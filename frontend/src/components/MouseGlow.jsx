import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

// A soft glow that trails the cursor, shown only on wide screens with a real
// pointer. It sits behind the content and is disabled for reduced-motion users.
export default function MouseGlow() {
    const x = useMotionValue(-9999);
    const y = useMotionValue(-9999);
    const sx = useSpring(x, { stiffness: 120, damping: 22, mass: 0.4 });
    const sy = useSpring(y, { stiffness: 120, damping: 22, mass: 0.4 });

    useEffect(() => {
        const wide = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (!wide.matches || reduce.matches) return;

        const onMove = (e) => {
            x.set(e.clientX);
            y.set(e.clientY);
        };
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, [x, y]);

    return (
        <div className="mouse-glow" aria-hidden="true">
            <motion.div className="mouse-glow__blob" style={{ x: sx, y: sy }} />
        </div>
    );
}
