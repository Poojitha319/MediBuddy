# Phase 1: Foundation — Backend + Bug Fixes + Deployment

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform MeddiBuddy from a frontend-only app into a full-stack application with FastAPI backend, PostgreSQL database, JWT authentication, and deploy it live.

**Architecture:** Monorepo with `backend/` (FastAPI + SQLAlchemy + Alembic) and existing `src/` (React frontend). Backend handles all Gemini API calls, auth, and data persistence. Frontend talks to backend via REST API with JWT bearer tokens.

**Tech Stack:** Python 3.11+, FastAPI, SQLAlchemy, Alembic, PostgreSQL, python-jose, passlib, google-generativeai, React 19, Vite, Tailwind CSS

---

## File Structure

### Backend (all new files)

```
backend/
  requirements.txt          — Python dependencies
  .env.example              — Template for environment variables
  .env                      — Local env vars (gitignored)
  alembic.ini               — Alembic config
  alembic/
    env.py                  — Alembic environment setup
    versions/               — Migration files
  app/
    __init__.py
    main.py                 — FastAPI app entry point, CORS, router includes
    config.py               — Settings loaded from env vars
    database.py             — SQLAlchemy engine, session, Base
    models/
      __init__.py
      user.py               — User SQLAlchemy model
      analysis.py           — Analysis SQLAlchemy model
    schemas/
      __init__.py
      user.py               — Pydantic schemas for auth request/response
      analysis.py           — Pydantic schemas for analysis request/response
    routers/
      __init__.py
      auth.py               — POST /register, POST /login, GET /me
      analysis.py           — POST /analyze, GET /analyses, GET /analyses/{id}, DELETE /analyses/{id}
    services/
      __init__.py
      auth.py               — Password hashing, JWT creation/verification
      gemini.py             — Gemini API integration (moved from frontend)
    dependencies.py         — get_db, get_current_user dependency functions
  tests/
    __init__.py
    conftest.py             — Fixtures: test client, test db, test user
    test_auth.py            — Auth endpoint tests
    test_analysis.py        — Analysis endpoint tests
    test_gemini_service.py  — Gemini service unit tests
```

### Frontend (modified files)

```
src/
  services/
    api.js                  — NEW: Axios/fetch wrapper with base URL + auth headers
    geminiApi.js            — MODIFY: Remove Gemini call, use backend API instead
  pages/
    LoginPage.jsx           — NEW: Login form
    RegisterPage.jsx        — NEW: Registration form
    MainPage.jsx            — MODIFY: Use backend API, fix bugs
    ReportPage.jsx          — MODIFY: Fetch from backend by ID, remove duplicate Navbar
    HistoryPage.jsx         — MODIFY: Fetch from backend instead of localStorage
  components/
    ProtectedRoute.jsx      — NEW: Redirect to login if not authenticated
    Navbar.jsx              — MODIFY: Add login/logout, show user name
  App.jsx                   — MODIFY: Add new routes, wrap protected routes
  contexts/
    AuthContext.jsx          — NEW: Auth state management (token, user, login/logout)
index.html                  — MODIFY: Fix title and meta tags
README.md                   — REWRITE: Proper project documentation
.gitignore                  — MODIFY: Add Python/backend ignores + .env
```

---

### Task 1: Backend Project Setup

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/.env.example`
- Create: `backend/app/__init__.py`
- Create: `backend/app/config.py`
- Create: `backend/app/main.py`

- [ ] **Step 1: Create backend directory structure**

```bash
cd D:/jay/poojitha/dream/projects/meddibuddy
mkdir -p backend/app/models backend/app/schemas backend/app/routers backend/app/services backend/tests
```

- [ ] **Step 2: Create requirements.txt**

Create `backend/requirements.txt`:

```
fastapi==0.115.12
uvicorn[standard]==0.34.2
sqlalchemy==2.0.40
alembic==1.15.2
psycopg2-binary==2.9.10
python-jose[cryptography]==3.4.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.20
python-dotenv==1.1.0
google-generativeai==0.8.5
pydantic[email]==2.11.3
httpx==0.28.1
pytest==8.3.5
pytest-asyncio==0.26.0
```

- [ ] **Step 3: Create .env.example**

Create `backend/.env.example`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/meddibuddy
SECRET_KEY=your-secret-key-here-change-in-production
GEMINI_API_KEY=your-gemini-api-key-here
ALLOWED_ORIGINS=http://localhost:5173
```

- [ ] **Step 4: Create config.py**

Create `backend/app/config.py`:

```python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    gemini_api_key: str
    allowed_origins: str = "http://localhost:5173"
    access_token_expire_minutes: int = 1440  # 24 hours
    algorithm: str = "HS256"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
```

- [ ] **Step 5: Add pydantic-settings to requirements.txt**

Append to `backend/requirements.txt`:

```
pydantic-settings==2.9.1
```

- [ ] **Step 6: Create main.py with CORS**

Create `backend/app/main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

app = FastAPI(title="MeddiBuddy API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
```

- [ ] **Step 7: Create __init__.py files**

Create empty `__init__.py` in: `backend/app/`, `backend/app/models/`, `backend/app/schemas/`, `backend/app/routers/`, `backend/app/services/`, `backend/tests/`.

- [ ] **Step 8: Create a local .env for development**

Create `backend/.env`:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/meddibuddy
SECRET_KEY=dev-secret-key-not-for-production
GEMINI_API_KEY=AIzaSyCsXUu2CxK7ZnPbfaugJQqQA1ROjDpPHiU
ALLOWED_ORIGINS=http://localhost:5173
```

- [ ] **Step 9: Install dependencies and verify server starts**

```bash
cd D:/jay/poojitha/dream/projects/meddibuddy/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Expected: Server starts at http://localhost:8000. Visit http://localhost:8000/api/health returns `{"status": "ok"}`.

- [ ] **Step 10: Commit**

```bash
git add backend/
git commit -m "feat: initialize FastAPI backend with project structure and health endpoint"
```

