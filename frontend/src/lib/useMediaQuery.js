import { useState, useEffect } from "react";

// Track a CSS media query as a boolean (used to switch the aspect breakdown
// between donuts on desktop and stacked bars on narrow screens).
export function useMediaQuery(query) {
    const read = () =>
        typeof window !== "undefined" && window.matchMedia
            ? window.matchMedia(query).matches
            : false;

    const [matches, setMatches] = useState(read);

    useEffect(() => {
        const mql = window.matchMedia(query);
        const onChange = () => setMatches(mql.matches);
        onChange();
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
    }, [query]);

    return matches;
}
