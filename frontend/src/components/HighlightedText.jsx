import { useMemo } from "react";
import { buildSegments, metaFor, pct } from "../lib/sentiment";

// Re-renders the original input with each aspect phrase highlighted by its
// sentiment. Hovering/focusing a mark cross-highlights its bar and vice versa.
// Aspects that cannot be located in the text are shown as pills so nothing is
// silently dropped.
export default function HighlightedText({ text, results, hoveredKey, onHover }) {
    const { segments, unlocated } = useMemo(
        () => buildSegments(text, results),
        [text, results]
    );

    return (
        <div className="highlight">
            <p className="highlight__text">
                {segments.map((seg, i) => {
                    if (!seg.sentiment) {
                        return <span key={i}>{seg.text}</span>;
                    }
                    const meta = metaFor(seg.sentiment);
                    const active = hoveredKey === seg.key;
                    return (
                        <mark
                            key={i}
                            className={`hl hl--${meta.key} ${active ? "is-active" : ""}`}
                            title={`${meta.label} · ${pct(seg.score)}`}
                            tabIndex={0}
                            onMouseEnter={() => onHover?.(seg.key)}
                            onMouseLeave={() => onHover?.(null)}
                            onFocus={() => onHover?.(seg.key)}
                            onBlur={() => onHover?.(null)}
                        >
                            {seg.text}
                        </mark>
                    );
                })}
            </p>

            {unlocated.length > 0 && (
                <div className="unlocated">
                    <span className="unlocated__label">Also detected:</span>
                    {unlocated.map((u) => {
                        const meta = metaFor(u.sentiment);
                        return (
                            <span key={u.key} className={`unlocated__pill pill--${meta.key}`}>
                                {meta.glyph} {u.aspect} · {pct(u.score)}
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
