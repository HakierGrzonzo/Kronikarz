from datetime import timedelta
from functools import wraps
from inspect import iscoroutinefunction
from typing import Callable, List

from fastapi import Response


def debug(f: Callable):
    if iscoroutinefunction(f):

        @wraps(f)
        async def innerAsync(*args, **kwargs):
            res = "ERROR"
            try:
                res = await f(*args, **kwargs)
            finally:
                print(
                    f"f: {f.__name__}:",
                    f"{repr(args)}",
                    f"& {repr(kwargs)}",
                    f"-> {repr(res)}",
                    sep="\n\t",
                    flush=True,
                )
            return res

        return innerAsync

    @wraps(f)
    def inner(*args, **kwargs):
        res = "ERROR"
        try:
            res = f(*args, **kwargs)
        finally:
            print(
                f"f: {f.__name__}:",
                f"{repr(args)}",
                f"& {repr(kwargs)}",
                f"-> {repr(res)}",
                sep="\n\t",
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


def parse_token(token: str) -> str:
    """
    Parses mime into token consisting of the [type, subtype] tuple
    """
    # Strip the webbrowser preferences
    token = token.strip().split(";")[0]
    type, subtype = token.split("/")
    return type, subtype


def parse_accept_header(value: str) -> List[str]:
    """
    Parses mime values in the `Accept` header into a list of tokens.
    """
    tokens = [parse_token(token) for token in value.split(",")]
    return tokens


def match_tokens(value: [str, str], matcher: [str, str]) -> bool:
    """
    Checks if the `matcher` matches the `value` while taking care of wildcards
    """
    for value, matcher in zip(value, matcher):
        if not (value == matcher or matcher == "*"):
            return False
    return True


def get_preffered_format(accept_header: str, our_preferences: List[str]) -> str:
    """
    Returns which format present in the accept_header is most preferable
    to us
    """
    tokens = parse_accept_header(accept_header)

    for mime in our_preferences:
        our_token = parse_token(mime)
        for token in tokens:
            if match_tokens(our_token, token):
                return mime
    raise Exception(f"Failed to find a common format from {accept_header}")