---

### Task 2: Database Setup with SQLAlchemy + Alembic

**Files:**
- Create: `backend/app/database.py`
- Create: `backend/app/models/user.py`
- Create: `backend/app/models/analysis.py`
- Create: `backend/alembic.ini`
- Create: `backend/alembic/env.py`

- [ ] **Step 1: Create database.py**

Create `backend/app/database.py`:

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

- [ ] **Step 2: Create User model**

Create `backend/app/models/user.py`:

```python
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    preferred_language: Mapped[str] = mapped_column(String(10), default="en")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")
```

- [ ] **Step 3: Create Analysis model**

Create `backend/app/models/analysis.py`:

```python
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    image_mime_type: Mapped[str] = mapped_column(String(50), nullable=False)
    language: Mapped[str] = mapped_column(String(10), default="en")
    raw_response: Mapped[str] = mapped_column(Text, nullable=False)
    parsed_report: Mapped[dict] = mapped_column(JSON, nullable=False)
    plain_text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User", back_populates="analyses")
```

- [ ] **Step 4: Update models __init__.py to import all models**

Create `backend/app/models/__init__.py`:

```python
from app.models.user import User
from app.models.analysis import Analysis

__all__ = ["User", "Analysis"]
```

- [ ] **Step 5: Initialize Alembic**

```bash
cd D:/jay/poojitha/dream/projects/meddibuddy/backend
alembic init alembic
```

- [ ] **Step 6: Configure alembic/env.py**

Replace `backend/alembic/env.py` with:

```python
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from app.config import settings
from app.database import Base
from app.models import User, Analysis  # noqa: F401 — registers models with Base

config = context.config
config.set_main_option("sqlalchemy.url", settings.database_url)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

- [ ] **Step 7: Create initial migration**

Requires a running PostgreSQL. Create the database first:

```bash
createdb meddibuddy
```

Or if using psql:

```bash
psql -U postgres -c "CREATE DATABASE meddibuddy;"
```

Then generate the migration:

```bash
cd D:/jay/poojitha/dream/projects/meddibuddy/backend
alembic revision --autogenerate -m "create users and analyses tables"
```

- [ ] **Step 8: Run the migration**

```bash
cd D:/jay/poojitha/dream/projects/meddibuddy/backend
alembic upgrade head
```

Expected: Tables `users` and `analyses` created in PostgreSQL.

- [ ] **Step 9: Commit**

```bash
git add backend/app/database.py backend/app/models/ backend/alembic.ini backend/alembic/
git commit -m "feat: add database setup with User and Analysis models, Alembic migrations"
```

---

### Task 3: Auth Service (Password Hashing + JWT)

**Files:**
- Create: `backend/app/services/auth.py`
- Create: `backend/app/schemas/user.py`
- Create: `backend/app/dependencies.py`
- Create: `backend/tests/conftest.py`
- Create: `backend/tests/test_auth.py`

- [ ] **Step 1: Write auth service tests**

Create `backend/tests/conftest.py`:

```python
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, StaticPool
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.main import app

SQLALCHEMY_TEST_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_TEST_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def registered_user(client):
    response = client.post(
        "/api/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "securepassword123"},
    )
    return response.json()


