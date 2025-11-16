# import pandas as pd
# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware

# CSV_PATH = "uttarakhand_infra_deficits.csv"

# df = pd.read_csv(CSV_PATH)

# app = FastAPI()

# # CORS so React frontend can call this
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],   # later restrict to your domain
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Helper: convert deficit to level
# def deficit_level(x: float) -> str:
#     if x >= 0.7:
#         return "High"
#     elif x >= 0.4:
#         return "Medium"
#     else:
#         return "Low"

# @app.get("/api/districts")
# def get_districts():
#     districts = sorted(df["district_name"].dropna().unique().tolist())
#     return {"districts": districts}

# @app.get("/api/villages")
# def get_villages(district: str):
#     dfg = df[df["district_name"].str.upper() == district.upper()]
#     if dfg.empty:
#         raise HTTPException(status_code=404, detail="No villages found for this district")
#     # Use village_code as stable id
#     records = []
#     for _, row in dfg.iterrows():
#         records.append({
#             "village_code": str(row.get("village_code", "")),
#             "village_name": row["village_name"],
#             "gp_name": row["gp_name"],
#             "block_name": row["block_name"],
#             "district_name": row["district_name"],
#             "service_deficit_index": row["service_deficit_index"],
#         })
#     # sort underserved first
#     records = sorted(records, key=lambda r: r["service_deficit_index"], reverse=True)
#     return {"villages": records}

# @app.get("/api/village_detail")
# def get_village_detail(village_code: str):
#     dfg = df[df["village_code"] == int(village_code)]
#     if dfg.empty:
#         raise HTTPException(status_code=404, detail="Village not found")

#     row = dfg.iloc[0]

#     detail = {
#         "district_name": row["district_name"],
#         "block_name": row["block_name"],
#         "gp_name": row["gp_name"],
#         "village_name": row["village_name"],
#         "village_code": int(row["village_code"]),
#         "service_deficit_index": row["service_deficit_index"],
#         "deficits": {
#             "health": {
#                 "score": row["health_deficit"],
#                 "level": deficit_level(row["health_deficit"]),
#             },
#             "education": {
#                 "score": row["education_deficit"],
#                 "level": deficit_level(row["education_deficit"]),
#             },
#             "sanitation": {
#                 "score": row["sanitation_deficit"],
#                 "level": deficit_level(row["sanitation_deficit"]),
#             },
#             "roads": {
#                 "score": row["road_deficit"],
#                 "level": deficit_level(row["road_deficit"]),
#             },
#             "digital": {
#                 "score": row["digital_deficit"],
#                 "level": deficit_level(row["digital_deficit"]),
#             },
#             "electricity": {
#                 "score": row["electricity_deficit"],
#                 "level": deficit_level(row["electricity_deficit"]),
#             },
#         },
#     }

#     return detail



from pathlib import Path

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = Path(__file__).resolve().parent
CSV_PATH = BASE_DIR / "uttarakhand_infra_deficits.csv"

# village_code ko string rakhte hain
df = pd.read_csv(CSV_PATH, dtype={"village_code": str})

app = FastAPI(title="Smart Gram Planning API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def deficit_level(x: float) -> str:
    if x >= 0.7:
        return "High"
    elif x >= 0.4:
        return "Medium"
    else:
        return "Low"


def to_float(v):
    """Safe conversion: numpy scalar -> Python float, None safe."""
    if pd.isna(v):
        return None
    return float(v)


@app.get("/api/districts")
def get_districts():
    if "district_name" not in df.columns:
        raise HTTPException(
            status_code=500,
            detail=f"Column 'district_name' missing in CSV. Columns: {list(df.columns)}",
        )

    districts = sorted(df["district_name"].dropna().unique().tolist())
    return {"districts": districts}


@app.get("/api/villages")
def get_villages(district: str):
    required_cols = [
        "district_name",
        "village_code",
        "village_name",
        "gp_name",
        "block_name",
        "service_deficit_index",
    ]
    for col in required_cols:
        if col not in df.columns:
            raise HTTPException(
                status_code=500,
                detail=f"Column '{col}' missing in CSV",
            )

    dfg = df[df["district_name"].str.upper() == district.upper()]
    if dfg.empty:
        raise HTTPException(
            status_code=404,
            detail=f"No villages found for district {district}",
        )

    records = []
    for _, row in dfg.iterrows():
        records.append(
            {
                "village_code": str(row.get("village_code", "")),
                "village_name": row.get("village_name", ""),
                "gp_name": row.get("gp_name", ""),
                "block_name": row.get("block_name", ""),
                "district_name": row.get("district_name", ""),
                "service_deficit_index": to_float(
                    row.get("service_deficit_index", 0.0)
                ),
            }
        )

    records = sorted(records, key=lambda r: r["service_deficit_index"] or 0.0, reverse=True)
    return {"villages": records}


@app.get("/api/village_detail")
def get_village_detail(village_code: str):
    required_cols = [
        "district_name",
        "block_name",
        "gp_name",
        "village_name",
        "village_code",
        "service_deficit_index",
        "health_deficit",
        "education_deficit",
        "sanitation_deficit",
        "road_deficit",
        "digital_deficit",
        "electricity_deficit",
    ]
    for col in required_cols:
        if col not in df.columns:
            raise HTTPException(
                status_code=500,
                detail=f"Column '{col}' missing in CSV",
            )

    # village_code string ke roop me store hai
    dfg = df[df["village_code"] == str(village_code)]
    if dfg.empty:
        raise HTTPException(
            status_code=404,
            detail=f"Village not found for code {village_code}",
        )

    row = dfg.iloc[0]

    detail = {
        "district_name": row["district_name"],
        "block_name": row["block_name"],
        "gp_name": row["gp_name"],
        "village_name": row["village_name"],
        "village_code": str(row["village_code"]),
        "service_deficit_index": to_float(row["service_deficit_index"]),
        "deficits": {
            "health": {
                "score": to_float(row["health_deficit"]),
                "level": deficit_level(float(row["health_deficit"])),
            },
            "education": {
                "score": to_float(row["education_deficit"]),
                "level": deficit_level(float(row["education_deficit"])),
            },
            "sanitation": {
                "score": to_float(row["sanitation_deficit"]),
                "level": deficit_level(float(row["sanitation_deficit"])),
            },
            "roads": {
                "score": to_float(row["road_deficit"]),
                "level": deficit_level(float(row["road_deficit"])),
            },
            "digital": {
                "score": to_float(row["digital_deficit"]),
                "level": deficit_level(float(row["digital_deficit"])),
            },
            "electricity": {
                "score": to_float(row["electricity_deficit"]),
                "level": deficit_level(float(row["electricity_deficit"])),
            },
        },
    }

    return detail
