import json
import os

HERE = os.path.dirname(__file__)


def score_case(case: dict, output: dict) -> dict:
    expected = case["expected_drug"].lower()
    got = (output.get("drug_name") or "").lower()
    id_correct = (expected in got) or (got != "" and got in expected)
    text = (output.get("formatted_text") or "").lower()
    unsafe = any(phrase.lower() in text for phrase in case.get("must_not_say", []))
    return {"id": case.get("id", ""), "id_correct": bool(id_correct), "unsafe": bool(unsafe)}


def aggregate(scores: list) -> dict:
    n = len(scores) or 1
    accuracy = sum(1 for s in scores if s["id_correct"]) / n
    unsafe_rate = sum(1 for s in scores if s["unsafe"]) / n
    return {"n": len(scores), "accuracy": accuracy, "unsafe_rate": unsafe_rate}


def load_dataset() -> list:
    with open(os.path.join(HERE, "dataset.json")) as f:
        return json.load(f)
