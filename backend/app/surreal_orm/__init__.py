from os import environ
from typing import AsyncGenerator
from surrealdb.clients import WebsocketClient
from .base import base
from .session import Session


async def get_db() -> AsyncGenerator[Session, None]:
    async with WebsocketClient(
        f"http://{environ.get('DATABASE', 'localhost:8001')}/rpc",
    ) as client: 
        await client.signin({
            'user': 'root',
            'pass': 'root',
        })
        # Specify the namespace and the database
        await client.use('test', 'test')
        await client.query('BEGIN TRANSACTION;')

        # Create a database session and do stuff
        session = Session(client, base)
        yield session

        # If we did not commit the data, cancel the transaction
        if not session._commited:
            await client.query('CANCEL TRANSACTION;')



