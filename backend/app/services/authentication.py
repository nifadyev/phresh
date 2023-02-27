from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from app.core.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    JWT_ALGORITHM,
    JWT_AUDIENCE,
    SECRET_KEY,
)
from app.models.token import JWTCreds, JWTMeta, JWTPayload
from app.models.user import UserBase, UserPasswordUpdate
from fastapi import HTTPException, status
from passlib.context import CryptContext
from pydantic import ValidationError

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthException(BaseException):
    """Custom auth exception that can be modified later on."""


class AuthService:
    def create_salt_and_hashed_password(
        self, *, plaintext_password: str
    ) -> UserPasswordUpdate:
        salt = self.generate_salt()
        hashed_password = self.hash_password(password=plaintext_password, salt=salt)

        return UserPasswordUpdate(salt=salt, password=hashed_password)

    def generate_salt(self) -> str:
        return bcrypt.gensalt().decode()

    def hash_password(self, *, password: str, salt: str) -> str:
        return pwd_context.hash(secret=f"{password}{salt}")

    def verify_password(self, *, password: str, salt: str, hashed_pw: str) -> bool:
        return pwd_context.verify(password + salt, hashed_pw)

    def create_access_token_for_user(
        self,
        *,
        user: type[UserBase],
        secret_key: str = str(SECRET_KEY),
        audience: str = JWT_AUDIENCE,
        expires_in: int = ACCESS_TOKEN_EXPIRE_MINUTES,
    ) -> str:
        if not user or not isinstance(user, UserBase):
            return None

        jwt_meta = JWTMeta(
            aud=audience,
            exp=datetime.timestamp(
                datetime.now(tz=timezone.utc) + timedelta(minutes=expires_in)
            ),
        )
        jwt_creds = JWTCreds(sub=user.email, username=user.username)
        token_payload = JWTPayload(**jwt_meta.dict(), **jwt_creds.dict())

        return jwt.encode(token_payload.dict(), secret_key, algorithm=JWT_ALGORITHM)

    def get_username_from_token(self, *, token: str, secret_key: str) -> str | None:
        try:
            decoded_token = jwt.decode(
                token,
                str(secret_key),
                audience=JWT_AUDIENCE,
                algorithms=[JWT_ALGORITHM],
            )
            payload = JWTPayload(**decoded_token)
        except (jwt.PyJWTError, ValidationError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate token credentials.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return payload.username
