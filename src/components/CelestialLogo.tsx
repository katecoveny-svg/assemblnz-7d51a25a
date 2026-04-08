import { motion } from "framer-motion";

/**
 * Constellation mark — Electric Blue + Aurora Green data nodes
 * with liquid glass halos and sparkle dust.
 */
const CelestialLogo = ({ size = 36 }: { size?: number }) => {
  const s = size;
  return (
    <motion.div style={{ width: s, height: s, flexShrink: 0 }}>
      <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
        <defs>
          <radialGradient id="nav-electric" cx="40%" cy="32%" r="50%">
            <stop offset="0%" stopColor="#66E0FF" />
            <stop offset="45%" stopColor="#00CFFF" />
            <stop offset="100%" stopColor="#006B80" />
          </radialGradient>
          <radialGradient id="nav-aurora" cx="40%" cy="35%" r="50%">
            <stop offset="0%" stopColor="#66FFBF" />
            <stop offset="50%" stopColor="#00FF9C" />
            <stop offset="100%" stopColor="#00804E" />
          </radialGradient>
          <radialGradient id="nav-ocean" cx="40%" cy="35%" r="50%">
            <stop offset="0%" stopColor="#3DB8CC" />
            <stop offset="50%" stopColor="#1B5E6B" />
            <stop offset="100%" stopColor="#0D3038" />
          </radialGradient>
          <radialGradient id="nav-hi" cx="38%" cy="28%" r="30%">
            <stop offset="0%" stopColor="white" stopOpacity="0.8" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nav-halo-e" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00CFFF" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#00CFFF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#00CFFF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nav-halo-a" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00FF9C" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#00FF9C" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#00FF9C" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Connection lines */}
        <motion.line x1="24" y1="10" x2="10" y2="34" stroke="#00CFFF" strokeWidth="0.6"
          animate={{ strokeOpacity: [0.12, 0.25, 0.12] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.line x1="24" y1="10" x2="38" y2="34" stroke="#00CFFF" strokeWidth="0.6"
          animate={{ strokeOpacity: [0.12, 0.25, 0.12] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        <motion.line x1="10" y1="34" x2="38" y2="34" stroke="#00FF9C" strokeWidth="0.6"
          animate={{ strokeOpacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        />

        {/* Halos */}
        <motion.circle cx="24" cy="10" r="10" fill="url(#nav-halo-e)"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle cx="10" cy="34" r="9" fill="url(#nav-halo-a)"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <motion.circle cx="38" cy="34" r="9" fill="url(#nav-halo-e)"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Orbs — data nodes */}
        <circle cx="24" cy="10" r="4.5" fill="url(#nav-electric)" />
        <circle cx="24" cy="10" r="4.5" fill="url(#nav-hi)" />
        <circle cx="10" cy="34" r="4.5" fill="url(#nav-aurora)" />
        <circle cx="10" cy="34" r="4.5" fill="url(#nav-hi)" />
        <circle cx="38" cy="34" r="4.5" fill="url(#nav-ocean)" />
        <circle cx="38" cy="34" r="4.5" fill="url(#nav-hi)" />

        {/* Sparkle dust */}
        {[
          { cx: 17, cy: 7, d: 0 }, { cx: 31, cy: 7, d: 0.5 },
          { cx: 6, cy: 28, d: 1.0 }, { cx: 42, cy: 28, d: 1.5 },
          { cx: 24, cy: 22, d: 0.3 }, { cx: 16, cy: 38, d: 0.8 },
          { cx: 32, cy: 38, d: 1.3 }, { cx: 24, cy: 42, d: 0.6 },
        ].map((dot, i) => (
          <motion.circle
            key={i}
            cx={dot.cx} cy={dot.cy} r="0.5"
            fill="#00CFFF"
            animate={{ opacity: [0, 0.9, 0] }}
            transition={{ duration: 1.6 + (i % 3) * 0.5, repeat: Infinity, ease: "easeInOut", delay: dot.d }}
          />
        ))}
      </svg>
    </motion.div>
  );
};

export default CelestialLogo;
