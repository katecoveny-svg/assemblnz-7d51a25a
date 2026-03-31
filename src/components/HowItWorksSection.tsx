import { motion } from "framer-motion";
import { MessageSquare, Layers, ShieldCheck, Rocket } from "lucide-react";
import MaungaStarCluster from "@/components/MaungaStarCluster";

const STEPS = [
  {
    icon: MessageSquare,
    title: "Tell us about your business",
    desc: "Share your industry, team size, and goals. Your specialist team adapts to you.",
  },
  {
    icon: Layers,
    title: "Access your specialist tools",
    desc: "44 tools covering every NZ industry, all trained on NZ legislation and tikanga.",
  },
  {
    icon: ShieldCheck,
    title: "Get specialist guidance",
    desc: "Ask anything. Get recommendations grounded in NZ law, regulations, and best practice.",
  },
  {
    icon: Rocket,
    title: "Run 24/7",
    desc: "Embed on your site, share with your team, or let customers chat directly.",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="relative z-10 py-20 sm:py-28 border-t border-border overflow-hidden">
      {/* Background cluster */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-30">
        <MaungaStarCluster size={600} showMaunga={false} />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p
            className="font-mono-jb text-[10px] tracking-[4px] uppercase mb-3"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Getting Started
          </p>
          <h2
            className="text-2xl sm:text-4xl font-display tracking-[0.02em] text-foreground heading-glow section-heading"
            style={{ fontWeight: 300 }}
          >
            How it works
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                className="relative rounded-2xl p-6 border border-border bg-card group"
                style={{ backdropFilter: "blur(12px)" }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{
                  borderColor: "rgba(255,255,255,0.15)",
                  boxShadow: "0 0 40px rgba(255,255,255,0.06), 0 0 80px rgba(255,255,255,0.03)",
                }}
              >
                {/* Step number glow */}
                <span
                  className="absolute -top-3 -left-1 font-display text-[3rem] font-bold pointer-events-none select-none"
                  style={{
                    color: "transparent",
                    WebkitTextStroke: "1px rgba(255,255,255,0.06)",
                    lineHeight: 1,
                  }}
                >
                  0{i + 1}
                </span>

                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-shadow duration-300 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <Icon size={18} style={{ color: "rgba(255,255,255,0.7)" }} />
                </div>

                <h3 className="text-sm font-display font-light text-foreground mb-2">{step.title}</h3>
                <p className="text-xs font-body text-muted-foreground leading-relaxed">{step.desc}</p>

                {/* Bottom glow line on hover */}
                <span
                  className="absolute bottom-0 left-[15%] right-[15%] h-px opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)" }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
