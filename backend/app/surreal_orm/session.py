from surrealdb.clients import HTTPClient
from typing import Any
from .base import Base


class Session:
    """Class that contains the connection to surrealdb and allows operations
    on tables"""

    def __init__(self, client: HTTPClient, base: Base) -> None:
        self._client = client
        self._base = base

    def __getattr__(self, __name: str) -> Any:
        """Returns appropriate table as a property of this session"""
        return self._base.tables[__name](self._client)
