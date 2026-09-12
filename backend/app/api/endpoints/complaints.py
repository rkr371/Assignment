from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import List, Any
import uuid

from backend.app.db.session import get_db
from backend.app.models.complaint import Complaint
from backend.app.schemas.complaint import ComplaintCreate, ComplaintInDB
from backend.app.ai.graph import complaint_workflow
from backend.app.services.pdf_extractor import extract_text_from_pdf

router = APIRouter()

@router.post("/analyze")
async def analyze_complaint(
    text: str = Form(None),
    file: UploadFile = File(None)
) -> Any:
    """
    Accepts either raw complaint text or a PDF file upload.
    Runs the input through the LangGraph AI workflow to extract structured data,
    assess completeness, assess risk, and generate recommendations.
    """
    raw_text = ""
    source_type = "text"

    # 1. Input Normalization
    if file:
        if not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are supported.")
        try:
            file_bytes = await file.read()
            raw_text = extract_text_from_pdf(file_bytes)
            source_type = "pdf"
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    elif text:
        raw_text = text
    else:
        raise HTTPException(status_code=400, detail="Must provide either 'text' or a PDF 'file'.")

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="The provided input contains no extractable text.")

    # 2. AI Workflow Execution
    try:
        initial_state = {"raw_text": raw_text, "source_type": source_type}
        # invoke() runs the LangGraph state machine synchronously from START to END
        result = complaint_workflow.invoke(initial_state)
        
        # 3. Error Checking from AI Workflow
        if result.get("errors"):
            # If the AI caught non-fatal errors, we still return the result but log them
            # For a production app, you might want a more sophisticated warning mechanism
            print(f"Workflow warnings: {result['errors']}")
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI workflow failed: {str(e)}")


@router.post("", response_model=ComplaintInDB)
def create_complaint(complaint_in: ComplaintCreate, db: Session = Depends(get_db)):
    """
    Saves a fully reviewed and verified complaint to the PostgreSQL database.
    """
    # Convert the Pydantic schema to an SQLAlchemy model dictionary
    db_obj = Complaint(**complaint_in.model_dump())
    
    # Auto-generate a readable complaint tracking number (e.g., CMP-A1B2C3D4)
    db_obj.complaint_number = f"CMP-{uuid.uuid4().hex[:8].upper()}"
    
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.get("", response_model=List[ComplaintInDB])
def get_complaints(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieves a list of all saved complaints for the dashboard view.
    """
    complaints = db.query(Complaint).order_by(Complaint.created_at.desc()).offset(skip).limit(limit).all()
    return complaints


@router.get("/{complaint_id}", response_model=ComplaintInDB)
def get_complaint(complaint_id: int, db: Session = Depends(get_db)):
    """
    Retrieves a single complaint by its database ID.
    """
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return complaint
