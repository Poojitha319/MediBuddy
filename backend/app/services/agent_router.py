from app.services.gemini import model
from app.services.ask_agent import run_ask
from app.services.triage_agent import run_triage

VALID_ROUTES = {"medicine", "symptom", "general"}


def _classify(question: str, language: str) -> str:
    """LLM boundary — patched in tests. Returns one of VALID_ROUTES.

    - "medicine": question about a specific drug (what it is, how to take, side effects)
    - "symptom": user describes how they feel / asks what to do about symptoms
    - "general": greetings, general health info, anything else
    """
    prompt = (
        "Classify the user's message into EXACTLY one word from this list: "
        "medicine, symptom, general.\n"
        "- medicine: about a specific drug/tablet (what it is, dose, side effects)\n"
        "- symptom: they describe how they feel or ask what to do about symptoms\n"
        "- general: greetings or anything else\n"
        "Reply with only the single word.\n\n"
        f"Message: {question}"
    )
    response = model.generate_content(prompt)
    label = (response.text or "").strip().lower()
    return label if label in VALID_ROUTES else "general"


async def route(question: str, language: str = "en") -> dict:
    """Multi-agent entry point: classify, then dispatch to a specialist agent."""
    category = _classify(question, language)

    if category == "symptom":
        result = await run_triage(question, language)
    else:
        result = await run_ask(question, language)
        result.setdefault("agent", category)

    result["route"] = category
    return result
