import random
from collections.abc import Callable

import pytest
from app.db.repositories.offers import OffersRepository
from app.models.cleaning import CleaningInDB
from app.models.offer import (
    OfferPublic,
    OfferStatus,
)
from app.models.user import UserInDB
from fastapi import FastAPI, status
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


class TestOffersRoutes:
    """Make sure all offers routes don't return 404s."""

    async def test_routes_exist(self, app: FastAPI, client: AsyncClient) -> None:
        response = await client.post(
            app.url_path_for("offers:create-offer", cleaning_id=1)
        )
        assert response.status_code != status.HTTP_404_NOT_FOUND

        response = await client.get(
            app.url_path_for("offers:list-offers-for-cleaning", cleaning_id=1)
        )
        assert response.status_code != status.HTTP_404_NOT_FOUND

        response = await client.get(
            app.url_path_for(
                "offers:get-offer-from-user", cleaning_id=1, username="bradpitt"
            )
        )
        assert response.status_code != status.HTTP_404_NOT_FOUND

        response = await client.put(
            app.url_path_for(
                "offers:accept-offer-from-user", cleaning_id=1, username="bradpitt"
            )
        )
        assert response.status_code != status.HTTP_404_NOT_FOUND

        response = await client.put(
            app.url_path_for("offers:cancel-offer-from-user", cleaning_id=1)
        )
        assert response.status_code != status.HTTP_404_NOT_FOUND

        response = await client.delete(
            app.url_path_for("offers:rescind-offer-from-user", cleaning_id=1)
        )
        assert response.status_code != status.HTTP_404_NOT_FOUND


