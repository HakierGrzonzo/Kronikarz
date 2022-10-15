from .surreal_orm import base
from pydantic import BaseModel


@base.table
class User(BaseModel):
    email: str
