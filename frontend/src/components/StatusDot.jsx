// Small fixed pill showing whether the backend (a free Space that may sleep) is
// awake. Driven by the warm-up health ping in App.
export default function StatusDot({ ready }) {
    return (
        <div
            className={`status-dot ${ready ? "is-ready" : "is-waking"}`}
            role="status"
            aria-live="polite"
        >
            <span className="status-dot__led" aria-hidden="true" />
            <span className="status-dot__label">{ready ? "Model ready" : "Waking up…"}</span>
        </div>
    );
}
