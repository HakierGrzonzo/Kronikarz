from os import environ
from surrealdb.clients import HTTPClient
from .base import base
from .session import Session


def get_db() -> Session:
    client = HTTPClient(
        f"http://{environ.get('DATABASE', 'localhost:8001')}",
        namespace="test",
        database="test",
        username="root",
        password="root",
    )
    return Session(client, base)
