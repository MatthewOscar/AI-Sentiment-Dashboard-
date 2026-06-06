import { useState, useEffect } from "react";
import { motion } from "motion/react";
import DonutChart from "./DonutChart";
import { metaFor, pct } from "../lib/sentiment";
import { useMediaQuery } from "../lib/useMediaQuery";

const SEGMENTS = [
    { key: "neg", label: "Negative", prob: "Negative" },
    { key: "neu", label: "Neutral", prob: "Neutral" },
    { key: "pos", label: "Positive", prob: "Positive" },
];

// Per-aspect breakdown panel. Donuts on desktop, stacked bars on narrow screens.
// Paginated at 3 rows. Hover/focus cross-highlights the matching phrase in the
// text (keyed by each result's original index).
export default function AspectBreakdown({ results, hoveredKey, onHover }) {
    const [page, setPage] = useState(0);
    const isDesktop = useMediaQuery("(min-width: 1080px)");
    // Donuts are larger, so show fewer per page than the compact mobile bars.
    const pageSize = isDesktop ? 2 : 3;
    const firstAspect = results?.[0]?.aspect;
    const count = results ? results.length : 0;

    useEffect(() => {
        setPage(0);
    }, [firstAspect, count]);

    if (!results || results.length === 0) return null;

    const pageCount = Math.ceil(results.length / pageSize);
    const safePage = Math.min(page, pageCount - 1);
    const start = safePage * pageSize;
    const visible = results.map((r, i) => ({ r, i })).slice(start, start + pageSize);

    const hoverProps = (i) => ({
        tabIndex: 0,
        onMouseEnter: () => onHover?.(i),
        onMouseLeave: () => onHover?.(null),
        onFocus: () => onHover?.(i),
        onBlur: () => onHover?.(null),
    });

    return (
        <section className="aspects" aria-label="Aspect breakdown">
            <h2 className="aspects__title">Aspect breakdown</h2>
            <ul className="aspects__list">
                {visible.map(({ r, i }, vIdx) => {
                    const meta = metaFor(r.sentiment);
                    const active = hoveredKey === i;
                    const probs = r.probabilities;

                    if (isDesktop) {
                        return (
                            <li
                                key={i}
                                className={`aspect-row aspect-row--${meta.key} ${active ? "is-active" : ""}`}
                                role="img"
                                aria-label={`${r.aspect}: ${meta.label} ${pct(r.score)}`}
                                {...hoverProps(i)}
                            >
                                <DonutChart
                                    sentiment={r.sentiment}
                                    score={r.score}
                                    probabilities={probs}
                                />
                                <div className="aspect-row__body">
                                    <span className="aspect-row__tag">
                                        {meta.glyph} {meta.label} · {pct(r.score)}
                                    </span>
                                    <span className="aspect-row__phrase">{r.aspect}</span>
                                </div>
                            </li>
                        );
                    }

                    const label = probs
                        ? `${r.aspect}: ${meta.label} ${pct(r.score)}. Positive ${pct(probs.Positive)}, Neutral ${pct(probs.Neutral)}, Negative ${pct(probs.Negative)}`
                        : `${r.aspect}: ${meta.label}, ${pct(r.score)}`;

                    return (
                        <li
                            key={i}
                            className={`bar bar--${meta.key} ${active ? "is-active" : ""}`}
                            role="img"
                            aria-label={label}
                            {...hoverProps(i)}
                        >
                            <div className="bar__head">
                                <span className="bar__tag">{meta.glyph} {meta.label}</span>
                                <span className="bar__pct">{pct(r.score)}</span>
                            </div>
                            <div className="bar__phrase">{r.aspect}</div>

                            {probs ? (
                                <div className="bar__stack" aria-hidden="true">
                                    {SEGMENTS.map((seg, j) => {
                                        const value = Math.max(0, Math.min(1, probs[seg.prob] || 0));
                                        if (value <= 0) return null;
                                        return (
                                            <motion.div
                                                key={seg.key}
                                                className={`bar__seg seg--${seg.key}`}
                                                title={`${seg.label} ${pct(value)}`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${value * 100}%` }}
                                                transition={{
                                                    duration: 0.7,
                                                    ease: "easeOut",
                                                    delay: vIdx * 0.06 + j * 0.04,
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="bar__track">
                                    <motion.div
                                        className="bar__fill"
                                        initial={{ width: 0 }}
                                        animate={{
                                            width: `${Math.max(0, Math.min(1, r.score || 0)) * 100}%`,
                                        }}
                                        transition={{ duration: 0.7, ease: "easeOut", delay: vIdx * 0.06 }}
                                    />
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>

            {pageCount > 1 && (
                <div className="pager">
                    <button
                        type="button"
                        className="pager__btn"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={safePage === 0}
                    >
                        Prev
                    </button>
                    <span className="pager__info">Page {safePage + 1} / {pageCount}</span>
                    <button
                        type="button"
                        className="pager__btn"
                        onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                        disabled={safePage >= pageCount - 1}
                    >
                        Next
                    </button>
                </div>
            )}
        </section>
    );
}
