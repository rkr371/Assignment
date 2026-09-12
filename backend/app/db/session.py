from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.core.config import settings

# If using SQLite for MVP fallback, we need connect_args to allow multiple threads
connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    Dependency function to yield a database session and ensure it closes
    after the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
