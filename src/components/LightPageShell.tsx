import React from "react";
import WharikiFoundation from "@/components/whariki/WharikiFoundation";

/**
 * Light-mode page shell — #FAFBFC background, liquid glass glow,
 * animated ambient blobs, no dark sections. Wraps all public pages.
 */
const LightPageShell: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div
    className={`min-h-screen relative overflow-hidden ${className}`}
    style={{ background: "#FAFBFC", color: "#1A1D29" }}
  >
    <WharikiFoundation />

    {/* Liquid glass glow layer */}
    <div className="fixed inset-0 pointer-events-none z-[1]">
      {/* Top-left teal glow orb */}
      <div
        className="absolute animate-pulse"
        style={{
          width: 500,
          height: 500,
          top: "-8%",
          left: "-6%",
          background:
            "radial-gradient(circle, rgba(74,165,168,0.18) 0%, rgba(74,165,168,0.06) 40%, transparent 70%)",
          filter: "blur(80px)",
          animation: "float-glow-1 12s ease-in-out infinite",
        }}
      />
      {/* Mid-right ochre glow orb */}
      <div
        className="absolute"
        style={{
          width: 400,
          height: 400,
          top: "25%",
          right: "-4%",
          background:
            "radial-gradient(circle, rgba(232,169,72,0.14) 0%, rgba(232,169,72,0.04) 40%, transparent 70%)",
          filter: "blur(100px)",
          animation: "float-glow-2 16s ease-in-out infinite",
        }}
      />
      {/* Bottom-center teal glow */}
      <div
        className="absolute"
        style={{
          width: 600,
          height: 600,
          bottom: "-10%",
          left: "20%",
          background:
            "radial-gradient(circle, rgba(74,165,168,0.12) 0%, rgba(74,165,168,0.03) 50%, transparent 70%)",
          filter: "blur(120px)",
          animation: "float-glow-3 20s ease-in-out infinite",
        }}
      />
      {/* Subtle lavender center glow */}
      <div
        className="absolute"
        style={{
          width: 700,
          height: 700,
          top: "40%",
          left: "40%",
          background:
            "radial-gradient(circle, rgba(232,230,240,0.20) 0%, transparent 60%)",
          filter: "blur(140px)",
          animation: "float-glow-4 18s ease-in-out infinite",
        }}
      />
    </div>

    {/* Noise grain overlay */}
    <div
      className="fixed inset-0 pointer-events-none z-[2]"
      style={{
        opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "256px 256px",
      }}
    />

    {/* Top accent bar glow */}
    <div
      className="fixed top-0 left-0 right-0 h-[2px] z-50"
      style={{
        background:
          "linear-gradient(90deg, transparent 5%, rgba(74,165,168,0.3) 30%, #4AA5A8 50%, rgba(74,165,168,0.3) 70%, transparent 95%)",
        boxShadow:
          "0 0 20px rgba(74,165,168,0.2), 0 2px 30px rgba(74,165,168,0.08)",
      }}
    />

    <div className="relative z-10">{children}</div>

    <style>{`
      @keyframes float-glow-1 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(30px, 20px) scale(1.1); }
      }
      @keyframes float-glow-2 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(-20px, 30px) scale(1.05); }
      }
      @keyframes float-glow-3 {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(40px, -20px) scale(1.08); }
      }
      @keyframes float-glow-4 {
        0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
        50% { transform: translate(-30px, 15px) scale(1.12); opacity: 1; }
      }
    `}</style>
  </div>
);

export default LightPageShell;
