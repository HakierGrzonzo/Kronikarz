from surrealdb.common.json import dumps
from pydantic import BaseModel, Field
from surrealdb.clients import HTTPClient
from typing import Dict, Protocol, Tuple, Optional, List, TypeVar, Union

from app.surreal_orm.relation import Relation
from .utils import (
    change_data_to_relation,
    get_surreal_id_fuckery_normalizer,
    quote_param,
    change_data_to_relation,
)

T = TypeVar("T", covariant=True)


class TableInterface(Protocol[T]):
    async def create(self, **data: Dict) -> T:
        raise NotImplemented()

    async def select(
        self, where_args: str, where_params: Optional[Tuple] = None
    ) -> List[T]:
        raise NotImplemented()

    async def select_deep(self, id: str, fields_to_fetch: List[str]) -> T:
        raise NotImplemented()

    async def select_all(self) -> List[T]:
        raise NotImplemented()

    async def select_id(self, id: str) -> T:
        raise NotImplemented()

    async def replace(self, id: str, **new_data: Dict) -> T:
        raise NotImplemented()

    async def patch(self, id: str, **fields_to_replace: Dict) -> T:
        raise NotImplemented()

    async def delete(self, id: str):
        raise NotImplemented()


T_in = TypeVar("T_in", covariant=True)
T_out = TypeVar("T_out", covariant=True)


class RelationTableInterface(Protocol[T, T_in, T_out]):
    async def create(
        self,
        from_obj: Union[T_in, str],
        to_obj: Union[T_out, str],
        **data: Dict,
    ) -> T:
        raise NotImplemented()

    async def select(
        self, where_args: str, where_params: Optional[Tuple] = None
    ) -> List[T]:
        raise NotImplemented()

    async def select_in(
        self, where_args: str, where_params: Optional[Tuple] = None
    ) -> List[T_in]:
        raise NotImplemented()

    async def select_out(
        self, where_args: str, where_params: Optional[Tuple] = None
    ) -> List[T_out]:
        raise NotImplemented()

    async def select_deep(self, id: str, fields_to_fetch: List[str]) -> T:
        raise NotImplemented()

    async def select_all(self) -> List[T]:
        raise NotImplemented()

    async def select_id(self, id: str) -> T:
        raise NotImplemented()

    async def replace(self, id: str, **new_data: Dict) -> T:
        raise NotImplemented()

    async def patch(self, id: str, **fields_to_replace: Dict) -> T:
        raise NotImplemented()

    async def delete(self, id: str):
        raise NotImplemented()


def get_table_class(
    pydantic_class: type[BaseModel],
) -> Tuple[type[TableInterface], type[BaseModel]]:

    id_normalizer = get_surreal_id_fuckery_normalizer(pydantic_class.__name__)

    class TableEntry(pydantic_class):
        id: str

    TableEntry.__name__ = pydantic_class.__name__
    TableEntry.__doc__ = pydantic_class.__doc__

    class Table(TableInterface):
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
                    self.__name,
                    id_normalizer(id),
                    change_data_to_relation(data),
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

        async def select_deep(self, id: str, fields_to_fetch: List[str]) -> TableEntry:
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

    return Table, TableEntry


def get_relation_class(
    from_class: type[BaseModel],
    to_class: type[BaseModel],
    pydantic_class: type[BaseModel],
) -> Tuple[type[RelationTableInterface], type[BaseModel]]:
    class RelationEntry_proto(pydantic_class):
        in_: Relation[from_class] = Field(alias="in")
        out: Relation[to_class]

    Table_class, RelationEntry = get_table_class(RelationEntry_proto)

    class RelationTable(
        Table_class,
        RelationTableInterface[pydantic_class, from_class, to_class],
    ):
        __name = pydantic_class.__name__

        async def create(
            self,
            from_obj: Union[from_class, str],
            to_obj: Union[to_class, str],
            **data: Dict,
        ) -> RelationEntry:
            res = await self._client.execute(
                "RELATE {}->{}->{} CONTENT {}".format(
                    from_obj if isinstance(from_obj, str) else from_obj.id,
                    self.__name,
                    to_obj if isinstance(to_obj, str) else to_obj.id,
                    dumps(change_data_to_relation(data)),
                ),
            )
            print(res)
            if len(res) != 1:
                raise Exception("Failed to create relation")
            return RelationEntry(**res[0])

    return RelationTable, RelationEntry
