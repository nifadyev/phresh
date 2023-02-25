from datetime import datetime, timedelta, timezone

from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES, JWT_AUDIENCE
from app.models.core import CoreModel
from pydantic import EmailStr


class JWTMeta(CoreModel):
    iss: str = "phresh.io"
    aud: str = JWT_AUDIENCE
    iat: float = datetime.timestamp(datetime.now(tz=timezone.utc))
    exp: float = datetime.timestamp(
        datetime.now(tz=timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )


class JWTCreds(CoreModel):
    """How we'll identify users."""

    sub: EmailStr
    username: str


class JWTPayload(JWTMeta, JWTCreds):
    """JWT Payload right before it's encoded - combine meta and username."""


class AccessToken(CoreModel):
    access_token: str
    token_type: str
