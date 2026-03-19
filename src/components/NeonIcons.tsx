// Custom SVG neon icons to replace generic emojis

export const NeonBuilding = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="6" width="18" height="16" rx="2" stroke="hsl(153,100%,50%)" strokeWidth="1.5" strokeOpacity="0.8" fill="hsl(153,100%,50%,0.08)" />
    <rect x="7" y="10" width="3" height="3" rx="0.5" fill="hsl(153,100%,50%)" fillOpacity="0.5" />
    <rect x="14" y="10" width="3" height="3" rx="0.5" fill="hsl(153,100%,50%)" fillOpacity="0.5" />
    <rect x="7" y="16" width="3" height="3" rx="0.5" fill="hsl(153,100%,50%)" fillOpacity="0.5" />
    <rect x="14" y="16" width="3" height="3" rx="0.5" fill="hsl(153,100%,50%)" fillOpacity="0.5" />
    <line x1="12" y1="2" x2="12" y2="6" stroke="hsl(153,100%,50%)" strokeWidth="1.5" strokeOpacity="0.4" />
    <circle cx="12" cy="2" r="1" fill="hsl(153,100%,50%)" opacity="0.8">
      <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export const NeonFamily = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="8" cy="6" r="3" stroke="hsl(280,100%,76%)" strokeWidth="1.5" fill="hsl(280,100%,76%,0.1)" />
    <circle cx="16" cy="6" r="3" stroke="hsl(280,100%,76%)" strokeWidth="1.5" fill="hsl(280,100%,76%,0.1)" />
    <circle cx="12" cy="14" r="2.5" stroke="hsl(326,100%,59%)" strokeWidth="1.5" fill="hsl(326,100%,59%,0.1)" />
    <path d="M4 20c0-2.2 1.8-4 4-4M20 20c0-2.2-1.8-4-4-4" stroke="hsl(280,100%,76%)" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
    <path d="M8.5 20c0-1.9 1.6-3.5 3.5-3.5s3.5 1.6 3.5 3.5" stroke="hsl(326,100%,59%)" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
  </svg>
);

export const NeonHammer = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 18L14 10" stroke="hsl(20,100%,60%)" strokeWidth="2" strokeLinecap="round" />
    <rect x="12" y="4" width="8" height="6" rx="1.5" transform="rotate(15 16 7)" stroke="hsl(20,100%,60%)" strokeWidth="1.5" fill="hsl(20,100%,60%,0.15)" />
    <circle cx="6" cy="18" r="1.5" fill="hsl(20,100%,60%)" opacity="0.6">
      <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export const NeonSeedling = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 22V12" stroke="hsl(153,100%,50%)" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 12C12 8 16 6 18 4C18 8 16 10 12 12Z" fill="hsl(153,100%,50%,0.15)" stroke="hsl(153,100%,50%)" strokeWidth="1.5" />
    <path d="M12 15C12 11 8 9 6 7C6 11 8 13 12 15Z" fill="hsl(153,100%,50%,0.1)" stroke="hsl(153,100%,50%)" strokeWidth="1.5" strokeOpacity="0.6" />
    <circle cx="12" cy="22" r="1" fill="hsl(153,100%,50%)" opacity="0.5" />
  </svg>
);

export const NeonClipboard = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="5" y="4" width="14" height="18" rx="2" stroke="hsl(189,100%,50%)" strokeWidth="1.5" fill="hsl(189,100%,50%,0.06)" />
    <rect x="8" y="2" width="8" height="4" rx="1" stroke="hsl(189,100%,50%)" strokeWidth="1.5" fill="hsl(var(--background))" />
    <line x1="8" y1="10" x2="16" y2="10" stroke="hsl(189,100%,50%)" strokeWidth="1" strokeOpacity="0.5" />
    <line x1="8" y1="13" x2="14" y2="13" stroke="hsl(189,100%,50%)" strokeWidth="1" strokeOpacity="0.4" />
    <line x1="8" y1="16" x2="12" y2="16" stroke="hsl(189,100%,50%)" strokeWidth="1" strokeOpacity="0.3" />
  </svg>
);

