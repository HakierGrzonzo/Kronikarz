from typing import Literal, Optional

from pydantic import BaseModel


class PartialDate(BaseModel):
    year: Optional[int]
    month: Optional[int]
    day: Optional[int]


class InputProps(BaseModel):
    name: str
    type: Literal["text", "number", "date", "file"]
    required: bool
