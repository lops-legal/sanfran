import { ShieldCheck, Lock, Fingerprint, Quote } from "lucide-react";
import { useInView } from "../../hooks/useInView";

const BADGES = [
    { icon: ShieldCheck, label: "Legal-Shield", rotate: "-1.5deg" },
    { icon: Lock, label: "LGPD / GDPR", rotate: "1deg" },
    { icon: Fingerprint, label: "Hash SHA-256", rotate: "-0.5deg" },
];

export function TrustSection() {
    const { ref: sectionRef, inView: sectionInView } = useInView<HTMLDivElement>({ threshold: 0.1 });

    return (
        <section className="py-20 md:py-28 bg-[#F9F7F5]">
            <div className="container max-w-3xl mx-auto px-4">
                <div ref={sectionRef} className="text-center space-y-8">
                    

                    <h2 className="text-2xl md:text-3xl font-bold text-[#3E2B1E]">
                        Segurança de dados como qualquer documento jurídico merece.
                    </h2>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        {BADGES.map(({ icon: Icon, label, rotate }) => (
                            <span
                                key={label}
                                className={`stamp-enter ${sectionInView ? "is-visible" : ""}`}
                                style={{ ["--stamp-rotate" as string]: rotate }}
                            >
                                <span className="stamp-badge">
                                    <Icon className="w-3.5 h-3.5" />
                                    {label}
                                </span>
                            </span>
                        ))}
                    </div>

                    <div className="pt-8">
                        <div className="max-w-lg mx-auto p-6 bg-white border border-[#E0D8D0] rounded-lg">
                            <Quote className="w-5 h-5 text-[#C9A84C] mb-3" />
                            <p className="text-base text-[#3E2B1E] leading-relaxed font-light italic mb-4">
                                "Reduzimos o tempo de triagem contratual de semanas para horas."
                            </p>
                            <p className="text-sm text-[#8B7D6B]">— Time Jurídico, cliente Enterprise</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}