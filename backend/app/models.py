from typing import Literal

from pydantic import BaseModel


class InputProps(BaseModel):
    name: str
    type: Literal["text", "number", "date"]
    required: bool
