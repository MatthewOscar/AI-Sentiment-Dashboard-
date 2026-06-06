import { motion } from "motion/react";
import Gauge from "./Gauge";
import HighlightedText from "./HighlightedText";
import { metaFor, SENTIMENT_META } from "../lib/sentiment";

// The main-column result: the overall gauge, a legend, and the original text
// with each aspect highlighted. The per-aspect breakdown now lives in the right
// rail (AspectBreakdown), so the hover key is owned by App and passed in.
export default function ResultCard({ data, hoveredKey, onHover }) {
    const overall = data.overall || {};
    const results = data.results || [];

    return (
        <motion.div
            className="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <div className="result__top">
                <Gauge sentiment={overall.sentiment} score={overall.score} />
                <div className="result__intro">
                    <h2 className="result__title">Overall: {metaFor(overall.sentiment).label}</h2>
                    <p className="result__sub">Here is how each part of the message reads.</p>
                    <Legend />
                </div>
            </div>

            <HighlightedText
                text={data.text}
                results={results}
                hoveredKey={hoveredKey}
                onHover={onHover}
            />
        </motion.div>
    );
}

function Legend() {
    return (
        <ul className="legend">
            {Object.values(SENTIMENT_META).map((m) => (
                <li key={m.key} className={`legend__item legend--${m.key}`}>
                    <span className="legend__dot" aria-hidden="true" /> {m.glyph} {m.label}
                </li>
            ))}
        </ul>
    );
}
