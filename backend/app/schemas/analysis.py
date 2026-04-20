from pydantic import BaseModel
from datetime import datetime


class AnalysisResponse(BaseModel):
    id: str
    language: str
    formatted_text: str
    plain_text: str
    parsed_report: dict
    created_at: datetime

    model_config = {"from_attributes": True}


class AnalysisListResponse(BaseModel):
    id: str
    language: str
    created_at: datetime
    summary: str

    model_config = {"from_attributes": True}
