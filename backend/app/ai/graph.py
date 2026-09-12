from langgraph.graph import StateGraph, START, END
from backend.app.ai.state import ComplaintState
from backend.app.ai.nodes import (
    extract_information,
    assess_completeness,
    assess_risk,
    generate_recommendations
)

def build_complaint_graph():
    """
    Constructs and compiles the LangGraph workflow.
    This dictates the exact order in which our AI nodes execute.
    """
    # 1. Initialize the graph with our state definition
    workflow = StateGraph(ComplaintState)

    # 2. Add our nodes to the graph
    workflow.add_node("extract", extract_information)
    workflow.add_node("completeness", assess_completeness)
    workflow.add_node("risk", assess_risk)
    workflow.add_node("recommendations", generate_recommendations)

    # 3. Define the edges (the flow of execution)
    workflow.add_edge(START, "extract")
    workflow.add_edge("extract", "completeness")
    workflow.add_edge("completeness", "risk")
    workflow.add_edge("risk", "recommendations")
    workflow.add_edge("recommendations", END)

    # 4. Compile the graph into an executable application
    app = workflow.compile()
    
    return app

# Expose a pre-compiled instance of the graph
complaint_workflow = build_complaint_graph()
