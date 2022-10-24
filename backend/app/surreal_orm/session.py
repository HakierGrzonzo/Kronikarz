from surrealdb.clients import WebsocketClient
from typing import Union

from .tables import TableInterface, RelationTableInterface
from .base import Base


class Session:
    """Class that contains the connection to surrealdb and allows operations
    on tables"""

    def __init__(self, client: WebsocketClient, base: Base) -> None:
        self._client = client
        self._base = base
        self._commited = False

    def __getattr__(
        self, __name: str
    ) -> Union[TableInterface, RelationTableInterface]:
        """Returns appropriate table as a property of this session"""
        return self._base.tables[__name](self._client)

    async def commit(self):
        """Commits the transaction"""
        await self._client.query("COMMIT TRANSACTION")
        self._commited = True
