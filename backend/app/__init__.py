from fastapi import FastAPI
from fastapi.params import Depends
from surrealdb.clients.http import HTTPClient
from .surreal_orm import get_db

app = FastAPI()


@app.get('/api/')
async def hello(db: HTTPClient = Depends(get_db)):
    return await db.select_all('test')
