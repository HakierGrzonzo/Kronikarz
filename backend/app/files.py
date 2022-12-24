from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi_users import FastAPIUsers
from miniopy_async import Minio
from .users import UserRead
from .object_store import get_object_store
from .surreal_orm import Session, get_db
from os import path
import json
from uuid import uuid4


def get_object_name(user: UserRead, tree_id: str) -> str:
    return path.join(user.email, tree_id, str(uuid4()))


def get_file_router(fastapi_users: FastAPIUsers) -> APIRouter:
    router = APIRouter()

    @router.post("/new/{tree_id}")
    async def upload_new_file(
        tree_id: str,
        file_content: UploadFile = File(...),
        current_user: UserRead = Depends(fastapi_users.current_user()),
        session: Session = Depends(get_db),
        minio: Minio = Depends(get_object_store)
    ):
        if tree_id not in current_user.trees:
            raise HTTPException(403)

        print(json.dumps({"original_filename": str(file_content.filename)}))

        res = await minio.put_object(
                "kronikarz",
                object_name=get_object_name(current_user, tree_id),
                data=file_content,
                length=-1,
                part_size=20 * 1024 ** 2,
                metadata={"original_filename": str(file_content.filename)},
                content_type=file_content.content_type
            )
        print(res)

    return router
