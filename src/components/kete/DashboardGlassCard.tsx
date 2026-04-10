import React from "react";

interface DashboardGlassCardProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  glow?: boolean;
}

/**
 * Shared glass card for all kete dashboards.
 * Matches the LiquidGlassCard / Mārama aesthetic used on the homepage kete cards.
 */
const DashboardGlassCard: React.FC<DashboardGlassCardProps> = ({
  children,
  className = "",
  accentColor,
  glow = false,
}) => {
  const borderColor = accentColor
    ? `rgba(${hexToRgb(accentColor)}, ${glow ? 0.25 : 0.15})`
    : glow
    ? "rgba(212,168,67,0.25)"
    : "rgba(255,255,255,0.06)";

  return (
    <div
      className={`rounded-2xl border backdrop-blur-md ${className}`}
      style={{
        background:
          "linear-gradient(135deg, rgba(15,15,26,0.85), rgba(15,15,26,0.65))",
        borderColor,
        boxShadow: glow
          ? `0 0 30px ${accentColor ? `${accentColor}14` : "rgba(212,168,67,0.08)"}`
          : "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      {children}
    </div>
  );
};

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export default DashboardGlassCard;