export const NeonDocument = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 4h8l4 4v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" stroke="hsl(224,100%,68%)" strokeWidth="1.5" fill="hsl(224,100%,68%,0.06)" />
    <path d="M14 4v4h4" stroke="hsl(224,100%,68%)" strokeWidth="1.5" strokeOpacity="0.6" />
    <line x1="8" y1="12" x2="14" y2="12" stroke="hsl(224,100%,68%)" strokeWidth="1" strokeOpacity="0.5" />
    <line x1="8" y1="15" x2="12" y2="15" stroke="hsl(224,100%,68%)" strokeWidth="1" strokeOpacity="0.4" />
  </svg>
);

export const NeonMegaphone = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M18 4L8 8H4v6h4l10 4V4z" stroke="hsl(326,100%,59%)" strokeWidth="1.5" fill="hsl(326,100%,59%,0.1)" />
    <path d="M20 9v4" stroke="hsl(326,100%,59%)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.6" />
    <circle cx="20" cy="7" r="1" fill="hsl(326,100%,59%)" opacity="0.5">
      <animate attributeName="opacity" values="0.5;0.2;0.5" dur="1.5s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export const NeonTeam = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="9" cy="7" r="3" stroke="hsl(153,100%,50%)" strokeWidth="1.5" fill="hsl(153,100%,50%,0.08)" />
    <circle cx="17" cy="9" r="2.5" stroke="hsl(189,100%,50%)" strokeWidth="1.5" fill="hsl(189,100%,50%,0.08)" />
    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="hsl(153,100%,50%)" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" />
    <path d="M15 20c0-2.2 1.8-4 4-4" stroke="hsl(189,100%,50%)" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round" />
  </svg>
);

export const NeonCoin = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="hsl(43,100%,50%)" strokeWidth="1.5" fill="hsl(43,100%,50%,0.08)" />
    <text x="12" y="16" textAnchor="middle" fill="hsl(43,100%,50%)" fontSize="10" fontFamily="JetBrains Mono, monospace" fontWeight="700" opacity="0.8">$</text>
    <circle cx="12" cy="12" r="9" stroke="hsl(43,100%,50%)" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="2 3">
      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="20s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export const NeonFactory = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="12" width="20" height="10" rx="1" stroke="hsl(20,100%,60%)" strokeWidth="1.5" fill="hsl(20,100%,60%,0.06)" />
    <path d="M6 12V6l4 3V6l4 3V6l4 3v3" stroke="hsl(20,100%,60%)" strokeWidth="1.5" strokeOpacity="0.7" />
    <rect x="5" y="16" width="3" height="3" rx="0.5" fill="hsl(20,100%,60%)" fillOpacity="0.3" />
    <rect x="10" y="16" width="3" height="3" rx="0.5" fill="hsl(20,100%,60%)" fillOpacity="0.3" />
    <circle cx="18" cy="4" r="1" fill="hsl(20,100%,60%)" opacity="0.4">
      <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite" />
    </circle>
    <line x1="18" y1="5" x2="18" y2="9" stroke="hsl(20,100%,60%)" strokeWidth="1" strokeOpacity="0.3" />
  </svg>
);

export const NeonWave = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M2 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0" stroke="hsl(153,100%,50%)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <path d="M2 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke="hsl(153,100%,50%)" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.4" fill="none" />
    <circle cx="12" cy="6" r="2" fill="hsl(153,100%,50%)" fillOpacity="0.2" stroke="hsl(153,100%,50%)" strokeWidth="1" />
  </svg>
);

export const NeonLock = ({ size = 16, color = "hsl(var(--muted-foreground))" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <rect x="3" y="7" width="10" height="7" rx="1.5" stroke={color} strokeWidth="1.2" fill="none" />
    <path d="M5 7V5a3 3 0 016 0v2" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" />
    <circle cx="8" cy="11" r="1" fill={color} />
  </svg>
);
