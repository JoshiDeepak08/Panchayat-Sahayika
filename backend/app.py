import os
import json
import uuid
import re
import unicodedata
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple

from dotenv import load_dotenv
from fastapi import FastAPI, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from pydantic import BaseModel

from qdrant_client import QdrantClient
from qdrant_client.models import (
    VectorParams,
    Distance,
    PointStruct,
    Filter,
    FieldCondition,
    MatchText,
)
from qdrant_client.http import models as qm

from sentence_transformers import SentenceTransformer
from fastembed import TextEmbedding
from groq import Groq
from googletrans import Translator  # Google Translate


# ================== CONFIG ==================

BASE_DIR = Path(__file__).resolve().parent.parent  # repo root (panchayat-sahayika)

# Schemes JSON path
SCHEMES_PATH = BASE_DIR / "samaj_kalyan_vibhag_clean_typed.json"
# or, if in public:
# SCHEMES_PATH = BASE_DIR / "public" / "samaj_kalyan_vibhag_clean_typed.json"

load_dotenv()

# ---- Groq / LLM ----
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY missing in .env")

LLM_MODEL = os.getenv("LLM_MODEL", "llama-3.1-8b-instant")
GROQ_MODEL_DOCS = os.getenv("GROQ_MODEL", LLM_MODEL)

groq_client = Groq(api_key=GROQ_API_KEY)

# ---- DOCS RAG Qdrant (remote or local) ----
DOC_QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
DOC_QDRANT_API_KEY = os.getenv("QDRANT_API_KEY") or None
DOC_COLLECTION = os.getenv("COLLECTION_NAME", "panchayat_uk_docs")

doc_qclient = QdrantClient(url=DOC_QDRANT_URL, api_key=DOC_QDRANT_API_KEY)
doc_embedder = TextEmbedding()

# ---- Schemes Qdrant (local embedded) ----
EMBED_MODEL_NAME_SCHEMES = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
SCHEMES_COLLECTION = "samaj_kalyan_vibhag_schemes"

scheme_embed_model = SentenceTransformer(EMBED_MODEL_NAME_SCHEMES)
scheme_qdrant = QdrantClient(path=str(BASE_DIR / "qdrant_data"))

# ---- FastAPI + Templates ----
app = FastAPI(title="Panchayat Sahayika Unified Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

translator = Translator()  # Google translator instance


# ================== COMMON LANGUAGE HELPERS ==================

def contains_devanagari(text: str) -> bool:
    """Check if text has any Devanagari characters."""
    for ch in text:
        if "\u0900" <= ch <= "\u097F":
            return True
    return False


def _llm_translate(text: str, target_desc: str) -> str:
    """
    Generic translator using Groq LLM.
    `target_desc` = description of target language/style.
    """
    system_msg = (
        "You are a translator for Gram Panchayat content.\n"
        "You ONLY translate the text; you do not add explanations.\n"
        "Preserve markdown bold markers **like this** exactly as they are.\n"
        "Do not change the meaning; only change the language.\n"
    )

    user_msg = (
        f"Translate the following text into {target_desc}\n\n"
        f"Text:\n{text}"
    )

    completion = groq_client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {"role": "system", "content": system_msg},
            {"role": "user", "content": user_msg},
        ],
        temperature=0.2,
        max_tokens=1200,
    )
    out = completion.choices[0].message.content or text
    return out


def translate_answer(text: str, target_lang: str) -> str:
    """
    Final step translation:

    target_lang:
      - 'en'       -> FIRST try Google Translate to English,
                     if fail or Hindi aa jaye to Groq se English.
      - 'hi'       -> Groq se simple Hindi (Devanagari)
      - 'hinglish' -> Groq se simple Hinglish (Roman Hindi)
    """

    # ---------- 1) English UI ----------
    if target_lang == "en":
        try:
            res = translator.translate(text, dest="en")
            out = res.text
            if out and not contains_devanagari(out) and out.strip() != "":
                return out
        except Exception:
            pass

        return _llm_translate(
            text,
            "clear, simple English suitable for village-level users. "
            "Avoid Hindi script and use plain English sentences."
        )

    # ---------- 2) Hindi (Devanagari) ----------
    if target_lang == "hi":
        return _llm_translate(
            text,
            "very simple Hindi in Devanagari script, using everyday words "
            "that village-level users understand."
        )

    # ---------- 3) Hinglish (Roman Hindi) ----------
    return _llm_translate(
        text,
        "very simple Hinglish (Roman Hindi using English letters). "
        "Do NOT use Devanagari characters."
    )


