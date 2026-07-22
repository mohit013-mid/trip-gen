from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth_routes ,chatroutes
from app.models.user import User
from app.core.database import Base , engine



from app.api.routes import router
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Travel Planner")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(auth_routes.router)
app.include_router(chatroutes.router)