from typing import Any, Dict, List, Tuple, Optional
from surrealdb.clients import HTTPClient

from app.utils import debug
from .utils import (
    quote_param,
    get_surreal_id_fuckery_normalizer,
    change_data_to_relation,
)


class Base:
    """
    Class used to gather all the instances of different tables
    """

    def __init__(self) -> None:
        self.tables = {}

    def table(self, pydantic_class: Any):

        id_normalizer = get_surreal_id_fuckery_normalizer(pydantic_class.__name__)

        class TableEntry(pydantic_class):
            id: str

        # Change the name of the TableEntry class to the original name
        TableEntry.__name__ = pydantic_class.__name__
        TableEntry.__doc__ = pydantic_class.__doc__

        class Table:
            __name = pydantic_class.__name__

            def __init__(self, db_client: HTTPClient) -> None:
                self._client = db_client

            async def create(self, **data: Dict) -> TableEntry:
                """Creates an object from kwargs with random id and stores it
                in surrealdb"""
                return TableEntry(
                    **(
                        await self._client.create_all(
                            self.__name, change_data_to_relation(data)
                        )
                    )[0]
                )

            async def create_one(self, id: str, **data: Dict) -> TableEntry:
                """Creates an object from kwargs with given id and stores it in
                surrealdb"""
                return TableEntry(
                    **await self._client.create_one(
                        self.__name, id_normalizer(id), change_data_to_relation(data)
                    )
                )

            async def select(
                self, where_args: str, where_params: Optional[Tuple] = None
            ) -> List[TableEntry]:
                """Returns rows that match the where clause"""
                if where_params is None:
                    where_params = tuple()
                else:
                    where_params = tuple([quote_param(param) for param in where_params])
                return list(
                    TableEntry(**d)
                    for d in await self._client.execute(
                        f"SELECT * FROM {self.__name} WHERE {where_args}".format(
                            *where_params
                        )
                    )
                )

            async def select_deep(
                self, id: str, fields_to_fetch: List[str]
            ) -> TableEntry:
                """Returns an object with given id with all it's links loaded"""
                result = await self._client.execute(
                    f'SELECT * FROM {id} FETCH {",".join(fields_to_fetch)}'
                )
                if len(result) != 1:
                    raise Exception("Failed to fetch by id!")
                return TableEntry(**result[0])

            async def select_all(self) -> List[TableEntry]:
                """Returns all rows from the table"""
                response = await self._client.select_all(self.__name)
                return list(TableEntry(**d) for d in response)

            async def select_id(self, id: str) -> TableEntry:
                """Selects a record with a given id"""
                return TableEntry(
                    **await self._client.select_one(self.__name, id_normalizer(id))
                )

            async def replace(self, id: str, **new_data: Dict) -> TableEntry:
                """Replaces all data with a given id with new id"""
                return TableEntry(
                    **await self._client.replace_one(
                        self.__name,
                        id_normalizer(id),
                        change_data_to_relation(new_data),
                    )
                )

            async def patch(self, id: str, **fields_to_replace: Dict) -> TableEntry:
                """Patches some fields with a given id, a partial replace"""
                return TableEntry(
                    **await self._client.upsert_one(
                        self.__name,
                        id_normalizer(id),
                        change_data_to_relation(fields_to_replace),
                    )
                )

            async def delete(self, id: str):
                """Deletes an item with a given id from the table"""
                await self._client.delete_one(self.__name, id_normalizer(id))

        # When debuging tables show the appropriate name
        Table.__name__ = f"{pydantic_class.__name__}Table"

        # Register the table with the rest
        self.tables[pydantic_class.__name__] = Table
        return TableEntry


# base is a singleton
base = Base()
