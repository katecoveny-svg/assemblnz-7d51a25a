import { motion } from "framer-motion";
import RobotIcon from "@/components/RobotIcon";

// Import AI-generated avatars
import auraImg from "@/assets/agents/aura.png";
import apexImg from "@/assets/agents/apex.png";
import prismImg from "@/assets/agents/prism.png";
import helmImg from "@/assets/agents/helm.png";
import marinerImg from "@/assets/agents/mariner.png";
import anchorImg from "@/assets/agents/anchor.png";
import signalImg from "@/assets/agents/signal.png";
import tikaImg from "@/assets/agents/tika.png";

const AVATAR_MAP: Record<string, string> = {
  hospitality: auraImg,
  construction: apexImg,
  marketing: prismImg,
  operations: helmImg,
  maritime: marinerImg,
  legal: anchorImg,
  it: signalImg,
  tiriti: tikaImg,
};

interface AgentAvatarProps {
  agentId: string;
  color: string;
  size?: number;
  showGlow?: boolean;
}

const AgentAvatar = ({ agentId, color, size = 40, showGlow = true }: AgentAvatarProps) => {
  const avatarSrc = AVATAR_MAP[agentId];

  if (avatarSrc) {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        {showGlow && (
          <div
            className="absolute inset-0 rounded-full blur-md opacity-40"
            style={{ background: color }}
          />
        )}
        <img
          src={avatarSrc}
          alt=""
          className="relative w-full h-full object-cover rounded-lg"
          style={{
            filter: `drop-shadow(0 0 6px ${color}60)`,
          }}
          loading="lazy"
        />
      </div>
    );
  }

  return <RobotIcon color={color} size={size} agentId={agentId} />;
};

export default AgentAvatar;
