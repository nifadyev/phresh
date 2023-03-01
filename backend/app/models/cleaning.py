from enum import Enum

from app.models.core import CoreModel, DateTimeModelMixin, IDModelMixin
from app.models.user import UserPublic


class CleaningType(str, Enum):
    dust_up = "dust_up"
    spot_clean = "spot_clean"
    full_clean = "full_clean"


class CleaningBase(CoreModel):
    """All common characteristics of our Cleaning resource."""

    name: str | None
    description: str | None
    price: float | None
    cleaning_type: CleaningType | None = "spot_clean"


class CleaningCreate(CleaningBase):
    name: str
    price: float


class CleaningUpdate(CleaningBase):
    cleaning_type: CleaningType | None


class CleaningInDB(IDModelMixin, DateTimeModelMixin, CleaningBase):
    name: str
    price: float
    cleaning_type: CleaningType
    owner: int


class CleaningPublic(CleaningInDB):
    owner: int | UserPublic
