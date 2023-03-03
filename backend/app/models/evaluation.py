from app.models.cleaning import CleaningPublic
from app.models.core import CoreModel, DateTimeModelMixin
from app.models.user import UserPublic
from pydantic import NonNegativeInt, confloat, conint


class EvaluationBase(CoreModel):
    no_show: bool = False
    headline: str | None
    comment: str | None
    # ? Move conint(ge=0, le=5) to constant
    professionalism: conint(ge=0, le=5) | None
    completeness: conint(ge=0, le=5) | None
    efficiency: conint(ge=0, le=5) | None
    overall_rating: conint(ge=0, le=5) | None


class EvaluationCreate(EvaluationBase):
    overall_rating: conint(ge=0, le=5)


class EvaluationUpdate(EvaluationBase):
    pass


class EvaluationInDB(DateTimeModelMixin, EvaluationBase):
    cleaner_id: int
    cleaning_id: int


class EvaluationPublic(EvaluationInDB):
    owner: int | UserPublic | None
    cleaner: UserPublic | None
    cleaning: CleaningPublic | None


class EvaluationAggregate(CoreModel):
    # ? Move confloat(ge=0, le=5) to constant
    avg_professionalism: confloat(ge=0, le=5)
    avg_completeness: confloat(ge=0, le=5)
    avg_efficiency: confloat(ge=0, le=5)
    avg_overall_rating: confloat(ge=0, le=5)
    max_overall_rating: conint(ge=0, le=5)
    min_overall_rating: conint(ge=0, le=5)
    one_stars: NonNegativeInt
    two_stars: NonNegativeInt
    three_stars: NonNegativeInt
    four_stars: NonNegativeInt
    five_stars: NonNegativeInt
    total_evaluations: NonNegativeInt
    total_no_show: NonNegativeInt
