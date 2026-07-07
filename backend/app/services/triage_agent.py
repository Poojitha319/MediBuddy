from app.services.gemini import model
from app.services.guardrails import apply_output_guardrails

URGENT_NOTICE = "⚠️ These symptoms may be serious. Please see a doctor right away."


def _assess(symptoms: str, language: str) -> dict:
    """LLM boundary — patched in tests. Returns {'advice': str, 'red_flag': bool}."""
    prompt = (
        f"You are a careful symptom-triage assistant. The user describes how they feel. "
        f"Give calm, plain-language self-care guidance in this language: {language}. "
        f"Do NOT diagnose or prescribe specific doses. "
        f"If the symptoms could be a medical emergency (e.g. chest pain, trouble breathing, "
        f"stroke signs, severe bleeding, fainting), the FIRST line must be exactly 'REDFLAG', "
        f"then a blank line, then the guidance.\n\n"
        f"Symptoms: {symptoms}"
    )
    response = model.generate_content(prompt)
    text = response.text or ""
    red_flag = text.strip().upper().startswith("REDFLAG")
    if red_flag:
        _, _, rest = text.partition("\n")
        advice = rest.strip()
    else:
        advice = text.strip()
    return {"advice": advice, "red_flag": red_flag}


async def run_triage(symptoms: str, language: str = "en") -> dict:
    assessment = _assess(symptoms, language)
    advice = assessment.get("advice", "")
    red_flag = bool(assessment.get("red_flag", False))

    if red_flag:
        advice = f"{URGENT_NOTICE}\n\n{advice}".strip()

    guarded = apply_output_guardrails({"formatted_text": advice, "plain_text": advice})
    return {
        "answer": guarded["formatted_text"],
        "grounded": False,
        "source": None,
        "red_flag": red_flag,
        "agent": "triage",
    }
