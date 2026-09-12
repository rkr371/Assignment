import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AIVOA QMS AI Copilot"
    API_V1_STR: str = "/api"
    
    # Defaults to SQLite for local development MVP ease, but supports PostgreSQL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./qms_mvp.db")
    
    # AI Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    MODEL_NAME: str = os.getenv("MODEL_NAME", "gemma2-9b-it")

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

settings = Settings()
