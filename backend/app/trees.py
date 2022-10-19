from typing import List
from fastapi import APIRouter, Depends, HTTPException
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

    @router.get("/{tree_id}", response_model=Tree)
    async def get_detailed_tree(
        tree_id: str,
        current_user: UserRead = Depends(fastapi_users.current_user()),
        session: Session = Depends(get_db),
    ):
        if tree_id not in current_user.trees:
            raise HTTPException(403)
        return await session.Tree.select_deep(tree_id, ["nodes"])

    return router