class TestCreateOffers:
    async def test_user_can_successfully_create_offer_for_other_users_cleaning_job(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_cleaning: CleaningInDB,
        test_user3: UserInDB,
    ) -> None:
        authorized_client = create_authorized_client(user=test_user3)

        response = await authorized_client.post(
            app.url_path_for("offers:create-offer", cleaning_id=test_cleaning.id)
        )

        offer = OfferPublic(**response.json())
        assert response.status_code == status.HTTP_201_CREATED
        assert offer.user_id == test_user3.id
        assert offer.cleaning_id == test_cleaning.id
        assert offer.status == OfferStatus.pending

    async def test_user_cant_create_duplicate_offers(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_cleaning: CleaningInDB,
        test_user4: UserInDB,
    ) -> None:
        authorized_client = create_authorized_client(user=test_user4)

        response = await authorized_client.post(
            app.url_path_for("offers:create-offer", cleaning_id=test_cleaning.id)
        )
        assert response.status_code == status.HTTP_201_CREATED

        response = await authorized_client.post(
            app.url_path_for("offers:create-offer", cleaning_id=test_cleaning.id)
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    async def test_user_unable_to_create_offer_for_their_own_cleaning_job(
        self,
        app: FastAPI,
        authorized_client: AsyncClient,
        test_user: UserInDB,
        test_cleaning: CleaningInDB,
    ) -> None:
        response = await authorized_client.post(
            app.url_path_for("offers:create-offer", cleaning_id=test_cleaning.id)
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    async def test_unauthenticated_users_cant_create_offers(
        self,
        app: FastAPI,
        client: AsyncClient,
        test_cleaning: CleaningInDB,
    ) -> None:
        response = await client.post(
            app.url_path_for("offers:create-offer", cleaning_id=test_cleaning.id)
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.parametrize(
        ("id", "status_code"),
        (
            (5000000, status.HTTP_404_NOT_FOUND),
            (-1, status.HTTP_422_UNPROCESSABLE_ENTITY),
            (None, status.HTTP_422_UNPROCESSABLE_ENTITY),
        ),
    )
    async def test_wrong_id_gives_proper_error_status(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_user5: UserInDB,
        id: int,
        status_code: int,
    ) -> None:
        authorized_client = create_authorized_client(user=test_user5)

        response = await authorized_client.post(
            app.url_path_for("offers:create-offer", cleaning_id=id)
        )

        assert response.status_code == status_code


class TestGetOffers:
    async def test_cleaning_owner_can_get_offer_from_user(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_user2: UserInDB,
        test_user_list: list[UserInDB],
        test_cleaning_with_offers: CleaningInDB,
    ) -> None:
        authorized_client = create_authorized_client(user=test_user2)
        selected_user = random.choice(test_user_list)

        response = await authorized_client.get(
            app.url_path_for(
                "offers:get-offer-from-user",
                cleaning_id=test_cleaning_with_offers.id,
                username=selected_user.username,
            )
        )

        offer = OfferPublic(**response.json())
        assert response.status_code == status.HTTP_200_OK
        assert offer.user_id == selected_user.id

    async def test_offer_owner_can_get_own_offer(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_user_list: list[UserInDB],
        test_cleaning_with_offers: CleaningInDB,
    ) -> None:
        first_test_user = test_user_list[0]
        authorized_client = create_authorized_client(user=first_test_user)

        response = await authorized_client.get(
            app.url_path_for(
                "offers:get-offer-from-user",
                cleaning_id=test_cleaning_with_offers.id,
                username=first_test_user.username,
            )
        )

        offer = OfferPublic(**response.json())
        assert response.status_code == status.HTTP_200_OK
        assert offer.user_id == first_test_user.id

    async def test_other_authenticated_users_cant_view_offer_from_user(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_user_list: list[UserInDB],
        test_cleaning_with_offers: CleaningInDB,
    ) -> None:
        first_test_user = test_user_list[0]
        second_test_user = test_user_list[1]
        authorized_client = create_authorized_client(user=first_test_user)

        response = await authorized_client.get(
            app.url_path_for(
                "offers:get-offer-from-user",
                cleaning_id=test_cleaning_with_offers.id,
                username=second_test_user.username,
            )
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    async def test_cleaning_owner_can_get_all_offers_for_cleanings(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_user2: UserInDB,
        test_user_list: list[UserInDB],
        test_cleaning_with_offers: CleaningInDB,
    ) -> None:
        authorized_client = create_authorized_client(user=test_user2)

        response = await authorized_client.get(
            app.url_path_for(
                "offers:list-offers-for-cleaning",
                cleaning_id=test_cleaning_with_offers.id,
            )
        )

        assert response.status_code == status.HTTP_200_OK
        for offer in response.json():
            assert any(offer["user_id"] == user.id for user in test_user_list)

    async def test_non_owners_forbidden_from_fetching_all_offers_for_cleaning(
        self,
        app: FastAPI,
        authorized_client: AsyncClient,
        test_cleaning_with_offers: CleaningInDB,
    ) -> None:
        response = await authorized_client.get(
            app.url_path_for(
                "offers:list-offers-for-cleaning",
                cleaning_id=test_cleaning_with_offers.id,
            )
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestAcceptOffers:
    async def test_cleaning_owner_can_accept_offer_successfully(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_user2: UserInDB,
        test_user_list: list[UserInDB],
        test_cleaning_with_offers: CleaningInDB,
    ) -> None:
        selected_user = random.choice(test_user_list)
        authorized_client = create_authorized_client(user=test_user2)

        response = await authorized_client.put(
            app.url_path_for(
                "offers:accept-offer-from-user",
                cleaning_id=test_cleaning_with_offers.id,
                username=selected_user.username,
            )
        )

        accepted_offer = OfferPublic(**response.json())
        assert response.status_code == status.HTTP_200_OK
        assert accepted_offer.status == OfferStatus.accepted
        assert accepted_offer.user_id == selected_user.id
        assert accepted_offer.cleaning_id == test_cleaning_with_offers.id

    async def test_non_owner_forbidden_from_accepting_offer_for_cleaning(
        self,
        app: FastAPI,
        authorized_client: AsyncClient,
        test_user_list: list[UserInDB],
        test_cleaning_with_offers: CleaningInDB,
    ) -> None:
        selected_user = random.choice(test_user_list)

        response = await authorized_client.put(
            app.url_path_for(
                "offers:accept-offer-from-user",
                cleaning_id=test_cleaning_with_offers.id,
                username=selected_user.username,
            )
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    async def test_cleaning_owner_cant_accept_multiple_offers(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_user2: UserInDB,
        test_user_list: list[UserInDB],
        test_cleaning_with_offers: CleaningInDB,
    ) -> None:
        authorized_client = create_authorized_client(user=test_user2)

        response = await authorized_client.put(
            app.url_path_for(
                "offers:accept-offer-from-user",
                cleaning_id=test_cleaning_with_offers.id,
                username=test_user_list[0].username,
            )
        )
        assert response.status_code == status.HTTP_200_OK

        response = await authorized_client.put(
            app.url_path_for(
                "offers:accept-offer-from-user",
                cleaning_id=test_cleaning_with_offers.id,
                username=test_user_list[1].username,
            )
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    async def test_accepting_one_offer_rejects_all_other_offers(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_user2: UserInDB,
        test_user_list: list[UserInDB],
        test_cleaning_with_offers: CleaningInDB,
    ) -> None:
        selected_user = random.choice(test_user_list)
        authorized_client = create_authorized_client(user=test_user2)

        response = await authorized_client.put(
            app.url_path_for(
                "offers:accept-offer-from-user",
                cleaning_id=test_cleaning_with_offers.id,
                username=selected_user.username,
            )
        )
        assert response.status_code == status.HTTP_200_OK

        response = await authorized_client.get(
            app.url_path_for(
                "offers:list-offers-for-cleaning",
                cleaning_id=test_cleaning_with_offers.id,
            )
        )
        assert response.status_code == status.HTTP_200_OK
        offers = [OfferPublic(**o) for o in response.json()]
        for offer in offers:
            if offer.user_id == selected_user.id:
                assert offer.status == OfferStatus.accepted
            else:
                assert offer.status == OfferStatus.rejected


class TestCancelOffers:
    async def test_user_can_cancel_offer_after_it_has_been_accepted(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_user3: UserInDB,
        test_cleaning_with_accepted_offer: CleaningInDB,
    ) -> None:
        accepted_user_client = create_authorized_client(user=test_user3)

        response = await accepted_user_client.put(
            app.url_path_for(
                "offers:cancel-offer-from-user",
                cleaning_id=test_cleaning_with_accepted_offer.id,
            )
        )

        cancelled_offer = OfferPublic(**response.json())
        assert response.status_code == status.HTTP_200_OK
        assert cancelled_offer.status == OfferStatus.cancelled
        assert cancelled_offer.user_id == test_user3.id
        assert cancelled_offer.cleaning_id == test_cleaning_with_accepted_offer.id

    async def test_only_accepted_offers_can_be_cancelled(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_user4: UserInDB,
        test_cleaning_with_accepted_offer: CleaningInDB,
    ) -> None:
        selected_user_client = create_authorized_client(user=test_user4)

        response = await selected_user_client.put(
            app.url_path_for(
                "offers:cancel-offer-from-user",
                cleaning_id=test_cleaning_with_accepted_offer.id,
            )
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    async def test_cancelling_offer_sets_all_others_to_pending(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_user3: UserInDB,
        test_cleaning_with_accepted_offer: CleaningInDB,
    ) -> None:
        accepted_user_client = create_authorized_client(user=test_user3)

        res = await accepted_user_client.put(
            app.url_path_for(
                "offers:cancel-offer-from-user",
                cleaning_id=test_cleaning_with_accepted_offer.id,
            )
        )

        assert res.status_code == status.HTTP_200_OK
        offers_repo = OffersRepository(app.state._db)
        offers = await offers_repo.list_offers_for_cleaning(
            cleaning=test_cleaning_with_accepted_offer
        )
        for offer in offers:
            if offer.user_id == test_user3.id:
                assert offer.status == OfferStatus.cancelled
            else:
                assert offer.status == OfferStatus.pending


class TestRescindOffers:
    async def test_user_can_successfully_rescind_pending_offer(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_user4: UserInDB,
        test_user_list: list[UserInDB],
        test_cleaning_with_offers: CleaningInDB,
    ) -> None:
        authorized_client = create_authorized_client(user=test_user4)

        response = await authorized_client.delete(
            app.url_path_for(
                "offers:rescind-offer-from-user",
                cleaning_id=test_cleaning_with_offers.id,
            )
        )

        assert response.status_code == status.HTTP_200_OK
        offers_repo = OffersRepository(app.state._db)
        offers = await offers_repo.list_offers_for_cleaning(
            cleaning=test_cleaning_with_offers
        )
        user_ids = [user.id for user in test_user_list]
        for offer in offers:
            assert offer.user_id in user_ids
            assert offer.user_id != test_user4.id

    async def test_users_cannot_rescind_accepted_offers(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_user3: UserInDB,
        test_cleaning_with_accepted_offer: CleaningInDB,
    ) -> None:
        authorized_client = create_authorized_client(user=test_user3)

        response = await authorized_client.delete(
            app.url_path_for(
                "offers:rescind-offer-from-user",
                cleaning_id=test_cleaning_with_accepted_offer.id,
            )
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    async def test_users_cannot_rescind_cancelled_offers(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_user3: UserInDB,
        test_cleaning_with_accepted_offer: CleaningInDB,
    ) -> None:
        authorized_client = create_authorized_client(user=test_user3)

        response = await authorized_client.put(
            app.url_path_for(
                "offers:cancel-offer-from-user",
                cleaning_id=test_cleaning_with_accepted_offer.id,
            )
        )
        assert response.status_code == status.HTTP_200_OK

        response = await authorized_client.delete(
            app.url_path_for(
                "offers:rescind-offer-from-user",
                cleaning_id=test_cleaning_with_accepted_offer.id,
            )
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    async def test_users_cannot_rescind_rejected_offers(
        self,
        app: FastAPI,
        create_authorized_client: Callable,
        test_user4: UserInDB,
        test_cleaning_with_accepted_offer: CleaningInDB,
    ) -> None:
        authorized_client = create_authorized_client(user=test_user4)

        response = await authorized_client.delete(
            app.url_path_for(
                "offers:rescind-offer-from-user",
                cleaning_id=test_cleaning_with_accepted_offer.id,
            )
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
