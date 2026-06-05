import { motion } from "motion/react";
import { metaFor, pct } from "../lib/sentiment";

// Overall sentiment as an SVG donut. The arc length encodes confidence and its
// color encodes the sentiment; the center repeats it as emoji, percent, and a
// glyph + word so it never relies on color alone.
export default function Gauge({ sentiment, score }) {
    const meta = metaFor(sentiment);
    const size = 168;
    const stroke = 14;
    const r = (size - stroke) / 2;
    const circumference = 2 * Math.PI * r;
    const clamped = Math.max(0, Math.min(1, typeof score === "number" ? score : 0));
    const dash = clamped * circumference;

    return (
        <div
            className={`gauge gauge--${meta.key}`}
            role="img"
            aria-label={`Overall sentiment ${meta.label}, ${pct(score)} confidence`}
        >
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
                <circle
                    className="gauge__track"
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    strokeWidth={stroke}
                    fill="none"
                />
                <motion.circle
                    className="gauge__arc"
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    strokeWidth={stroke}
                    fill="none"
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - dash }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                />
            </svg>
            <div className="gauge__center">
                <span className="gauge__emoji" aria-hidden="true">{meta.emoji}</span>
                <span className="gauge__pct">{pct(score)}</span>
                <span className="gauge__label">{meta.glyph} {meta.label}</span>
            </div>
        </div>
    );
}
