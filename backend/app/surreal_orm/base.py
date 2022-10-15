from typing import Any, Dict
from surrealdb.clients import HTTPClient


class Base:
    """
    Class used to gather all the instances of different tables
    """

    def __init__(self) -> None:
        self.tables = {}

    def table(self, pydantic_class: Any):
        class TableEntry(pydantic_class):
            id: str

        class Table:
            __name = pydantic_class.__name__

            def __init__(self, db_client: HTTPClient) -> None:
                self._client = db_client

            async def create(self, **data: Dict) -> TableEntry:
                """Creates an object from kwargs with random id and stores it
                in surrealdb"""
                return TableEntry(
                    **(await self._client.create_all(self.__name, data))[0]
                )

            async def create_one(self, id: str, **data: Dict) -> TableEntry:
                """Creates an object from kwargs with given id and stores it in
                surrealdb"""
                return TableEntry(
                    **await self._client.create_one(self.__name, id, data)
                )

        self.tables[pydantic_class.__name__] = Table
        return TableEntry


# base is a singleton
base = Base()
