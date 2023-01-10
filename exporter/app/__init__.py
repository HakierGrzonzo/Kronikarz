from fastapi import Depends, FastAPI

from app.kronikarz_backend_client.client import AuthenticatedClient

from .client import get_client
from .kronikarz_backend_client.api.trees import list_my_trees_api_trees_my_get

app = FastAPI()


@app.get("/export")
async def test(client: AuthenticatedClient = Depends(get_client)):
    return await list_my_trees_api_trees_my_get.asyncio(client=client)
