# Deployment guide

The app is split into two pieces:

```
Browser  ->  Netlify (static React)  --fetch(VITE_API_URL)-->  Hugging Face Space :7860 (FastAPI + model)
             https://<site>.netlify.app                         https://<user>-<space>.hf.space
```

Deploy the backend first, then the frontend, then connect them. The repo already
contains every file you need: `backend/Dockerfile`, `backend/README.hf.md`,
`frontend/netlify.toml`, and `frontend/.env.example`.

## Part 1: backend on a Hugging Face Space

1. Sign in at https://huggingface.co and click **New Space**.
2. Choose **Docker** as the SDK (blank template), set visibility to **Public**, and pick the free **CPU basic** hardware. Create the Space. It gives you a URL like `https://<user>-<space>.hf.space`.
3. Put four files at the **root** of the Space repo:
   - `backend/Dockerfile`
   - `backend/app.py`
   - `backend/requirements.txt`
   - `backend/README.hf.md`, renamed to `README.md`

   The quickest way:

   ```bash
   git clone https://huggingface.co/spaces/<user>/<space> hf-space
   cd hf-space
   cp ../AI-Sentiment-Dashboard-/backend/Dockerfile .
   cp ../AI-Sentiment-Dashboard-/backend/app.py .
   cp ../AI-Sentiment-Dashboard-/backend/requirements.txt .
   cp ../AI-Sentiment-Dashboard-/backend/README.hf.md ./README.md
   git add .
   git commit -m "Deploy sentiment API"
   git push
   ```

4. Watch the build logs in the Space UI. The first build is slow because it pulls PyTorch and bakes the model weights into the image. When the Space shows **Running**, test it:
   - Open `https://<user>-<space>.hf.space/health` and confirm `{"status":"ok"}`.
   - Try an analysis:
     ```bash
     curl -X POST https://<user>-<space>.hf.space/api/analyze \
       -H 'Content-Type: application/json' \
       -d '{"text":"The food was amazing but the service was slow"}'
     ```

## Part 2: frontend on Netlify

1. Sign in at https://app.netlify.com and choose **Add new site -> Import an existing project**, then connect the GitHub repo.
2. In the build settings, set:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   (`frontend/netlify.toml` already declares the build command, publish dir, and the single-page redirect, so these should auto-fill once the base directory is `frontend`.)
3. Before the first deploy, add an environment variable under **Site settings -> Environment variables**:
   - Key: `VITE_API_URL`
   - Value: your Space URL, for example `https://<user>-<space>.hf.space` (no trailing slash)
4. Deploy. Netlify gives you a URL like `https://<site>.netlify.app`.

> Vite inlines `VITE_API_URL` at build time, so if you change it later you must redeploy for the new value to take effect.

## Part 3: connect them

1. Copy your Netlify URL.
2. In the Space, open **Settings -> Variables and secrets** and add a **variable**:
   - Key: `ALLOWED_ORIGINS`
   - Value: your Netlify URL, for example `https://<site>.netlify.app` (you can add more origins comma separated, such as `http://localhost:5173`)
3. Restart the Space so FastAPI picks up the new origins.
4. Open your Netlify URL, run an analysis, and check the browser network tab. You should see a `/health` request followed by a successful `/api/analyze` with no CORS error.

## Notes and troubleshooting

- **Cold starts.** Free Spaces sleep after a period of inactivity and take time to wake up. The frontend pings `/health` on load to start the wake-up early and shows a "waking up the model" message on the first run. Expect the first request after a sleep to be slow.
- **Changing settings.** A Space variable change needs a restart. A `Dockerfile` change needs a factory rebuild (Space settings -> Factory rebuild).
- **torch pin.** The Dockerfile installs `torch==2.12.0` from the CPU wheel index. If that exact version is not available there during the build, relax the pin in both `backend/Dockerfile` and `backend/requirements.txt` (for example drop the version to let pip pick the latest CPU build).
- **CORS errors.** They almost always mean `ALLOWED_ORIGINS` on the Space does not match your Netlify URL exactly, or the Space was not restarted after the change.
