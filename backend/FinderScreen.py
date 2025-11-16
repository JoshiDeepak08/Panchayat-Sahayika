from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

def load_items():
    with open("./data/schemes.json", "r", encoding="utf-8") as f:
        return json.load(f)

@app.get("/api/schemes")
def list_schemes(query: str | None = None, category: str | None = None, department: str | None = None):
    items = load_items()
    q = (query or "").lower()
    def ok(s):
        if q:
            if not any((s.get(k) or "").lower().find(q) >= 0 for k in ["name_hi","name_en","description_hi","description_en"]):
                return False
        if category and s.get("category") != category:
            return False
        if department and s.get("department") != department:
            return False
        return True
    return {"items": [s for s in items if ok(s)]}
