import { motion } from "motion/react";
import { metaFor, pct } from "../lib/sentiment";

const ORDER = [
    { key: "neg", prob: "Negative" },
    { key: "neu", prob: "Neutral" },
    { key: "pos", prob: "Positive" },
];

const SIZE = 100;
const STROKE = 13;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

// A donut for one aspect: a ring split into Negative/Neutral/Positive by
// probability, with the dominant sentiment's emoji + score in the center. Falls
// back to a single dominant arc when the distribution is missing (old entries).
export default function DonutChart({ sentiment, score, probabilities }) {
    const meta = metaFor(sentiment);

    let segments;
    if (probabilities) {
        let acc = 0;
        segments = ORDER.map((s) => {
            const value = Math.max(0, Math.min(1, probabilities[s.prob] || 0));
            const seg = { key: s.key, value, start: acc };
            acc += value;
            return seg;
        }).filter((s) => s.value > 0);
    } else {
        const value = Math.max(0, Math.min(1, typeof score === "number" ? score : 0));
        segments = [{ key: meta.key, value, start: 0 }];
    }

    const aria = probabilities
        ? `${meta.label} ${pct(score)}. Positive ${pct(probabilities.Positive)}, Neutral ${pct(probabilities.Neutral)}, Negative ${pct(probabilities.Negative)}`
        : `${meta.label} ${pct(score)}`;

    return (
        <div className="donut" role="img" aria-label={aria}>
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
                <circle
                    className="donut__track"
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={R}
                    fill="none"
                    strokeWidth={STROKE}
                />
                {segments.map((s) => {
                    const len = s.value * C;
                    return (
                        <motion.circle
                            key={s.key}
                            className={`donut__seg donut__seg--${s.key}`}
                            cx={SIZE / 2}
                            cy={SIZE / 2}
                            r={R}
                            fill="none"
                            strokeWidth={STROKE}
                            strokeLinecap="butt"
                            strokeDasharray={`${len} ${C}`}
                            transform={`rotate(${-90 + s.start * 360} ${SIZE / 2} ${SIZE / 2})`}
                            initial={{ strokeDashoffset: len }}
                            animate={{ strokeDashoffset: 0 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                        />
                    );
                })}
            </svg>
            <div className="donut__center">
                <span className="donut__emoji" aria-hidden="true">{meta.emoji}</span>
                <span className="donut__pct">{pct(score)}</span>
            </div>
        </div>
    );
}
