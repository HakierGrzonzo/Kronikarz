import asyncio
from os import path
from typing import List, Literal, Optional
from uuid import uuid4

from fastapi import (
    APIRouter,
    Depends,
    File,
    Header,
    HTTPException,
    Response,
    UploadFile,
)
from fastapi.responses import StreamingResponse
from fastapi_users import FastAPIUsers
from miniopy_async import Minio
from pydantic import BaseModel

from .image import convert_file
from .object_store import get_object_store
from .surreal_orm import Session, get_db
from .users import UserRead
from .utils import cache, get_preffered_format

RoleType = Literal["picture", "document", "other"]


class FileMeta(BaseModel):
    file_name: str
    role: RoleType
    node: str
    owner: str


class FileMetaResponse(FileMeta):
    content_type: str
    id: str


def get_object_name(tree_id: str) -> str:
    return path.join(tree_id, str(uuid4()))


def get_file_router(fastapi_users: FastAPIUsers) -> APIRouter:
    router = APIRouter()

    @router.post("/new/{tree_id}/{node_id}", response_model=FileMetaResponse)
    async def upload_new_file(
        tree_id: str,
        node_id: str,
        role: RoleType,
        file_content: UploadFile = File(...),
        current_user: UserRead = Depends(fastapi_users.current_user()),
        session: Session = Depends(get_db),
        minio: Minio = Depends(get_object_store),
    ):

        if (
            not file_content.content_type.startswith("image")
            and role == "picture"
        ):
            raise HTTPException(400, "pictures must be valid images")

        if tree_id not in current_user.trees:
            raise HTTPException(403)

        tree = await session.Tree.select_id(tree_id)
        if node_id not in tree.nodes:
            raise HTTPException(404, "Node not found!")

        node = await session.Node.select_id(node_id)

        object_id = get_object_name(tree_id)

        file_meta = FileMeta(
            file_name=file_content.filename,
            role=role,
            owner=current_user.id,
            node=node_id,
        )

        await minio.put_object(
            "kronikarz",
            object_name=object_id,
            data=file_content,
            length=-1,
            part_size=20 * 1024**2,
            metadata=file_meta.dict(),
            content_type=file_content.content_type,
        )

        await session.Node.patch(id=node_id, files=[*node.files, object_id])

        await session.commit()

        return FileMetaResponse(
            content_type=file_content.content_type,
            id=object_id,
            **file_meta.dict(),
        )

    @router.get("/get/{file_id:path}", response_class=StreamingResponse)
    @cache()
    async def get_file_with_id(
        file_id: str,
        minio: Minio = Depends(get_object_store),
        current_user: UserRead = Depends(fastapi_users.current_user()),
    ):
        try:
            file = await minio.stat_object("kronikarz", file_id)
        except:
            raise HTTPException(404, "file not found")

        if not file.metadata["x-amz-meta-owner"] == current_user.id:
            raise HTTPException(403)

        file_content = await minio.get_object("kronikarz", file_id)

        async def read_file():
            yield await file_content.read()
            file_content.close()
            await file_content.release()

        return StreamingResponse(
            read_file(), media_type=file_content.content_type
        )

    @router.get(
        "/picture/{file_id:path}",
        response_class=StreamingResponse,
        responses={200: {"content": {"image/jpeg": {}, "image/webp": {}}}},
    )
    @cache()
    async def get_resized_picture(
        file_id: str,
        minio: Minio = Depends(get_object_store),
        height: Optional[int] = None,
        width: Optional[int] = None,
        current_user: UserRead = Depends(fastapi_users.current_user()),
        accept: str = Header("image/jpeg"),
    ):
        """
        Returns a resized image in an accepted format, the file must have
        content_type `image/*` in order to be processed.

        If no height or width is provided, **then a 400 will be returned**!
        """
        if height is None and width is None:
            raise HTTPException(400, "No width or height has been provided!")

        # Get a common format between us and the client
        accept = get_preffered_format(accept, ["image/webp", "image/jpeg"])

        try:
            meta = await minio.stat_object("kronikarz", file_id)
        except:
            raise HTTPException(404, "file not found")

        if meta.metadata["x-amz-meta-owner"] != current_user.id:
            raise HTTPException(403)

        file = await minio.get_object("kronikarz", file_id)
        converted_file = await convert_file(file, width, height, accept)

        def return_file():
            yield converted_file.read()
            converted_file.close()

        return StreamingResponse(return_file(), 200, media_type=accept)

    @router.get("/{tree_id}/{node_id}", response_model=List[FileMetaResponse])
    async def get_files_for_node(
        tree_id: str,
        node_id: str,
        current_user: UserRead = Depends(fastapi_users.current_user()),
        minio: Minio = Depends(get_object_store),
        session: Session = Depends(get_db),
    ):
        if tree_id not in current_user.trees:
            raise HTTPException(403)

        tree = await session.Tree.select_id(tree_id)
        if node_id not in tree.nodes:
            raise HTTPException(404, "Node not found!")

        node = await session.Node.select_id(node_id)

        files = await asyncio.gather(
            *[minio.stat_object("kronikarz", file) for file in node.files]
        )

        return [
            FileMetaResponse(
                content_type=file.content_type,
                owner=file.metadata["x-amz-meta-owner"],
                role=file.metadata["x-amz-meta-role"],
                file_name=file.metadata["x-amz-meta-file_name"],
                id=file.object_name,
                node=node.id,
            )
            for file in files
        ]

    @router.get("/delete/{file_id:path}", status_code=204)
    async def delete_file_with_id(
        file_id: str,
        minio: Minio = Depends(get_object_store),
        session: Session = Depends(get_db),
        current_user: UserRead = Depends(fastapi_users.current_user()),
    ):
        try:
            file = await minio.stat_object("kronikarz", file_id)
        except:
            raise HTTPException(404, "file not found")

        if not file.metadata["x-amz-meta-owner"] == current_user.id:
            raise HTTPException(403)

        node = await session.Node.select_id(file.metadata["x-amz-meta-node"])
        await session.Node.patch(
            node.id, files=[file for file in node.files if file != file_id]
        )

        await minio.remove_object("kronikarz", file_id)

        await session.commit()
        return Response(status_code=204)

    return router
