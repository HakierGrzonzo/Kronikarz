from typing import Any


def quote_param(param: Any) -> str:
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
