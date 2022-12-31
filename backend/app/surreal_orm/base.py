from pydantic import BaseModel

from app.utils import debug

from .tables import get_relation_class, get_table_class
from .utils import change_data_to_relation, quote_param


class Base:
    """
    Class used to gather all the instances of different tables
    """

    def __init__(self) -> None:
        self.tables = {}

    def edge(self, from_class: type[BaseModel], to_class: type[BaseModel]):
        def inner(pydantic_class: type[BaseModel]):

            RelationTable, RelationEntry = get_relation_class(
                from_class, to_class, pydantic_class
            )

            # Register the table with the rest
            self.tables[pydantic_class.__name__] = RelationTable

            return RelationEntry

        return inner

    def table(self, pydantic_class: type[BaseModel]):

        Table, TableEntry = get_table_class(pydantic_class)

        # Register the table with the rest
        self.tables[pydantic_class.__name__] = Table
        return TableEntry


# base is a singleton
base = Base()
