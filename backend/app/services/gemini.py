import base64
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
