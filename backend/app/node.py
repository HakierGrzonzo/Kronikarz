from fastapi import APIRouter, Depends, HTTPException
import asyncio
from typing import Dict
from fastapi_users import FastAPIUsers

from app.surreal_orm import get_db
from app.users import UserRead

from .surreal_orm.session import Session
from .tables import Node, NodeRelation


def get_node_router(fastapi_users: FastAPIUsers) -> APIRouter:
    router = APIRouter()

    @router.post("/new", response_model=Node)
    async def create_new_node(
        tree_id: str,
        node_props: Dict,
        session: Session = Depends(get_db),
        current_user: UserRead = Depends(fastapi_users.current_user()),
    ):
        if tree_id not in current_user.trees:
            raise HTTPException(403)

        node, tree = await asyncio.gather(
            session.Node.create(props=node_props),
            session.Tree.select_deep(tree_id, ["nodes"]),
        )

        await session.Tree.patch(tree.id, nodes=[*tree.nodes, node])

        return node

    @router.post(
        "/relation/{tree_id}/link/{in_node_id}/{out_node_id}",
        response_model=NodeRelation,
    )
    async def link_nodes(
        tree_id: str,
        in_node_id: str,
        out_node_id: str,
        edge_props: Dict,
        relation_type: str,
        session: Session = Depends(get_db),
        current_user: UserRead = Depends(fastapi_users.current_user()),
    ):
        if tree_id not in current_user.trees:
            raise HTTPException(403)

        tree = await session.Tree.select_id(tree_id)
        if in_node_id not in tree.nodes or out_node_id not in tree.nodes:
            raise HTTPException(400, "Nodes don't belong to the same tree")

        return await session.NodeRelation.create(
            in_node_id, out_node_id, props=edge_props, relation_type=relation_type
        )

    return router
