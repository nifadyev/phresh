from app.db.repositories.base import BaseRepository
from app.db.repositories.offers import OffersRepository
from app.db.repositories.users import UsersRepository
from app.models.cleaning import (
    CleaningCreate,
    CleaningInDB,
    CleaningPublic,
    CleaningUpdate,
)
from app.models.user import UserInDB
from databases import Database
from fastapi import HTTPException, status

CREATE_CLEANING_QUERY = """
    INSERT INTO cleanings (name, description, price, cleaning_type, owner)
    VALUES (:name, :description, :price, :cleaning_type, :owner)
    RETURNING id, name, description, price, cleaning_type, owner, created_at, updated_at;
"""
GET_CLEANING_BY_ID_QUERY = """
    SELECT id, name, description, price, cleaning_type, owner, created_at, updated_at
    FROM cleanings
    WHERE id = :id;
"""
LIST_ALL_USER_CLEANINGS_QUERY = """
    SELECT id, name, description, price, cleaning_type, owner, created_at, updated_at
    FROM cleanings
    WHERE owner = :owner;
"""
UPDATE_CLEANING_BY_ID_QUERY = """
    UPDATE cleanings
    SET name         = :name,
        description  = :description,
        price        = :price,
        cleaning_type = :cleaning_type
    WHERE id = :id
    RETURNING id, name, description, price, cleaning_type, owner, created_at, updated_at;
"""
DELETE_CLEANING_BY_ID_QUERY = """
    DELETE FROM cleanings
    WHERE id = :id
    RETURNING id;
"""


class CleaningsRepository(BaseRepository):
    """All database actions associated with the Cleaning resource."""

    def __init__(self, db: Database) -> None:
        super().__init__(db)
        self.users_repo = UsersRepository(db)
        self.offers_repo = OffersRepository(db)

    async def create_cleaning(
        self, *, new_cleaning: CleaningCreate, requesting_user: UserInDB
    ) -> CleaningPublic:
        cleaning_record = await self.db.fetch_one(
            query=CREATE_CLEANING_QUERY,
            values={**new_cleaning.dict(), "owner": requesting_user.id},
        )

        return CleaningPublic(**cleaning_record, total_offers=0)

    async def get_cleaning_by_id(
        self, *, id: int, requesting_user: UserInDB, populate: bool = True
    ) -> CleaningInDB | CleaningPublic | None:
        cleaning_record = await self.db.fetch_one(
            query=GET_CLEANING_BY_ID_QUERY, values={"id": id}
        )

        if cleaning_record:
            cleaning = CleaningInDB(**cleaning_record)
            if populate:
                return await self.populate_cleaning(
                    cleaning=cleaning, requesting_user=requesting_user
                )
            return cleaning

        return None

    async def list_all_user_cleanings(
        self, *, requesting_user: UserInDB, populate: bool = True
    ) -> list[CleaningInDB | CleaningPublic]:
        cleaning_records = await self.db.fetch_all(
            query=LIST_ALL_USER_CLEANINGS_QUERY,
            values={"owner": requesting_user.id},
        )
        cleanings = [CleaningInDB(**cleaning) for cleaning in cleaning_records]

        if populate:
            return [
                await self.populate_cleaning(
                    cleaning=cleaning,
                    requesting_user=requesting_user,
                    populate_offers=True,
                )
                for cleaning in cleanings
            ]

        return cleanings

    async def update_cleaning(
        self, *, cleaning: CleaningInDB, cleaning_update: CleaningUpdate
    ) -> CleaningPublic:
        cleaning_update_params = cleaning.copy(
            update=cleaning_update.dict(exclude_unset=True),
        )

        if cleaning_update_params.cleaning_type is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid cleaning type. Cannot be None.",
            )

        updated_cleaning = await self.db.fetch_one(
            query=UPDATE_CLEANING_BY_ID_QUERY,
            values=cleaning_update_params.dict(
                exclude={
                    "owner",
                    "offers",
                    "total_offers",
                    "created_at",
                    "updated_at",
                },
            ),
        )

        return await self.populate_cleaning(
            cleaning=CleaningInDB(**updated_cleaning),
            populate_offers=True,
        )

    async def delete_cleaning_by_id(self, *, cleaning: CleaningInDB) -> int:
        return await self.db.execute(
            query=DELETE_CLEANING_BY_ID_QUERY, values={"id": cleaning.id}
        )

    async def populate_cleaning(
        self,
        *,
        cleaning: CleaningInDB,
        requesting_user: UserInDB = None,
        populate_offers: bool = False,
    ) -> CleaningPublic:
        """Cleaning models are populated with the owner
        and total number of offers made for it.
        If the user is the owner of the cleaning, offers are included by default.
        Otherwise, only include an offer made by the requesting user - if it exists.
        """
        offers = await self.offers_repo.list_offers_for_cleaning(
            cleaning=cleaning,
            populate=populate_offers,
            requesting_user=requesting_user,
        )

        return CleaningPublic(
            **cleaning.dict(exclude={"owner"}),
            owner=await self.users_repo.get_user_by_id(user_id=cleaning.owner),
            total_offers=len(offers),
            # full offers if `populate_offers` is specified,
            # otherwise only the offer from the authed user
            offers=offers
            if populate_offers
            else [
                offer
                for offer in [
                    await self.offers_repo.get_offer_for_cleaning_from_user(
                        cleaning=cleaning,
                        user=requesting_user,
                    )
                ]
                if offer
            ],
            # any other populated fields for cleaning public would be tacked on here
        )
