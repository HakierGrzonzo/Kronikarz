from typing import Dict, List, Optional

from fastapi import Depends, Request
from fastapi_users import BaseUserManager, FastAPIUsers, schemas
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    CookieTransport,
    JWTStrategy,
)
from fastapi_users.db.base import BaseUserDatabase
from pydantic import Field

from .models import InputProps
from .surreal_orm import Session, get_db
from .tables import User


class UserRead(schemas.BaseUser):
    trees: List[str] = Field(default_factory=lambda: list())
    field_set_templates: List[str] = Field(default_factory=lambda: list())


class UserCreate(schemas.BaseUserCreate):
    pass


class UserUpdate(schemas.BaseUserUpdate):
    pass


class SurrealUsersDatabase(BaseUserDatabase[User, str]):
    """An interface between the microORM for surrealDB and fastapi_users"""

    def __init__(self, session: Session) -> None:
        self._session = session

    async def get(self, id: str) -> Optional[User]:
        try:
            return await self._session.User.select_id(id)
        except Exception as e:
            print(e)

    async def get_by_email(self, email: str) -> Optional[User]:
        accounts = await self._session.User.select("email = {}", (email,))
        if len(accounts) == 1:
            return accounts[0]
        elif len(accounts) == 0:
            return
        else:
            raise Exception(f"Many accounts with the same email <{email}>!")

    async def create(self, create_dict: Dict) -> User:
        base_field_set = await self._session.FieldSetTemplate.create(
            name="Base Set",
            fields=[InputProps(name="name", type="text", required=True)],
        )
        res = await self._session.User.create(
            **create_dict, trees=[], field_set_templates=[base_field_set.id]
        )
        await self._session.commit()
        return res

    async def update(self, user: User, update_dict: Dict) -> User:
        res = await self._session.User.patch(user.id, **update_dict)
        await self._session.commit()
        return res

    async def delete(self, user: User) -> None:
        await self._session.User.delete(user.id)
        await self._session.commit()


def get_user_db(session: Session = Depends(get_db)):
    return SurrealUsersDatabase(session)


SECRET = "SECRET"


class UserManager(BaseUserManager[User, str]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    def parse_id(self, value: str) -> str:
        """FastAPIUsers supports uuid or int, we use str so we mock this method"""
        return value

    async def on_after_register(self, user: User, _: Optional[Request] = None):
        print(f"User {user.id} has registered.")

    async def on_after_forgot_password(
        self, user: User, token: str, _: Optional[Request] = None
    ):
        # TODO: send email with token?
        print(f"User {user.id} has forgot their password. Reset token: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, _: Optional[Request] = None
    ):
        # TODO: Send verification token via email?
        print(
            f"Verification requested for user {user.id}. Verification token: {token}"
        )


async def get_user_manager(
    user_db: SurrealUsersDatabase = Depends(get_user_db),
):
    yield UserManager(user_db)


bearer_transport = BearerTransport(tokenUrl="api/auth/jwt/login")
cookie_transport = CookieTransport(
    cookie_name="dev-kronikarz",
    cookie_max_age=36000,
    cookie_secure=False,
    cookie_samesite="strict",
)


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=3600)


token_backend = AuthenticationBackend(
    name="token",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

cookie_backend = AuthenticationBackend(
    name="cookie", transport=cookie_transport, get_strategy=get_jwt_strategy
)

fastapi_users = FastAPIUsers[User, str](
    get_user_manager, [token_backend, cookie_backend]
)

current_active_user = fastapi_users.current_user(active=True)
