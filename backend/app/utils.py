from typing import Callable
from inspect import iscoroutinefunction
from functools import wraps


def debug(f: Callable):
    if iscoroutinefunction(f):

        @wraps(f)
        async def innerAsync(*args, **kwargs):
            res = await f(*args, **kwargs)
            print(
                f"f: {f.__name__}:",
                f"{repr(args)}",
                f"& {repr(kwargs)}",
                f"-> {repr(res)}",
                sep="\t",
                flush=True,
            )
            return res

        return innerAsync

    @wraps(f)
    def inner(*args, **kwargs):
        res = f(*args, **kwargs)
        print(
            f"f: {f.__name__}:",
            f"{repr(args)}",
            f"& {repr(kwargs)}",
            f"-> {repr(res)}",
            sep="\t",
            flush=True,
        )
        return res

    return inner
