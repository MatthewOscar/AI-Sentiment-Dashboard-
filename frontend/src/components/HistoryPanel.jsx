import { metaFor } from "../lib/sentiment";

function timeAgo(ts) {
    const seconds = Math.round((Date.now() - ts) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.round(hours / 24)}d ago`;
}

// Clickable list of recent analyses. Selecting one restores its cached result.
export default function HistoryPanel({ items, onSelect, onClear, activeId }) {
    if (!items || items.length === 0) return null;

    return (
        <section className="history" aria-label="Recent analyses">
            <div className="history__head">
                <h2 className="history__title">Recent</h2>
                <button type="button" className="history__clear" onClick={onClear}>
                    Clear
                </button>
            </div>
            <ul className="history__list">
                {items.map((item) => {
                    const meta = metaFor(item.data?.overall?.sentiment);
                    const active = item.id === activeId;
                    return (
                        <li key={item.id}>
                            <button
                                type="button"
                                className={`history__item history--${meta.key} ${active ? "is-active" : ""}`}
                                onClick={() => onSelect(item)}
                                title={item.text}
                                aria-label={`Restore: ${item.text} (${meta.label})`}
                            >
                                <span className="history__tag" aria-hidden="true">{meta.glyph}</span>
                                <span className="history__text">{item.text}</span>
                                <span className="history__time">{timeAgo(item.ts)}</span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
