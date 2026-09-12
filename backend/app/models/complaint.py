from sqlalchemy import Column, Integer, String, Text, Date, DateTime
from sqlalchemy.sql import func
from backend.app.db.base_class import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_number = Column(String, unique=True, index=True, nullable=True)
    
    # Core complaint details (can be extracted by AI or entered manually)
    customer_name = Column(String, nullable=True)
    product_name = Column(String, nullable=True)
    batch_number = Column(String, nullable=True)
    complaint_category = Column(String, nullable=True)
    complaint_description = Column(Text, nullable=True)
    date_received = Column(Date, nullable=True)
    affected_quantity = Column(String, nullable=True)
    complaint_source = Column(String, nullable=True)
    
    # Workflow status
    severity = Column(String, nullable=True)
    status = Column(String, default="Pending Triage")
    
    # AI Copilot Metadata (Stored separately from the core record fields for auditability)
    ai_risk_level = Column(String, nullable=True)
    ai_risk_reason = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    ai_completeness_score = Column(Integer, nullable=True)
    
    # Audit Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
