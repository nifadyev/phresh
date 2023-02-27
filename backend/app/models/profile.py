from app.models.core import CoreModel, DateTimeModelMixin, IDModelMixin
from pydantic import EmailStr, HttpUrl


class ProfileBase(CoreModel):
    full_name: str | None
    phone_number: str | None
    bio: str | None
    image: HttpUrl | None


class ProfileCreate(ProfileBase):
    """The only field required to create a profile is the users id."""

    user_id: int


class ProfileUpdate(ProfileBase):
    """Allow users to update any or no fields, as long as it's not user_id."""


class ProfileInDB(IDModelMixin, DateTimeModelMixin, ProfileBase):
    user_id: int
    username: str | None
    email: EmailStr | None


class ProfilePublic(ProfileInDB):
    pass
