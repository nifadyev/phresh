import pytest
import pytest_asyncio
from app.db.repositories.cleanings import CleaningsRepository
from app.models.cleaning import CleaningCreate, CleaningInDB, CleaningPublic
from app.models.user import UserInDB
from databases import Database
from fastapi import FastAPI, status
from httpx import AsyncClient
from starlette import status

# decorate all tests with @pytest.mark.asyncio
pytestmark = pytest.mark.asyncio


@pytest.fixture()
def new_cleaning():
    return CleaningCreate(
        name="test cleaning",
        description="test description",
        price=10.00,
        cleaning_type="spot_clean",
    )


@pytest_asyncio.fixture
async def test_cleanings_list(db: Database, test_user2: UserInDB) -> list[CleaningInDB]:
    cleaning_repo = CleaningsRepository(db)
    return [
        await cleaning_repo.create_cleaning(
            new_cleaning=CleaningCreate(
                name=f"test cleaning {i}",
                description="test description",
                price=20.00,
                cleaning_type="full_clean",
            ),
            requesting_user=test_user2,
        )
        for i in range(5)
    ]


class TestCleaningsRoutes:
    """Check each cleaning route to ensure none return 404s."""

    async def test_routes_exist(self, app: FastAPI, client: AsyncClient) -> None:
        response = await client.post(
            app.url_path_for("cleanings:create-cleaning"), json={}
        )
        assert response.status_code != status.HTTP_404_NOT_FOUND

        response = await client.get(
            app.url_path_for("cleanings:get-cleaning-by-id", cleaning_id=1)
        )
        assert response.status_code != status.HTTP_404_NOT_FOUND

        response = await client.get(
            app.url_path_for("cleanings:list-all-user-cleanings")
        )
        assert response.status_code != status.HTTP_404_NOT_FOUND

        response = await client.put(
            app.url_path_for("cleanings:update-cleaning-by-id", cleaning_id=1)
        )
        assert response.status_code != status.HTTP_404_NOT_FOUND

        response = await client.delete(
            app.url_path_for("cleanings:delete-cleaning-by-id", cleaning_id=0)
        )
        assert response.status_code != status.HTTP_404_NOT_FOUND


