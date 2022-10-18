from typing import Generic, TypeVar, Union, List

T = TypeVar("T")

Relation = Union[T, str]
RelationList = Union[List[T], List[str]]
