from app.services.gemini import model
from app.services.grounding import lookup_drug_label
from app.services.guardrails import apply_output_guardrails


def _generate(question: str, language: str) -> dict:
    """LLM boundary — patched in tests. Returns {'answer': str, 'drug_name': str}."""
    prompt = (
        f"You are a careful medical information assistant. Answer the user's question in plain, "
        f"simple language in this language: {language}. Do NOT diagnose or prescribe doses beyond "
        f"general label information; encourage seeing a doctor for anything specific.\n\n"
        f"Also, if the question is clearly about a specific medicine, put its generic/active-ingredient "
        f"name (English) on the FIRST line prefixed with 'DRUG:' then a blank line, then the answer.\n\n"
        f"Question: {question}"
    )
    response = model.generate_content(prompt)
    text = response.text or ""
    drug_name = ""
    answer = text
    if text.strip().lower().startswith("drug:"):
        first, _, rest = text.partition("\n")
        drug_name = first.split(":", 1)[1].strip()
        answer = rest.strip()
    return {"answer": answer, "drug_name": drug_name}


def _merge_grounding(answer: str, facts: dict) -> str:
    return (
        f"{answer}\n\n**Verified facts (openFDA):**\n"
        f"- Purpose: {facts['purpose']}\n"
        f"- Warnings: {facts['warnings']}"
    ).strip()


async def run_ask(question: str, language: str = "en") -> dict:
    gen = _generate(question, language)
    answer = gen.get("answer", "")
    drug_name = gen.get("drug_name", "")

    facts = lookup_drug_label(drug_name) if drug_name else None
    grounded = facts is not None
    if grounded:
        answer = _merge_grounding(answer, facts)

    guarded = apply_output_guardrails({"formatted_text": answer, "plain_text": answer})
    return {
        "answer": guarded["formatted_text"],
        "grounded": grounded,
        "source": facts["source"] if grounded else None,
    }
