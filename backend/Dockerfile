# Hugging Face Space (Docker SDK) image for the AI Sentiment Dashboard API.
# Build context is this backend/ folder copied into the Space repo root.
FROM python:3.11-slim

# build-essential covers C extensions that ship without wheels (e.g. sentencepiece),
# curl is handy for manual health checks.
RUN apt-get update && apt-get install -y --no-install-recommends \
        build-essential \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Hugging Face Spaces run the container as uid 1000. Create that user and point
# the model cache at a writable home so build-time downloads are reused at runtime.
RUN useradd -m -u 1000 appuser
ENV HOME=/home/appuser \
    PATH=/home/appuser/.local/bin:$PATH \
    HF_HOME=/home/appuser/.cache/huggingface \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install CPU-only torch FIRST so the multi-gigabyte CUDA wheel is never pulled.
# If torch==2.12.0 is not on the CPU index, relax the pin here and in requirements.txt.
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch==2.12.0 \
        --index-url https://download.pytorch.org/whl/cpu

# Install the remaining Python deps (torch is already satisfied above).
COPY --chown=appuser:appuser requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application code.
COPY --chown=appuser:appuser app.py .

USER appuser

# Bake the model weights into the image so the first request is not a slow
# download. Runs as appuser so the cache lives under HF_HOME and is reused at runtime.
RUN python -c "import spacy; spacy.load('en_core_web_sm'); \
from transformers import AutoTokenizer, AutoModelForSequenceClassification; \
m='yangheng/deberta-v3-base-absa-v1.1'; \
AutoTokenizer.from_pretrained(m, use_fast=False); \
AutoModelForSequenceClassification.from_pretrained(m); \
e='j-hartmann/emotion-english-distilroberta-base'; \
AutoTokenizer.from_pretrained(e); \
AutoModelForSequenceClassification.from_pretrained(e)"

EXPOSE 7860

# Hugging Face Spaces require the app to listen on 0.0.0.0:7860.
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
