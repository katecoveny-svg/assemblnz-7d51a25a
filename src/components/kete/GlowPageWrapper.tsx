import React from "react";

/**
 * Site-wide glow page wrapper that adds the starfield background,
 * ambient halo, and top accent bar to any page.
 */
const GlowPageWrapper: React.FC<{
  children: React.ReactNode;
  accentColor?: string;
  className?: string;
}> = ({ children, accentColor = "#3A7D6E", className = "" }) => {
  const rgb = hexToRgb(accentColor);

  return (
    <div className={`min-h-screen relative ${className}`} style={{ background: "#09090F" }}>
      {/* Starfield */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          backgroundImage:
            "radial-gradient(1.5px 1.5px at 20px 30px, rgba(255,255,255,0.15), transparent)," +
            "radial-gradient(1px 1px at 60px 70px, rgba(255,255,255,0.12), transparent)," +
            "radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.18), transparent)," +
            "radial-gradient(1.5px 1.5px at 90px 10px, rgba(255,255,255,0.1), transparent)," +
            "radial-gradient(1px 1px at 160px 120px, rgba(255,255,255,0.08), transparent)",
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      {/* Ambient halo */}
      <div
        className="absolute top-0 left-0 right-0 h-[400px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% -15%, rgba(${rgb},0.10) 0%, transparent 70%)`,
        }}
      />

      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] z-50"
        style={{
          background: `linear-gradient(90deg, transparent 5%, rgba(240,208,120,0.4) 30%, ${accentColor} 50%, rgba(240,208,120,0.4) 70%, transparent 95%)`,
          boxShadow: `0 0 12px rgba(240,208,120,0.3), 0 0 6px rgba(${rgb},0.25)`,
        }}
      />

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

export default GlowPageWrapper;
