import jwt
import pytest
from app.core.config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    JWT_ALGORITHM,
    JWT_AUDIENCE,
    SECRET_KEY,
)
from app.db.repositories.users import UsersRepository
from app.models.user import UserInDB, UserPublic
from app.services import auth_service
from databases import Database
from fastapi import FastAPI
from httpx import AsyncClient
from pydantic import ValidationError
from starlette import status
from starlette.datastructures import Secret

pytestmark = pytest.mark.asyncio


class TestUserRoutes:
    async def test_routes_exist(self, app: FastAPI, client: AsyncClient) -> None:
        new_user = {
            "email": "test@email.io",
            "username": "test_username",
            "password": "testpassword",
        }

        response = await client.post(
            app.url_path_for("users:register-new-user"), json={"new_user": new_user}
        )

        assert response.status_code != status.HTTP_404_NOT_FOUND


class TestUserRegistration:
    async def test_users_can_register_successfully(
        self, app: FastAPI, client: AsyncClient, db: Database
    ) -> None:
        user_repo = UsersRepository(db)
        new_user = {
            "email": "shakira@shakira.io",
            "username": "shakirashakira",
            "password": "chantaje",
        }
        # make sure user doesn't exist yet
        user_in_db = await user_repo.get_user_by_email(email=new_user["email"])
        assert user_in_db is None

        # send post request to create user and ensure it is successful
        response = await client.post(
            app.url_path_for("users:register-new-user"), json={"new_user": new_user}
        )
        assert response.status_code == status.HTTP_201_CREATED

        # ensure that the user now exists in the db
        user_in_db = await user_repo.get_user_by_email(email=new_user["email"])
        assert user_in_db is not None
        assert user_in_db.email == new_user["email"]
        assert user_in_db.username == new_user["username"]

        # check that the user returned in the response is equal to the user in the database
        created_user = UserPublic(**response.json()).dict(exclude={"access_token"})
        assert created_user == user_in_db.dict(exclude={"password", "salt"})

    @pytest.mark.parametrize(
        ("attr", "value", "status_code"),
        (
            ("email", "shakira@shakira.io", status.HTTP_400_BAD_REQUEST),
            ("username", "shakirashakira", status.HTTP_400_BAD_REQUEST),
            ("email", "invalid_email@one@two.io", status.HTTP_422_UNPROCESSABLE_ENTITY),
            ("password", "short", status.HTTP_422_UNPROCESSABLE_ENTITY),
            ("username", "shakira@#$%^<>", status.HTTP_422_UNPROCESSABLE_ENTITY),
            ("username", "ab", status.HTTP_422_UNPROCESSABLE_ENTITY),
        ),
    )
    async def test_user_registration_fails_when_credentials_are_taken(
        self,
        app: FastAPI,
        client: AsyncClient,
        db: Database,
        attr: str,
        value: str,
        status_code: int,
    ) -> None:
        new_user = {
            "email": "nottaken@email.io",
            "username": "not_taken_username",
            "password": "freepassword",
        }
        new_user[attr] = value

        response = await client.post(
            app.url_path_for("users:register-new-user"), json={"new_user": new_user}
        )

        assert response.status_code == status_code

    async def test_users_saved_password_is_hashed_and_has_salt(
        self, app: FastAPI, client: AsyncClient, db: Database
    ) -> None:
        user_repo = UsersRepository(db)
        new_user = {
            "email": "beyonce@knowles.io",
            "username": "queenbey",
            "password": "destinyschild",
        }

        # send post request to create user and ensure it is successful
        response = await client.post(
            app.url_path_for("users:register-new-user"), json={"new_user": new_user}
        )

        user_in_db = await user_repo.get_user_by_email(email=new_user["email"])
        assert response.status_code == status.HTTP_201_CREATED
        # ensure that the users password is hashed in the db
        # and that we can verify it using our auth service
        assert user_in_db is not None
        assert user_in_db.salt is not None
        assert user_in_db.salt != "123"
        assert user_in_db.password != new_user["password"]
        assert auth_service.verify_password(
            password=new_user["password"],
            salt=user_in_db.salt,
            hashed_pw=user_in_db.password,
        )


class TestAuthTokens:
    async def test_can_create_access_token_successfully(
        self, app: FastAPI, client: AsyncClient, test_user: UserInDB
    ) -> None:
        access_token = auth_service.create_access_token_for_user(
            user=test_user,
            secret_key=str(SECRET_KEY),
            audience=JWT_AUDIENCE,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES,
        )

        creds = jwt.decode(
            access_token,
            str(SECRET_KEY),
            audience=JWT_AUDIENCE,
            algorithms=[JWT_ALGORITHM],
        )

        assert creds.get("username") is not None
        assert creds["username"] == test_user.username
        assert creds["aud"] == JWT_AUDIENCE

    async def test_token_missing_user_is_invalid(
        self, app: FastAPI, client: AsyncClient
    ) -> None:
        access_token = auth_service.create_access_token_for_user(
            user=None,
            secret_key=str(SECRET_KEY),
            audience=JWT_AUDIENCE,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES,
        )

        with pytest.raises(jwt.PyJWTError):
            jwt.decode(
                access_token,
                str(SECRET_KEY),
                audience=JWT_AUDIENCE,
                algorithms=[JWT_ALGORITHM],
            )

    @pytest.mark.parametrize(
        ("secret_key", "jwt_audience", "exception"),
        (
            ("wrong-secret", JWT_AUDIENCE, jwt.InvalidSignatureError),
            (None, JWT_AUDIENCE, jwt.InvalidSignatureError),
            (SECRET_KEY, "othersite:auth", jwt.InvalidAudienceError),
            (SECRET_KEY, None, ValidationError),
        ),
    )
    async def test_invalid_token_content_raises_error(
        self,
        app: FastAPI,
        client: AsyncClient,
        test_user: UserInDB,
        secret_key: str | Secret,
        jwt_audience: str,
        exception: type[BaseException],
    ) -> None:
        with pytest.raises(exception):
            access_token = auth_service.create_access_token_for_user(
                user=test_user,
                secret_key=str(secret_key),
                audience=jwt_audience,
                expires_in=ACCESS_TOKEN_EXPIRE_MINUTES,
            )
            jwt.decode(
                access_token,
                str(SECRET_KEY),
                audience=JWT_AUDIENCE,
                algorithms=[JWT_ALGORITHM],
            )
