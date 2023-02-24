import pytest
from app.db.repositories.users import UsersRepository
from app.models.user import UserInDB
from databases import Database
from fastapi import FastAPI
from httpx import AsyncClient
from starlette import status

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
        created_user = UserInDB(
            **response.json(), password="whatever", salt="123"
        ).dict(exclude={"password", "salt"})
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
