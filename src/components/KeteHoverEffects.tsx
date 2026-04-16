import { motion } from "framer-motion";

const reducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** MANAAKI — soft coral steam rising */
export function ManaakiHoverEffect() {
  if (reducedMotion) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms]">
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="absolute bottom-0 rounded-full"
          style={{
            width: 40 + i * 20, height: 60 + i * 30,
            left: `${25 + i * 20}%`,
            background: `radial-gradient(ellipse, rgba(232,140,120,${0.12 - i * 0.03}) 0%, transparent 70%)`,
            filter: "blur(8px)",
          }}
          animate={{ y: [0, -40 - i * 15, -80], opacity: [0, 0.8, 0] }}
          transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, ease: "easeOut", delay: i * 0.4 }}
        />
      ))}
    </div>
  );
}

/** WAIHANGA — ochre construction grid pattern */
export function WaihangaHoverEffect() {
  if (reducedMotion) return null;
  return (
    <div className="absolute inset-0 pointer-events-none rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(232,169,72,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(232,169,72,0.06) 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px",
      }}
    />
  );
}

/** AUAHA — kōwhaiwhai-inspired line drawing around edge */
export function AuahaHoverEffect() {
  if (reducedMotion) return null;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms]" viewBox="0 0 400 200" preserveAspectRatio="none">
      <motion.path
        d="M 20 10 Q 100 0, 200 10 T 380 10 L 390 100 Q 400 150, 380 190 L 200 195 Q 100 200, 20 190 L 10 100 Q 0 50, 20 10"
        fill="none" stroke="rgba(155,142,196,0.2)" strokeWidth="1.5"
        initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1] }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
    </svg>
  );
}

/** ARATAKI — dashed road lane markings */
export function AratakiHoverEffect() {
  if (reducedMotion) return null;
  return (
    <div className="absolute inset-0 pointer-events-none rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] overflow-hidden">
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="absolute h-[2px]"
          style={{
            top: `${30 + i * 20}%`,
            left: 0, right: 0,
            background: `repeating-linear-gradient(90deg, rgba(74,165,168,${0.15 - i * 0.03}) 0, rgba(74,165,168,${0.15 - i * 0.03}) 16px, transparent 16px, transparent 28px)`,
          }}
          animate={{ x: [-200, 0] }}
          transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

/** PIKAU — shipping route dotted curve */
export function PikauHoverEffect() {
  if (reducedMotion) return null;
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms]" viewBox="0 0 400 200" preserveAspectRatio="none">
      <motion.path
        d="M 30 160 Q 120 40, 200 100 T 370 60"
        fill="none" stroke="rgba(108,191,193,0.25)" strokeWidth="2" strokeDasharray="6 8"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      <motion.circle cx="30" cy="160" r="3" fill="rgba(108,191,193,0.4)"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} />
      <motion.circle cx="370" cy="60" r="3" fill="rgba(108,191,193,0.4)"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} />
    </svg>
  );
}

/** Map kete slug to hover effect */
export function KeteHoverEffect({ kete }: { kete: string }) {
  const slug = kete.toLowerCase();
  switch (slug) {
    case "manaaki": return <ManaakiHoverEffect />;
    case "waihanga": return <WaihangaHoverEffect />;
    case "auaha": return <AuahaHoverEffect />;
    case "arataki": return <AratakiHoverEffect />;
    case "pikau": return <PikauHoverEffect />;
    default: return null;
  }
}
