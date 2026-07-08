import { useEffect, useState } from "react";

export function ScrollProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const onScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight =
                document.documentElement.scrollHeight - window.innerHeight;
            setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div className="scroll-progress-track" role="presentation" aria-hidden="true">
            <div className="scroll-progress-fill" style={{ width: `${progress}%` }} />
        </div>
    );
}