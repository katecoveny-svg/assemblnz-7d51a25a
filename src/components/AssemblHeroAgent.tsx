import { motion } from "framer-motion";

const AssemblHeroAgent = ({ size = 200 }: { size?: number }) => {
  const green = "#00FF88";
  const pink = "#FF2D9B";
  const cyan = "#00E5FF";
  const purple = "#B388FF";

  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Outer glow halo */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size * 0.85,
          height: size * 0.85,
          background: `radial-gradient(circle, ${green}15, ${cyan}08, transparent 70%)`,
          filter: 'blur(20px)',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Orbiting particles */}
      {[0, 120, 240].map((deg, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 4,
            height: 4,
            background: [green, pink, cyan][i],
            boxShadow: `0 0 8px ${[green, pink, cyan][i]}`,
          }}
          animate={{
            rotate: [deg, deg + 360],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          // Position on orbit
        >
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 4,
              height: 4,
              background: [green, pink, cyan][i],
              boxShadow: `0 0 8px ${[green, pink, cyan][i]}`,
              top: -(size * 0.38),
              left: 0,
            }}
          />
        </motion.div>
      ))}

      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 64 64" fill="none">
        <defs>
          <filter id="heroGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="heroGlowStrong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="heroBodyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={green} stopOpacity="0.15" />
            <stop offset="100%" stopColor={cyan} stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Antenna */}
        <line x1="32" y1="6" x2="32" y2="12" stroke={green} strokeWidth="1.5" opacity="0.5" />
        <motion.circle cx="32" cy="5" r="2.5" fill={green} filter="url(#heroGlowStrong)">
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
        </motion.circle>
        {/* Antenna sparkle */}
        <g opacity="0.6">
          <animate attributeName="opacity" values="0;0.8;0" dur="2.5s" repeatCount="indefinite" />
          <line x1="32" y1="2" x2="32" y2="0.5" stroke={green} strokeWidth="0.6" strokeLinecap="round" />
          <line x1="34" y1="3.5" x2="35.5" y2="2.5" stroke={green} strokeWidth="0.6" strokeLinecap="round" />
          <line x1="30" y1="3.5" x2="28.5" y2="2.5" stroke={green} strokeWidth="0.6" strokeLinecap="round" />
        </g>

        {/* Head */}
        <rect x="14" y="12" width="36" height="24" rx="8" fill="#0E0E1A" stroke={green} strokeWidth="1.5" opacity="0.6" />
        {/* Head inner glow */}
        <rect x="14" y="12" width="36" height="24" rx="8" fill="url(#heroBodyGrad)" />

        {/* Left eye */}
        <circle cx="24" cy="24" r="4" fill={green} filter="url(#heroGlow)">
          <animate attributeName="opacity" values="0.95;0.4;0.95" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="23" cy="23" r="1.2" fill="white" opacity="0.5" />

        {/* Right eye */}
        <circle cx="40" cy="24" r="4" fill={pink} filter="url(#heroGlow)">
          <animate attributeName="opacity" values="0.95;0.4;0.95" dur="3s" repeatCount="indefinite" begin="0.3s" />
        </circle>
        <circle cx="39" cy="23" r="1.2" fill="white" opacity="0.5" />

        {/* Smile */}
        <path d="M26 30 Q32 34 38 30" stroke={cyan} strokeWidth="1.2" fill="none" opacity="0.4" />

        {/* Ears / side nodes */}
        <circle cx="12" cy="24" r="2" fill={cyan} opacity="0.4" filter="url(#heroGlow)">
          <animate attributeName="opacity" values="0.4;0.15;0.4" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="52" cy="24" r="2" fill={purple} opacity="0.4" filter="url(#heroGlow)">
          <animate attributeName="opacity" values="0.4;0.15;0.4" dur="2.5s" repeatCount="indefinite" begin="0.5s" />
        </circle>

        {/* Body */}
        <rect x="18" y="38" width="28" height="16" rx="5" fill="#0E0E1A" stroke={green} strokeWidth="1.2" opacity="0.4" />
        <rect x="18" y="38" width="28" height="16" rx="5" fill="url(#heroBodyGrad)" />

        {/* Hexagonal AI badge */}
        <polygon
          points="32,40 37,42.5 37,47.5 32,50 27,47.5 27,42.5"
          fill={green}
          fillOpacity="0.12"
          stroke={green}
          strokeWidth="0.8"
          opacity="0.7"
        />
        <text x="32" y="47" textAnchor="middle" fill={green} fontSize="5" fontFamily="JetBrains Mono, monospace" fontWeight="700" opacity="0.85">AI</text>

        {/* Shoulder dots */}
        <circle cx="16" cy="42" r="1.5" fill={green} opacity="0.3" />
        <circle cx="48" cy="42" r="1.5" fill={pink} opacity="0.3" />
      </svg>
    </motion.div>
  );
};

export default AssemblHeroAgent;
