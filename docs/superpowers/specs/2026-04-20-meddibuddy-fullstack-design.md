# MeddiBuddy Full-Stack Redesign — Design Spec

## Overview

MeddiBuddy is an AI-powered medicine analysis platform. Users upload medicine package images, and the app uses Google Gemini to extract and present structured information (usage, side effects, warnings, etc.). The project is being redesigned from a frontend-only React app into a full-stack application with a FastAPI backend, PostgreSQL database, JWT authentication, and multiple new features.

**Target audience**: General public, with accessibility considerations for elderly users (old-age homes, non-English speakers).

**Goal**: A portfolio-ready, deployable project with a live link suitable for a resume.

## Architecture

```
┌─────────────────────┐         ┌─────────────────────────┐
│   React Frontend    │         │    FastAPI Backend       │
│   (Vercel)          │  HTTP   │    (Railway)             │
│                     │◄───────►│                          │
│ - Pages/Components  │   API   │ - Auth (JWT)             │
│ - Tailwind CSS      │         │ - Medicine Analysis      │
│ - Framer Motion     │         │ - Drug Interactions      │
│                     │         │ - PDF Generation         │
└─────────────────────┘         │ - Text-to-Speech         │
                                │ - History/User mgmt      │
                                └────────┬────────────────┘
                                         │
                                ┌────────▼────────────────┐
                                │   PostgreSQL (Railway)   │
                                │                          │
                                │ - Users                  │
                                │ - Analyses               │
                                │ - Interactions           │
                                │ - Feedback               │
                                └────────┬────────────────┘
                                         │
                                ┌────────▼────────────────┐
                                │   Google Gemini API      │
                                │   (called from backend)  │
                                └─────────────────────────┘
```

### Key Architectural Decisions

- **Gemini API calls move to the backend** — API key is never exposed to the browser.
- **All auth, history, and analysis storage happens server-side** — replaces localStorage.
- **Frontend is a pure React SPA** that communicates with FastAPI via REST.
- **PostgreSQL** stores users, analyses, interaction checks, and feedback persistently.
- **Deployment split**: Vercel (frontend) + Railway (backend + PostgreSQL).

## Tech Stack

### Frontend
- React 19 + Vite
- React Router DOM v7
- Tailwind CSS 3 (with dark mode via `class` strategy)
- Framer Motion (subtle, reduced-motion-aware animations)
- Lucide React (icons)

### Backend
- Python 3.11+
- FastAPI
- SQLAlchemy (ORM) + Alembic (migrations)
- Pydantic (request/response validation)
- python-jose (JWT tokens)
- passlib + bcrypt (password hashing)
- google-generativeai (Gemini SDK)
- fpdf2 or weasyprint (PDF generation)
- python-multipart (file uploads)

### Database
- PostgreSQL (hosted on Railway, free tier)

### Deployment
- Frontend: Vercel (Git-based auto-deploy)
- Backend + DB: Railway (Git-based auto-deploy)

## Database Schema

### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default gen |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| preferred_language | VARCHAR(10) | DEFAULT 'en' |
| created_at | TIMESTAMP | DEFAULT now() |
| updated_at | TIMESTAMP | DEFAULT now() |

### analyses
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default gen |
| user_id | UUID | FK → users.id, NOT NULL |
| image_data | TEXT | Base64 encoded image |
| image_mime_type | VARCHAR(50) | e.g., "image/jpeg" |
| language | VARCHAR(10) | DEFAULT 'en' |
| raw_response | TEXT | Full Gemini response |
| parsed_report | JSONB | Structured report data |
| plain_text | TEXT | Plain text for TTS |
| created_at | TIMESTAMP | DEFAULT now() |

