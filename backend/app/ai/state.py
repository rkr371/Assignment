from typing import TypedDict, Optional, List, Dict, Any

class ComplaintState(TypedDict):
    """
    Represents the state of our LangGraph workflow as it moves through the nodes.
    Every node will read from and update this dictionary.
    """
    raw_text: str
    source_type: str # 'pdf' or 'text'
    
    # AI generated outputs
    extracted_complaint: Optional[Dict[str, Any]]
    completeness_result: Optional[Dict[str, Any]]
    risk_assessment: Optional[Dict[str, Any]]
    summary: Optional[str]
    recommendations: Optional[List[str]]
    
    # Workflow status
    errors: Optional[List[str]]