def _convert_markdown_bold_to_html(text: str) -> str:
    """**bold** -> <strong>bold</strong> for UI."""
    return re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)


# ================== DOCS RAG PIPELINE ==================

def build_docs_system_prompt() -> str:
    """
    System prompt for docs:
    - Sirf Qdrant se aaye context ka use karo
    - Gram Panchayat users ke liye simple Hindi
    """
    return (
        "आप 'Panchayat Sahayika' हैं, उत्तराखंड की ग्राम पंचायतों के लिए सहायक।\n"
        "आपको केवल नीचे दिए गए संदर्भ (official Panchayati Raj documents: acts, rules, guidelines, roles, schemes, training material)\n"
        "का इस्तेमाल करके ही जवाब देना है।\n\n"
        "भाषा बहुत ही सरल और आसान हिन्दी होनी चाहिए ताकि सरपंच, वार्ड मेंबर और ग्राम पंचायत कर्मचारी आसानी से समझ सकें।\n"
        "कानूनी भारी शब्दों से बचें।\n"
        "अगर ज़रूरी जानकारी संदर्भ में नहीं है, तो साफ-साफ लिखें कि यह जानकारी उपलब्ध नहीं है और आप अंदाज़ा नहीं लगा रहे हैं।\n"
        "कभी भी दस्तावेज़ का नाम, फाइल का नाम, पेज नंबर या 'source' list का ज़िक्र न करें।\n"
    )


def retrieve_docs_context(query: str, top_k: int = 8) -> List[Dict[str, Any]]:
    query_vec = list(doc_embedder.embed([query]))[0]
    results = doc_qclient.search(
        collection_name=DOC_COLLECTION,
        query_vector=query_vec,
        limit=top_k,
        with_payload=True,
    )

    contexts = []
    for r in results:
        pl = r.payload or {}
        contexts.append(
            {
                "text": pl.get("text", ""),
                "source_file": pl.get("source_file", ""),
                "page": pl.get("page", ""),
                "url": pl.get("url", ""),
                "score": r.score,
            }
        )
    return contexts


