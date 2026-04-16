import { motion } from "framer-motion";
import React from "react";

/**
 * LiquidGlassCard — Neumorphic glass card with raised/inset depth,
 * specular highlights, accent glow, and mouse-following light.
 * Light mode only — pounamu green accent default.
 */
interface Props {
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
  glassIntensity?: "subtle" | "medium" | "strong";
  animate?: boolean;
  delay?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const NEU = {
  subtle: { shadowDark: 0.25, shadowLight: 0.7, inner: 0.5, accent: 0.06 },
  medium: { shadowDark: 0.35, shadowLight: 0.85, inner: 0.6, accent: 0.08 },
  strong: { shadowDark: 0.45, shadowLight: 0.95, inner: 0.7, accent: 0.10 },
};

const ease = [0.16, 1, 0.3, 1] as [number, number, number, number];

const LiquidGlassCard: React.FC<Props> = ({
  children,
  className = "",
  accentColor = "#3A7D6E",
  glassIntensity = "medium",
  animate = true,
  delay = 0,
  onClick,
  style = {},
}) => {
  const n = NEU[glassIntensity];
  const ref = React.useRef<HTMLDivElement>(null);
  const rgb = hexToRgb(accentColor);

  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--lx", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    ref.current.style.setProperty("--ly", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  }, []);

  const inner = (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`rounded-2xl relative overflow-hidden group transition-all duration-400 hover:-translate-y-1 ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{
        background: "#FAFBFC",
        boxShadow: `
          8px 8px 20px rgba(166,166,180,${n.shadowDark}),
          -8px -8px 20px rgba(255,255,255,${n.shadowLight}),
          inset 0 1px 0 rgba(255,255,255,${n.inner})
        `,
        ...style,
      }}
      onClick={onClick}
    >
      {/* Specular highlight — top edge */}
      <div
        className="absolute top-0 left-[8%] right-[8%] h-[1px] opacity-60 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
        }}
      />

      {/* Accent glow on hover — mouse-following */}
      {accentColor && (
        <>
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(350px circle at var(--lx, 50%) var(--ly, 50%), rgba(${rgb},${n.accent}) 0%, transparent 50%)`,
            }}
          />
          {/* Accent glow line top */}
          <div
            className="absolute top-0 left-[12%] right-[12%] h-[2px] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `linear-gradient(90deg, transparent, ${accentColor}60, transparent)`,
              boxShadow: `0 0 16px rgba(${rgb},0.15)`,
            }}
          />
        </>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );

  if (!animate) return inner;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay, ease }}
    >
      {inner}
    </motion.div>
  );
};

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

export default LiquidGlassCard;
