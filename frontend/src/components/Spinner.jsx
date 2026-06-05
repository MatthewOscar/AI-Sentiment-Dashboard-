export default function Spinner({ size = 18 }) {
    return (
        <span className="spinner" style={{ width: size, height: size }} aria-hidden="true">
            <span className="spinner__ring" />
        </span>
    );
}
