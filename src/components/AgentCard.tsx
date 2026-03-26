import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Mic, ChevronRight } from "lucide-react";
import AgentAvatar from "@/components/AgentAvatar";
import { getElevenLabsAgentId } from "@/data/elevenLabsAgents";
import { agentCapabilities } from "@/data/agentCapabilities";
import type { Agent } from "@/data/agents";

interface AgentCardProps {
  agent: Agent;
  index: number;
}

const AgentCard = ({ agent, index }: AgentCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [3, -3]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-3, 3]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const caps = agentCapabilities[agent.id];
  const bullets = caps ? caps.slice(0, 3).map(c => c.bullet) : agent.expertise.slice(0, 3);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.04 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className="relative"
    >
      <Link
        to={`/chat/${agent.id}`}
        className="group relative block rounded-2xl p-5 transition-all duration-300 overflow-hidden border border-border hover:border-foreground/10"
        style={{
          background: 'hsl(225 20% 7% / 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Premium top edge glow on hover */}
        <span
          className="absolute top-0 left-[15%] right-[15%] h-px opacity-0 group-hover:opacity-40 transition-opacity duration-500"
          style={{ background: `linear-gradient(90deg, transparent, ${agent.color}60, transparent)` }}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <AgentAvatar agentId={agent.id} color={agent.color} size={40} />
            <div className="flex items-center gap-1.5">
              {getElevenLabsAgentId(agent.id) && (
                <span
                  className="flex items-center gap-1 text-[9px] font-mono-jb px-1.5 py-0.5 rounded-full"
                  style={{ background: `${agent.color}15`, color: agent.color, border: `1px solid ${agent.color}25` }}
                >
                  <Mic size={8} /> VOICE
                </span>
              )}
              <span className="font-mono-jb text-[10px] text-muted-foreground">{agent.designation}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-base font-syne font-bold tracking-wide text-foreground">{agent.name}</h3>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: agent.color, opacity: 0.5 }} />
          </div>
          <p className="text-xs font-jakarta font-medium mb-2 text-muted-foreground">{agent.role}</p>

          {/* Capability bullets */}
          <ul className="space-y-1.5 mb-3">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-[11px] font-jakarta text-foreground/70">
                <ChevronRight size={10} className="mt-[3px] shrink-0" style={{ color: agent.color }} />
                {b}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 text-xs font-jakarta font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agent.color, opacity: 0.5 }} />
            Chat now →
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default AgentCard;