def generate_docs_answer_raw(
    query: str,
    history: List[Dict[str, str]],
) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Returns raw answer in Hindi-ish language (LLM decides, but system prompt nudges to Hindi).
    We will later translate to final UI language using translate_answer().
    """
    contexts = retrieve_docs_context(query)

    context_block = "\n\n---\n\n".join(
        c["text"] for c in contexts if c["text"]
    )

    messages = [
        {"role": "system", "content": build_docs_system_prompt()},
    ]

    # include a few last turns from history (server-side only)
    for h in history[-4:]:
        messages.append({"role": h["role"], "content": h["content"]})

    messages.append(
        {
            "role": "user",
            "content": (
                f"प्रश्न: {query}\n\n"
                f"नीचे दिए गए दस्तावेज़ों के संदर्भ का उपयोग करके उत्तर दीजिए। "
                f"अपने उत्तर में इन दस्तावेज़ों के नाम या पेज नंबर का ज़िक्र मत कीजिए:\n\n"
                f"{context_block}"
            ),
        }
    )

    completion = groq_client.chat.completions.create(
        model=GROQ_MODEL_DOCS,
        messages=messages,
        temperature=0.3,
        max_tokens=900,
    )
    raw_answer = completion.choices[0].message.content or ""

    # dedupe sources
    unique_sources = []
    seen = set()
    for c in contexts:
        key = (c["source_file"], c["page"])
        if key not in seen and c["source_file"]:
            seen.add(key)
            unique_sources.append(
                {
                    "source_file": c["source_file"],
                    "page": c["page"],
                    "url": c["url"],
                }
            )

    return raw_answer, unique_sources


# ================== SCHEMES PIPELINE ==================

def load_schemes() -> List[Dict[str, Any]]:
    with open(SCHEMES_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    # ensure strings and minimal keys exist
    for s in data:
        s.setdefault("name_hi", "")
        s.setdefault("name_en", "")
        s.setdefault("category", "")
        s.setdefault("department", "")
        s.setdefault("description_hi", "")
        s.setdefault("description_en", "")
        s.setdefault("eligibility", "")
        s.setdefault("benefit", "")
        s.setdefault("apply_process", "")
        s.setdefault("apply_link", "")
        s.setdefault("type", s.get("type", "scheme"))
    return data


def _concat_item_text(s: Dict[str, Any]) -> str:
    """
    Text used for vector embedding.
    We heavily weight the scheme name so that exact-name queries hit correctly.
    """
    name = (s.get("name_hi", "") + " " + s.get("name_en", "")).strip()
    other_parts = [
        s.get("category", ""),
        s.get("department", ""),
        s.get("description_hi", ""),
        s.get("description_en", ""),
        s.get("eligibility", ""),
        s.get("benefit", ""),
        s.get("apply_process", ""),
    ]

    # Repeat name 5x → boosts similarity when user types scheme name
    weighted_name = " ".join([name] * 5) if name else ""
    rest = " | ".join([str(p) for p in other_parts if p])

    return " | ".join([p for p in [weighted_name, rest] if p])


def init_schemes_collection():
    schemes = load_schemes()

    scheme_qdrant.recreate_collection(
        collection_name=SCHEMES_COLLECTION,
        vectors_config=VectorParams(
            size=scheme_embed_model.get_sentence_embedding_dimension(),
            distance=Distance.COSINE,
        ),
    )

    points: List[PointStruct] = []
    for s in schemes:
        vec = scheme_embed_model.encode(_concat_item_text(s)).tolist()
        payload = dict(s)
        payload["__search_blob"] = _concat_item_text(s)
        points.append(PointStruct(id=str(uuid.uuid4()), vector=vec, payload=payload))

    scheme_qdrant.upsert(SCHEMES_COLLECTION, points)
    print(f"✅ Indexed {len(points)} schemes into Qdrant (schemes collection)")


# Build index at import time
init_schemes_collection()


def _norm(s: str) -> str:
    if not s:
        return ""
    s = unicodedata.normalize("NFKC", s)
    s = re.sub(r"\s+", " ", s).strip().lower()
    return s


def _qdrant_filter(
    category: Optional[str],
    department: Optional[str],
    typ: Optional[str],
) -> Optional[Filter]:
    conds = []
    if category:
        conds.append(FieldCondition(key="category", match=MatchText(text=category)))
    if department:
        conds.append(FieldCondition(key="department", match=MatchText(text=department)))
    if typ:
        conds.append(FieldCondition(key="type", match=MatchText(text=typ)))
    if not conds:
        return None
    return Filter(must=conds)


def _keyword_boost(question: str, item: Dict[str, Any]) -> float:
    """
    Simple textual boost based on name/category/department match.
    Helps exact-name queries like 'atal awas yojna' hit the right scheme.
    """
    q = _norm(question)
    name = _norm((item.get("name_hi", "") + " " + item.get("name_en", "")))
    cat = _norm(item.get("category", ""))
    dept = _norm(item.get("department", ""))

    boost = 0.0

    if q and q in name:
        boost += 0.6

    q_words = [w for w in q.split() if len(w) > 2]
    for w in q_words:
        if w in name or w in cat or w in dept:
            boost += 0.15

    return boost


def search_schemes(
    question: str,
    limit: int = 3,
    page: int = 1,
    min_score: float = 0.20,
    category: Optional[str] = None,
    department: Optional[str] = None,
    typ: Optional[str] = None,
):
    """
    Hybrid search for schemes.
    Returns: (results:list[payload+_score], total:int)
    """
    qvec = scheme_embed_model.encode(question).tolist()
    page = max(page, 1)
    limit = max(1, min(20, limit))

    MAX_HITS = 50

    hits = scheme_qdrant.search(
        collection_name=SCHEMES_COLLECTION,
        query_vector=qvec,
        limit=MAX_HITS,
        with_payload=True,
        with_vectors=False,
        query_filter=_qdrant_filter(category, department, typ),
    )

    scored: List[Dict[str, Any]] = []
    for h in hits:
        base_score = float(h.score) if hasattr(h, "score") else 0.0
        if base_score < min_score:
            continue
        p = dict(h.payload)
        kw_boost = _keyword_boost(question, p)
        final_score = base_score + kw_boost
        p["_score"] = base_score
        p["_final_score"] = final_score
        scored.append(p)

    # De-duplicate by scheme name
    deduped: List[Dict[str, Any]] = []
    seen = set()
    for p in scored:
        key = (p.get("name_hi") or p.get("name_en") or "").strip()
        if not key:
            key = p.get("id", "")
        if key in seen:
            continue
        seen.add(key)
        deduped.append(p)

    deduped.sort(key=lambda x: x.get("_final_score", 0.0), reverse=True)

    total = len(deduped)
    start = (page - 1) * limit
    end = start + limit
    page_items = deduped[start:end]

    return page_items, total


def _fmt_scheme_card(s: Dict[str, Any]) -> str:
    name = s.get("name_hi") or s.get("name_en") or "—"
    bits = [
        f"• **{name}**",
        f"  - 🎓 पात्रता: {s.get('eligibility','उपलब्ध नहीं')}",
        f"  - 💰 लाभ: {s.get('benefit','उपलब्ध नहीं')}",
        f"  - 📝 आवेदन: {s.get('apply_process','उपलब्ध नहीं')}",
    ]
    if s.get("apply_link"):
        bits.append(f"  - 🔗 लिंक: {s['apply_link']}")
    return "\n".join(bits)


def build_schemes_answer(question: str, schemes: List[Dict[str, Any]]) -> str:
    """
    Build Hindi-centric, LLM-generated answer for schemes.
    """
    if not schemes:
        return (
            "माफ़ कीजिए, इस सवाल से मिलती-जुलती कोई योजना नहीं मिली। "
            "कृपया अलग शब्दों में पूछें, या ज़िला/विभाग/श्रेणी लिखें।\n\n"
            "**English:** No strong matches. Try different words or add location/department."
        )

    q_low = question.lower()
    want_apply = any(w in q_low for w in [
        "apply", " आवेदन", "आवेदन", "फॉर्म", "form", "कैसे", "kaise", "कहाँ", "kaha", "कहां"
    ])
    want_benefit = any(w in q_low for w in [
        "लाभ", "benefit", "paisa", "₹", "kitna", "कितना", "राशि"
    ])
    want_elig = any(w in q_low for w in [
        "পात्रता", "पात्रता", "eligibility", "kaun", "कौन", "किसको", "kis ko", "kisko"
    ])

    if not GROQ_API_KEY:
        hdr = f"आपके सवाल के आधार पर {len(schemes)} योजनाएँ मिलीं:\n\n"
        body = "\n\n".join(_fmt_scheme_card(s) for s in schemes)
        eng = "\n\n**English:** Listed top matches with eligibility, benefits and how to apply."
        return hdr + body + eng

    context_lines = []
    for s in schemes:
        context_lines.append(
            "योजना: {name}\nविवरण: {desc}\nपात्रता: {elig}\nलाभ: {ben}\nआवेदन प्रक्रिया: {proc}\nविभाग: {dept}\nश्रेणी: {cat}\nलिंक: {link}\n".format(
                name=(s.get("name_hi") or s.get("name_en") or ""),
                desc=s.get("description_hi", ""),
                elig=s.get("eligibility", ""),
                ben=s.get("benefit", ""),
                proc=s.get("apply_process", ""),
                dept=s.get("department", ""),
                cat=s.get("category", ""),
                link=s.get("apply_link", ""),
            )
        )
    context = "\n---\n".join(context_lines)

    focus_lines = []
    if want_apply:
        focus_lines.append(
            "- User is mainly asking **how to apply**. "
            "You MUST explain the पूरा 'आवेदन प्रक्रिया' field step-by-step in simple Hindi. "
            "हर ज़रूरी स्टेप और हर ज़रूरी दस्तावेज़ का नाम जरूर बताएं।"
        )
    if want_benefit:
        focus_lines.append(
            "- User is asking about **benefits / amount**. "
            "Explain the 'लाभ' field completely. अलग-अलग राशि हो तो सब बताएं।"
        )
    if want_elig:
        focus_lines.append(
            "- User is asking about **eligibility / who can get it**. "
            "Explain the 'पात्रता' field पूरी तरह, सभी शर्तें (1, 2, 3...) अलग-अलग लिखें।"
        )

    focus_text = "\n".join(focus_lines) if focus_lines else "- Follow the general rules below."

    prompt = f"""
