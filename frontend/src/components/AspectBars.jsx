import { motion } from "motion/react";
import { metaFor, pct } from "../lib/sentiment";

// Per-aspect confidence bars. Each row reports its own sentiment + score, and
// hovering/focusing a row cross-highlights the matching phrase in the text.
export default function AspectBars({ results, hoveredKey, onHover }) {
    if (!results || results.length === 0) return null;

    return (
        <ul className="bars">
            {results.map((r, i) => {
                const meta = metaFor(r.sentiment);
                const active = hoveredKey === i;
                const width = Math.max(0, Math.min(1, r.score || 0)) * 100;
                return (
                    <li
                        key={i}
                        className={`bar bar--${meta.key} ${active ? "is-active" : ""}`}
                        role="img"
                        aria-label={`${r.aspect}: ${meta.label}, ${pct(r.score)}`}
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
                        <div className="bar__track">
                            <motion.div
                                className="bar__fill"
                                initial={{ width: 0 }}
                                animate={{ width: `${width}%` }}
                                transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.08 }}
                            />
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
