from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date

class ExtractedComplaint(BaseModel):
    """Schema for extracting raw complaint data from text."""
    customer_name: Optional[str] = Field(description="Name of the customer or company reporting the complaint")
    product_name: Optional[str] = Field(description="Name of the pharmaceutical product")
    batch_number: Optional[str] = Field(description="Batch or Lot number of the product. Often alphanumeric.")
    complaint_category: Optional[str] = Field(description="General category of the complaint (e.g., Packaging Defect, Efficacy, Adverse Event, Appearance)")
    complaint_description: Optional[str] = Field(description="A concise description of the reported issue")
    date_received: Optional[str] = Field(description="Date the complaint was received, formatted as YYYY-MM-DD if possible")
    affected_quantity: Optional[str] = Field(description="The quantity of product affected by the issue")

class CompletenessAssessment(BaseModel):
    """Schema for evaluating if critical information is missing."""
    is_complete: bool = Field(description="True if all critical fields are present, False otherwise")
    missing_fields: List[str] = Field(description="List of important fields that are missing from the complaint")
    completeness_score: int = Field(description="A score from 0 to 100 indicating how complete the complaint information is")

class RiskAssessment(BaseModel):
    """Schema for assessing the preliminary risk of the complaint."""
    risk_level: str = Field(description="The assigned risk level: LOW, MEDIUM, HIGH, or CRITICAL")
    risk_reason: str = Field(description="A brief explanation of why this risk level was assigned based on potential patient impact and compliance risk")

class ComplaintRecommendations(BaseModel):
    """Schema for AI-generated summary and suggested next steps."""
    summary: str = Field(description="A professional, 1-2 sentence executive summary of the complaint")
    suggested_actions: List[str] = Field(description="A list of 2-4 recommended next actions for the QA team to investigate or address this complaint")
