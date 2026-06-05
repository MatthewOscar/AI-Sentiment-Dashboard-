// Base URL of the FastAPI backend. Configured via VITE_API_URL at build time
// (set in Netlify); falls back to the local dev server when unset.
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Ping the backend so a sleeping Hugging Face Space starts waking up before the
// user submits. Resolves true when the server is reachable.
export async function pingHealth() {
    try {
        const res = await fetch(`${API_BASE}/health`, { method: "GET" });
        return res.ok;
    } catch {
        return false;
    }
}

export async function analyzeText(text) {
    // Free Spaces can cold-start slowly, so allow a generous timeout instead of
    // letting the request hang or get cut off by an intermediate proxy.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);

    let response;
    try {
        response = await fetch(`${API_BASE}/api/analyze`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
            signal: controller.signal,
        });
    } catch (err) {
        clearTimeout(timeout);
        if (err.name === "AbortError") {
            throw new Error("The model is still waking up. Please try again in a moment.");
        }
        throw new Error("Could not reach the sentiment service. Please try again.");
    }
    clearTimeout(timeout);

    if (!response.ok) {
        console.error("Backend error:", response.status, await response.text());
        throw new Error("Something went wrong while analyzing the text.");
    }

    const data = await response.json();
    // The backend returns HTTP 200 with an { error } body when analysis fails.
    if (data && data.error) {
        throw new Error("Something went wrong while analyzing the text.");
    }
    return data;
}
