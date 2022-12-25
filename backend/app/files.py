import asyncio
from os import path
from typing import List, Literal
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from fastapi_users import FastAPIUsers
from miniopy_async import Minio
from pydantic import BaseModel

from .object_store import get_object_store
from .surreal_orm import Session, get_db
from .users import UserRead
from .utils import cache

RoleType = Literal["picture", "document", "other"]


class FileMeta(BaseModel):
    file_name: str
    role: RoleType
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
            file_name=file_content.filename, role=role, owner=current_user.id
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
            )
            for file in files
        ]

    return router
