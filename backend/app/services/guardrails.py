
DOCTOR_DISCLAIMER = "Always confirm with your doctor before taking any medicine."
MIN_CONFIDENCE = 0.4


def is_medicine_result(vision: dict) -> bool:
    """Input guardrail: only proceed if the image is confidently a medicine."""
    return bool(vision.get("is_medicine")) and float(vision.get("confidence", 0)) >= MIN_CONFIDENCE


def apply_output_guardrails(report: dict) -> dict:
    """Output guardrail: ensure the doctor disclaimer is present exactly once."""
    out = dict(report)
    for key in ("formatted_text", "plain_text"):
        text = out.get(key, "") or ""
        if DOCTOR_DISCLAIMER not in text:
            text = f"{text}\n\n{DOCTOR_DISCLAIMER}".strip()
        out[key] = text
    return out
