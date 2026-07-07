# Reminders Subsystem — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Let a user create medicine reminders (medicine, dose, one or more times of day) and fetch the ones due at a given time. Backend only (UI is a later plan).

**Architecture:** New `Reminder` SQLAlchemy model + Pydantic schemas + a `/api/reminders` router (create/list/due/delete), scoped to the authenticated user. The `/due` endpoint accepts a `now=HH:MM` query param (defaulting to the current time) so it is deterministically testable. Tests use the existing `client`/`auth_headers` fixtures; `conftest.py` calls `Base.metadata.create_all`, so importing the model registers the table automatically — no migration needed for tests.

**Tech Stack:** FastAPI, SQLAlchemy 2.0 (Mapped/mapped_column), Pydantic v2, pytest.

---

## File Structure
- Create `backend/app/models/reminder.py` — `Reminder` model.
- Create `backend/app/schemas/reminder.py` — `ReminderCreate`, `ReminderResponse`.
- Create `backend/app/routers/reminders.py` — the router.
- Modify `backend/app/main.py` — include the reminders router.
- Create `backend/tests/test_reminders.py` — full TDD coverage.
- (Optional) `backend/alembic/versions/<rev>_add_reminders.py` — migration for the real DB, only if alembic is configured.

**Canonical Reminder fields:** `id` (uuid str), `user_id` (FK→users.id), `medicine_name` (str), `dose` (str), `times` (JSON list of "HH:MM" strings), `language` (str, default "en"), `active` (bool, default True), `created_at` (datetime).

---

### Task 1: Reminder model + schemas

**Files:**
- Create: `backend/app/models/reminder.py`
- Create: `backend/app/schemas/reminder.py`

- [ ] **Step 1: Write the model** `backend/app/models/reminder.py`

```python
import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Reminder(Base):
    __tablename__ = "reminders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    medicine_name: Mapped[str] = mapped_column(String(200), nullable=False)
    dose: Mapped[str] = mapped_column(String(100), default="")
    times: Mapped[list] = mapped_column(JSON, default=list)
    language: Mapped[str] = mapped_column(String(10), default="en")
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
```

- [ ] **Step 2: Write the schemas** `backend/app/schemas/reminder.py`

```python
from datetime import datetime
from pydantic import BaseModel


class ReminderCreate(BaseModel):
    medicine_name: str
    dose: str = ""
    times: list[str] = []
    language: str = "en"


class ReminderResponse(BaseModel):
    id: str
    medicine_name: str
    dose: str
    times: list[str]
    language: str
    active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
```

- [ ] **Step 3: Verify it imports** (no test yet — Task 2 tests exercise it)

Run: `cd backend && python -c "from app.models.reminder import Reminder; from app.schemas.reminder import ReminderCreate, ReminderResponse; print('ok')"`
Expected: prints `ok`

---

### Task 2: Reminders router + wire into app + tests

**Files:**
- Create: `backend/app/routers/reminders.py`
- Modify: `backend/app/main.py` (include the router)
- Create: `backend/tests/test_reminders.py`

- [ ] **Step 1: Write the failing tests** `backend/tests/test_reminders.py`

```python
def _create(client, auth_headers, **overrides):
    payload = {"medicine_name": "Paracetamol", "dose": "1 tablet", "times": ["09:00", "21:00"], "language": "en"}
    payload.update(overrides)
    return client.post("/api/reminders", headers=auth_headers, json=payload)


def test_create_reminder(client, auth_headers):
    resp = _create(client, auth_headers)
    assert resp.status_code == 201
    body = resp.json()
    assert body["medicine_name"] == "Paracetamol"
    assert body["times"] == ["09:00", "21:00"]
    assert body["active"] is True
    assert "id" in body


def test_list_reminders(client, auth_headers):
    _create(client, auth_headers)
    _create(client, auth_headers, medicine_name="Ibuprofen")
    resp = client.get("/api/reminders", headers=auth_headers)
    assert resp.status_code == 200
    names = [r["medicine_name"] for r in resp.json()]
    assert "Paracetamol" in names and "Ibuprofen" in names


def test_due_filters_by_time(client, auth_headers):
    _create(client, auth_headers, medicine_name="Morning", times=["09:00"])
    _create(client, auth_headers, medicine_name="Night", times=["21:00"])
    resp = client.get("/api/reminders/due?now=09:00", headers=auth_headers)
    assert resp.status_code == 200
    names = [r["medicine_name"] for r in resp.json()]
    assert names == ["Morning"]


def test_delete_reminder(client, auth_headers):
    rid = _create(client, auth_headers).json()["id"]
    resp = client.delete(f"/api/reminders/{rid}", headers=auth_headers)
    assert resp.status_code == 204
    assert client.get("/api/reminders", headers=auth_headers).json() == []


def test_reminders_require_auth(client):
    assert client.get("/api/reminders").status_code in (401, 403)
```

