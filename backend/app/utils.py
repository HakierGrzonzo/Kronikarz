from datetime import timedelta
from functools import wraps
from inspect import iscoroutinefunction
from typing import Callable, Optional

from fastapi import Response


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


def cache(maxAge: timedelta = timedelta(minutes=15), public: bool = False):
    def outer(f: Callable):
        @wraps(f)
        async def inner(*args, **kwargs):
            res: Response = await f(*args, **kwargs)
            res.headers[
                "Cache-Control"
            ] = f"{'public' if public else 'private'}, max-age={maxAge.total_seconds()}"
            return res

        return inner

    return outer
