from enum import Enum

from app.models.cleaning import CleaningPublic
from app.models.core import CoreModel, DateTimeModelMixin
from app.models.user import UserPublic


class OfferStatus(str, Enum):
    accepted = "accepted"
    rejected = "rejected"
    pending = "pending"
    cancelled = "cancelled"


class OfferBase(CoreModel):
    user_id: int | None
    cleaning_id: int | None
    status: OfferStatus | None = OfferStatus.pending


class OfferCreate(OfferBase):
    user_id: int
    cleaning_id: int


class OfferUpdate(CoreModel):
    status: OfferStatus


class OfferInDB(DateTimeModelMixin, OfferBase):
    user_id: int
    cleaning_id: int


class OfferPublic(OfferInDB):
    user: UserPublic | None
    cleaning: CleaningPublic | None
