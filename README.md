# MeddiBuddy

**AI-powered medicine analysis platform.**

Upload medicine package images and get instant, structured analysis including usage instructions, side effects, warnings, and more — powered by Google Gemini.

---

## Features

- Upload medicine images for AI-powered analysis
- Structured report with usage, side effects, warnings, dosage info
- User authentication (register/login)
- Analysis history saved to your account
- Multi-language support (coming soon)
- Accessible design for all age groups

---

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, Framer Motion, React Router

**Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL, JWT Authentication

**AI:** Google Gemini 2.5 Flash

---

## System Architecture

```
User uploads medicine image
    -> Frontend sends image to FastAPI backend
        -> Backend converts to base64, sends to Gemini API
            -> Gemini returns structured analysis
        -> Backend stores result in PostgreSQL
    -> Frontend displays formatted report
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL (or SQLite for local dev)

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your database URL and Gemini API key
pip install -r requirements.txt
python -c "from app.database import Base, engine; from app.models import User, Analysis; Base.metadata.create_all(bind=engine)"
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## Project Structure

```
meddibuddy/
  backend/            # FastAPI backend
    app/
      models/         # SQLAlchemy models (User, Analysis)
      routers/        # API endpoints (auth, analysis)
      schemas/        # Pydantic validation
      services/       # Business logic (auth, Gemini)
    tests/            # Backend tests
  src/                # React frontend
    components/       # Reusable UI components
    contexts/         # React context providers (Auth)
    pages/            # Page components
    services/         # API client
```

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## Contact

For any inquiries or feedback, please contact [Poojitha319](https://github.com/Poojitha319).
