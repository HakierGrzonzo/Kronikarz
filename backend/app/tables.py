from typing import List
from pydantic import BaseModel

from .surreal_orm.relation import RelationList
from .surreal_orm import base


@base.table
class Tree(BaseModel):
    name: str


@base.table
class User(BaseModel):
    id: str
    email: str
    hashed_password: str
    is_active: bool = True
    is_superuser: bool = False
    is_verified: bool = True
    trees: RelationList[Tree]
