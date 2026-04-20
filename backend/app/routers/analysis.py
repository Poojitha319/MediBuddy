from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.analysis import Analysis
from app.dependencies import get_current_user
from app.services.gemini import analyze_medicine_image

router = APIRouter(prefix="/api", tags=["analysis"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/analyze", status_code=status.HTTP_201_CREATED)
async def analyze(
    file: UploadFile = File(...),
    language: str = Form("en"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10 MB")

    try:
        result = await analyze_medicine_image(image_bytes, file.content_type, language)
    except Exception as e:
        error_msg = str(e).lower()
        if "429" in str(e) or "quota" in error_msg or "resource_exhausted" in error_msg or "resourceexhausted" in error_msg:
            raise HTTPException(
                status_code=429,
                detail="Our AI is busy right now. Please wait 30-60 seconds and try again."
            )
        raise HTTPException(
            status_code=500,
            detail="Failed to analyze the image. Please try again."
        )

    analysis = Analysis(
        user_id=current_user.id,
        image_mime_type=file.content_type,
        language=language,
        raw_response=result["raw"],
        parsed_report={"formatted_text": result["formatted_text"]},
        plain_text=result["plain_text"],
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return {
        "id": analysis.id,
        "language": analysis.language,
        "formatted_text": result["formatted_text"],
        "plain_text": result["plain_text"],
        "parsed_report": analysis.parsed_report,
        "created_at": analysis.created_at.isoformat(),
    }


@router.get("/analyses")
def get_analyses(
    search: str = "",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Analysis).filter(Analysis.user_id == current_user.id)
    if search:
        query = query.filter(Analysis.plain_text.ilike(f"%{search}%"))
    analyses = query.order_by(Analysis.created_at.desc()).all()

    return [
        {
            "id": a.id,
            "language": a.language,
            "created_at": a.created_at.isoformat(),
            "summary": a.plain_text[:150] + "..." if len(a.plain_text) > 150 else a.plain_text,
        }
        for a in analyses
    ]


@router.get("/analyses/{analysis_id}")
def get_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return {
        "id": analysis.id,
        "language": analysis.language,
        "formatted_text": analysis.parsed_report.get("formatted_text", ""),
        "plain_text": analysis.plain_text,
        "parsed_report": analysis.parsed_report,
        "created_at": analysis.created_at.isoformat(),
    }


@router.delete("/analyses/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    db.delete(analysis)
    db.commit()
