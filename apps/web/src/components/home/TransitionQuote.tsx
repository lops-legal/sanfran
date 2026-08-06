import { useInView } from "../../hooks/useInView";

export function TransitionQuote() {
    const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });

    return (
        <section className="py-12 md:py-20 lg:py-28 bg-[#F9F7F5]">
            <div className="container max-w-3xl mx-auto px-4">
                <div ref={ref} className={`scale-reveal ${inView ? "is-visible" : ""} text-center space-y-6`}>
                    
                    <blockquote>
                        <p className="text-xl md:text-2xl text-[#3E2B1E] leading-relaxed font-light italic">
                            "E se cada skill jurídica coubesse num único plug-in?"
                        </p>
                    </blockquote>
                    <p className="text-sm text-[#8B7D6B]">— a pergunta que deu origem ao Sanfran</p>
                </div>
            </div>
        </section>
    );
}