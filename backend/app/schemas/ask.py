from pydantic import BaseModel


class AskRequest(BaseModel):
    question: str
    language: str = "en"


class AskResponse(BaseModel):
    answer: str
    grounded: bool
    source: str | None = None
    agent: str | None = None
    route: str | None = None
    red_flag: bool = False