You are **Panchayat Sahayika**, a friendly, polite and knowledgeable AI assistant created to help rural citizens of India. 
Your main goal is to explain information in very **simple, clear, human-like Hindi**, so that even villagers, elderly people, 
and first-time smartphone users can easily understand.

You must use **only** the information given in the schemes context below. 
Do NOT invent or guess any benefits, eligibility rules, amounts or links that are not present.

--------------------------------------------
📌 USER QUESTION:
{question}

📌 RELEVANT SCHEMES (if matched):
{context}
--------------------------------------------

### 🔍 SPECIAL FOCUS (based on the user's question)
{focus_text}

### 🟢 MAIN RULES FOR ANSWERING:
- Explain in **simple conversational Hindi**, short sentences, and natural flow.  
- Do NOT sound robotic. Do NOT dump raw data.  
- Be clear, warm, and practical.
- **Whenever you write the name of any scheme / yojana, always wrap it like this: `**PM Awas Yojana**`.  
  यानी हर योजना का नाम hamesha `**` ke andar hona chahiye.**

Include these only if available in provided context:
- योज़ना / स्कीम का नाम  
- यह किसके लिए है (पात्रता)  
- कितना लाभ मिलता है (लाभ)  
- कैसे और कहाँ आवेदन करना है (आवेदन प्रक्रिया)  
- लिंक हो तो बताएं  


