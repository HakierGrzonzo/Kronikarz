from typing import List
from fastapi import APIRouter, Depends
from fastapi_users import FastAPIUsers

from app.surreal_orm.session import Session
from app.utils import debug

from .surreal_orm import get_db

from .users import UserRead
from .tables import Tree


def get_tree_router(fastapi_users: FastAPIUsers) -> APIRouter:
    router = APIRouter()

    @router.post("/new", response_model=Tree)
    async def create_new_tree(
        name: str,
        user: UserRead = Depends(fastapi_users.current_user()),
        session: Session = Depends(get_db),
    ):
        tree = await session.Tree.create(name=name)
        await session.User.patch(user.id, trees=[*user.trees, tree])
        return tree

    @router.get("/my", response_model=List[Tree])
    async def list_my_trees(
        user: UserRead = Depends(fastapi_users.current_user()),
        session: Session = Depends(get_db),
    ):
        return (await session.User.select_deep(user.id, ["trees"])).trees

    return router
