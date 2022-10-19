from fastapi import FastAPI
from app.node import get_node_router

from app.trees import get_tree_router

from .users import (
    UserRead,
    UserCreate,
    UserUpdate,
    auth_backend,
    fastapi_users,
)

app = FastAPI()

app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/api/auth/jwt",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/api/auth",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/api/users",
    tags=["users"],
)

app.include_router(get_tree_router(fastapi_users), prefix="/api/trees", tags=["data"])

app.include_router(get_node_router(fastapi_users), prefix="/api/nodes", tags=["data"])