class TestCreateCleaning:
    async def test_valid_input_creates_cleaning_belonging_to_user(
        self,
        app: FastAPI,
        authorized_client: AsyncClient,
        test_user: UserInDB,
        new_cleaning: CleaningCreate,
    ) -> None:
        response = await authorized_client.post(
            app.url_path_for("cleanings:create-cleaning"),
            json={"new_cleaning": new_cleaning.dict()},
        )

        created_cleaning = CleaningPublic(**response.json())
        assert response.status_code == status.HTTP_201_CREATED
        assert created_cleaning.name == new_cleaning.name
        assert created_cleaning.price == new_cleaning.price
        assert created_cleaning.cleaning_type == new_cleaning.cleaning_type
        assert created_cleaning.owner == test_user.id

    async def test_unauthorized_user_unable_to_create_cleaning(
        self, app: FastAPI, client: AsyncClient, new_cleaning: CleaningCreate
    ) -> None:
        response = await client.post(
            app.url_path_for("cleanings:create-cleaning"),
            json={"new_cleaning": new_cleaning.dict()},
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.parametrize(
        "invalid_payload",
        (
            (None),
            ({}),
            ({"name": "test"}),
            ({"price": 10.00}),
            ({"name": "test", "description": "test"}),
        ),
    )
    async def test_invalid_input_raises_error(
        self,
        app: FastAPI,
        authorized_client: AsyncClient,
        invalid_payload: dict[str, str | float],
        test_cleaning: CleaningCreate,
    ) -> None:
        response = await authorized_client.post(
            app.url_path_for("cleanings:create-cleaning"),
            json={"new_cleaning": invalid_payload},
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestGetCleaning:
    async def test_get_cleaning_by_id(
        self, app: FastAPI, authorized_client: AsyncClient, test_cleaning: CleaningInDB
    ) -> None:
        response = await authorized_client.get(
            app.url_path_for(
                "cleanings:get-cleaning-by-id", cleaning_id=test_cleaning.id
            )
        )

        cleaning = CleaningPublic(**response.json()).dict(exclude={"owner"})
        assert response.status_code == status.HTTP_200_OK
        assert cleaning == test_cleaning.dict(exclude={"owner"})

    async def test_unauthorized_users_cant_access_cleanings(
        self, app: FastAPI, client: AsyncClient, test_cleaning: CleaningInDB
    ) -> None:
        response = await client.get(
            app.url_path_for(
                "cleanings:get-cleaning-by-id", cleaning_id=test_cleaning.id
            )
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.parametrize(
        ("id", "status_code"),
        (
            (50000, status.HTTP_404_NOT_FOUND),
            (-1, status.HTTP_422_UNPROCESSABLE_ENTITY),
            (None, status.HTTP_422_UNPROCESSABLE_ENTITY),
        ),
    )
    async def test_wrong_id_returns_error(
        self, app: FastAPI, authorized_client: AsyncClient, id: int, status_code: int
    ) -> None:
        response = await authorized_client.get(
            app.url_path_for("cleanings:get-cleaning-by-id", cleaning_id=id)
        )

        assert response.status_code == status_code

    async def test_get_all_cleanings_returns_only_user_owned_cleanings(
        self,
        app: FastAPI,
        authorized_client: AsyncClient,
        test_user: UserInDB,
        db: Database,
        test_cleaning: CleaningInDB,
        test_cleanings_list: list[CleaningInDB],
    ) -> None:
        response = await authorized_client.get(
            app.url_path_for("cleanings:list-all-user-cleanings")
        )

        cleanings = [CleaningInDB(**l) for l in response.json()]
        assert response.status_code == status.HTTP_200_OK
        assert isinstance(response.json(), list)
        assert len(response.json()) > 0
        # check that a cleaning created by our user is returned
        assert test_cleaning in cleanings
        # test that all cleanings returned are owned by this user
        assert all(cleaning.owner == test_user.id for cleaning in cleanings)
        # assert all cleanings created by another user not included (redundant, but fine)
        assert all(c not in cleanings for c in test_cleanings_list)


class TestUpdateCleaning:
    @pytest.mark.parametrize(
        ("attrs_to_change", "values"),
        (
            (["name"], ["new fake cleaning name"]),
            (["description"], ["new fake cleaning description"]),
            (["price"], [3.14]),
            (["cleaning_type"], ["full_clean"]),
            (
                ["name", "description"],
                ["extra new fake cleaning name", "extra new fake cleaning description"],
            ),
            (["price", "cleaning_type"], [42.00, "dust_up"]),
        ),
    )
    async def test_update_cleaning_with_valid_input(
        self,
        app: FastAPI,
        authorized_client: AsyncClient,
        test_cleaning: CleaningInDB,
        attrs_to_change: list[str],
        values: list[str],
    ) -> None:
        cleaning_update = {
            "cleaning_update": {
                attrs_to_change[i]: values[i] for i in range(len(attrs_to_change))
            }
        }

        response = await authorized_client.put(
            app.url_path_for(
                "cleanings:update-cleaning-by-id", cleaning_id=test_cleaning.id
            ),
            json=cleaning_update,
        )

        updated_cleaning = CleaningInDB(**response.json())
        assert response.status_code == status.HTTP_200_OK
        # make sure it's the same cleaning
        assert updated_cleaning.id == test_cleaning.id
        # make sure that any attribute we updated has changed to the correct value
        for i in range(len(attrs_to_change)):
            assert getattr(updated_cleaning, attrs_to_change[i]) != getattr(
                test_cleaning, attrs_to_change[i]
            )
            assert getattr(updated_cleaning, attrs_to_change[i]) == values[i]
        # make sure that no other attributes' values have changed
        for attr, value in updated_cleaning.dict().items():
            if attr not in attrs_to_change and attr != "updated_at":
                assert getattr(test_cleaning, attr) == value

    async def test_user_receives_error_if_updating_other_users_cleaning(
        self,
        app: FastAPI,
        authorized_client: AsyncClient,
        test_cleanings_list: list[CleaningInDB],
    ) -> None:
        response = await authorized_client.put(
            app.url_path_for(
                "cleanings:update-cleaning-by-id", cleaning_id=test_cleanings_list[0].id
            ),
            json={"cleaning_update": {"price": 99.99}},
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    async def test_user_cant_change_ownership_of_cleaning(
        self,
        app: FastAPI,
        authorized_client: AsyncClient,
        test_cleaning: CleaningInDB,
        test_user: UserInDB,
        test_user2: UserInDB,
    ) -> None:
        response = await authorized_client.put(
            app.url_path_for(
                "cleanings:update-cleaning-by-id", cleaning_id=test_cleaning.id
            ),
            json={"cleaning_update": {"owner": test_user2.id}},
        )

        cleaning = CleaningPublic(**response.json())
        assert response.status_code == status.HTTP_200_OK
        assert cleaning.owner == test_user.id

    @pytest.mark.parametrize(
        ("id", "payload", "status_code"),
        (
            (-1, {"name": "test"}, status.HTTP_422_UNPROCESSABLE_ENTITY),
            (0, {"name": "test2"}, status.HTTP_422_UNPROCESSABLE_ENTITY),
            (500, {"name": "test3"}, status.HTTP_404_NOT_FOUND),
            (1, None, 422),
            (
                1,
                {"cleaning_type": "invalid cleaning type"},
                status.HTTP_422_UNPROCESSABLE_ENTITY,
            ),
            (1, {"cleaning_type": None}, status.HTTP_400_BAD_REQUEST),
        ),
    )
    async def test_update_cleaning_with_invalid_input_throws_error(
        self,
        app: FastAPI,
        authorized_client: AsyncClient,
        id: int,
        payload: dict[str, str | None],
        status_code: int,
    ) -> None:
        cleaning_update = {"cleaning_update": payload}

        response = await authorized_client.put(
            app.url_path_for("cleanings:update-cleaning-by-id", cleaning_id=id),
            json=cleaning_update,
        )

        assert response.status_code == status_code


class TestDeleteCleaning:
    async def test_can_delete_cleaning_successfully(
        self, app: FastAPI, authorized_client: AsyncClient, test_cleaning: CleaningInDB
    ) -> None:
        response = await authorized_client.delete(
            app.url_path_for(
                "cleanings:delete-cleaning-by-id", cleaning_id=test_cleaning.id
            )
        )

        assert response.status_code == status.HTTP_200_OK

    async def test_user_cant_delete_other_users_cleaning(
        self,
        app: FastAPI,
        authorized_client: AsyncClient,
        test_cleanings_list: list[CleaningInDB],
    ) -> None:
        response = await authorized_client.delete(
            app.url_path_for(
                "cleanings:delete-cleaning-by-id", cleaning_id=test_cleanings_list[0].id
            )
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.parametrize(
        ("id", "status_code"),
        (
            (5000000, status.HTTP_404_NOT_FOUND),
            (0, status.HTTP_422_UNPROCESSABLE_ENTITY),
            (-1, status.HTTP_422_UNPROCESSABLE_ENTITY),
            (None, status.HTTP_422_UNPROCESSABLE_ENTITY),
        ),
    )
    async def test_wrong_id_throws_error(
        self,
        app: FastAPI,
        authorized_client: AsyncClient,
        test_cleaning: CleaningInDB,
        id: int,
        status_code: int,
    ) -> None:
        response = await authorized_client.delete(
            app.url_path_for("cleanings:delete-cleaning-by-id", cleaning_id=id)
        )

        assert response.status_code == status_code
