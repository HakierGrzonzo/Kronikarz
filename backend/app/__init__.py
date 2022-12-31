from fastapi import FastAPI
from fastapi.responses import RedirectResponse

from .files import get_file_router
from .node import get_node_router
from .object_store import init_minio_buckets
from .trees import get_tree_router
from .users import UserCreate, UserRead, UserUpdate, auth_backend, fastapi_users

app = FastAPI()


@app.on_event("startup")
async def init_application():
    await init_minio_buckets()


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

app.include_router(
    get_tree_router(fastapi_users), prefix="/api/trees", tags=["data"]
)

app.include_router(
    get_node_router(fastapi_users), prefix="/api/nodes", tags=["data"]
)

app.include_router(
    get_file_router(fastapi_users), prefix="/api/files", tags=["files"]
)


@app.get("/", response_class=RedirectResponse)
def redirect_to_docs():
    """Redirects the developer to the docs, if they forget to add `/docs` to
    the url."""
    return RedirectResponse("/docs")
