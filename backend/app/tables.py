from datetime import date
from typing import Dict, List, Union

from pydantic import BaseModel

from .models import InputProps
from .surreal_orm import base
from .surreal_orm.relation import RelationList

FileID = str


@base.table
class FieldSetTemplate(BaseModel):
    name: str
    fields: List[InputProps]


@base.table
class Node(BaseModel):
    files: List[FileID]


class RawNodeValues(BaseModel):
    values: List[Union[None, date, float, str]]


@base.edge(Node, FieldSetTemplate)
class NodeValues(RawNodeValues):
    pass


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
    field_set_templates: RelationList[FieldSetTemplate]
    is_active: bool = True
    is_superuser: bool = False
    is_verified: bool = True
    trees: RelationList[Tree]


class AllNode(Node):
    values: List[NodeValues]
    relations: List[NodeRelation]