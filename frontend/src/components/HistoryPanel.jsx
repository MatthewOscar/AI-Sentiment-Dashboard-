import { useState, useEffect } from "react";
import { metaFor } from "../lib/sentiment";

const PAGE_SIZE = 10;

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
// Paginated at 10 per page once there are more than that.
export default function HistoryPanel({ items, onSelect, onClear, activeId }) {
    const [page, setPage] = useState(0);
    const topId = items[0]?.id;

    // Jump back to the first page whenever a new analysis is added on top.
    useEffect(() => {
        setPage(0);
    }, [topId]);

    if (!items || items.length === 0) return null;

    const pageCount = Math.ceil(items.length / PAGE_SIZE);
    const safePage = Math.min(page, pageCount - 1);
    const start = safePage * PAGE_SIZE;
    const visible = items.slice(start, start + PAGE_SIZE);

    return (
        <section className="history" aria-label="Recent analyses">
            <div className="history__head">
                <h2 className="history__title">Recent</h2>
                <button type="button" className="history__clear" onClick={onClear}>
                    Clear
                </button>
            </div>
            <ul className="history__list">
                {visible.map((item) => {
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

            {pageCount > 1 && (
                <div className="history__pager">
                    <button
                        type="button"
                        className="history__page-btn"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={safePage === 0}
                        aria-label="Newer analyses"
                    >
                        Prev
                    </button>
                    <span className="history__page-info">
                        Page {safePage + 1} / {pageCount}
                    </span>
                    <button
                        type="button"
                        className="history__page-btn"
                        onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                        disabled={safePage >= pageCount - 1}
                        aria-label="Older analyses"
                    >
                        Next
                    </button>
                </div>
            )}
        </section>
    );
}
