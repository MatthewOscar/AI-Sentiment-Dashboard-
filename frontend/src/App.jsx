import "./App.css";
import { useState, useRef, useEffect } from "react";
import { analyzeText, pingHealth } from "./api";
import ExampleChips from "./components/ExampleChips";
import ResultCard from "./components/ResultCard";
import Spinner from "./components/Spinner";
import ThemeToggle from "./components/ThemeToggle";
import MouseGlow from "./components/MouseGlow";
import HistoryPanel from "./components/HistoryPanel";
import { loadHistory, addToHistory, clearHistory, makeId } from "./lib/history";

const SUBMIT_KEY =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform)
        ? "⌘"
        : "Ctrl";

export default function App() {
    const [input, setInput] = useState("");
    const [data, setData] = useState(null);
    const [status, setStatus] = useState("idle"); // idle | loading | success | error
    const [fieldError, setFieldError] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [cold, setCold] = useState(false); // first run / cold-start copy
    const [history, setHistory] = useState(() => loadHistory());
    const [activeId, setActiveId] = useState(null);

    const lastInput = useRef("");
    const textareaRef = useRef(null);
    const coldTimer = useRef(null);

    // Warm up a sleeping Space while the user reads and types.
    useEffect(() => {
        let cancelled = false;
        const tick = async () => {
            const ok = await pingHealth();
            if (cancelled) return;
            if (!ok) setTimeout(tick, 5000);
        };
        tick();
        return () => {
            cancelled = true;
        };
    }, []);

    const runAnalysis = async (text) => {
        const trimmed = (text ?? input).trim();
        if (!trimmed) {
            setFieldError("Please enter a sentence first.");
            textareaRef.current?.focus();
            return;
        }
        setFieldError("");
        lastInput.current = trimmed;
        setStatus("loading");
        setData(null);
        setCold(false);
        coldTimer.current = setTimeout(() => setCold(true), 3000);

        try {
            const result = await analyzeText(trimmed);
            const entry = { id: makeId(), text: trimmed, data: result, ts: Date.now() };
            setData(result);
            setStatus("success");
            setActiveId(entry.id);
            setHistory((prev) => addToHistory(prev, entry));
        } catch (err) {
            setErrorMsg(err.message || "Something went wrong.");
            setStatus("error");
        } finally {
            clearTimeout(coldTimer.current);
            setCold(false);
        }
    };

    const onPickExample = (text) => {
        setInput(text);
        setFieldError("");
        runAnalysis(text);
    };

    const onKeyDown = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            runAnalysis();
        }
    };

    // Restore a past analysis from the local cache without calling the model.
    const restoreFromHistory = (item) => {
        setInput(item.text);
        setData(item.data);
        setStatus("success");
        setActiveId(item.id);
        setFieldError("");
    };

    const onClearHistory = () => {
        setHistory(clearHistory());
        setActiveId(null);
    };

    const loading = status === "loading";

    return (
        <div className={`app${history.length ? " app--side" : ""}`}>
            <MouseGlow />
            <ThemeToggle />
            <header className="hero">
                <p className="hero__badge">Aspect-based sentiment analysis</p>
                <h1 className="hero__title">AI Sentiment Dashboard</h1>
                <p className="hero__subtitle">
                    Paste a sentence and see not just whether it is positive or negative,
                    but which parts carry which feeling.
                </p>
            </header>

            <section className="panel" aria-label="Analyze text">
                <label className="sr-only" htmlFor="sentiment-input">
                    Text to analyze
                </label>
                <textarea
                    id="sentiment-input"
                    ref={textareaRef}
                    className="textarea"
                    placeholder={'e.g. "The food was amazing but the service was painfully slow."'}
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        if (fieldError) setFieldError("");
                    }}
                    onKeyDown={onKeyDown}
                    aria-invalid={Boolean(fieldError)}
                    aria-describedby={fieldError ? "field-error" : "hint"}
                    rows={3}
                />
                {fieldError ? (
                    <p id="field-error" className="field-error" role="alert">
                        {fieldError}
                    </p>
                ) : (
                    <p id="hint" className="hint">
                        Press {SUBMIT_KEY} + Enter to analyze.
                    </p>
                )}

                <div className="composer__actions">
                    <button className="btn" onClick={() => runAnalysis()} disabled={loading}>
                        {loading ? (
                            <>
                                <Spinner /> {cold ? "Waking up the model…" : "Analyzing…"}
                            </>
                        ) : (
                            "Analyze"
                        )}
                    </button>
                </div>

                <ExampleChips onPick={onPickExample} disabled={loading} />
            </section>

            <section className="results" aria-live="polite" aria-busy={loading}>
                {status === "idle" && (
                    <div className="state state--empty">
                        <p>Enter a sentence or pick an example to see aspect-level sentiment.</p>
                    </div>
                )}

                {loading && (
                    <div className="state state--loading">
                        <Spinner size={28} />
                        <p>
                            {cold
                                ? "The model is waking up. The first run can take up to a minute."
                                : "Analyzing your text…"}
                        </p>
                    </div>
                )}

                {status === "error" && (
                    <div className="state state--error" role="alert">
                        <p>{errorMsg}</p>
                        <button
                            className="btn btn--ghost"
                            onClick={() => runAnalysis(lastInput.current)}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {status === "success" && data && data.overall && <ResultCard data={data} />}
            </section>

            <HistoryPanel
                items={history}
                onSelect={restoreFromHistory}
                onClear={onClearHistory}
                activeId={activeId}
            />

            <footer className="footer">
                <p>
                    This app uses AI models to detect emotional tone and context. Results are
                    probabilistic, not deterministic.
                </p>
                <p>No text is stored. Built for FAU CAP 4630 – Responsible AI.</p>
            </footer>
        </div>
    );
}
