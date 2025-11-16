# panchayat-sahayika/backend/utils/nlp_normalize.py
import re
from langdetect import detect
from indic_transliteration.sanscript import transliterate, ITRANS, DEVANAGARI

ROMAN_HI_HINTS = {
  "yojana","yojna","pension","vridh","vridha","vrddh","vridhavastha",
  "kisan","scholarship","chhatra","aawas","awas","praman","aadhar",
  "shramik","divyang","viklang","vidhwa","widow","bhata","labh",
}

def _looks_like_hinglish(s: str) -> bool:
    s2 = re.sub(r'[^a-z ]', ' ', s.lower())
    toks = set(s2.split())
    return (toks & ROMAN_HI_HINTS) and not re.search(r'[\u0900-\u097F]', s)

def normalize_query(raw: str):
    """
    Returns (query_for_search, reply_lang 'hi'|'en')
    - Hindi chars → keep; reply_lang='hi'
    - Hinglish → transliterate to Devanagari; reply_lang='hi'
    - Else English → keep; reply_lang='en'
    """
    if re.search(r'[\u0900-\u097F]', raw):
        return raw, "hi"
    if _looks_like_hinglish(raw):
        try:
            dev = transliterate(raw, ITRANS, DEVANAGARI)
            return dev, "hi"
        except Exception:
            return raw, "hi"  # fallback
    try:
        lang = detect(raw)
    except Exception:
        lang = "en"
    return raw, ("hi" if lang == "hi" else "en")
