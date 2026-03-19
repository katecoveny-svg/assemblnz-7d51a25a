const AssemblLogo = ({ size = 36 }: { size?: number }) => {
  const color = "#00FF88";
  const pink = "#FF2D9B";
  const cyan = "#00E5FF";

  return (
    <div
      className="inline-flex items-center justify-center shrink-0 relative"
      style={{
        width: size + 10,
        height: size + 10,
        background: 'rgba(14, 14, 26, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(0, 255, 136, 0.15)',
        borderRadius: 12,
        boxShadow: '0 0 20px rgba(0, 255, 136, 0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
        <defs>
          <filter id="logoGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Antenna */}
        <line x1="24" y1="4" x2="24" y2="10" stroke={color} strokeWidth="1.5" opacity="0.5" />
        <circle cx="24" cy="3" r="2" fill={color} opacity="0.8" filter="url(#logoGlow)">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Head — rounded rect */}
        <rect x="10" y="10" width="28" height="20" rx="6" fill="#0E0E1A" stroke={color} strokeWidth="1.5" opacity="0.5" />

        {/* Eyes — green left, pink right */}
        <circle cx="18" cy="20" r="3" fill={color} opacity="0.9" filter="url(#logoGlow)">
          <animate attributeName="opacity" values="0.9;0.4;0.9" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="30" cy="20" r="3" fill={pink} opacity="0.9" filter="url(#logoGlow)">
          <animate attributeName="opacity" values="0.9;0.4;0.9" dur="3s" repeatCount="indefinite" begin="0.3s" />
        </circle>

        {/* Smile */}
        <path d="M20 25 Q24 28 28 25" stroke={cyan} strokeWidth="1" fill="none" opacity="0.35" />

        {/* Body */}
        <rect x="14" y="32" width="20" height="12" rx="4" fill="#0E0E1A" stroke={color} strokeWidth="1.2" opacity="0.35" />

        {/* AI Badge */}
        <rect x="19" y="34" width="10" height="8" rx="2" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="0.8" opacity="0.5" />
        <text x="24" y="40" textAnchor="middle" fill={color} fontSize="5" fontFamily="JetBrains Mono, monospace" fontWeight="600" opacity="0.7">AI</text>
      </svg>
    </div>
  );
};

export default AssemblLogo;
