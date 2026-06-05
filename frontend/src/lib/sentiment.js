// Shared sentiment vocabulary, example prompts, and the helper that maps the
// backend's aspect phrases back onto the original text for highlighting.

// Each sentiment carries a CSS key, a word label, an emoji, and a shape glyph.
// The glyph means colorblind users can tell sentiments apart without relying on
// hue or emoji alone.
export const SENTIMENT_META = {
    Positive: { key: "pos", label: "Positive", emoji: "😊", glyph: "+" },
    Negative: { key: "neg", label: "Negative", emoji: "☹️", glyph: "−" },
    Neutral: { key: "neu", label: "Neutral", emoji: "😐", glyph: "=" },
    Mixed: { key: "mix", label: "Mixed", emoji: "🤔", glyph: "±" },
};

export function metaFor(sentiment) {
    return (
        SENTIMENT_META[sentiment] || {
            key: "neu",
            label: sentiment || "Unknown",
            emoji: "❓",
            glyph: "?",
        }
    );
}

// Backend scores are 0..1; render as a whole-number percent.
export function pct(score) {
    if (typeof score !== "number" || Number.isNaN(score)) return "—";
    return `${Math.round(score * 100)}%`;
}

// One-click sample prompts. Two mixed examples lead because splitting opposing
// sentiment inside one sentence is the model's signature trick.
export const EXAMPLES = [
    { label: "Mixed", text: "The food was amazing but the service was painfully slow." },
    { label: "Mixed", text: "I love the camera on this phone, though the battery life is terrible." },
    { label: "Positive", text: "The new update is fast, polished, and genuinely delightful to use." },
    { label: "Negative", text: "The checkout kept crashing and support never replied. A total waste of time." },
    { label: "Neutral", text: "The document contains twelve pages and three appendices." },
];

// Aspect phrases sometimes arrive with a leading contrast word (e.g.
// "but  the service was slow") and extra spacing, so strip that before matching.
const LEADING_CONTRAST = /^[\s,;:.\-"']*(?:but|however|although|though|yet)\b[\s,;:.\-"']*/i;

// Map each result's aspect back onto the original text and return an ordered
// list of segments (plain text + highlighted spans) plus any aspects that could
// not be located. The result index becomes each span's `key` so a bar and its
// phrase can cross-highlight each other on hover.
export function buildSegments(text, results) {
    if (!text || !Array.isArray(results) || results.length === 0) {
        return { segments: [{ text: text || "", sentiment: null }], unlocated: [] };
    }

    const lower = text.toLowerCase();
    const spans = [];
    const unlocated = [];

    results.forEach((r, i) => {
        const cleaned = (r.aspect || "").replace(LEADING_CONTRAST, "").trim();
        if (!cleaned) return;
        const idx = lower.indexOf(cleaned.toLowerCase());
        if (idx === -1) {
            unlocated.push({ aspect: r.aspect, sentiment: r.sentiment, score: r.score, key: i });
            return;
        }
        spans.push({
            start: idx,
            end: idx + cleaned.length,
            sentiment: r.sentiment,
            score: r.score,
            key: i,
        });
    });

    // Sort by start, then prefer the longer span, and greedily drop overlaps.
    spans.sort((a, b) => a.start - b.start || b.end - b.start - (a.end - a.start));
    const kept = [];
    let lastEnd = 0;
    for (const s of spans) {
        if (s.start >= lastEnd) {
            kept.push(s);
            lastEnd = s.end;
        }
    }

    const segments = [];
    let cursor = 0;
    for (const s of kept) {
        if (s.start > cursor) {
            segments.push({ text: text.slice(cursor, s.start), sentiment: null });
        }
        segments.push({
            text: text.slice(s.start, s.end),
            sentiment: s.sentiment,
            score: s.score,
            key: s.key,
        });
        cursor = s.end;
    }
    if (cursor < text.length) {
        segments.push({ text: text.slice(cursor), sentiment: null });
    }

    return { segments, unlocated };
}