### interactions
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default gen |
| user_id | UUID | FK → users.id, NOT NULL |
| medicine_1_name | VARCHAR(255) | NULL (if image used) |
| medicine_1_image | TEXT | NULL (base64, if image used) |
| medicine_2_name | VARCHAR(255) | NULL (if image used) |
| medicine_2_image | TEXT | NULL (base64, if image used) |
| interaction_result | TEXT | Gemini's interaction analysis |
| is_safe | BOOLEAN | NULL (if Gemini can't determine) |
| created_at | TIMESTAMP | DEFAULT now() |

### feedback
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default gen |
| user_id | UUID | FK → users.id, NULL (allow anonymous) |
| name | VARCHAR(100) | NOT NULL |
| message | TEXT | NOT NULL |
| created_at | TIMESTAMP | DEFAULT now() |

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Create account | No |
| POST | /api/auth/login | Get JWT token | No |
| GET | /api/auth/me | Get current user profile | Yes |

### Analysis
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/analyze | Upload image + language, get analysis | Yes |
| GET | /api/analyses | User's analysis history (paginated) | Yes |
| GET | /api/analyses/{id} | Single analysis detail | Yes |
| DELETE | /api/analyses/{id} | Delete an analysis | Yes |

### Drug Interactions
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/interactions/check | Check 2 medicines (image or text) | Yes |
| GET | /api/interactions | User's interaction history | Yes |

### Export
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/analyses/{id}/pdf | Download analysis as PDF | Yes |

### Misc
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/languages | Supported languages list | No |
| POST | /api/feedback | Submit feedback | No |

## Frontend Pages

| Route | Page | Description | Auth Required |
|-------|------|-------------|---------------|
| `/` | Home | Landing page with CTA | No |
| `/login` | Login | Email + password login | No |
| `/register` | Register | Sign up form | No |
| `/dashboard` | Dashboard | Upload + analyze medicine images | Yes |
| `/report/:id` | Report | Single analysis report with TTS + share + PDF | Yes |
| `/compare` | Compare | Drug interaction checker (image or text) | Yes |
| `/history` | History | Past analyses from database (search + filter) | Yes |
| `/about` | About | About the project | No |
| `/faq` | FAQ | Frequently asked questions | No |
| `/feedback` | Feedback | Submit feedback (saved to DB) | No |
| `/profile` | Profile | User settings, language preference | Yes |

## Authentication Flow

1. User registers with name, email, password.
2. Password hashed with bcrypt and stored in PostgreSQL.
3. Login returns a JWT access token (expires in 24h).
4. Frontend stores token in localStorage and sends it as `Authorization: Bearer <token>` header on all protected requests.
5. Backend middleware validates the token and injects the current user into request context.
6. Protected routes return 401 if token is missing/invalid/expired.

## Gemini Integration

The backend handles all Gemini API communication:

1. Frontend sends the image file + language to `POST /api/analyze`.
2. Backend converts image to base64, constructs the prompt (same structured prompt as current, with language parameter).
3. Backend calls Gemini 1.5 Flash API.
4. Backend parses the response into structured JSON fields (about, usage, side effects, etc.).
5. Both raw response and parsed JSON are stored in PostgreSQL.
6. Parsed report is returned to the frontend.

### Drug Interaction Prompt

For the interaction checker, a separate prompt asks Gemini to:
- Identify both medicines (from images or names).
- Check for known interactions, contraindications.
- Provide a safety assessment with a clear yes/no/unknown indicator.
- List any warnings or precautions when taking both together.

## Feature Details

### Multi-Language Support
- Supported languages: English, Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali, Marathi, Gujarati.
- User selects language per-analysis or sets a default in their profile.
- The language parameter is passed to Gemini in the prompt.
- UI labels remain in English; only the Gemini analysis output is translated.

### Camera Capture
- Add `capture="environment"` attribute to the file input on mobile devices.
- Detect mobile via user agent or screen width.
- Same upload flow — just changes how the image is acquired.

### Text-to-Speech
- Uses the browser's `window.speechSynthesis` API.
- Reads the `plain_text` field from the analysis.
- UI provides play/pause/stop controls on the report page.
- Respects the selected language for voice selection.

### PDF Report Download
- Server-side PDF generation via `fpdf2` or `weasyprint`.
- Branded with MeddiBuddy logo and clean formatting.
- Includes all parsed report fields + disclaimer.
- Endpoint: `GET /api/analyses/{id}/pdf` returns a downloadable PDF.

### Dark Mode
- Tailwind `class` strategy (not `media`) for manual toggle.
- Toggle in navbar, preference saved to localStorage and user profile.
- System preference detection as default for non-logged-in users.

### Search/Filter History
- Frontend search bar filters analyses by medicine name or date.
- Backend supports `?search=` and `?sort=` query params on `GET /api/analyses`.

### Share Analysis
- Web Share API for mobile (native share sheet).
- Fallback: copy-to-clipboard button.
- Shareable link format: `/report/{id}` — requires auth to view. Non-logged-in users who open the link are redirected to login/register first.

### Drug Interaction Checker
- Two input modes: upload images OR type medicine names.
- Can mix modes (one image + one text name).
- Results show: safety indicator (safe/caution/dangerous), interaction details, recommendations.
- History of checks saved to database.

### Medicine Comparison
- Upload 2 medicine images.
- Both are analyzed individually via Gemini.
- Frontend renders a side-by-side comparison table.
- Highlights differences in usage, side effects, age groups.

### PWA
- `vite-plugin-pwa` for service worker and manifest generation.
- App icon, splash screen, offline fallback page.
- Installable on Android/iOS home screen.

## UI Design Principles

- **Accessibility-first**: Minimum 16px body text, 48px minimum button/tap target height, WCAG AA contrast ratios.
- **Clean medical theme**: Blue/cyan primary palette, white backgrounds, clear section dividers.
- **Responsive**: Mobile-first design, works well on phones (camera capture, large tap targets).
- **Dark mode**: System preference detection + manual toggle.
- **Reduced motion**: Respect `prefers-reduced-motion` media query. Keep Framer Motion animations subtle and functional, not decorative.
- **Icons always paired with text labels** — no icon-only buttons (especially important for elderly users).
- **Clear typography**: Inter font, generous line height, sufficient spacing between sections.

## Phased Delivery

### Phase 1 — Foundation (Deployable MVP)
- Set up FastAPI project structure with proper config.
- Implement JWT authentication (register, login, me).
- Set up PostgreSQL with SQLAlchemy + Alembic.
- Create User and Analysis database models.
- Migrate Gemini API call from frontend to backend.
- Build the `/api/analyze` endpoint.
- Build the `/api/analyses` history endpoint.
- Fix all existing frontend bugs (broken result property, image import, README merge conflicts, index.html title).
- Connect React frontend to backend API (axios/fetch with auth headers).
- Add login/register pages.
- Add protected route wrapper.
- Deploy frontend to Vercel, backend + DB to Railway.
- Write a proper README.

### Phase 2 — Quick Wins
- Multi-language selector (dropdown on dashboard + profile setting).
- Camera capture on mobile.
- Text-to-speech on report page.
- Dark mode toggle.
- Search/filter on history page.
- Share analysis button.

### Phase 3 — Rich Features
- Drug interaction checker (image + text input, new Gemini prompt).
- Medicine comparison (side-by-side).
- PDF report download (server-side generation).
- PWA setup (manifest, service worker, offline page).
- Feedback saved to database.

## Error Handling

- Backend returns consistent error responses: `{"detail": "error message"}` with appropriate HTTP status codes.
- Frontend shows user-friendly error messages (not raw API errors).
- Network errors show a retry option.
- Gemini API failures return a clear message: "Analysis failed, please try again."
- Auth errors (401) redirect to login page.

## Security

- API key stored in backend environment variables only — never in frontend code.
- Passwords hashed with bcrypt (cost factor 12).
- JWT tokens with expiration (24h).
- CORS configured to allow only the Vercel frontend domain.
- Input validation on all endpoints via Pydantic.
- File upload size limit (10MB) enforced on backend.
- Rate limiting on auth endpoints to prevent brute force.
