import { motion } from "motion/react";
import { metaFor, pct, emotionMeta } from "../lib/sentiment";

// Segment order for the stacked distribution bar (left to right).
const SEGMENTS = [
    { key: "neg", label: "Negative", prob: "Negative" },
    { key: "neu", label: "Neutral", prob: "Neutral" },
    { key: "pos", label: "Positive", prob: "Positive" },
];

// Per-aspect bars. When the backend returns the full class distribution, show a
// stacked Negative/Neutral/Positive bar; otherwise (older cached entries) fall
// back to a single confidence fill. Hover/focus cross-highlights the phrase.
export default function AspectBars({ results, hoveredKey, onHover }) {
    if (!results || results.length === 0) return null;

    return (
        <ul className="bars">
            {results.map((r, i) => {
                const meta = metaFor(r.sentiment);
                const active = hoveredKey === i;
                const probs = r.probabilities;
                const emo = r.emotion ? emotionMeta(r.emotion.label) : null;
                const label = probs
                    ? `${r.aspect}: ${meta.label} ${pct(r.score)}. Positive ${pct(probs.Positive)}, Neutral ${pct(probs.Neutral)}, Negative ${pct(probs.Negative)}`
                    : `${r.aspect}: ${meta.label}, ${pct(r.score)}`;

                return (
                    <li
                        key={i}
                        className={`bar bar--${meta.key} ${active ? "is-active" : ""}`}
                        role="img"
                        aria-label={label}
                        tabIndex={0}
                        onMouseEnter={() => onHover?.(i)}
                        onMouseLeave={() => onHover?.(null)}
                        onFocus={() => onHover?.(i)}
                        onBlur={() => onHover?.(null)}
                    >
                        <div className="bar__head">
                            <span className="bar__tag">{meta.glyph} {meta.label}</span>
                            <span className="bar__pct">{pct(r.score)}</span>
                        </div>
                        <div className="bar__phrase">{r.aspect}</div>
                        {emo && (
                            <div className="bar__emotion">
                                Emotion: {emo.emoji} {emo.label}
                            </div>
                        )}

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
                                                delay: i * 0.08 + j * 0.04,
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
                                    transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.08 }}
                                />
                            </div>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
