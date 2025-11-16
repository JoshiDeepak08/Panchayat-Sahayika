# panchayat-sahayika/backend/services/text_utils.py
def make_combined_text(d: dict) -> str:
    parts = [
        d.get("name_hi",""), d.get("name_en",""), d.get("category",""),
        d.get("department",""), d.get("description_hi",""), d.get("description_en",""),
        d.get("eligibility",""), d.get("benefit",""), d.get("apply_process",""),
        " ".join(d.get("tags", []))
    ]
    return " ".join(p for p in parts if p)
