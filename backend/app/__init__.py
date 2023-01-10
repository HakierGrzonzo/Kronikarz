from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from .field_sets import get_field_set_router
from .files import get_file_router
from .node import get_node_router
from .object_store import init_minio_buckets
from .trees import get_tree_router
from .users import (
    UserCreate,
    UserRead,
    UserUpdate,
    cookie_backend,
    fastapi_users,
    token_backend,
)

app = FastAPI(title="Kronikarz backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def init_application():
    await init_minio_buckets()


app.include_router(
    fastapi_users.get_auth_router(token_backend),
    prefix="/api/auth/jwt",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_auth_router(cookie_backend),
    prefix="/api/auth/cookie",
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
    get_tree_router(fastapi_users), prefix="/api/trees", tags=["trees"]
)

app.include_router(
    get_node_router(fastapi_users), prefix="/api/nodes", tags=["nodes"]
)

app.include_router(
    get_field_set_router(fastapi_users), prefix="/api/fields", tags=["fields"]
)

app.include_router(
    get_file_router(fastapi_users), prefix="/api/files", tags=["files"]
)


@app.get("/", response_class=RedirectResponse)
def redirect_to_docs():
    """Redirects the developer to the docs, if they forget to add `/docs` to
    the url."""
    return RedirectResponse("/docs")
