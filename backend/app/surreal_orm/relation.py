from typing import Generic, List, TypeVar, Union

T = TypeVar("T")

Relation = Union[T, str]
RelationList = Union[List[T], List[str]]
