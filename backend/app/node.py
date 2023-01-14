import asyncio
from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException
from fastapi_users import FastAPIUsers

from app.surreal_orm import get_db
from app.users import UserRead

from .surreal_orm.session import Session
from .tables import AllNode, Node, NodeRelation, NodeValues, RawNodeValues


def get_node_router(fastapi_users: FastAPIUsers) -> APIRouter:
    router = APIRouter()

    @router.post("/new/{tree_id}", response_model=Node)
    async def create_new_node(
        tree_id: str,
        node_values: Dict[str, RawNodeValues],
        session: Session = Depends(get_db),
        current_user: UserRead = Depends(fastapi_users.current_user()),
    ):
        if tree_id not in current_user.trees or any(
            field_set_template not in current_user.field_set_templates
            for field_set_template in node_values.keys()
        ):
            raise HTTPException(403)

        node, tree = await asyncio.gather(
            session.Node.create(
                files=list(),
            ),
            session.Tree.select_id(tree_id),
        )

        await asyncio.gather(
            session.Tree.patch(tree.id, nodes=[*tree.nodes, node.id]),
            *[
                session.NodeValues.create(node.id, k, **v.dict())
                for k, v in node_values.items()
            ]
        )

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

    @router.get("/values/{tree_id}/{node_id}", response_model=List[NodeValues])
    async def get_values_for_node(
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

        return await session.Node.select_related(node_id, NodeValues)

    @router.get("/{tree_id}", response_model=List[Node])
    async def get_all_nodes_in_tree(
        tree_id: str,
        session: Session = Depends(get_db),
        current_user: UserRead = Depends(fastapi_users.current_user()),
    ):
        if tree_id not in current_user.trees:
            raise HTTPException(403)

        return (await session.Tree.select_deep(tree_id, ["nodes"])).nodes

    @router.get("/{tree_id}/values", response_model=List[AllNode])
    async def get_all_values_and_relations_in_tree(
        tree_id: str,
        session: Session = Depends(get_db),
        current_user: UserRead = Depends(fastapi_users.current_user()),
    ):
        if tree_id not in current_user.trees:
            raise HTTPException(403)

        nodes = (await session.Tree.select_deep(tree_id, ["nodes"])).nodes

        data = []
        for node in nodes:
            node_values = await session.Node.select_related(node.id, NodeValues)
            node_relations = await session.Node.select_related(
                node.id, NodeRelation
            )
            data.append(
                {
                    "node": node,
                    "values": node_values,
                    "relations": node_relations,
                }
            )
        return data

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
        "/{tree_id}/{node_id}/{field_set_id}", response_model=NodeValues
    )
    async def edit_node(
        tree_id: str,
        node_id: str,
        field_set_id: str,
        values: RawNodeValues,
        current_user: UserRead = Depends(fastapi_users.current_user()),
        session: Session = Depends(get_db),
    ):
        "Editing values on node"
        if (
            tree_id not in current_user.trees
            or field_set_id not in current_user.field_set_templates
        ):
            raise HTTPException(403)

        tree = await session.Tree.select_id(tree_id)
        if node_id not in tree.nodes:
            raise HTTPException(404, "Node not found!")

        node_values = await session.Node.select_related(node_id, NodeValues)
        relations = list(
            filter(lambda item: item.out.id == field_set_id, node_values)
        )
        if len(relations) > 1:
            raise HTTPException(500, "Multiple same field_sets for this node!")
        elif len(relations) == 0:
            res = await session.NodeValues.create(
                node_id, field_set_id, **values.dict()
            )
        else:
            relation_id = relations[0].id
            res = await session.NodeValues.patch(relation_id, **values.dict())

        await session.commit()
        return res

    @router.post("/{tree_id}/{node_id}/{field_set_id}/delete")
    async def remove_values_from_node(
        tree_id: str,
        node_id: str,
        field_set_id: str,
        current_user: UserRead = Depends(fastapi_users.current_user()),
        session: Session = Depends(get_db),
    ):
        "Removing a set of values from the node"
        if (
            tree_id not in current_user.trees
            or field_set_id not in current_user.field_set_templates
        ):
            raise HTTPException(403)

        tree = await session.Tree.select_id(tree_id)
        if node_id not in tree.nodes:
            raise HTTPException(404, "Node not found!")

        node_values = await session.Node.select_related(node_id, NodeValues)
        relations = list(
            filter(lambda item: item.out.id == field_set_id, node_values)
        )
        if len(relations) > 1:
            raise HTTPException(500, "Multiple same field_sets for this node!")
        elif len(relations) == 1:
            relation = relations[0]
            res = await session.NodeValues.delete(relation.id)
        else:
            raise HTTPException(
                404, "Failed to find such a relation on this node"
            )

        await session.commit()
        return res

    return router
