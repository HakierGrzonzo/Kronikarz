from typing import Dict, Optional
from pydantic import BaseModel

from .surreal_orm.relation import RelationList
from .surreal_orm import base


@base.table
class Node(BaseModel):
    props: Dict


@base.edge(Node, Node)
class NodeRelation(BaseModel):
    relation_type: str
    props: Dict


@base.table
class Tree(BaseModel):
    name: str
    nodes: RelationList[Node]


@base.table
class User(BaseModel):
    id: str
    email: str
    hashed_password: str
    is_active: bool = True
    is_superuser: bool = False
    is_verified: bool = True
    trees: RelationList[Tree]
