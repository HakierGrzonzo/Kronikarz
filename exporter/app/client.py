from os import environ

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

from .kronikarz_backend_client.client import AuthenticatedClient

API_ROOT = environ.get("BACKEND", "http://localhost:8000")

# This is the authentication header
auth_schema = OAuth2PasswordBearer(f"{API_ROOT}/api/auth/jwt/login")


async def get_client(token: str = Depends(auth_schema)):
    """
    A function to create authenticated clients for Kronikarz backend
    """
    client = AuthenticatedClient(
        API_ROOT,
        token,
        timeout=10,
        verify_ssl=False,
        raise_on_unexpected_status=True,
    )
    yield client
