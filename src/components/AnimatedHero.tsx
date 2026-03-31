import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import MaungaStarCluster from "@/components/MaungaStarCluster";

interface AnimatedHeroProps {
  onScrollToGrid: () => void;
}

const STAT_PILLS = [
  { label: "44 specialist tools" },
  { label: "50+ NZ Acts" },
  { label: "16 industries" },
  { label: "From $89/mo NZD" },
  { label: "Built in Aotearoa" },
];

const AnimatedHero = ({ onScrollToGrid }: AnimatedHeroProps) => {
  const isMobile = useIsMobile();

  return (
    <section className="relative overflow-hidden" style={{ minHeight: isMobile ? "100vh" : "92vh" }}>

      {/* ── Maunga + Star Cluster — background centrepiece ── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 1 }}>
        <MaungaStarCluster size={isMobile ? 500 : 800} showMaunga />
      </div>

      {/* ── Hero content — centred ── */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6" style={{ minHeight: isMobile ? "100vh" : "92vh", paddingBottom: "80px" }}>

        {/* ASSEMBL wordmark — big, glowing, unmissable */}
        <motion.div
          className="flex flex-col items-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Small constellation mark */}
          <motion.svg
            width={isMobile ? 36 : 48}
            height={isMobile ? 36 : 48}
            viewBox="0 0 36 36"
            fill="none"
            className="mb-5"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <defs>
              <radialGradient id="hg" cx="40%" cy="35%" r="50%"><stop offset="0%" stopColor="#fff"/><stop offset="100%" stopColor="#ccc"/></radialGradient>
            </defs>
            <line x1="18" y1="8" x2="8" y2="26" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            <line x1="18" y1="8" x2="28" y2="26" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            <line x1="8" y1="26" x2="28" y2="26" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            <circle cx="18" cy="8" r="3" fill="url(#hg)" opacity="0.9" />
            <circle cx="8" cy="26" r="3" fill="url(#hg)" opacity="0.7" />
            <circle cx="28" cy="26" r="3" fill="url(#hg)" opacity="0.7" />
          </motion.svg>

          {/* ASSEMBL wordmark */}
          <motion.h2
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 300,
              fontSize: isMobile ? "2rem" : "3.5rem",
              letterSpacing: isMobile ? "0.4em" : "0.55em",
              textTransform: "uppercase" as const,
              color: "#FFFFFF",
              lineHeight: 1,
            }}
            animate={{
              textShadow: [
                "0 0 20px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.2), 0 0 120px rgba(255,255,255,0.08)",
                "0 0 40px rgba(255,255,255,0.8), 0 0 100px rgba(255,255,255,0.35), 0 0 180px rgba(255,255,255,0.12)",
                "0 0 20px rgba(255,255,255,0.5), 0 0 60px rgba(255,255,255,0.2), 0 0 120px rgba(255,255,255,0.08)",
              ],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            Assembl
          </motion.h2>

          {/* Tagline */}
          <motion.p
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 300,
              fontSize: "10px",
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              marginTop: "12px",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Business Intelligence · Aotearoa
          </motion.p>
        </motion.div>

        {/* ── Main heading ── */}
        <motion.div
          className="max-w-3xl mx-auto mb-5"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <h1
            className="text-[1.65rem] sm:text-[2.8rem] lg:text-[3.2rem] font-display leading-[1.12] mb-3"
            style={{ fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em" }}
          >
            Your business runs on NZ law.{" "}
            <br className="hidden sm:block" />
            <span
              style={{
                background: "linear-gradient(135deg, #FFFFFF 0%, #D4A843 50%, #3A7D6E 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Your tools should too.
            </span>
          </h1>
        </motion.div>

        {/* Sub copy */}
        <motion.p
          className="text-sm sm:text-[15px] font-body leading-relaxed max-w-[560px] mx-auto mb-7"
          style={{ color: "rgba(255,255,255,0.5)" }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          44 specialist tools trained on New Zealand legislation, built with tikanga Māori at the core. The compliance, operations, and strategy platform Aotearoa's been missing.
        </motion.p>

        {/* Divider */}
        <motion.div
          className="w-full max-w-[200px] mx-auto mb-7"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)" }}
        />

        {/* Stat pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mb-9"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          {STAT_PILLS.map((pill) => (
            <span
              key={pill.label}
              className="stat-pill cursor-default"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.05em",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "10px",
                padding: "6px 14px",
                borderRadius: "9999px",
              }}
            >
              {pill.label}
            </span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <button onClick={onScrollToGrid} className="cta-glass-green inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm">
            Browse all tools <ArrowRight size={16} />
          </button>
          <Link to="/content-hub" className="btn-ghost inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm">
            Explore the platform →
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default AnimatedHero;
