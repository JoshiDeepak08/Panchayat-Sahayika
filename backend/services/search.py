# panchayat-sahayika/backend/services/search.py
from qdrant_client import QdrantClient
from qdrant_client.models import SearchParams
from sentence_transformers import SentenceTransformer, CrossEncoder
import numpy as np
from .text_utils import make_combined_text
from ..utils.nlp_normalize import normalize_query

EMB = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
RERANK = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

qdr = QdrantClient(path="qdrant_data")   # you already have this folder
COLL = "schemes"

def _emb(x): return EMB.encode(x, normalize_embeddings=True)

def search_related(raw_query: str, top_k=10):
    q, _ = normalize_query(raw_query)
    vec = _emb([q])[0].tolist()

    hits = qdr.search(
        collection_name=COLL,
        query_vector=vec,
        limit=36,
        search_params=SearchParams(hnsw_ef=128, exact=False),
        with_payload=True
    )
    if not hits: return []

    pairs = [(q, h.payload.get("combined_text","")) for h in hits]
    scores = RERANK.predict(pairs)
    ranked = [h for h,_s in sorted(zip(hits, scores), key=lambda z:z[1], reverse=True)]

    # lightweight MMR diversification
    text_embs = _emb([h.payload.get("combined_text","") for h in ranked])
    picked, chosen = set(), []
    for _i in range(min(top_k, len(ranked))):
        best, best_score = None, -1e9
        for idx, h in enumerate(ranked):
            if idx in picked: continue
            rel = float(np.dot(text_embs[idx], _emb([q])[0]))
            div = 0.0
            for c in chosen:
                div = max(div, float(np.dot(text_embs[idx], c["emb"])))
            score = 0.72*rel - 0.28*div
            if score > best_score:
                best, best_score = idx, score
        picked.add(best)
        chosen.append({"hit": ranked[best], "emb": text_embs[best]})
    return [c["hit"].payload for c in chosen]
