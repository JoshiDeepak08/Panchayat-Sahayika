# main.py
import os, glob, re
from typing import Dict, List
import pandas as pd
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Uttarakhand Trainings Finder")

# CORS so React can call FastAPI from http://localhost:5173 etc
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # during dev, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------- paths ---------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")   # put your Excel files in backend/data/

# --------- load & normalize excel(s)
def read_all_excels(folder: str) -> pd.DataFrame:
    # read all .xlsx and .xls
    files = glob.glob(os.path.join(folder, "*.xlsx")) + glob.glob(os.path.join(folder, "*.xls"))
    frames = []
    for fp in files:
        try:
            df = pd.read_excel(fp, dtype=str).fillna("")
            df["__source"] = os.path.basename(fp)
            frames.append(df)
        except Exception as e:
            print(f"[WARN] {fp}: {e}")
    return pd.concat(frames, ignore_index=True) if frames else pd.DataFrame()

RE_DIST_1 = re.compile(r"DISTRICT\s*-\s*([A-Za-z ]+)\)?", re.I)     # DPRO( DISTRICT - ALMORA )
RE_DIST_2 = re.compile(r"District\s*[-:]?\s*([A-Za-z ]+)", re.I)    # District Almora
RE_BLOCK   = re.compile(r"Block\s+([A-Za-z ]+)", re.I)              # Block Bhikiyasain

def extract_district(text: str) -> str:
    t = text or ""
    for rx in (RE_DIST_1, RE_DIST_2):
        m = rx.search(t)
        if m:
            return m.group(1).strip().title()
    return ""

def extract_block(text: str) -> str:
    m = RE_BLOCK.search(text or "")
    return m.group(1).strip().title() if m else ""

def normalize(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return df

    rename_map = {
        "S.No.": "sno",
        "S.No": "sno",
        "State/UT": "state",
        "Training Name": "training_name",
        "Organizing Institute": "org_institute",
        "Start Date": "start_date",
        "End Date": "end_date",
        "Course Coordinator": "course_coordinator",
        "Training Category": "training_category",
        "Training Sub-Category": "training_sub_category",
        "Sponsors": "sponsors",
        "Level Of Institute": "level_of_institute",
        "Agenda": "agenda",
        "Targeted Participants": "targeted_participants",
        "Total Participant": "total_participants",
        "Uploaded": "uploaded",
    }

    df = df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns})

    # ensure all required columns exist
    for v in rename_map.values():
        if v not in df.columns:
            df[v] = ""

    # 👉 yahan force kar do:
    df["state"] = "Uttarakhand"

    # derive district/block from institute or training text
    mix = (df["org_institute"].astype(str) + " | " + df["training_name"].astype(str))
    df["district"] = [extract_district(x) for x in mix]
    df["block"] = [extract_block(x) for x in mix]

    return df

RAW = normalize(read_all_excels(DATA_DIR))

def district_block_options() -> Dict[str, List[str]]:
    if RAW.empty:
        return {"districts": [], "blocksByDistrict": {}}

    # Agar saara data Uttarakhand ka hai, direct RAW use kar lo:
    uk = RAW

    dists = sorted(set(x for x in uk["district"] if str(x).strip()))
    by = {}
    for d in dists:
        sub = uk[uk["district"].str.lower() == d.lower()]
        blocks = sorted(set(x for x in sub["block"] if str(x).strip()))
        by[d] = blocks

    return {"districts": dists, "blocksByDistrict": by}


OPTIONS = district_block_options()

# --------- API
@app.get("/filters")
def filters():
    """
    Returns:
    {
      "state": "Uttarakhand",
      "districts": [...],
      "blocksByDistrict": {
          "Almora": ["Bhikiyasain", ...],
          ...
      }
    }
    """
    return {"state": "Uttarakhand", **OPTIONS}

@app.get("/trainings")
def trainings(
    district: str = Query("", description="optional"),
    block: str = Query("", description="optional"),
):
    df = RAW.copy()
    if df.empty:
        return {"count": 0, "items": []}

    df = df[df["state"].str.strip().str.lower().eq("uttarakhand")]

    if district:
        df = df[df["district"].str.lower() == district.lower().strip()]
    if block:
        df = df[df["block"].str.lower() == block.lower().strip()]

    def row(r):
        g = r.get
        return {
            "state": "Uttarakhand",
            "district": g("district", ""),
            "block": g("block", ""),
            "training_name": g("training_name", ""),
            "org_institute": g("org_institute", ""),
            "start_date": g("start_date", ""),
            "end_date": g("end_date", ""),
            "course_coordinator": g("course_coordinator", ""),
            "training_category": g("training_category", ""),
            "training_sub_category": g("training_sub_category", ""),
            "sponsors": g("sponsors", ""),
            "level_of_institute": g("level_of_institute", ""),
            "targeted_participants": g("targeted_participants", ""),
            "total_participants": g("total_participants", ""),
            "agenda": g("agenda", ""),
            "source": g("__source", ""),
        }

    items = [row(r) for _, r in df.iterrows()]
    return {"count": len(items), "items": items}
