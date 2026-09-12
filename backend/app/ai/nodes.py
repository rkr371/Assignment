from langchain_core.prompts import ChatPromptTemplate
from backend.app.ai.llm import get_llm
from backend.app.ai.state import ComplaintState
from backend.app.ai.schemas import (
    ExtractedComplaint, 
    CompletenessAssessment, 
    RiskAssessment, 
    ComplaintRecommendations
)
import json

def extract_information(state: ComplaintState) -> ComplaintState:
    """Node 1: Extracts structured data from the raw complaint text."""
    llm = get_llm().with_structured_output(ExtractedComplaint)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert pharmaceutical Quality Assurance assistant. Extract the requested fields from the complaint text. If a field is not mentioned, return null."),
        ("human", "Complaint Text:\n\n{raw_text}")
    ])
    
    chain = prompt | llm
    
    try:
        result = chain.invoke({"raw_text": state["raw_text"]})
        state["extracted_complaint"] = result.model_dump()
    except Exception as e:
        state["errors"] = state.get("errors", []) + [f"Extraction Error: {str(e)}"]
        
    return state


def assess_completeness(state: ComplaintState) -> ComplaintState:
    """Node 2: Checks if the extracted data is missing vital information."""
    if "extracted_complaint" not in state or not state["extracted_complaint"]:
        return state
        
    llm = get_llm().with_structured_output(CompletenessAssessment)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a Quality Assurance reviewer. Look at the extracted complaint data. Determine if it is complete enough for a proper investigation. Vital fields are Product Name, Batch Number, and Complaint Description."),
        ("human", "Extracted Data:\n\n{extracted_data}")
    ])
    
    chain = prompt | llm
    
    try:
        result = chain.invoke({"extracted_data": json.dumps(state["extracted_complaint"])})
        state["completeness_result"] = result.model_dump()
    except Exception as e:
        state["errors"] = state.get("errors", []) + [f"Completeness Error: {str(e)}"]
        
    return state


def assess_risk(state: ComplaintState) -> ComplaintState:
    """Node 3: Evaluates the preliminary risk of the complaint."""
    if "extracted_complaint" not in state or not state["extracted_complaint"]:
        return state

    llm = get_llm().with_structured_output(RiskAssessment)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a pharmaceutical risk assessment tool. Based on the complaint text and extracted data, assign a preliminary risk level (LOW, MEDIUM, HIGH, CRITICAL) and provide a short reason. Examples of HIGH risk: contamination, adverse events, product mix-up. Examples of LOW risk: minor packaging dents not affecting product."),
        ("human", "Raw Text: {raw_text}\n\nExtracted Data: {extracted_data}")
    ])
    
    chain = prompt | llm
    
    try:
        result = chain.invoke({
            "raw_text": state["raw_text"],
            "extracted_data": json.dumps(state["extracted_complaint"])
        })
        state["risk_assessment"] = result.model_dump()
    except Exception as e:
        state["errors"] = state.get("errors", []) + [f"Risk Assessment Error: {str(e)}"]
        
    return state


def generate_recommendations(state: ComplaintState) -> ComplaintState:
    """Node 4: Generates a professional summary and recommended next steps."""
    llm = get_llm().with_structured_output(ComplaintRecommendations)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a senior Quality Assurance manager. Provide a concise executive summary of this complaint and 2-4 recommended immediate next actions for the investigation team."),
        ("human", "Raw Text: {raw_text}")
    ])
    
    chain = prompt | llm
    
    try:
        result = chain.invoke({"raw_text": state["raw_text"]})
        state["summary"] = result.summary
        state["recommendations"] = result.suggested_actions
    except Exception as e:
        state["errors"] = state.get("errors", []) + [f"Recommendations Error: {str(e)}"]
        
    return state
