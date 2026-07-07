from fastapi import APIRouter, Depends, HTTPException
from app.models.user import User
from app.schemas.ask import AskRequest, AskResponse
from app.dependencies import get_current_user
from app.services.agent_router import route

router = APIRouter(prefix="/api", tags=["ask"])


@router.post("/ask", response_model=AskResponse)
async def ask(
    payload: AskRequest,
    current_user: User = Depends(get_current_user),
):
    if not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question is required")
    return await route(payload.question, payload.language)
