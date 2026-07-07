from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine
from app.routers import auth, analysis, reminders, ask


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure all tables exist on startup (no Alembic configured yet).
    # Models are registered on Base via the router imports above.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="MeddiBuddy API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(analysis.router)
app.include_router(reminders.router)
app.include_router(ask.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
