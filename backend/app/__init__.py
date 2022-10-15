from fastapi import FastAPI, Depends

from .surreal_orm import Session
from .surreal_orm import get_db
from .database import User


app = FastAPI()


@app.get("/api/", response_model=User)
async def hello(db: Session = Depends(get_db)) -> User:
    return await db.User.create(email="foo")
