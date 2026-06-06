from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import spacy
import re
import os

app = FastAPI()

# -------------------------------------------------------
# 🛡️ CORS Middleware
# -------------------------------------------------------
# Allowed origins come from the ALLOWED_ORIGINS env var (comma separated),
# defaulting to local dev. Credentials are off because the API uses no cookies,
# which also avoids the illegal "*" + credentials combination in production.
_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
allowed_origins = [o.strip() for o in _origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------
# 🧠 Load Models
# -------------------------------------------------------
nlp = spacy.load("en_core_web_sm")

model_name = "yangheng/deberta-v3-base-absa-v1.1"
absa_tokenizer = AutoTokenizer.from_pretrained(model_name, use_fast=False)
absa_model = AutoModelForSequenceClassification.from_pretrained(model_name)

# -------------------------------------------------------
# 📦 Request Model
# -------------------------------------------------------
class TextRequest(BaseModel):
    # Generous cap: long enough for a paragraph, short enough to keep a public
    # Space from being hit with huge or abusive inputs.
    text: str = Field(..., max_length=5000)


# -------------------------------------------------------
# 🧩 Aspect Extraction (Contrast-Aware)
# -------------------------------------------------------
# Words that mark a contrast between clauses. We split on these (and semicolons)
# and drop the connector, so each clause is a clean substring of the input.
CONTRAST_WORDS = ["but", "however", "although", "though", "yet", "while", "whereas"]
_SPLIT_RE = re.compile(r"\s*;\s*|\b(?:" + "|".join(CONTRAST_WORDS) + r")\b", re.IGNORECASE)


def extract_aspect_sentences(text: str):
    """
    Split the text into clause-level aspects. Each spaCy sentence is further
    split on contrast words and semicolons, the connector is dropped, whitespace
    is normalized, and clauses shorter than three words are ignored.
    """
    doc = nlp(text)
    sentences = [s.text.strip() for s in doc.sents if s.text.strip()] or [text]

    clauses = []
    for sentence in sentences:
        for part in _SPLIT_RE.split(sentence):
            clause = re.sub(r"\s+", " ", part or "").strip()
            if len(clause.split()) > 2:
                clauses.append(clause)

    # De-duplicate case-insensitively while preserving order.
    seen = set()
    unique = []
    for clause in clauses:
        key = clause.lower()
        if key not in seen:
            seen.add(key)
            unique.append(clause)
    return unique


# -------------------------------------------------------
# ❤️ Health check (frontend pings this to warm up the Space)
# -------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok"}


# -------------------------------------------------------
# 🚀 API Route: Analyze Sentiment
# -------------------------------------------------------
@app.post("/api/analyze")
def analyze_prompt(request: TextRequest):
    prompt = request.text.strip()
    try:
        aspects = extract_aspect_sentences(prompt)
        print("🔍 Extracted aspects:", aspects)

        label_map = {0: "Negative", 1: "Neutral", 2: "Positive"}
        negative_keywords = {
            "not", "no", "scared", "fear", "afraid", "worried",
            "hate", "alergic", "allergic", "sick", "ill",
            "anxious", "nervous", "concerned", "upset"
        }

        results = []
        grouped = {"Positive": [], "Negative": [], "Neutral": []}

        # Analyze each extracted aspect
        for aspect in aspects:
            inputs = absa_tokenizer(aspect, return_tensors="pt", truncation=True)
            with torch.no_grad():
                outputs = absa_model(**inputs)
                probs = F.softmax(outputs.logits, dim=1)[0]
                pred_label = torch.argmax(probs).item()

            sentiment = label_map.get(pred_label, "Unknown")
            score = probs[pred_label].item()

            # Adjust for negative-emotion keywords
            if any(word in aspect.lower() for word in negative_keywords) and sentiment == "Positive":
                sentiment = "Negative"
                score = min(score + 0.1, 1.0)

            entry = {
                "aspect": aspect,
                "sentiment": sentiment,
                "score": round(score, 2),
                # Raw model distribution over the three classes (label_map order).
                "probabilities": {
                    "Negative": round(probs[0].item(), 2),
                    "Neutral": round(probs[1].item(), 2),
                    "Positive": round(probs[2].item(), 2),
                },
            }
            results.append(entry)
            if sentiment in grouped:
                grouped[sentiment].append(entry)

        # --- Compute weighted overall sentiment ---
        if results:
            weights = {"Positive": 1, "Neutral": 0, "Negative": -1}
            weighted_scores = [weights[r["sentiment"]] * r["score"] for r in results]
            avg_score = sum(weighted_scores) / len(weighted_scores)

            pos_count = len([r for r in results if r["sentiment"] == "Positive"])
            neg_count = len([r for r in results if r["sentiment"] == "Negative"])
            neu_count = len([r for r in results if r["sentiment"] == "Neutral"])

            # ✅ True balance for mixed emotions
            if pos_count > 0 and neg_count > 0:
                pos_strength = sum([r["score"] for r in results if r["sentiment"] == "Positive"]) / pos_count
                neg_strength = sum([r["score"] for r in results if r["sentiment"] == "Negative"]) / neg_count

                overall_sentiment = "Mixed"
                overall_confidence = round(((pos_strength + neg_strength) / 2), 2)

            elif avg_score > 0.2:
                overall_sentiment = "Positive"
                overall_confidence = round(avg_score, 2)

            elif avg_score < -0.2:
                overall_sentiment = "Negative"
                overall_confidence = round(abs(avg_score), 2)

            else:
                overall_sentiment = "Neutral"
                # Use the mean aspect confidence so a neutral result reports its
                # real certainty instead of ~0 from the signed weighted average.
                overall_confidence = round(sum(r["score"] for r in results) / len(results), 2)

        else:
            # Fallback: analyze whole prompt
            inputs = absa_tokenizer(prompt, return_tensors="pt", truncation=True)
            with torch.no_grad():
                outputs = absa_model(**inputs)
                probs = F.softmax(outputs.logits, dim=1)[0]
                pred_label = torch.argmax(probs).item()
            overall_sentiment = label_map.get(pred_label, "Unknown")
            overall_confidence = probs[pred_label].item()

        # ✅ Return structured response
        return {
            "text": prompt,
            "overall": {
                "sentiment": overall_sentiment,
                "score": round(overall_confidence, 2)
            },
            "grouped": grouped,
            "results": results
        }

    except Exception as e:
        return {"error": str(e)}
