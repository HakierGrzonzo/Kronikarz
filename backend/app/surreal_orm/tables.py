from typing import Dict, List, Optional, Protocol, Tuple, TypeVar, Union

from pydantic import BaseModel, Field
from surrealdb.clients import WebsocketClient
from surrealdb.common.json import dumps

from app.surreal_orm.relation import Relation

from .utils import change_data_to_relation, quote_param

T = TypeVar("T", covariant=True)
R = TypeVar("R")


class TableInterface(Protocol[T]):
    """Defines all the operations a table should have"""

    async def create(self, **data: Dict) -> T:
        raise NotImplemented()

    async def select(
        self,
        where_args: str,
        where_params: Optional[Tuple] = None,
        fields_to_fetch: Optional[List[str]] = None,
    ) -> List[T]:
        raise NotImplemented()

    async def select_deep(self, id: str, fields_to_fetch: List[str]) -> T:
        """
        Record link relations need to be fetched explicitly, otherwise
        they will be available only as strings.
        """
        raise NotImplemented()

    async def select_all(self) -> List[T]:
        raise NotImplemented()

    async def select_id(self, id: str) -> T:
        raise NotImplemented()

    async def select_related(self, id: str, relation: type[R]) -> List[R]:
        """
        Selects all the outgoing edges and their targets that belong to a
        given `relation` relation.
        """
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
    """Defines all the operations a relation table should have"""

    async def create(
        self,
        from_obj: Union[T_in, str],
        to_obj: Union[T_out, str],
        **data: Dict,
    ) -> T:
        raise NotImplemented()

    async def select(
        self,
        where_args: str,
        where_params: Optional[Tuple] = None,
        fields_to_fetch: Optional[List[str]] = None,
    ) -> List[T]:
        raise NotImplemented()

    async def select_deep(self, id: str, fields_to_fetch: List[str]) -> T:
        """
        Record link relations need to be fetched explicitly, otherwise
        they will be available only as strings.
        """
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
    class TableEntry(pydantic_class):
        id: str

    TableEntry.__name__ = pydantic_class.__name__
    TableEntry.__doc__ = pydantic_class.__doc__

    class Table(TableInterface):
        __name = pydantic_class.__name__

        def __init__(self, db_client: WebsocketClient) -> None:
            self._client = db_client

        async def create(self, **data: Dict) -> TableEntry:
            """Creates an object from kwargs with random id and stores it
            in surrealdb"""
            result = await self._client.create(
                self.__name, change_data_to_relation(data)
            )
            return TableEntry(**result[0])

        async def select(
            self,
            where_args: str,
            where_params: Optional[Tuple] = None,
            fields_to_fetch: Optional[List[str]] = None,
        ) -> List[TableEntry]:
            """Returns rows that match the where clause"""
            if where_params is None:
                where_params = tuple()
            else:
                where_params = tuple(
                    [quote_param(param) for param in where_params]
                )
            if fields_to_fetch is None:
                fetch_statement = ""
            else:
                fetch_statement = f"FETCH {', '.join(fields_to_fetch)}"
            result = await self._client.query(
                f"SELECT * FROM {self.__name} WHERE {where_args} {fetch_statement}".format(
                    *where_params
                )
            )
            return list(TableEntry(**d) for d in result[0])

        async def select_deep(
            self, id: str, fields_to_fetch: List[str]
        ) -> TableEntry:
            """Returns an object with given id with all it's links loaded"""
            result = await self._client.query(
                f'SELECT * FROM {quote_param(id)} FETCH {",".join(fields_to_fetch)}'
            )
            result = result[0]
            if len(result) != 1:
                raise Exception("Failed to fetch by id!")
            return TableEntry(**result[0])

        async def select_related(self, id: str, relation: type[R]) -> List[R]:
            """Selects given relations (edges) that come out of the given
            id"""
            # quote item id, to hopefully prevent SQL injection
            item_id = quote_param(id)
            result = await self._client.query(
                f"SELECT ->{relation.__name__}.* AS rel FROM {item_id} FETCH rel.out"
            )
            result = result[0]
            if len(result) != 1:
                raise Exception("Failed to fetch by id!")
            return list(relation(**x) for x in result[0]["rel"])

        async def select_all(self) -> List[TableEntry]:
            """Returns all rows from the table"""
            response = await self._client.select(self.__name)
            return list(TableEntry(**d) for d in response)

        async def select_id(self, id: str) -> TableEntry:
            """Selects a record with a given id"""
            res = await self._client.select(id)
            return TableEntry(**res[0])

        async def replace(self, id: str, **new_data: Dict) -> TableEntry:
            """Replaces all data with a given id with new id"""
            res = await self._client.update(
                id,
                change_data_to_relation(new_data),
            )
            return TableEntry(**res[0])

        async def patch(self, id: str, **fields_to_replace: Dict) -> TableEntry:
            """Patches some fields with a given id, a partial replace"""
            res = await self._client.change(
                id,
                change_data_to_relation(fields_to_replace),
            )
            return TableEntry(**res[0])

        async def delete(self, id: str):
            """Deletes an item with a given id from the table"""
            await self._client.delete(id)

    # When debugging tables show the appropriate name
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
            """Creates a relation using the `RELATE` statement"""
            res = await self._client.query(
                "RELATE {}->{}->{} CONTENT {}".format(
                    quote_param(
                        from_obj if isinstance(from_obj, str) else from_obj.id
                    ),
                    self.__name,
                    quote_param(
                        to_obj if isinstance(to_obj, str) else to_obj.id
                    ),
                    dumps(change_data_to_relation(data)),
                ),
            )
            res = res[0]
            if len(res) != 1:
                raise Exception("Failed to create relation")
            return RelationEntry(**res[0])

    RelationEntry.__name__ = pydantic_class.__name__

    return RelationTable, RelationEntry
