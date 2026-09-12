from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class ComplaintBase(BaseModel):
    customer_name: Optional[str] = None
    product_name: Optional[str] = None
    batch_number: Optional[str] = None
    complaint_category: Optional[str] = None
    complaint_description: Optional[str] = None
    date_received: Optional[date] = None
    affected_quantity: Optional[str] = None
    complaint_source: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = "Pending Triage"

    # AI Metadata
    ai_risk_level: Optional[str] = None
    ai_risk_reason: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_completeness_score: Optional[int] = None

class ComplaintCreate(ComplaintBase):
    """Schema used when creating a new complaint."""
    pass

class ComplaintUpdate(ComplaintBase):
    """Schema used when updating an existing complaint."""
    pass

class ComplaintInDB(ComplaintBase):
    """Schema used when returning a complaint from the database."""
    id: int
    complaint_number: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        # Allows Pydantic to read data from SQLAlchemy ORM models
        from_attributes = True
