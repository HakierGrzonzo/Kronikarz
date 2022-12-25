import asyncio
from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException
from fastapi_users import FastAPIUsers

from app.surreal_orm import get_db
from app.users import UserRead

from .surreal_orm.session import Session
from .tables import Node, NodeRelation


def get_node_router(fastapi_users: FastAPIUsers) -> APIRouter:
    router = APIRouter()

    @router.post("/new/{tree_id}", response_model=Node)
    async def create_new_node(
        tree_id: str,
        node_props: Dict,
        session: Session = Depends(get_db),
        current_user: UserRead = Depends(fastapi_users.current_user()),
    ):
        if tree_id not in current_user.trees:
            raise HTTPException(403)

        node, tree = await asyncio.gather(
            session.Node.create(props=node_props, files=list()),
            session.Tree.select_deep(tree_id, ["nodes"]),
        )

        await session.Tree.patch(tree.id, nodes=[*tree.nodes, node])

        await session.commit()

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

        res = await session.NodeRelation.create(
            in_node_id,
            out_node_id,
            props=edge_props,
            relation_type=relation_type,
        )

        await session.commit()

        return res

    @router.get(
        "/relations/{tree_id}/{node_id}", response_model=List[NodeRelation]
    )
    async def get_relations_for_node(
        tree_id: str,
        node_id: str,
        session: Session = Depends(get_db),
        current_user: UserRead = Depends(fastapi_users.current_user()),
    ):
        if tree_id not in current_user.trees:
            raise HTTPException(403)

        tree = await session.Tree.select_id(tree_id)
        if node_id not in tree.nodes:
            raise HTTPException(400, "Node does not belong to the given tree!")

        return await session.Node.select_related(node_id, NodeRelation)

    @router.get("/{tree_id}", response_model=List[Node])
    async def get_all_nodes_in_tree(
        tree_id: str,
        session: Session = Depends(get_db),
        current_user: UserRead = Depends(fastapi_users.current_user()),
    ):
        if tree_id not in current_user.trees:
            raise HTTPException(403)

        return (await session.Tree.select_deep(tree_id, ["nodes"])).nodes

    @router.get("/{tree_id}/{node_id}", response_model=Node)
    async def get_one_node(
        tree_id: str,
        node_id: str,
        session: Session = Depends(get_db),
        current_user: UserRead = Depends(fastapi_users.current_user()),
    ):
        if tree_id not in current_user.trees:
            raise HTTPException(403)

        tree = await session.Tree.select_id(tree_id)
        if node_id not in tree.nodes:
            raise HTTPException(400, "Node not found!")

        return await session.Node.select_id(node_id)

    @router.post(
        "/{tree_id}/{node_id}/delete",
    )
    async def delete_node(
        tree_id: str,
        node_id: str,
        current_user: UserRead = Depends(fastapi_users.current_user()),
        session: Session = Depends(get_db),
    ):
        "Deleting node"
        if tree_id not in current_user.trees:
            raise HTTPException(403)
        tree = await session.Tree.select_id(tree_id)
        if node_id not in tree.nodes:
            raise HTTPException(404, "Node not found!")
        await asyncio.gather(
            session.User.patch(
                current_user.id,
                nodes=[node for node in tree.nodes if node != node_id],
            ),
            session.Node.delete(node_id),
        )

    @router.post(
        "/{tree_id}/{node_id}/edit",
    )
    async def edit_node(
        tree_id: str,
        node_id: str,
        new_props: Dict,
        current_user: UserRead = Depends(fastapi_users.current_user()),
        session: Session = Depends(get_db),
    ):
        "Editing node"
        if tree_id not in current_user.trees:
            raise HTTPException(403)
        tree = await session.Tree.select_id(tree_id)
        if node_id not in tree.nodes:
            raise HTTPException(404, "Node not found!")
        node = await session.Node.patch(node_id, props=new_props)
        await session.commit()
        return node

    return router
