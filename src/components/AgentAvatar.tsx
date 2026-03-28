import heroImg from "@/assets/agents/hero-orb-robot.png";

interface AgentAvatarProps {
  agentId: string;
  color: string;
  size?: number;
  showGlow?: boolean;
  eager?: boolean;
}

const AgentAvatar = ({ agentId, color, size = 40, showGlow = true, eager = false }: AgentAvatarProps) => {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer glow in agent brand colour */}
      {showGlow && (
        <div
          className="absolute inset-[-6px] rounded-full blur-xl opacity-40"
          style={{ background: color }}
        />
      )}

      {/* Robot container */}
      <div
        className="relative rounded-xl overflow-hidden flex items-center justify-center"
        style={{
          width: size,
          height: size,
          background: "#09090F",
          border: `1.5px solid ${color}40`,
          boxShadow: `0 0 12px ${color}30, 0 0 24px ${color}15`,
        }}
      >
        {/* Hero robot image — same for every agent */}
        <img
          src={heroImg}
          alt={`${agentId} agent`}
          className="w-full h-full object-contain"
          style={{
            filter: `drop-shadow(0 0 6px ${color}90) drop-shadow(0 0 14px ${color}50)`,
          }}
          loading={eager ? "eager" : "lazy"}
          decoding={eager ? "sync" : "async"}
          fetchPriority={eager ? "high" : undefined}
        />

        {/* Colour overlay for eye/chest glow tint */}
        <div
          className="absolute inset-0 mix-blend-color pointer-events-none"
          style={{ background: color, opacity: 0.25 }}
        />

        {/* Nexus triangle chest glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: size * 0.3,
            height: size * 0.3,
            bottom: "18%",
            left: "50%",
            transform: "translateX(-50%)",
            background: `radial-gradient(circle, ${color}40, transparent 70%)`,
            filter: "blur(4px)",
          }}
        />
      </div>
    </div>
  );
};

export default AgentAvatar;
