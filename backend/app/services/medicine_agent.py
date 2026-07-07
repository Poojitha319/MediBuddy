import base64
from app.services.gemini import build_structured_prompt, parse_structured_response, model
from app.services.grounding import lookup_drug_label
from app.services.guardrails import is_medicine_result, apply_output_guardrails


def _vision(image_bytes: bytes, mime_type: str, language: str) -> dict:
    """Gemini vision boundary — patched in tests."""
    prompt = build_structured_prompt(language)
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")
    response = model.generate_content([prompt, {"mime_type": mime_type, "data": image_b64}])
    return parse_structured_response(response.text)


def _merge_grounding(text: str, facts: dict) -> str:
    extra = (
        f"\n\n**Verified facts (openFDA):**\n"
        f"- Purpose: {facts['purpose']}\n"
        f"- How to take: {facts['dosage']}\n"
        f"- Warnings: {facts['warnings']}"
    )
    return f"{text}{extra}".strip()


async def run_medicine_analysis(image_bytes: bytes, mime_type: str, language: str = "en") -> dict:
    vision = _vision(image_bytes, mime_type, language)

    if not is_medicine_result(vision):
        return {
            "is_medicine": False, "drug_name": "", "confidence": vision.get("confidence", 0.0),
            "grounded": False, "source": None,
            "formatted_text": vision.get("formatted_text", "")
            or "That doesn't look like a medicine. Please retake the photo in good light.",
            "plain_text": vision.get("plain_text", "")
            or "That doesn't look like a medicine. Please retake the photo in good light.",
        }

    facts = lookup_drug_label(vision["drug_name"])
    grounded = facts is not None
    formatted = vision["formatted_text"]
    plain = vision["plain_text"]
    if grounded:
        formatted = _merge_grounding(formatted, facts)
        plain = _merge_grounding(plain, facts)

    report = {
        "is_medicine": True,
        "drug_name": vision["drug_name"],
        "confidence": vision["confidence"],
        "grounded": grounded,
        "source": facts["source"] if grounded else None,
        "formatted_text": formatted,
        "plain_text": plain,
    }
    return apply_output_guardrails(report)
