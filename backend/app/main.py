from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.db.session import engine
from backend.app.db.base_class import Base
from backend.app.models import complaint
from backend.app.api.api import api_router

# Create all database tables based on SQLAlchemy models
# Note: For this MVP, we use create_all(). In a production environment, 
# Alembic would be used for database migrations.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered QMS Customer Complaint API",
    version="1.0.0",
)

# Configure CORS so the React frontend can communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For MVP. Restrict this in production.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the main API router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    """Health check endpoint to ensure the backend is running."""
    return {"status": "ok", "message": "AIVOA Backend is active"}
