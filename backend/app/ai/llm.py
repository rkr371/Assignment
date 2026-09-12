from langchain_groq import ChatGroq
from backend.app.core.config import settings

def get_llm(temperature: float = 0.0):
    """
    Initializes and returns the Groq LLM client.
    
    Args:
        temperature (float): The sampling temperature. Defaults to 0.0 for 
                             predictable, deterministic outputs, which is 
                             critical for QMS data extraction.
    """
    if not settings.GROQ_API_KEY:
        # Provide a fallback/mock for local testing if no key is present,
        # but normally this should raise an error in a real app.
        raise ValueError("GROQ_API_KEY environment variable is not set.")
        
    return ChatGroq(
        model_name=settings.MODEL_NAME,
        temperature=temperature,
        api_key=settings.GROQ_API_KEY,
        max_tokens=2048,
    )
