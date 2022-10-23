from typing import Any, Dict, Iterable

from pydantic import BaseModel




def change_data_to_relation(data: Dict) -> Dict:
    """
    Ensures that data is not duplicated and is instead related in the database
    """
    
    def check_data(value: Any):
        """
        Recursively checks all fields for nested database entires and weird types
        """
        if isinstance(value, BaseModel) and hasattr(value, "id"):
            # Every pydantic class with an id is treated as a record in the
            # database
            return value.id
        elif any(isinstance(value, type) for type in [str, float, int, bool]):
            # Value is a primitive, can be passed directly
            return value
        elif isinstance(value, BaseModel):
            return {k: check_data(v) for k, v in value.dict(by_alias=True)}
        elif isinstance(value, Dict):
            if (id := value.get("id")) is not None:
                return id
            return {k: check_data(v) for k, v in value.items()}
        elif isinstance(value, Iterable):
            # If data is a listlike, then check all elements
            return [check_data(v) for v in value]
        else:
            # Value is a weird, unhandled type
            raise Exception(
                f"Data type {type(value)} is not supported, try adding support for it"
            )

    return check_data(data)


def quote_param(param: Any) -> str:
    """
    Quotes and serializes parameters for SurrealDB queries
    """
    match param:
        case str():
            # Hopefully prevent SQL injection
            return '"' + param.replace("\\", "\\\\").replace('"', '\\"') + '"'
        case int():
            return str(param)
        case float():
            return str(param)
        case _:
            raise Exception("Unsupported Param for quoting, pls add more")
