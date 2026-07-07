from datetime import datetime
from pydantic import BaseModel


class ReminderCreate(BaseModel):
    medicine_name: str
    dose: str = ""
    times: list[str] = []
    language: str = "en"


class ReminderResponse(BaseModel):
    id: str
    medicine_name: str
    dose: str
    times: list[str]
    language: str
    active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
