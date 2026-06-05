// Local, cached history of recent analyses, persisted in localStorage. Each
// entry keeps the full API response so a past analysis can be restored instantly
// without calling the model again.

const KEY = "ai-sentiment-history";
const MAX = 50;

export function makeId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function loadHistory() {
    try {
        const raw = localStorage.getItem(KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
}

function save(list) {
    try {
        localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    } catch {
        /* storage may be full or unavailable; history just will not persist */
    }
}

// Add an entry to the top, drop any earlier entry with the same text, and cap
// the list. Returns the new list (already persisted).
export function addToHistory(list, entry) {
    const text = entry.text.trim();
    const deduped = list.filter((e) => e.text.trim() !== text);
    const next = [{ ...entry, text }, ...deduped].slice(0, MAX);
    save(next);
    return next;
}

export function clearHistory() {
    try {
        localStorage.removeItem(KEY);
    } catch {
        /* ignore */
    }
    return [];
}
