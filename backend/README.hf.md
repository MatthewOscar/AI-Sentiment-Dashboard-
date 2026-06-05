---
title: AI Sentiment Dashboard API
emoji: 🧠
colorFrom: indigo
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# AI Sentiment Dashboard API

FastAPI backend for the AI Sentiment Dashboard. It runs aspect-based sentiment
analysis with spaCy (`en_core_web_sm`) and a DeBERTa ABSA model
(`yangheng/deberta-v3-base-absa-v1.1`).

## Endpoints

- `GET /health` returns `{ "status": "ok" }`.
- `POST /api/analyze` with body `{ "text": "..." }` returns the overall sentiment
  plus a per-aspect breakdown.

## Configuration

Set the `ALLOWED_ORIGINS` Space variable to the frontend origin that should be
allowed through CORS, for example `https://your-site.netlify.app`. Multiple
origins can be comma separated. It defaults to local dev origins.

> When deploying: this file becomes the Space's `README.md`. Copy `Dockerfile`,
> `app.py`, and `requirements.txt` from the project's `backend/` folder into the
> Space repo root alongside it.
