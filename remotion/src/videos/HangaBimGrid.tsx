import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  AbsoluteFill,
  Sequence,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { cosmicGradient, glassCardStyle } from "../shared/styles";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "700", "900"],
  subsets: ["latin"],
});

const KOWHAI = "#D4A843";
const POUNAMU = "#3A7D6E";
const TANGAROA = "#1A3A5C";
const BG_DARK = "#09090F";

const hangaGradient = `radial-gradient(ellipse at 30% 20%, ${TANGAROA}60 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, ${POUNAMU}30 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, ${KOWHAI}10 0%, transparent 70%), linear-gradient(180deg, ${BG_DARK} 0%, #0a0a1a 50%, ${BG_DARK} 100%)`;

const BIM_FEATURES = [
  { label: "Model Register", sub: "IFC 4.0 / RVT / DWG", color: KOWHAI },
  { label: "Clash Detection", sub: "Hard · Soft · Workflow", color: "#EF4444" },
  { label: "4D Sequence", sub: "Gantt + BIM Timeline", color: POUNAMU },
  { label: "Plan → 3D", sub: "Gemini Vision + Meshy", color: KOWHAI },
  { label: "4D Flythrough", sub: "WASD First-Person", color: TANGAROA },
  { label: "Digital Handover", sub: "CCC · BWOF · O&M", color: POUNAMU },
];

/* ── Scene 1: Title Reveal ── */
const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 15, stiffness: 80 } });
  const subOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });
  const lineWidth = interpolate(frame, [10, 50], [0, 400], { extrapolateRight: "clamp" });
  const pulseGlow = interpolate(Math.sin(frame * 0.05), [-1, 1], [20, 50]);

  return (
    <AbsoluteFill
      style={{
        background: hangaGradient,
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Floating stars */}
      {Array.from({ length: 30 }).map((_, i) => {
        const x = ((i * 37) % 100);
        const y = ((i * 53 + 20) % 100);
        const drift = Math.sin(frame * 0.02 + i) * 3;
        const starOp = interpolate(Math.sin(frame * 0.04 + i * 0.5), [-1, 1], [0.05, 0.3]);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: 2,
              height: 2,
              borderRadius: "50%",
              background: KOWHAI,
              opacity: starOp,
              transform: `translateY(${drift}px)`,
            }}
          />
        );
      })}

      {/* Box icon */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: `linear-gradient(135deg, ${KOWHAI}30, ${POUNAMU}30)`,
          border: `2px solid ${KOWHAI}50`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 30,
          transform: `scale(${titleSpring})`,
          boxShadow: `0 0 ${pulseGlow}px ${KOWHAI}40`,
        }}
      >
        <div
          style={{
            width: 35,
            height: 35,
            border: `3px solid ${KOWHAI}`,
            borderRadius: 4,
            transform: "rotate(45deg)",
          }}
        />
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: 72,
          fontWeight: 900,
          color: "#FFFFFF",
          letterSpacing: -2,
          transform: `scale(${titleSpring}) translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
        }}
      >
        HANGA
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 22,
          fontWeight: 400,
          color: `${KOWHAI}`,
          letterSpacing: 6,
          textTransform: "uppercase",
          marginTop: 8,
          opacity: subOpacity,
        }}
      >
        Construction Intelligence
      </div>

      {/* Accent line */}
      <div
        style={{
          width: lineWidth,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${KOWHAI}, transparent)`,
          marginTop: 20,
        }}
      />

      {/* Tagline */}
      <div
        style={{
          fontSize: 16,
          fontWeight: 400,
          color: "rgba(255,255,255,0.4)",
          marginTop: 20,
          opacity: interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" }),
          letterSpacing: 1,
        }}
      >
        BIM · Safety · Consenting · Quality · Resources
      </div>
    </AbsoluteFill>
  );
};

