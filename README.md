# AI Sentiment Dashboard

A web tool that reads a sentence and shows the feeling behind each part of it, not only a single label for the whole thing. Type a message, click Analyze, and the dashboard breaks it into aspects, scores each one, and highlights the exact words that drove the result.

Built for Florida Atlantic University's CAP 4630 (Artificial Intelligence) as a Responsible AI project.

Slides: https://1drv.ms/p/c/6c383511022771d7/EW9zlOjly_RIvPyB5oOc7LgB9Kawy8fz8QU_1W5IMGtXVQ

![AI Sentiment Dashboard](docs/screenshots/after-mixed.png)

## Live demo

- **App:** https://ai-sentiment-dashboard.netlify.app
- **API (Hugging Face Space):** https://MatthewOscar-ai-sentiment-api.hf.space

> The API runs on a free Hugging Face Space that sleeps after 48 hours idle. The first request after a nap takes roughly 30 to 60 seconds to wake the model, and the app shows a "waking up" state while it does. It is instant after that.

## What makes it different

Most sentiment demos return one label for an entire sentence, which falls apart on real opinions like "the food was amazing but the service was slow." This dashboard uses **aspect-based sentiment analysis**: it splits a sentence into its parts, scores each part on its own, and then sums them into an overall read. A mixed sentence comes back as Mixed, with the positive clause shown in green and the negative clause in red.

## Features

- **Aspect-level analysis** that handles mixed and contrasting opinions in one sentence
- **In-text highlighting:** the message is re-rendered with each aspect colored by sentiment; hovering an aspect lights up its phrase, and the other way round
- **Per-aspect probability distribution**, shown as a donut on desktop and a stacked bar on mobile, alongside an overall confidence gauge
- **Dashboard layout:** the result takes over the input, with the breakdown and a recent-history panel in a side rail on wide screens
- **Local history** of recent analyses, cached so you can reopen a past result instantly, with pagination
- **Shareable links:** the analyzed text lives in the URL, so a link opens straight to its result
- **Backend status indicator** and graceful cold-start handling for the free hosting
- **One-click example prompts**, including mixed-sentiment sentences
- **Accessibility:** keyboard submit, ARIA labels, and shape glyphs so meaning never depends on color alone, plus clear loading/empty/error states with retry
- **Light and dark themes** that follow the system setting (with a manual toggle) and reduced-motion support

## Before and after

| Before | After |
| --- | --- |
| ![before](docs/screenshots/before-result.png) | ![after](docs/screenshots/after-mixed.png) |

The starting point was a single localhost page that printed results as a flat list of text. The rebuild adds the overall gauge, in-text aspect highlighting, a per-aspect probability breakdown (donuts on desktop), a cached history with shareable links, light and dark theming, and a public deployment.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19 + Vite, hand-built SVG visuals animated with Motion |
| Backend | FastAPI (Python) on Uvicorn |
| Aspect splitting | spaCy (`en_core_web_sm`) |
| Sentiment model | DeBERTa ABSA (`yangheng/deberta-v3-base-absa-v1.1`) via Hugging Face Transformers + PyTorch |
| Deploy | Netlify (frontend) and a Hugging Face Docker Space (API) |

## How it works

1. The React frontend sends the text to the backend at `POST /api/analyze`.
2. spaCy splits the text into clauses, with an extra split on contrast words such as "but" and "however".
3. The DeBERTa ABSA model scores each clause, returning a probability for Positive, Negative, and Neutral.
4. The backend combines the clause scores into an overall label (Positive, Negative, Neutral, or Mixed) and returns the per-aspect breakdown as JSON.
5. The frontend renders the gauge, highlights each aspect in the original text, and shows each aspect's class distribution as a donut (desktop) or stacked bar (mobile), with the breakdown and recent history in a side rail.

## Run it locally

1. Create and activate the Python virtual environment.

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate      # Mac/Linux
   # or: .venv\Scripts\activate    # Windows
   ```

2. Install the backend dependencies.

   ```bash
   pip3 install -r backend/requirements.txt
   ```

3. Install the frontend dependencies.

   ```bash
   cd frontend && npm install && cd ..
   ```

4. Start both servers.

   ```bash
   ./start-dev.sh
   ```

   The launcher starts the FastAPI backend on port 8000 and the Vite frontend on port 5173, and writes logs to `.backend-dev.log` and `.frontend-dev.log`.

To run them separately:

```bash
cd backend && uvicorn app:app --reload --port 8000
```

```bash
cd frontend && npm run dev
```

The frontend reads the backend URL from `VITE_API_URL` and falls back to `http://127.0.0.1:8000` for local development. See `frontend/.env.example`.

## Responsible AI

- **Privacy:** no text is stored. Each request is processed once and discarded.
- **Transparency:** every result shows a confidence value, and the aspect breakdown shows which words led to it.
- **Limitations:** the model can miss sarcasm and irony, and it works on English text. Results are probabilistic, not deterministic, and are meant for educational use.
- **Bias:** the model reflects patterns in its training data and may handle slang, dialects, and underrepresented groups less reliably.

## Contributors

- Machine Learning Lead: Christopher Piedra
- Backend Developer: Matthew White
- Frontend Developer: Matthew Wyatt
- Data Engineer: Sophia Camacho
- Responsible AI and Documentation Lead / PM: Mackenzie Falla

---

All predictions are probabilistic and for educational use under FAU's CAP 4630 (Artificial Intelligence).
