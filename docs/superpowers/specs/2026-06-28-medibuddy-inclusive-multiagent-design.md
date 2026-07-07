# MediBuddy v1 — Inclusive Multi-Agent Medical Assistant (Design Spec)

**Date:** 2026-06-28
**Status:** Approved design, pending implementation plan
**Repo:** `D:\jay\poojitha\dream\projects\meddibuddy` (code package name: `meddibuddy` / "MeddiBuddy API")
**Reference (study only, NOT reused):** `souvikmajumder26/Multi-Agent-Medical-Assistant` — patterns learned, implemented independently here.

---

## 1. Goal

Turn MediBuddy from a working Gemini medicine-analysis app into an **inclusive, bilingual, voice-assisted medical helper** that is safe and usable by **elderly residents of an old-age home, their caretakers, and everyday people** — and deploy it live. It is also the flagship project for demonstrating *senior-grade* backend work: multi-agent orchestration, retrieval grounding, guardrails, evaluation, and observability.

**Design principle:** Design for the hardest user first (an elderly Telugu speaker who does not type and reads small text poorly). Everyone else benefits for free.

## 2. Users & primary jobs

- **Elderly residents** — primary. Low literacy/eyesight tolerance; voice + big buttons essential.
- **Caretakers / staff** — operate on residents' behalf; need history and speed.
- **Everyday adults** (e.g. the developer's parents) — general consumer use.

**Core jobs (all three in v1, camera is the visual star):**
1. 💊 **Understand a medicine** — photograph a medicine → plain-language, grounded report (what / how to take / warnings), read aloud.
2. ⏰ **Reminders** — set and receive medicine reminders.
3. 💬 **Ask a health question** — grounded, guardrailed Q&A.

## 3. Non-goals (v1)

- No real clinical/diagnostic use or regulatory claims; always defer to a doctor.
- No image *diagnosis* models (brain tumor / X-ray etc. from the reference project) — out of scope.
- No multi-tenant facility dashboard; no push to app stores. Web app only.
- Languages limited to **English + Telugu** in v1.

## 4. UI design (approved)

Frontend stays React (existing `src/`), redesigned inclusive-first.

- **Home (Option A "Big Camera Hero"):** large camera hero action ("Scan a medicine" / "మందు స్కాన్ చేయండి"); two tall secondary rows (My reminders, Ask a question); persistent 🎤 *Tap & speak* bar; EN/తె toggle top-right.
- **Results screen:** medicine name, **"✓ Verified · openFDA"** grounding badge, primary **🔊 Read this aloud** button, color-coded blocks (blue *what is it*, green *how to take*, red *be careful*), and a permanent **"👩‍⚕️ Always confirm with your doctor"** footer (bilingual).
- **Cross-cutting UI rules:** minimum ~19px body text, large tap targets (≥64px), high contrast, every screen supports read-aloud and speech input, EN/తె switch anywhere.

Mockups saved under `.superpowers/brainstorm/` (AARNA workspace) during design.

## 5. Backend architecture

Extend the existing FastAPI app (`backend/app`). Introduce an **orchestrator + agents** layer; keep the current layering (`routers / services / schemas / models`).

- **Orchestrator / router** (`services/orchestrator.py`) — classifies the incoming request (medicine image, reminder action, health question) and routes to the right agent. Confidence-aware: low confidence → safe fallback, never a guess.
- **💊 Medicine agent** (`services/medicine_agent.py`, extends current `gemini.py`) — Gemini 2.5 Flash identifies the medicine from the image, then **grounds** the result against a trusted source before composing the report.
- **🌐 Grounding service** (`services/grounding.py`) — queries **openFDA** drug label API for authoritative purpose / dosage / warnings keyed off the identified drug name. On a miss, the report is marked *unverified* and the doctor disclaimer is strengthened. (Optional later: cache labels in Qdrant.)
- **🛡️ Guardrails** (`services/guardrails.py`) — **input:** reject non-medicine images with a friendly retake message; **output:** strip/Forbid unsafe advice (e.g. dosage beyond the label), always append the doctor disclaimer.
- **⏰ Reminders agent + model** — new `Reminder` model and `routers/reminders.py` (create / list / delete). v1 stores reminders; delivery is in-app (a due-reminders endpoint the frontend polls). Push/SMS is a later phase.
- **💬 Ask-health agent** (`services/ask_agent.py`, `routers/ask.py`) — grounded, guardrailed Q&A; reuses grounding + guardrails. Ships only with guardrails active.
- **🔊 Speech service** (`services/speech.py`) — **Google Cloud TTS/STT** for real Telugu support, English fallback. Endpoints for text→audio and audio→text.
- **Localization** (`services/i18n.py`) — canonical report fields produced once, then rendered/translated to EN or తె; do not rely on Gemini alone to translate (unreliable for Telugu). Static UI strings handled client-side via `react-i18next`.

## 6. Data model changes

- Keep `User`, `Analysis` as-is. Extend `Analysis.parsed_report` to optionally carry structured fields (`drug_name`, `grounded: bool`, `source`, `confidence`) alongside `formatted_text`.
- **New `Reminder` model:** `id` (uuid), `user_id` (FK), `medicine_name`, `dose`, `schedule` (time(s) of day / frequency), `language`, `active` (bool), `created_at`.
- Add an **Alembic migration** for the new table.

## 7. Key API endpoints

- `POST /api/analyze` — *(exists; extend)* now runs guardrail → vision → grounding → guardrail → localize; returns structured report incl. `grounded`, `source`, `confidence`.
- `GET /api/analyses`, `GET /api/analyses/{id}`, `DELETE /api/analyses/{id}` — exist, unchanged.
- `POST /api/reminders`, `GET /api/reminders`, `GET /api/reminders/due`, `DELETE /api/reminders/{id}` — new.
- `POST /api/ask` — new, grounded health Q&A.
- `POST /api/speech/tts`, `POST /api/speech/stt` — new, Google Cloud backed.
- `GET /api/health` — exists.

## 8. Scan data flow

1. User taps Scan → captures/uploads photo (frontend validates type/size).
2. `POST /api/analyze` (image + language).
3. **Guardrail (input):** is this a medicine package? If not → friendly "that doesn't look like a medicine, please retake" (no model call wasted).
4. **Vision:** Gemini identifies drug name + strength + visible details.
5. **Grounding:** openFDA lookup for authoritative purpose/dosage/warnings.
6. **Compose:** structured report (what / how / warnings) + `confidence` + `source`.
7. **Guardrail (output):** enforce safety, attach doctor disclaimer.
8. **Localize** to EN/తె → persist `Analysis` → return.
9. Results screen renders; read-aloud via TTS on demand.

## 9. Error handling (elderly-safe)

- Low vision confidence → "I'm not fully sure — please retake the photo in good light." Never guess a medicine.
- Grounding miss → show what is known, mark **unverified**, strengthen the doctor prompt.
- Gemini 429/quota → existing calm retry message ("Our AI is busy, try in 30–60s").
- Any upstream failure (openFDA, TTS) → degrade gracefully; never show a blank screen or stack trace to an elderly user.
- Rate limiting on `/api/analyze` and `/api/ask`.

## 10. Evaluation harness (the senior differentiator)

- A labeled set of **~30 medicine photos** with ground-truth (correct drug, expected purpose, known warnings) under `backend/eval/`.
- Scores **identification accuracy** and **unsafe-advice rate (target: 0)**; reports per-run metrics.
- Wired into **CI** (GitHub Actions) so every change re-runs the eval; a regression fails the build.

## 11. Testing

- Extend existing `pytest` suite (`backend/tests`): unit tests for guardrails, grounding (mock openFDA), orchestrator routing, reminders CRUD, ask agent.
- Keep existing `test_auth`, `test_analysis`, `test_gemini_service`.
- Eval harness runs in CI alongside unit tests.
- Basic React component tests for the new inclusive screens.

## 12. Deployment & observability

- Use existing `Dockerfile`; deploy backend + frontend to a live URL (provider TBD at deploy time, e.g. Render/Railway/Fly).
- Add structured logging + per-request tracing of the analyze pipeline (latency, cost proxy, grounded yes/no). Surface p95 latency and grounding rate.
- Secrets via env (`.env.example` already present): Gemini, Google Cloud (TTS/STT), openFDA (no key needed), DB.

## 13. Phasing within v1

All three agents ship in v1 (per product owner decision), camera first. Build order:
1. Medicine agent: guardrails + openFDA grounding + structured report + eval harness.
2. Inclusive frontend: Home (A) + Results + read-aloud + EN/తె + speech.
3. Reminders (model, endpoints, UI).
4. Ask-health agent (grounded + guarded).
5. Deploy + CI eval + observability + writeup.

## 14. Risks & open questions

- **Telugu voice quality** — depends on Google Cloud TTS/STT for `te`; confirm voice quality and cost early.
- **openFDA coverage for Indian medicines** — openFDA is US-centric; many Indian brand names may miss. Mitigation: ground on generic/active-ingredient name; if still a miss, mark unverified rather than fabricate. A curated local corpus (Indian drug data) is a possible later addition.
- **Gemini Telugu translation reliability** — mitigated by producing canonical fields then translating deliberately.
- **Cost** — Gemini + Google Cloud TTS/STT per request; add caching for repeat medicines later.
