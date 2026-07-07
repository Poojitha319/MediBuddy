import base64
import json
import re
import google.generativeai as genai
from app.config import settings

genai.configure(api_key=settings.gemini_api_key)
model = genai.GenerativeModel("gemini-2.5-flash")


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


def build_structured_prompt(language: str = "en") -> str:
    return f"""
You are given an image. First decide if it shows a medicine package/strip/bottle.
Respond with the report text in the user's language: **{language}**.

Return ONLY a JSON object (optionally inside a ```json fence) with these keys:
- "is_medicine": true/false
- "drug_name": the primary active ingredient / generic name in English (for lookup), or ""
- "confidence": a number 0.0-1.0 for how sure you are this is that medicine
- "formatted_text": a markdown summary (about, how to take, warnings) for screen display
- "plain_text": the same summary as plain text for a voice assistant

If it is not a medicine, set is_medicine=false, drug_name="", confidence high, and
put a short friendly note in formatted_text/plain_text.
"""


def parse_structured_response(raw: str) -> dict:
    default = {
        "is_medicine": False, "drug_name": "", "confidence": 0.0,
        "formatted_text": "", "plain_text": "",
    }
    if not raw:
        return default
    text = raw.strip()
    if "```" in text:
        inner = text.split("```", 2)
        if len(inner) >= 2:
            block = inner[1]
            if block.lstrip().lower().startswith("json"):
                block = block.lstrip()[4:]
            text = block.strip()
    try:
        data = json.loads(text)
    except Exception:
        return default
    return {
        "is_medicine": bool(data.get("is_medicine", False)),
        "drug_name": str(data.get("drug_name", "") or ""),
        "confidence": float(data.get("confidence", 0.0) or 0.0),
        "formatted_text": str(data.get("formatted_text", "") or ""),
        "plain_text": str(data.get("plain_text", "") or ""),
    }
