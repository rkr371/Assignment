from fastapi import APIRouter
from backend.app.api.endpoints import complaints

api_router = APIRouter()

# Mount the complaints router. 
# It will handle all endpoints starting with /complaints
api_router.include_router(complaints.router, prefix="/complaints", tags=["complaints"])
