import asyncio
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi_users import FastAPIUsers

from app.surreal_orm.session import Session
from app.utils import debug

from .surreal_orm import get_db
from .tables import Tree
from .users import UserRead


def get_tree_router(fastapi_users: FastAPIUsers) -> APIRouter:
    router = APIRouter()

    @router.post("/new", response_model=Tree)
    async def create_new_tree(
        name: str,
        user: UserRead = Depends(fastapi_users.current_user()),
        session: Session = Depends(get_db),
    ):
        tree = await session.Tree.create(name=name, nodes=[])
        await session.User.patch(user.id, trees=[*user.trees, tree])
        await session.commit()
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

    @router.post(
        "/{tree_id}/delete",
    )
    async def delete_tree(
        tree_id: str,
        current_user: UserRead = Depends(fastapi_users.current_user()),
        session: Session = Depends(get_db),
    ):
        """Moj pierwszy endpoint 8)"""
        if tree_id not in current_user.trees:
            raise HTTPException(403)
        await asyncio.gather(
            session.User.patch(
                current_user.id,
                trees=[tree for tree in current_user.trees if tree != tree_id],
            ),
            session.Tree.delete(tree_id),
        )

    @router.post("/{tree_id}/rename", response_model=Tree)
    async def rename_tree(
        tree_id: str,
        new_name: str,
        current_user: UserRead = Depends(fastapi_users.current_user()),
        session: Session = Depends(get_db),
    ):
        if tree_id not in current_user.trees:
            raise HTTPException(403)
        tree = await session.Tree.patch(tree_id, name=new_name)
        await session.commit()
        return tree

    return router
