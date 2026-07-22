from datetime import datetime
from typing import Any
from pydantic import BaseModel, Field

class chatrequest(BaseModel):
    message: str


class MessageIn(BaseModel):
    role: str  # "user" | "assistant"
    text: str | None = None
    itinerary: dict[str, Any] | None = None
    isError: bool | None = None


class ChatCreate(BaseModel):
    title: str = Field(default="New chat", max_length=120)
    messages: list[MessageIn] = Field(default_factory=list)


class ChatUpdate(BaseModel):
    title: str | None = Field(default=None, max_length=120)
    messages: list[MessageIn]


class ChatSummary(BaseModel):
    id: str
    title: str
    updated_at: datetime

    class Config:
        from_attributes = True


class ChatOut(BaseModel):
    id: str
    title: str
    messages: list[dict[str, Any]]
    updated_at: datetime

    class Config:
        from_attributes = True