/* ── Scene 2: BIM Feature Grid ── */
const FeatureGridScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background: hangaGradient,
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      {/* Section title */}
      <div
        style={{
          fontSize: 36,
          fontWeight: 700,
          color: KOWHAI,
          marginBottom: 40,
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(frame, [0, 20], [20, 0], { extrapolateRight: "clamp" })}px)`,
        }}
      >
        ATA — BIM Management
      </div>

      {/* 3x2 Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 20,
          width: "100%",
          maxWidth: 900,
        }}
      >
        {BIM_FEATURES.map((feat, i) => {
          const delay = i * 5;
          const cardSpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 15, stiffness: 100 },
          });
          const glow = interpolate(Math.sin(frame * 0.04 + i * 0.8), [-1, 1], [10, 25]);

          return (
            <div
              key={feat.label}
              style={{
                ...glassCardStyle,
                background: `linear-gradient(135deg, rgba(15,15,26,0.85), rgba(15,15,26,0.65))`,
                border: `1px solid ${feat.color}30`,
                boxShadow: `0 0 ${glow}px ${feat.color}20, 0 8px 32px rgba(0,0,0,0.4)`,
                transform: `scale(${cardSpring}) translateY(${interpolate(cardSpring, [0, 1], [30, 0])}px)`,
                opacity: cardSpring,
                textAlign: "center",
                padding: "30px 20px",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: feat.color,
                  margin: "0 auto 16px",
                  boxShadow: `0 0 15px ${feat.color}60`,
                }}
              />
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  marginBottom: 6,
                }}
              >
                {feat.label}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.45)",
                  letterSpacing: 0.5,
                }}
              >
                {feat.sub}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ── Scene 3: 4D Timeline ── */
const TimelineScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phases = [
    { name: "Enabling Works", pct: 100, color: POUNAMU },
    { name: "Foundations", pct: 72, color: KOWHAI },
    { name: "Superstructure", pct: 0, color: "rgba(255,255,255,0.2)" },
    { name: "Envelope", pct: 0, color: "rgba(255,255,255,0.2)" },
    { name: "Services Fit-Out", pct: 0, color: "rgba(255,255,255,0.2)" },
    { name: "Interior Fit-Out", pct: 0, color: "rgba(255,255,255,0.2)" },
    { name: "Handover", pct: 0, color: "rgba(255,255,255,0.2)" },
  ];

  return (
    <AbsoluteFill
      style={{
        background: hangaGradient,
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      <div
        style={{
          fontSize: 30,
          fontWeight: 700,
          color: KOWHAI,
          marginBottom: 50,
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        4D Construction Sequence
      </div>

      <div style={{ width: "100%", maxWidth: 860, display: "flex", flexDirection: "column", gap: 14 }}>
        {phases.map((p, i) => {
          const barDelay = i * 8;
          const barWidth = interpolate(frame - barDelay, [0, 40], [0, Math.max(p.pct, 8)], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const rowOpacity = interpolate(frame - barDelay, [0, 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 16, opacity: rowOpacity }}>
              <div
                style={{
                  width: 180,
                  textAlign: "right",
                  fontSize: 14,
                  color: "rgba(255,255,255,0.5)",
                  flexShrink: 0,
                }}
              >
                {p.name}
              </div>
              <div
                style={{
                  flex: 1,
                  height: 28,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.04)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: `${barWidth}%`,
                    height: "100%",
                    borderRadius: 8,
                    background: p.pct > 0
                      ? `linear-gradient(90deg, ${p.color}80, ${p.color}40)`
                      : "rgba(255,255,255,0.06)",
                    border: `1px solid ${p.color}40`,
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: 10,
                  }}
                >
                  {p.pct > 0 && (
                    <span style={{ fontSize: 10, color: p.color, fontWeight: 700 }}>
                      {p.pct}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today marker label */}
      <div
        style={{
          marginTop: 30,
          fontSize: 12,
          color: KOWHAI,
          opacity: interpolate(frame, [50, 65], [0, 1], { extrapolateRight: "clamp" }),
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        ▲ April 2026 — Current Position
      </div>
    </AbsoluteFill>
  );
};

/* ── Scene 4: Assembl Branding Close ── */
const CloseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({ frame, fps, config: { damping: 12, stiffness: 80 } });
  const pulseGlow = interpolate(Math.sin(frame * 0.06), [-1, 1], [25, 55]);

  return (
    <AbsoluteFill
      style={{
        background: hangaGradient,
        fontFamily,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: 90,
          height: 90,
          borderRadius: 22,
          background: `linear-gradient(135deg, ${KOWHAI}40, ${POUNAMU}40)`,
          border: `2px solid ${KOWHAI}60`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${logoSpring})`,
          boxShadow: `0 0 ${pulseGlow}px ${KOWHAI}30`,
          marginBottom: 30,
        }}
      >
        <div
          style={{
            fontSize: 36,
            fontWeight: 900,
            color: KOWHAI,
          }}
        >
          H
        </div>
      </div>

      <div
        style={{
          fontSize: 48,
          fontWeight: 900,
          color: "#FFFFFF",
          letterSpacing: -1,
          transform: `translateY(${interpolate(logoSpring, [0, 1], [20, 0])}px)`,
          opacity: logoSpring,
        }}
      >
        Built for Aotearoa
      </div>

      <div
        style={{
          fontSize: 16,
          color: "rgba(255,255,255,0.4)",
          marginTop: 16,
          opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" }),
          letterSpacing: 1,
        }}
      >
        assembl.co.nz/hanga
      </div>

      <div
        style={{
          display: "flex",
          gap: 30,
          marginTop: 30,
          opacity: interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        {["Building Act 2004", "H&S at Work 2015", "CCA 2002"].map((law) => (
          <div
            key={law}
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              padding: "6px 14px",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            {law}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ── Main Composition ── */
export const HangaBimGrid: React.FC = () => {
  return (
    <AbsoluteFill>
      <Sequence from={0} durationInFrames={80}>
        <TitleScene />
      </Sequence>
      <Sequence from={80} durationInFrames={90}>
        <FeatureGridScene />
      </Sequence>
      <Sequence from={170} durationInFrames={90}>
        <TimelineScene />
      </Sequence>
      <Sequence from={260} durationInFrames={70}>
        <CloseScene />
      </Sequence>
    </AbsoluteFill>
  );
};
