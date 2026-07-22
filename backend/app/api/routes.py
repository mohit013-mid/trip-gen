from fastapi import APIRouter

from app.schemas.chat import chatrequest
from app.services.groq_service import generate_trip

router = APIRouter()


@router.post("/chat")
def chat(data: chatrequest):

    return generate_trip(data.message)