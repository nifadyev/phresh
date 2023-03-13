from app.db.repositories.base import BaseRepository
from app.db.repositories.users import UsersRepository
from app.models.cleaning import CleaningInDB
from app.models.offer import OfferCreate, OfferInDB, OfferPublic, OfferUpdate
from app.models.user import UserInDB
from databases import Database

CREATE_OFFER_FOR_CLEANING_QUERY = """
    INSERT INTO user_offers_for_cleanings (cleaning_id, user_id, status)
    VALUES (:cleaning_id, :user_id, :status)
    RETURNING cleaning_id, user_id, status, created_at, updated_at;
"""
LIST_OFFERS_FOR_CLEANING_QUERY = """
    SELECT cleaning_id, user_id, status, created_at, updated_at
    FROM user_offers_for_cleanings
    WHERE cleaning_id = :cleaning_id;
"""
GET_OFFER_FOR_CLEANING_FROM_USER_QUERY = """
    SELECT cleaning_id, user_id, status, created_at, updated_at
    FROM user_offers_for_cleanings
    WHERE cleaning_id = :cleaning_id AND user_id = :user_id;
"""
ACCEPT_OFFER_QUERY = """
    UPDATE user_offers_for_cleanings
    SET status = 'accepted'
    WHERE cleaning_id = :cleaning_id AND user_id = :user_id
    RETURNING cleaning_id, user_id, status, created_at, updated_at;
"""
REJECT_ALL_OTHER_OFFERS_QUERY = """
    UPDATE user_offers_for_cleanings
    SET status = 'rejected'
    WHERE cleaning_id = :cleaning_id
    AND user_id != :user_id
    AND status = 'pending';
"""
CANCEL_OFFER_QUERY = """
    UPDATE user_offers_for_cleanings
    SET status = 'cancelled'
    WHERE cleaning_id = :cleaning_id AND user_id = :user_id
    RETURNING cleaning_id, user_id, status, created_at, updated_at;
"""
SET_ALL_OTHER_OFFERS_AS_PENDING_QUERY = """
    UPDATE user_offers_for_cleanings
    SET status = 'pending'
    WHERE cleaning_id = :cleaning_id
    AND user_id != :user_id
    AND status = 'rejected';
"""
RESCIND_OFFER_QUERY = """
    DELETE FROM user_offers_for_cleanings
    WHERE cleaning_id = :cleaning_id
    AND user_id = :user_id;
"""
MARK_OFFER_COMPLETED_QUERY = """
    UPDATE user_offers_for_cleanings
    SET status = 'completed'
    WHERE cleaning_id = :cleaning_id
      AND user_id     = :user_id
    RETURNING *;
"""


class OffersRepository(BaseRepository):
    def __init__(self, db: Database) -> None:
        super().__init__(db)
        self.users_repo = UsersRepository(db)

    async def create_offer_for_cleaning(
        self, *, new_offer: OfferCreate, requesting_user: UserInDB = None
    ) -> OfferPublic:
        created_offer = await self.db.fetch_one(
            query=CREATE_OFFER_FOR_CLEANING_QUERY,
            values={**new_offer.dict(), "status": "pending"},
        )

        return OfferPublic(**created_offer, user=requesting_user)

    async def list_offers_for_cleaning(
        self,
        *,
        cleaning: CleaningInDB,
        populate: bool = True,
        requesting_user = None,
    ) -> list[OfferInDB | OfferPublic]:
        # ? use requesting_user as user.id
        offer_records = await self.db.fetch_all(
            query=LIST_OFFERS_FOR_CLEANING_QUERY,
            values={"cleaning_id": cleaning.id},
        )
        offers = [OfferInDB(**o) for o in offer_records]

        if populate:
            return [await self.populate_offer(offer=offer) for offer in offers]

        return offers

    async def populate_offer(self, *, offer: OfferInDB) -> OfferPublic:
        return OfferPublic(
            **offer.dict(),
            user=await self.users_repo.get_user_by_id(user_id=offer.user_id),
            # could populate cleaning here as well if needed
        )

    async def get_offer_for_cleaning_from_user(
        self, *, cleaning: CleaningInDB, user: UserInDB
    ) -> OfferPublic | None:
        offer_record = await self.db.fetch_one(
            query=GET_OFFER_FOR_CLEANING_FROM_USER_QUERY,
            values={"cleaning_id": cleaning.id, "user_id": user.id},
        )

        return OfferPublic(**offer_record) if offer_record else None

    async def accept_offer(
        self, *, offer: OfferInDB, offer_update: OfferUpdate
    ) -> OfferPublic:
        async with self.db.transaction():
            accepted_offer = await self.db.fetch_one(
                query=ACCEPT_OFFER_QUERY,  # accept current offer
                values={"cleaning_id": offer.cleaning_id, "user_id": offer.user_id},
            )
            await self.db.execute(
                query=REJECT_ALL_OTHER_OFFERS_QUERY,  # reject all other offers
                values={"cleaning_id": offer.cleaning_id, "user_id": offer.user_id},
            )

            return await self.populate_offer(offer=OfferInDB(**accepted_offer))

    async def cancel_offer(
        self, *, offer: OfferInDB, offer_update: OfferUpdate
    ) -> OfferPublic:
        async with self.db.transaction():
            cancelled_offer = await self.db.fetch_one(
                query=CANCEL_OFFER_QUERY,  # cancel current offer
                values={"cleaning_id": offer.cleaning_id, "user_id": offer.user_id},
            )
            await self.db.execute(
                query=SET_ALL_OTHER_OFFERS_AS_PENDING_QUERY,  # set all other offers to pending again
                values={"cleaning_id": offer.cleaning_id, "user_id": offer.user_id},
            )

            return await self.populate_offer(offer=OfferInDB(**cancelled_offer))

    async def rescind_offer(self, *, offer: OfferInDB) -> int:
        return await self.db.execute(
            query=RESCIND_OFFER_QUERY,  # rescinding an offer deletes it as long as it's pending
            values={"cleaning_id": offer.cleaning_id, "user_id": offer.user_id},
        )

    async def mark_offer_completed(
        self, *, cleaning: CleaningInDB, cleaner: UserInDB
    ) -> OfferPublic:
        offer_record = await self.db.fetch_one(
            query=MARK_OFFER_COMPLETED_QUERY,  # owner of cleaning marks job status as completed
            values={"cleaning_id": cleaning.id, "user_id": cleaner.id},
        )

        return OfferPublic(**offer_record, user=cleaner)
