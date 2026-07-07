import httpx

OPENFDA_URL = "https://api.fda.gov/drug/label.json"
TIMEOUT = 8.0


def _fetch_openfda(drug_name: str) -> dict:
    """Network boundary — patched in tests."""
    params = {"search": f'openfda.generic_name:"{drug_name}"', "limit": 1}
    with httpx.Client(timeout=TIMEOUT) as client:
        resp = client.get(OPENFDA_URL, params=params)
        if resp.status_code != 200:
            return {"results": []}
        return resp.json()


def _first(label: dict, key: str) -> str:
    val = label.get(key)
    if isinstance(val, list) and val:
        return val[0].strip()
    return ""


def lookup_drug_label(drug_name: str) -> dict | None:
    """Return authoritative drug facts from openFDA, or None on a miss."""
    name = (drug_name or "").strip()
    if not name:
        return None
    try:
        data = _fetch_openfda(name)
    except Exception:
        return None
    results = data.get("results", [])
    if not results:
        return None
    label = results[0]
    return {
        "source": "openFDA",
        "purpose": _first(label, "purpose"),
        "dosage": _first(label, "dosage_and_administration"),
        "warnings": _first(label, "warnings"),
    }