Missing data → write “उपलब्ध नहीं” naturally.

If multiple schemes match, explain **2–3** clearly but naturally.

### 🟡 ALWAYS END WITH:
"अगर ज़रूरत हो तो अपने ग्राम पंचायत या CSC केंद्र से मदद लें।"

### 🌍 AFTER THE HINDI ANSWER:
Give **one short English summary sentence** (not detailed).

--------------------------------------------
Now write the final answer in a natural, fluent, friendly tone.
--------------------------------------------
"""

    try:
        completion = groq_client.chat.completions.create(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        ai_answer = completion.choices[0].message.content.strip()
    except Exception:
        hdr = f"आपके सवाल के आधार पर {len(schemes)} योजनाएँ मिलीं:\n\n"
        body = "\n\n".join(_fmt_scheme_card(s) for s in schemes)
        eng = "\n\n**English:** Listed top matches with eligibility, benefits and how to apply."
        return hdr + body + eng

    return ai_answer


def _should_use_schemes(question: str, schemes: List[Dict[str, Any]]) -> bool:
    """
    Decide kare ki is query ke liye schemes pipeline use karni hai ya nahi.
    """
    if not schemes:
        return False

    top = schemes[0]
    top_final = float(top.get("_final_score", top.get("_score", 0.0)) or 0.0)

    q = question.lower()
    has_scheme_word = any(
        w in q
        for w in [
            "योजना",
            "yojana",
            "scheme",
            "स्कीम",
            "pension",
            "पेंशन",
            "subsidy",
            "सब्सिडी",
            "बीमा",
            "insurance",
            "scholarship",
            " छात्रवृत्ति",
        ]
    )

    if top_final >= 0.60:
        return True

    if has_scheme_word and top_final >= 0.25:
        return True

    return False


# ================== MODELS FOR JSON /ask ==================

class AskRequest(BaseModel):
    question: str
    ui_lang: str = "hi"        # "hi" or "en"
    mode: str = "auto"         # "auto" | "docs" | "schemes"
    history: List[Dict[str, str]] = []


class AskResponse(BaseModel):
    response: str
    sources: List[Dict[str, Any]] = []


# ================== ROUTES (HTML DEMO) ==================

@app.get("/", response_class=HTMLResponse)
async def get_home(
    request: Request,
    lang: str = "hi",      # ui_lang
    mode: str = "docs",    # "docs" or "schemes"
):
    if lang not in ("hi", "en"):
        lang = "hi"
    if mode not in ("docs", "schemes"):
        mode = "docs"

    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "messages": [],
            "history_json": "[]",
            "lang": lang,
            "mode": mode,
        },
    )


@app.post("/", response_class=HTMLResponse)
async def post_query(
    request: Request,
    query: str = Form(...),
    history_json: str = Form("[]"),
    ui_lang: str = Form("hi"),   # "hi" or "en"
    mode: str = Form("docs"),    # "docs" or "schemes"
):
    try:
        history = json.loads(history_json)
    except Exception:
        history = []

    if ui_lang == "en":
        target_lang = "en"
    else:
        target_lang = "hi" if contains_devanagari(query) else "hinglish"

    if mode == "schemes":
        schemes, _total = search_schemes(
            question=query,
            limit=3,
            page=1,
            min_score=0.20,
            category=None,
            department=None,
            typ=None,
        )
        base_answer = build_schemes_answer(query, schemes)
    else:
        base_answer, _sources = generate_docs_answer_raw(query, history)

    final_text = translate_answer(base_answer, target_lang)
    answer_html = _convert_markdown_bold_to_html(final_text)

    history.append({"role": "user", "content": query})
    history.append({"role": "assistant", "content": answer_html})

    messages = [{"role": h["role"], "content": h["content"]} for h in history]

    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "messages": messages,
            "history_json": json.dumps(history, ensure_ascii=False),
            "lang": ui_lang,
            "mode": mode,
        },
    )


# ================== JSON API FOR REACT CHAT ==================

@app.post("/ask", response_model=AskResponse)
def ask(req: AskRequest):
    """
    Used by React ChatScreen.
    - Decides schemes vs docs (or forced by req.mode)
    - Applies translation for UI lang
    - Returns { response, sources } that your ChatScreen understands
    """

    # Decide final language
    if req.ui_lang == "en":
        target_lang = "en"
    else:
        target_lang = "hi" if contains_devanagari(req.question) else "hinglish"

    schemes: List[Dict[str, Any]] = []
    doc_sources: List[Dict[str, Any]] = []

    use_schemes = False

    if req.mode in ("schemes", "auto"):
        schemes, total = search_schemes(
            question=req.question,
            limit=5,
            page=1,
            min_score=0.20,
            category=None,
            department=None,
            typ=None,
        )
        if req.mode == "schemes":
            use_schemes = True
        else:
            use_schemes = _should_use_schemes(req.question, schemes)

    if use_schemes:
        base_answer = build_schemes_answer(req.question, schemes)
        sources = [
            {
                "name_hi": s.get("name_hi"),
                "name_en": s.get("name_en"),
                "score": s.get("_score"),
                "department": s.get("department"),
                "category": s.get("category"),
                "apply_link": s.get("apply_link"),
            }
            for s in schemes
        ]
    else:
        base_answer, doc_sources = generate_docs_answer_raw(req.question, req.history)
        sources = doc_sources

    final_text = translate_answer(base_answer, target_lang)
    final_html = _convert_markdown_bold_to_html(final_text)

    return AskResponse(response=final_html, sources=sources)

   


@app.get("/health")
def health():
    return {
        "status": "ok",
        "docs_collection": DOC_COLLECTION,
        "schemes_collection": SCHEMES_COLLECTION,
        "embed_model_schemes": EMBED_MODEL_NAME_SCHEMES,
    }
