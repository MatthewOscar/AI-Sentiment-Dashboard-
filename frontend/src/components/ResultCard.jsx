import { useState } from "react";
import { motion } from "motion/react";
import Gauge from "./Gauge";
import HighlightedText from "./HighlightedText";
import AspectBars from "./AspectBars";
import { metaFor, SENTIMENT_META } from "../lib/sentiment";

// Composes the overall gauge, the highlighted input, and the per-aspect bars,
// and owns the shared hover key that links a bar to its highlighted phrase.
export default function ResultCard({ data }) {
    const [hoveredKey, setHoveredKey] = useState(null);
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
                onHover={setHoveredKey}
            />

            {results.length > 0 && (
                <>
                    <h3 className="result__section">Aspect breakdown</h3>
                    <AspectBars results={results} hoveredKey={hoveredKey} onHover={setHoveredKey} />
                </>
            )}
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
