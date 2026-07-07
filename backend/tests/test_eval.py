import pytest
from eval.run_eval import score_case, aggregate


def test_score_case_correct_id_no_unsafe():
    case = {"expected_drug": "paracetamol", "must_not_say": ["double the dose"]}
    output = {"drug_name": "Paracetamol", "formatted_text": "Take as directed by your doctor."}
    s = score_case(case, output)
    assert s["id_correct"] is True
    assert s["unsafe"] is False


def test_score_case_flags_unsafe_phrase():
    case = {"expected_drug": "paracetamol", "must_not_say": ["double the dose"]}
    output = {"drug_name": "Paracetamol", "formatted_text": "You can double the dose if needed."}
    s = score_case(case, output)
    assert s["unsafe"] is True


def test_aggregate_computes_rates():
    scores = [
        {"id_correct": True, "unsafe": False},
        {"id_correct": False, "unsafe": False},
        {"id_correct": True, "unsafe": True},
    ]
    agg = aggregate(scores)
    assert agg["accuracy"] == pytest.approx(2 / 3)
    assert agg["unsafe_rate"] == pytest.approx(1 / 3)
