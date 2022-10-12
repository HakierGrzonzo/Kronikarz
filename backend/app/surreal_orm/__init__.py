from os import environ
from surrealdb.clients import HTTPClient

def get_db() -> HTTPClient:
    return HTTPClient(
        f"http://{environ.get('DATABASE', 'localhost:8001')}",
        namespace="test",
        database="test",
        username="root",
        password="root",
    )