@pytest.fixture
def auth_headers(client, registered_user):
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "securepassword123"},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
```

Create `backend/tests/test_auth.py`:

```python
def test_register_success(client):
    response = client.post(
        "/api/auth/register",
        json={"name": "Alice", "email": "alice@example.com", "password": "strongpass123"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "alice@example.com"
    assert data["name"] == "Alice"
    assert "id" in data
    assert "password_hash" not in data


def test_register_duplicate_email(client):
    client.post(
        "/api/auth/register",
        json={"name": "Alice", "email": "dup@example.com", "password": "strongpass123"},
    )
    response = client.post(
        "/api/auth/register",
        json={"name": "Bob", "email": "dup@example.com", "password": "otherpass123"},
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()


def test_login_success(client, registered_user):
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "securepassword123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client, registered_user):
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "ghost@example.com", "password": "whatever"},
    )
    assert response.status_code == 401


def test_get_me_authenticated(client, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"


def test_get_me_no_token(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd D:/jay/poojitha/dream/projects/meddibuddy/backend
python -m pytest tests/test_auth.py -v
```

Expected: All tests FAIL (routes don't exist yet).

- [ ] **Step 3: Create auth service**

Create `backend/app/services/auth.py`:

```python
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload.get("sub")
    except JWTError:
        return None
```

- [ ] **Step 4: Create user schemas**

Create `backend/app/schemas/user.py`:

```python
from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    preferred_language: str

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
```

- [ ] **Step 5: Create dependencies**

Create `backend/app/dependencies.py`:

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.services.auth import decode_access_token

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    user_id = decode_access_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user
```

- [ ] **Step 6: Create auth router**

Create `backend/app/routers/auth.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserResponse, TokenResponse
from app.services.auth import hash_password, verify_password, create_access_token
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token(user.id)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
```

- [ ] **Step 7: Register auth router in main.py**

Update `backend/app/main.py` to add:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth

app = FastAPI(title="MeddiBuddy API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
```

- [ ] **Step 8: Run tests to verify they pass**

```bash
cd D:/jay/poojitha/dream/projects/meddibuddy/backend
python -m pytest tests/test_auth.py -v
```

Expected: All 7 tests PASS.

- [ ] **Step 9: Commit**

```bash
git add backend/app/services/auth.py backend/app/schemas/user.py backend/app/dependencies.py backend/app/routers/auth.py backend/tests/
git commit -m "feat: add JWT authentication with register, login, and me endpoints"
```

---

### Task 4: Gemini Service (Backend)

**Files:**
- Create: `backend/app/services/gemini.py`
- Create: `backend/tests/test_gemini_service.py`

- [ ] **Step 1: Write Gemini service tests**

Create `backend/tests/test_gemini_service.py`:

```python
from app.services.gemini import build_analysis_prompt, parse_gemini_response


def test_build_prompt_default_language():
    prompt = build_analysis_prompt("en")
    assert "English" not in prompt or "en" in prompt.lower() or "language" in prompt.lower()
    assert "About the Medicine" in prompt
    assert "Side Effects" in prompt


def test_build_prompt_with_hindi():
    prompt = build_analysis_prompt("hi")
    assert "hi" in prompt


def test_parse_gemini_response_extracts_text():
    mock_response = {
        "candidates": [
            {
                "content": {
                    "parts": [{"text": "**About the Medicine:**\nParacetamol 500mg\n\n**Usage Instructions:**\nTake one tablet every 6 hours"}]
                }
            }
        ]
    }
    result = parse_gemini_response(mock_response)
    assert "Paracetamol" in result["formatted_text"]
    assert "Paracetamol" in result["plain_text"]
    assert "**" not in result["plain_text"]


def test_parse_gemini_response_empty():
    mock_response = {"candidates": []}
    result = parse_gemini_response(mock_response)
    assert result["formatted_text"] == ""
    assert result["plain_text"] == ""
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd D:/jay/poojitha/dream/projects/meddibuddy/backend
python -m pytest tests/test_gemini_service.py -v
```

Expected: FAIL (module doesn't exist).

- [ ] **Step 3: Create Gemini service**

Create `backend/app/services/gemini.py`:

```python
import base64
import re
import google.generativeai as genai
from app.config import settings

genai.configure(api_key=settings.gemini_api_key)
model = genai.GenerativeModel("gemini-1.5-flash")


def build_analysis_prompt(language: str = "en") -> str:
    return f"""
You are provided an image of a medicine package. Extract all visible information and generate a concise summary.

Respond in the user's preferred language: **{language}**.

Use the format below. Avoid repetition. Only fabricate info when allowed.

---

About the Medicine:
Summarize main ingredients or purpose.

Form & Packaging Type:
State form (tablet, syrup, etc.) and packaging.

Usage Instructions:
Copy if visible; else say "Use as directed by a healthcare provider."

Possible Side Effects:
Use visible info or common ones for this type.

Recommended Age Group:
Use visible info or infer responsibly.

Expiry Information:
Only clearly visible expiry like "EXP: Nov 2026."

Primary Purpose:
Summarize intended medical use.

Useful For:
List people or age groups it's meant for.

Treats:
List relevant symptoms or conditions.

Storage Instructions:
Use visible info or say "Store in a cool, dry place."

Warnings / Precautions:
Visible warnings or standard safety notes.

Prescription Required:
Only state this if clearly visible.

Manufacturer Information:
Company name & location (only if visible).

---
Return the above content in:
1. Well-formatted markdown (for screen display)
2. Plain, readable summary (for voice assistant)
"""


def parse_gemini_response(response: dict) -> dict:
    candidates = response.get("candidates", [])
    if not candidates:
        return {"formatted_text": "", "plain_text": ""}

    content = candidates[0].get("content", {})
    parts = content.get("parts", [])
    formatted_text = parts[0].get("text", "") if parts else ""

    plain_text = re.sub(r"\*\*", "", formatted_text)
    plain_text = re.sub(r"(?:^|\n)([A-Za-z ]+):\s*", r"\n\n\1:\n", plain_text)

    return {"formatted_text": formatted_text, "plain_text": plain_text.strip()}


async def analyze_medicine_image(image_bytes: bytes, mime_type: str, language: str = "en") -> dict:
    prompt = build_analysis_prompt(language)
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    response = model.generate_content(
        [
            prompt,
            {"mime_type": mime_type, "data": image_b64},
        ]
    )

    raw_response = response.text
    formatted_text = raw_response
    plain_text = re.sub(r"\*\*", "", formatted_text)
    plain_text = re.sub(r"(?:^|\n)([A-Za-z ]+):\s*", r"\n\n\1:\n", plain_text)

    return {
        "formatted_text": formatted_text,
        "plain_text": plain_text.strip(),
        "raw": raw_response,
    }
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd D:/jay/poojitha/dream/projects/meddibuddy/backend
python -m pytest tests/test_gemini_service.py -v
```

Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/app/services/gemini.py backend/tests/test_gemini_service.py
git commit -m "feat: add Gemini service with prompt builder and response parser"
```

---

### Task 5: Analysis Router (Upload + History + Detail + Delete)

**Files:**
- Create: `backend/app/schemas/analysis.py`
- Create: `backend/app/routers/analysis.py`
- Create: `backend/tests/test_analysis.py`
- Modify: `backend/app/main.py`

- [ ] **Step 1: Create analysis schemas**

Create `backend/app/schemas/analysis.py`:

```python
from pydantic import BaseModel
from datetime import datetime


class AnalysisResponse(BaseModel):
    id: str
    language: str
    formatted_text: str
    plain_text: str
    parsed_report: dict
    created_at: datetime

    model_config = {"from_attributes": True}


class AnalysisListResponse(BaseModel):
    id: str
    language: str
    created_at: datetime
    summary: str

    model_config = {"from_attributes": True}
```

- [ ] **Step 2: Write analysis endpoint tests**

Create `backend/tests/test_analysis.py`:

```python
from unittest.mock import patch, AsyncMock


def test_analyze_no_auth(client):
    response = client.post("/api/analyze")
    assert response.status_code == 403 or response.status_code == 401


def test_get_analyses_empty(client, auth_headers):
    response = client.get("/api/analyses", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


@patch("app.routers.analysis.analyze_medicine_image")
def test_analyze_success(mock_gemini, client, auth_headers):
    mock_gemini.return_value = {
        "formatted_text": "**About:** Paracetamol",
        "plain_text": "About: Paracetamol",
        "raw": "raw response text",
    }

    with open("tests/test_image.jpg", "wb") as f:
        f.write(b"\xff\xd8\xff\xe0" + b"\x00" * 100)

    with open("tests/test_image.jpg", "rb") as f:
        response = client.post(
            "/api/analyze",
            headers=auth_headers,
            files={"file": ("medicine.jpg", f, "image/jpeg")},
            data={"language": "en"},
        )

    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["language"] == "en"
    assert "Paracetamol" in data["formatted_text"]


@patch("app.routers.analysis.analyze_medicine_image")
def test_get_analyses_after_upload(mock_gemini, client, auth_headers):
    mock_gemini.return_value = {
        "formatted_text": "**About:** Ibuprofen",
        "plain_text": "About: Ibuprofen",
        "raw": "raw response",
    }

    with open("tests/test_image.jpg", "wb") as f:
        f.write(b"\xff\xd8\xff\xe0" + b"\x00" * 100)

    with open("tests/test_image.jpg", "rb") as f:
        client.post(
            "/api/analyze",
            headers=auth_headers,
            files={"file": ("med.jpg", f, "image/jpeg")},
            data={"language": "en"},
        )

    response = client.get("/api/analyses", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1


@patch("app.routers.analysis.analyze_medicine_image")
def test_delete_analysis(mock_gemini, client, auth_headers):
    mock_gemini.return_value = {
        "formatted_text": "text",
        "plain_text": "text",
        "raw": "raw",
    }

    with open("tests/test_image.jpg", "wb") as f:
        f.write(b"\xff\xd8\xff\xe0" + b"\x00" * 100)

    with open("tests/test_image.jpg", "rb") as f:
        create_resp = client.post(
            "/api/analyze",
            headers=auth_headers,
            files={"file": ("med.jpg", f, "image/jpeg")},
            data={"language": "en"},
        )

    analysis_id = create_resp.json()["id"]
    delete_resp = client.delete(f"/api/analyses/{analysis_id}", headers=auth_headers)
    assert delete_resp.status_code == 204

    get_resp = client.get(f"/api/analyses/{analysis_id}", headers=auth_headers)
    assert get_resp.status_code == 404
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd D:/jay/poojitha/dream/projects/meddibuddy/backend
python -m pytest tests/test_analysis.py -v
```

Expected: All FAIL (router doesn't exist).

- [ ] **Step 4: Create analysis router**

Create `backend/app/routers/analysis.py`:

```python
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.analysis import Analysis
from app.dependencies import get_current_user
from app.services.gemini import analyze_medicine_image

router = APIRouter(prefix="/api", tags=["analysis"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/analyze", status_code=status.HTTP_201_CREATED)
async def analyze(
    file: UploadFile = File(...),
    language: str = Form("en"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 10 MB")

    result = await analyze_medicine_image(image_bytes, file.content_type, language)

    analysis = Analysis(
        user_id=current_user.id,
        image_mime_type=file.content_type,
        language=language,
        raw_response=result["raw"],
        parsed_report={"formatted_text": result["formatted_text"]},
        plain_text=result["plain_text"],
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    return {
        "id": analysis.id,
        "language": analysis.language,
        "formatted_text": result["formatted_text"],
        "plain_text": result["plain_text"],
        "parsed_report": analysis.parsed_report,
        "created_at": analysis.created_at.isoformat(),
    }


@router.get("/analyses")
def get_analyses(
    search: str = "",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Analysis).filter(Analysis.user_id == current_user.id)
    if search:
        query = query.filter(Analysis.plain_text.ilike(f"%{search}%"))
    analyses = query.order_by(Analysis.created_at.desc()).all()

    return [
        {
            "id": a.id,
            "language": a.language,
            "created_at": a.created_at.isoformat(),
            "summary": a.plain_text[:150] + "..." if len(a.plain_text) > 150 else a.plain_text,
        }
        for a in analyses
    ]


@router.get("/analyses/{analysis_id}")
def get_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    return {
        "id": analysis.id,
        "language": analysis.language,
        "formatted_text": analysis.parsed_report.get("formatted_text", ""),
        "plain_text": analysis.plain_text,
        "parsed_report": analysis.parsed_report,
        "created_at": analysis.created_at.isoformat(),
    }


@router.delete("/analyses/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    analysis = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id)
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    db.delete(analysis)
    db.commit()
```

- [ ] **Step 5: Register analysis router in main.py**

Update `backend/app/main.py`:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, analysis

app = FastAPI(title="MeddiBuddy API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(analysis.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
cd D:/jay/poojitha/dream/projects/meddibuddy/backend
python -m pytest tests/test_analysis.py -v
```

Expected: All 5 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/app/schemas/analysis.py backend/app/routers/analysis.py backend/tests/test_analysis.py backend/app/main.py
git commit -m "feat: add analysis endpoints — upload, history, detail, delete"
```

---

### Task 6: Frontend API Service + Auth Context

**Files:**
- Create: `src/services/api.js`
- Create: `src/contexts/AuthContext.jsx`
- Create: `src/components/ProtectedRoute.jsx`

- [ ] **Step 1: Create API service**

Create `src/services/api.js`:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getToken() {
  return localStorage.getItem('meddibuddy_token')
}

function authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function apiRequest(endpoint, options = {}) {
  const { body, method = 'GET', headers = {}, isFormData = false } = options

  const config = {
    method,
    headers: {
      ...authHeaders(),
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
  }

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

  if (response.status === 401) {
    localStorage.removeItem('meddibuddy_token')
    window.location.href = '/login'
    throw new Error('Session expired. Please log in again.')
  }

  if (response.status === 204) {
    return null
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.detail || 'Something went wrong')
  }

  return data
}

export function register(name, email, password) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: { name, email, password },
  })
}

export function login(email, password) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function getMe() {
  return apiRequest('/api/auth/me')
}

export function analyzeMedicine(file, language = 'en') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('language', language)
  return apiRequest('/api/analyze', {
    method: 'POST',
    body: formData,
    isFormData: true,
  })
}

export function getAnalyses(search = '') {
  const params = search ? `?search=${encodeURIComponent(search)}` : ''
  return apiRequest(`/api/analyses${params}`)
}

export function getAnalysis(id) {
  return apiRequest(`/api/analyses/${id}`)
}

export function deleteAnalysis(id) {
  return apiRequest(`/api/analyses/${id}`, { method: 'DELETE' })
}
```

- [ ] **Step 2: Create AuthContext**

Create `src/contexts/AuthContext.jsx`:

```jsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { getMe } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('meddibuddy_token')
    if (token) {
      getMe()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('meddibuddy_token')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  function handleLogin(token, userData) {
    localStorage.setItem('meddibuddy_token', token)
    setUser(userData)
  }

  function handleLogout() {
    localStorage.removeItem('meddibuddy_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

- [ ] **Step 3: Create ProtectedRoute component**

Create `src/components/ProtectedRoute.jsx`:

```jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-700"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
```

- [ ] **Step 4: Create .env file for frontend**

Create `.env` in the project root:

```
VITE_API_URL=http://localhost:8000
```

- [ ] **Step 5: Commit**

```bash
git add src/services/api.js src/contexts/AuthContext.jsx src/components/ProtectedRoute.jsx .env
git commit -m "feat: add API service, auth context, and protected route component"
```

---

### Task 7: Login + Register Pages

**Files:**
- Create: `src/pages/LoginPage.jsx`
- Create: `src/pages/RegisterPage.jsx`

- [ ] **Step 1: Create LoginPage**

Create `src/pages/LoginPage.jsx`:

```jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { login, getMe } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { handleLogin } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const tokenData = await login(email, password)
      localStorage.setItem('meddibuddy_token', tokenData.access_token)
      const userData = await getMe()
      handleLogin(tokenData.access_token, userData)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8"
      >
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-8">Log In</h1>

        {error && (
          <p className="mb-4 text-center text-red-600 font-semibold text-sm">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="Your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:bg-blue-300 disabled:cursor-not-allowed text-base"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default LoginPage
```

- [ ] **Step 2: Create RegisterPage**

Create `src/pages/RegisterPage.jsx`:

```jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { register, login, getMe } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const RegisterPage = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { handleLogin } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      await register(name, email, password)
      const tokenData = await login(email, password)
      localStorage.setItem('meddibuddy_token', tokenData.access_token)
      const userData = await getMe()
      handleLogin(tokenData.access_token, userData)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8"
      >
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-8">Create Account</h1>

        {error && (
          <p className="mb-4 text-center text-red-600 font-semibold text-sm">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="Repeat your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition disabled:bg-blue-300 disabled:cursor-not-allowed text-base"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Log In
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default RegisterPage
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/LoginPage.jsx src/pages/RegisterPage.jsx
git commit -m "feat: add login and register pages"
```

---

### Task 8: Rewire Frontend to Backend API

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/main.jsx`
- Modify: `src/pages/MainPage.jsx`
- Modify: `src/pages/ReportPage.jsx`
- Modify: `src/pages/HistoryPage.jsx`
- Modify: `src/pages/FeedbackPage.jsx`
- Modify: `src/components/Navbar.jsx`

- [ ] **Step 1: Wrap app with AuthProvider in main.jsx**

Replace `src/main.jsx` with:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)
```

- [ ] **Step 2: Update App.jsx with new routes**

Replace `src/App.jsx` with:

```jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MainPage from './pages/MainPage'
import ReportPage from './pages/ReportPage'
import HistoryPage from './pages/HistoryPage'
import About from './pages/AboutPage'
import Feedback from './pages/FeedbackPage'
import FaqPage from './pages/FAQPage'
import './index.css'

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/:id"
          element={
            <ProtectedRoute>
              <ReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </Router>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <p className="text-xl text-gray-600">Page not found</p>
      </div>
    </div>
  )
}

export default App
```

- [ ] **Step 3: Update MainPage to use backend API**

Replace the core logic in `src/pages/MainPage.jsx`. Key changes:
- Import `analyzeMedicine` from `../services/api` instead of `../services/geminiApi`
- Fix `result.analysis` → `result.formatted_text`
- Fix chat image to use import
- Navigate to `/report/${result.id}` instead of passing state
- Remove localStorage history saving (backend handles it)

Replace `src/pages/MainPage.jsx` with:

```jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { analyzeMedicine } from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import chatIcon from '../assets/chat.png'

const MAX_FILE_SIZE_MB = 10

const pulseAnimation = {
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(14, 165, 233, 0.5)",
      "0 0 12px 6px rgba(14, 165, 233, 0)",
      "0 0 0 0 rgba(14, 165, 233, 0.5)",
    ],
  },
  transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
}

const shakeAnimation = {
  initial: { x: 0 },
  animate: { x: [0, -6, 6, -6, 6, 0], transition: { duration: 0.4 } },
}

const successCheckmark = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1, rotate: [0, 360], transition: { duration: 0.7 } },
  exit: { scale: 0, opacity: 0 },
}

const MainPage = () => {
  const [file, setFile] = useState(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzed, setIsAnalyzed] = useState(false)
  const [analysisId, setAnalysisId] = useState(null)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [toastMsg, setToastMsg] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!file) {
      setFilePreviewUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(file)
    setFilePreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  const validateFile = (selectedFile) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload a valid image file.')
      return false
    }
    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError('File size exceeds 10 MB.')
      return false
    }
    setError('')
    return true
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile)
      setIsAnalyzed(false)
      setAnalysisId(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile)
      setIsAnalyzed(false)
      setAnalysisId(null)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragActive(true)
  }
  const handleDragLeave = () => setDragActive(false)

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please upload a file to analyze.')
      return
    }
    setIsUploading(true)
    setError('')
    try {
      const result = await analyzeMedicine(file)
      setAnalysisId(result.id)
      setIsAnalyzed(true)
      setToastMsg('Analysis complete!')
      setTimeout(() => setToastMsg(''), 3000)
    } catch (err) {
      setError(err.message || 'Failed to analyze image.')
      setIsAnalyzed(false)
    } finally {
      setIsUploading(false)
    }
  }

  const handleReport = () => {
    if (!analysisId) {
      setError('Please analyze a file first.')
      return
    }
    navigate(`/report/${analysisId}`)
  }

  const resetFile = () => {
    setFile(null)
    setIsAnalyzed(false)
    setAnalysisId(null)
    setError('')
    setFilePreviewUrl(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-cyan-50 flex justify-center items-center p-6">
      <div className="w-full max-w-[1000px] flex flex-col">
        <div className="flex flex-col md:flex-row flex-1 min-h-[calc(100vh-72px)] gap-10">
          <motion.div
            className={`border-2 rounded-2xl p-8 shadow-lg md:m-14 md:w-1/2 w-full bg-white
              ${dragActive ? 'border-cyan-600' : 'border-gray-300'}
              transition-colors duration-300 ease-in-out`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            {...(dragActive ? pulseAnimation : {})}
          >
            <h1 className="text-center text-2xl font-semibold text-cyan-800 mb-3 tracking-wide">Upload Your Medicine Image</h1>
            <p className="text-center text-sm text-cyan-600 italic mb-6 max-w-[320px] mx-auto">
              Please upload an image of the back side of the medicine wrapper for accurate analysis.
            </p>

            <label
              htmlFor="file-upload"
              className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-cyan-300 p-8 hover:border-cyan-500 transition-colors duration-300"
              title="Click or drag file here"
            >
              <div className="mb-3 text-cyan-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h10a4 4 0 004-4v-3a4 4 0 00-4-4H9a4 4 0 00-4 4v3z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-cyan-700">Choose a file</span>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>

            {filePreviewUrl && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-6 rounded-xl border border-cyan-300 p-3 shadow-md"
              >
                <img
                  src={filePreviewUrl}
                  alt="Uploaded preview"
                  className="mx-auto max-h-48 rounded-xl object-contain"
                />
                <button
                  onClick={resetFile}
                  className="mt-4 w-full rounded-xl bg-red-500 px-5 py-3 text-white hover:bg-red-600 transition"
                  aria-label="Remove uploaded file"
                >
                  Remove File
                </button>
              </motion.div>
            )}

            <AnimatePresence>
              {error && (
                <motion.p
                  key="error"
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0 }}
                  variants={shakeAnimation}
                  className="mt-4 text-center text-sm text-red-600 font-semibold select-none"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <motion.button
                onClick={handleAnalyze}
                disabled={isUploading || !file}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 rounded-2xl bg-cyan-700 px-8 py-3 text-white font-semibold shadow-md disabled:cursor-not-allowed disabled:bg-cyan-300"
                title="Click to analyze the uploaded image"
              >
                {isUploading ? 'Analyzing...' : 'Analyze'}
              </motion.button>

              <motion.button
                onClick={handleReport}
                disabled={!isAnalyzed}
                whileHover={{ scale: isAnalyzed ? 1.05 : 1 }}
                whileTap={{ scale: isAnalyzed ? 0.95 : 1 }}
                className="flex-1 rounded-2xl border border-cyan-700 px-8 py-3 font-semibold disabled:cursor-not-allowed disabled:border-cyan-300 disabled:text-cyan-300"
                title="Show detailed analysis report"
              >
                Show Report
              </motion.button>
            </div>

            <AnimatePresence>
              {isAnalyzed && (
                <motion.div
                  key="success"
                  className="mt-6 flex flex-col items-center gap-2 text-green-700 font-semibold select-none"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={successCheckmark}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <p>Analysis complete! You can now view the report.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            className="md:w-1/2 flex flex-col justify-center gap-8 rounded-2xl border border-cyan-300 bg-white p-8 shadow-lg md:m-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <h2 className="text-3xl font-semibold text-cyan-800 mb-4 tracking-wide">How to Use</h2>
            <ol className="list-decimal list-inside space-y-3 text-cyan-700 text-lg leading-relaxed select-none">
              {[
                "Upload a clear image of the back side of the medicine wrapper.",
                "Click Analyze to start the AI-powered medicine analysis.",
                "Once analysis completes, click Show Report to see detailed info.",
                "Use the report to understand medicine usage, warnings, and more.",
                "For any medical concerns, always consult your doctor.",
              ].map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </motion.div>
        </div>

        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-20 right-6 rounded-xl bg-cyan-700 px-6 py-3 text-white shadow-lg select-none"
            >
              {toastMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          initial={{ rotate: -10 }}
          animate={{
            rotate: [-10, 10, -10],
            boxShadow: ["0 0 8px 2px rgba(14, 165, 233, 0.6)", "0 0 0 0 rgba(14, 165, 233, 0)"],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          whileHover={{ scale: 1.1, boxShadow: "0 0 15px 4px rgba(14, 165, 233, 0.8)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => alert('Voice Assistant Coming Soon!')}
          className="fixed bottom-6 right-6 z-50 rounded-full bg-white p-2 shadow-lg hover:shadow-xl transition"
          aria-label="Voice Assistant"
        >
          <img src={chatIcon} alt="Voice Assistant Icon" className="h-14 w-14 rounded-full object-cover" />
        </motion.button>
      </div>
    </div>
  )
}

export default MainPage
```

- [ ] **Step 4: Update ReportPage to fetch from backend by ID**

Replace `src/pages/ReportPage.jsx` with:

```jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAnalysis } from '../services/api'

function parseGeminiText(text) {
  if (!text) return {}

  const cleanText = (t) => t.replace(/\*\*/g, '').replace(/\*/g, '').trim()

  const result = {
    about: '', formType: '', usageInstructions: [], sideEffects: [],
    ageGroup: [], expiryInfo: [], primaryPurpose: [], usefulFor: '',
    treats: '', storage: '', warnings: '', prescriptionRequired: '',
    manufacturer: '', raw: text,
  }

  const sections = [
    'about the medicine', 'form & packaging type', 'usage instructions',
    'possible side effects', 'recommended age group', 'expiry information',
    'primary purpose', 'useful for', 'treats', 'storage instructions',
    'warnings', 'prescription required', 'manufacturer information',
  ]
  const sectionPattern = sections.join('|')

  const patterns = {
    about: new RegExp(`about the medicine\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    formType: new RegExp(`form & packaging type\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    usageInstructions: new RegExp(`usage instructions\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    sideEffects: new RegExp(`possible side effects\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    ageGroup: new RegExp(`recommended age group\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    expiryInfo: new RegExp(`expiry information\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    primaryPurpose: new RegExp(`primary purpose\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    usefulFor: new RegExp(`useful for\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    treats: new RegExp(`treats\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    storage: new RegExp(`storage instructions\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    warnings: new RegExp(`warnings\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    prescriptionRequired: new RegExp(`prescription required\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
    manufacturer: new RegExp(`manufacturer information\\s*[:\\-]?\\s*(.*?)(?=\\n\\s*(${sectionPattern})|$)`, 'is'),
  }

  for (const [key, regex] of Object.entries(patterns)) {
    const match = text.match(regex)
    if (match && match[1]) {
      const value = cleanText(match[1])
      if (['usageInstructions', 'sideEffects', 'ageGroup', 'expiryInfo', 'primaryPurpose'].includes(key)) {
        result[key] = value.split(/\n+|\*|\d+\.\s+/).map((line) => cleanText(line)).filter(Boolean)
      } else {
        result[key] = value
      }
    }
  }
  return result
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.15 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

const ReportPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAnalysis(id)
      .then((data) => {
        const parsed = parseGeminiText(data.formatted_text)
        setReport(parsed)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <div className="mx-auto w-full max-w-[800px] rounded-2xl bg-white p-10 shadow-xl text-center">
          <p className="text-lg text-red-600 font-semibold">
            {error || 'No report data found. Please analyze a medicine image first.'}
          </p>
          <button
            className="mt-6 rounded-xl bg-blue-600 px-6 py-2 text-white font-semibold shadow hover:bg-blue-700"
            onClick={() => navigate('/dashboard')}
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="mx-auto flex w-full max-w-[1000px] flex-col">
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-8 text-center text-4xl font-bold text-blue-800"
        >
          Medicine Analysis Report
        </motion.h1>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mx-auto mt-10 w-full max-w-[800px] rounded-2xl bg-white p-8 shadow-xl"
        >
          {Object.entries({
            'About the medicine': report.about,
            'Form & Packaging Type': report.formType,
            'Useful for': report.usefulFor,
            'Treats': report.treats,
            'Storage instructions': report.storage,
            'Warnings / Precautions': report.warnings,
            'Prescription required': report.prescriptionRequired,
            'Manufacturer information': report.manufacturer,
          }).map(([title, value], idx) => (
            <motion.div className="mt-6" key={idx} variants={itemVariants}>
              <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
              <p className="mt-1 text-gray-600">{value || <span className="text-gray-400">Not available</span>}</p>
            </motion.div>
          ))}

          {Object.entries({
            'Usage instructions': report.usageInstructions,
            'Possible side effects': report.sideEffects,
            'Recommended age group': report.ageGroup,
            'Expiry information': report.expiryInfo,
            'Primary purpose': report.primaryPurpose,
          }).map(([title, list], idx) => (
            <motion.div className="mt-6" key={idx} variants={itemVariants}>
              <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
              <ul className="mt-2 list-inside list-disc text-gray-600">
                {list.length > 0 ? list.map((item, i) => <li key={i}>{item}</li>) : <li className="text-gray-400">Not available</li>}
              </ul>
            </motion.div>
          ))}

          <hr className="my-6 border-t" />

          <p className="text-center text-sm text-gray-500">
            This analysis is generated by AI. For medical advice, always consult a healthcare professional.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default ReportPage
```

- [ ] **Step 5: Update HistoryPage to fetch from backend**

Replace `src/pages/HistoryPage.jsx` with:

```jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAnalyses, deleteAnalysis } from '../services/api'

const HistoryPage = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchHistory = (query = '') => {
    setLoading(true)
    getAnalyses(query)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchHistory(search)
  }

  const handleDelete = async (id) => {
    await deleteAnalysis(id)
    setHistory((prev) => prev.filter((item) => item.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="mb-6 text-3xl font-bold text-blue-700">Analysis History</h1>

      <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-6 flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search analyses..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Search
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center mt-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
        </div>
      ) : history.length === 0 ? (
        <p className="text-gray-600 text-center">No analyses found.</p>
      ) : (
        <div className="max-w-3xl mx-auto space-y-4">
          {history.map((item) => (
            <div key={item.id} className="border border-gray-300 rounded-md p-4 bg-white shadow-sm flex justify-between items-start">
              <div className="flex-1">
                <p className="text-gray-700">{item.summary}</p>
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(item.created_at).toLocaleString()}
                </p>
                <Link
                  to={`/report/${item.id}`}
                  className="text-blue-600 text-sm font-semibold hover:underline mt-1 inline-block"
                >
                  View Report
                </Link>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="ml-4 text-red-500 hover:text-red-700 text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default HistoryPage
```

- [ ] **Step 6: Update Navbar with auth state**

Replace `src/components/Navbar.jsx` with:

```jsx
import React, { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, handleLogout } = useAuth()

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false)
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen])

  const onLogout = () => {
    handleLogout()
    navigate('/')
  }

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`cursor-pointer py-2 px-4 font-bold ${
        location.pathname === to ? 'text-blue-600' : 'text-black'
      } hover:text-gray-900`}
    >
      {label}
    </Link>
  )

  const mobileNavLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setIsOpen(false)}
      className={`cursor-pointer py-4 px-6 font-bold border-b border-gray-200 ${
        location.pathname === to ? 'text-blue-600' : 'text-black'
      } hover:text-gray-900`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md">
      <div className="flex items-center justify-between p-4 px-6 md:px-14">
        <Link
          to="/"
          className="border-2 bg-white px-4 py-1 text-xl font-bold text-gray-800 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
          aria-label="Go to Home"
        >
          MeddiBuddy
        </Link>

        <div className="md:hidden">
          <button onClick={() => setIsOpen((o) => !o)} aria-label="Toggle menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="hidden md:flex md:space-x-4 md:items-center">
          {user && navLink('/dashboard', 'Dashboard')}
          {navLink('/about', 'About')}
          {user && navLink('/history', 'History')}
          {navLink('/faq', 'FAQ')}
          {navLink('/feedback', 'Feedback')}
          {user ? (
            <div className="flex items-center gap-3 ml-4">
              <span className="text-sm text-gray-600 font-medium">{user.name}</span>
              <button
                onClick={onLogout}
                className="px-4 py-1 text-sm font-semibold text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-4 px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm"
            >
              Log In
            </Link>
          )}
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-full left-0 right-0 bg-white shadow-md flex flex-col md:hidden"
            >
              {user && mobileNavLink('/dashboard', 'Dashboard')}
              {mobileNavLink('/about', 'About')}
              {user && mobileNavLink('/history', 'History')}
              {mobileNavLink('/faq', 'FAQ')}
              {mobileNavLink('/feedback', 'Feedback')}
              {user ? (
                <button
                  onClick={() => { setIsOpen(false); onLogout() }}
                  className="py-4 px-6 font-bold text-red-600 text-left"
                >
                  Logout ({user.name})
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="py-4 px-6 font-bold text-blue-600"
                >
                  Log In
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default Navbar
```

- [ ] **Step 7: Update HomePage CTA link**

In `src/pages/HomePage.jsx`, change the "Get Started" link from `/main` to `/dashboard`:

Replace in `src/pages/HomePage.jsx`:
```jsx
<Link to="/main">
```
with:
```jsx
<Link to="/dashboard">
```

- [ ] **Step 8: Commit**

```bash
git add src/
git commit -m "feat: rewire frontend to use backend API with auth, fix all existing bugs"
```

---

### Task 9: Fix Remaining Issues (README, index.html, .gitignore)

**Files:**
- Rewrite: `README.md`
- Modify: `index.html`
- Modify: `.gitignore`

- [ ] **Step 1: Fix README.md**

Replace `README.md` with:

```markdown
# MeddiBuddy

AI-powered medicine analysis platform. Upload medicine package images and get instant, structured analysis including usage instructions, side effects, warnings, and more — powered by Google Gemini.

## Features

- Upload medicine images for AI-powered analysis
- Structured report with usage, side effects, warnings, dosage info
- User authentication (register/login)
- Analysis history saved to your account
- Multi-language support (coming soon)
- Accessible design for all age groups

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, Framer Motion, React Router

**Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL, JWT Authentication

**AI:** Google Gemini 1.5 Flash

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your database URL and Gemini API key
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Project Structure

```
meddibuddy/
  backend/          # FastAPI backend
    app/
      models/       # SQLAlchemy models
      routers/      # API endpoints
      schemas/      # Pydantic validation
      services/     # Business logic (auth, Gemini)
    tests/          # Backend tests
  src/              # React frontend
    components/     # Reusable UI components
    contexts/       # React context providers
    pages/          # Page components
    services/       # API client
```

## License

MIT
```

- [ ] **Step 2: Fix index.html**

Replace `index.html` with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="MeddiBuddy — AI-powered medicine analysis. Upload medicine images and get instant analysis of usage, side effects, and warnings." />
    <title>MeddiBuddy — AI Medicine Analysis</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Update .gitignore**

Add these lines to `.gitignore`:

```
# Environment variables
.env
.env.local
.env.*.local

# Python
__pycache__/
*.py[cod]
*.egg-info/
.venv/
venv/
backend/.env

# IDE
.vscode/
.idea/
```

- [ ] **Step 4: Commit**

```bash
git add README.md index.html .gitignore
git commit -m "fix: rewrite README, update page title/meta, add Python to gitignore"
```

---

### Task 10: Deployment Setup

**Files:**
- Create: `Dockerfile`
- Create: `backend/Procfile`
- Modify: `vite.config.js`

- [ ] **Step 1: Write Dockerfile for backend**

Replace `Dockerfile` with:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [ ] **Step 2: Create Procfile for Railway**

Create `backend/Procfile`:

```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

- [ ] **Step 3: Update vite.config.js for production**

Replace `vite.config.js` with:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

- [ ] **Step 4: Update frontend API service for production**

In `src/services/api.js`, the `API_BASE_URL` already reads from `VITE_API_URL` env var. For Vercel deployment, set `VITE_API_URL` to the Railway backend URL in Vercel's environment variables dashboard.

- [ ] **Step 5: Commit**

```bash
git add Dockerfile backend/Procfile vite.config.js
git commit -m "feat: add deployment config — Dockerfile, Procfile, Vite proxy"
```

---

## Deployment Steps (Manual — Not Automated)

After all tasks are complete:

### Railway (Backend + DB)
1. Create a Railway account at railway.app
2. Create a new project → "Deploy from GitHub repo"
3. Set root directory to `backend`
4. Add a PostgreSQL plugin to the project
5. Set environment variables: `DATABASE_URL` (from Railway PostgreSQL), `SECRET_KEY`, `GEMINI_API_KEY`, `ALLOWED_ORIGINS` (your Vercel URL)
6. Deploy — Railway auto-detects the Procfile

### Vercel (Frontend)
1. Create a Vercel account at vercel.com
2. Import the GitHub repo
3. Framework preset: Vite
4. Set environment variable: `VITE_API_URL` = your Railway backend URL
5. Deploy

### Post-Deploy
1. Update `ALLOWED_ORIGINS` on Railway to include the Vercel domain
2. Run `alembic upgrade head` on Railway (via Railway CLI or console)
3. Test: register, login, upload image, view report, check history
