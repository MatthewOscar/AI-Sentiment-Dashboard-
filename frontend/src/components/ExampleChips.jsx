import { EXAMPLES, metaFor } from "../lib/sentiment";

// One-click sample prompts. Picking a chip fills the textarea and runs analysis.
export default function ExampleChips({ onPick, disabled }) {
    return (
        <div className="examples">
            <span className="examples__label">Try an example</span>
            <div className="examples__row">
                {EXAMPLES.map((ex, i) => {
                    const meta = metaFor(ex.label);
                    return (
                        <button
                            key={i}
                            type="button"
                            className={`chip chip--${meta.key}`}
                            onClick={() => onPick(ex.text)}
                            disabled={disabled}
                            aria-label={`Use ${meta.label} example: ${ex.text}`}
                            title={ex.text}
                        >
                            <span className="chip__tag">{meta.glyph} {ex.label}</span>
                            <span className="chip__text">{ex.text}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