- [ ] **Step 2: Run tests, expect FAIL**

Run: `cd backend && python -m pytest tests/test_reminders.py -v`
Expected: FAIL (404s / router not registered)

- [ ] **Step 3: Write the router** `backend/app/routers/reminders.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.reminder import Reminder
from app.schemas.reminder import ReminderCreate, ReminderResponse
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/reminders", tags=["reminders"])


@router.post("", response_model=ReminderResponse, status_code=status.HTTP_201_CREATED)
def create_reminder(
    payload: ReminderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reminder = Reminder(
        user_id=current_user.id,
        medicine_name=payload.medicine_name,
        dose=payload.dose,
        times=payload.times,
        language=payload.language,
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder


@router.get("", response_model=list[ReminderResponse])
def list_reminders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Reminder)
        .filter(Reminder.user_id == current_user.id, Reminder.active == True)  # noqa: E712
        .order_by(Reminder.created_at.desc())
        .all()
    )


@router.get("/due", response_model=list[ReminderResponse])
def due_reminders(
    now: str = "",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reminders = (
        db.query(Reminder)
        .filter(Reminder.user_id == current_user.id, Reminder.active == True)  # noqa: E712
        .all()
    )
    return [r for r in reminders if now in (r.times or [])]


@router.delete("/{reminder_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reminder(
    reminder_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    reminder = (
        db.query(Reminder)
        .filter(Reminder.id == reminder_id, Reminder.user_id == current_user.id)
        .first()
    )
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    db.delete(reminder)
    db.commit()
```

Note: the `/due` route is declared before `/{reminder_id}` is irrelevant here (different methods/paths), but keep `/due` as a GET distinct from the list. FastAPI matches `/api/reminders/due` to the `due` route correctly.

- [ ] **Step 4: Wire into `backend/app/main.py`** — add `reminders` to the routers import and include it:

Change `from app.routers import auth, analysis` to `from app.routers import auth, analysis, reminders`, and after `app.include_router(analysis.router)` add `app.include_router(reminders.router)`.

- [ ] **Step 5: Run tests, expect PASS (5 passed)**

Run: `cd backend && python -m pytest tests/test_reminders.py -v`

- [ ] **Step 6: Run the FULL suite** `cd backend && python -m pytest -q` — expect all green (39 total).

---

### Task 3: Alembic migration for the reminders table (real DB only)

**Files:**
- Create (only if alembic is configured): `backend/alembic/versions/<rev>_add_reminders.py`

- [ ] **Step 1: Check whether alembic is set up**

Run: `cd backend && ls alembic/versions 2>NUL || dir alembic\versions`
- If there is NO `alembic/` directory or `alembic.ini`, SKIP this task and report "alembic not configured; tests rely on Base.metadata.create_all; migration deferred."
- If alembic IS configured, run `cd backend && alembic revision --autogenerate -m "add reminders table"` and verify the generated migration creates the `reminders` table with the columns from the model. Then `alembic upgrade head` against the dev DB if safe.

- [ ] **Step 2: Report** whether a migration was created or deferred, and why.

---

## Self-Review
- **Spec coverage:** Reminder model (§6), endpoints create/list/due/delete (§7), auth-scoping (§2). ✅
- **Placeholders:** none — all code provided. The `/due` matching is exact `HH:MM` string membership (deterministic, testable). Real scheduled notifications (push/SMS) are explicitly out of scope (spec §5 "delivery is in-app … later phase").
- **Type consistency:** `times` is `list[str]` in schema and `JSON`/`list` in model; router passes `payload.times` straight through; `/due` reads `r.times`. `ReminderResponse.from_attributes` maps the ORM object. Router prefix `/api/reminders` + `response_model` consistent across handlers.
