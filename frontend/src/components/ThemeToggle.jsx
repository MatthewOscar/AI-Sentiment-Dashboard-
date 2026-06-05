import { useEffect, useState } from "react";

// The initial theme is resolved before paint by an inline script in index.html
// (stored choice, else device preference) and written to data-theme on <html>.
function getInitialTheme() {
    if (typeof document !== "undefined" && document.documentElement.dataset.theme) {
        return document.documentElement.dataset.theme;
    }
    return "dark";
}

export default function ThemeToggle() {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    // Keep following the system theme until the user makes an explicit choice.
    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const onChange = (e) => {
            if (!localStorage.getItem("theme")) setTheme(e.matches ? "dark" : "light");
        };
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    const isDark = theme === "dark";

    const toggle = () => {
        const next = isDark ? "light" : "dark";
        try {
            localStorage.setItem("theme", next);
        } catch {
            /* localStorage may be unavailable; the toggle still works for the session */
        }
        setTheme(next);
    };

    return (
        <button
            type="button"
            className="theme-toggle"
            onClick={toggle}
            aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
            title={`Switch to ${isDark ? "light" : "dark"} theme`}
        >
            <span aria-hidden="true">{isDark ? "☀️" : "🌙"}</span>
        </button>
    );
}
