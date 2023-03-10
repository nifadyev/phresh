import datetime
from typing import Literal

from app.models.cleaning import CleaningPublic
from app.models.core import CoreModel


class FeedItem(CoreModel):
    row_number: int | None
    event_timestamp: datetime.datetime | None


class CleaningFeedItem(CleaningPublic, FeedItem):
    event_type: Literal["is_update", "is_create"] | None
