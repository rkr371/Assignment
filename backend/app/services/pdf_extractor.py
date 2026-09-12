import fitz  # PyMuPDF

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts raw text from a PDF file.
    
    Args:
        file_bytes (bytes): The raw bytes of the uploaded PDF file.
        
    Returns:
        str: The extracted text.
        
    Raises:
        ValueError: If the PDF cannot be parsed or read.
    """
    text = ""
    try:
        # Open the PDF directly from the byte stream
        with fitz.open(stream=file_bytes, filetype="pdf") as doc:
            for page in doc:
                text += page.get_text()
    except Exception as e:
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")
        
    return text.strip()
