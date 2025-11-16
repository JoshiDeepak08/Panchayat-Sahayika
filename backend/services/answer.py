# panchayat-sahayika/backend/services/answer.py
def plain_answer(lang: str, doc: dict) -> str:
    name_hi = doc.get("name_hi") or ""
    name_en = doc.get("name_en") or ""
    elig   = (doc.get("eligibility") or "").strip()
    ben    = (doc.get("benefit") or "").strip()
    applyp = (doc.get("apply_process") or "").strip()

    if lang == "hi":
        return (
          f"यह योजना: {name_hi or name_en}\n"
          f"किसके लिए: {elig}\n"
          f"लाभ: {ben}\n"
          f"आवेदन: {applyp}"
        ).strip()

    return (
      f"Scheme: {name_en or name_hi}\n"
      f"Who is eligible: {elig}\n"
      f"Benefit: {ben}\n"
      f"How to apply: {applyp}"
    ).strip()

def to_card(doc: dict):
    return {
      "title": f"{(doc.get('name_hi') or '').strip()} / {(doc.get('name_en') or '').strip()}".strip(" /"),
      "subtitle": doc.get("description_hi") or doc.get("description_en") or "",
      "verified": True,
      "badges": [doc.get("department",""), doc.get("category","")],
      "apply_url": doc.get("apply_link") or "",
      "read_more_url": doc.get("source_url") or ""
    }
