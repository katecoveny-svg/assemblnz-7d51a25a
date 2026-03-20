import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import AgentAvatar from "@/components/AgentAvatar";
import type { Agent } from "@/data/agents";

interface AgentCardProps {
  agent: Agent;
  index: number;
}

const AgentCard = ({ agent, index }: AgentCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [4, -4]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-4, 4]), { stiffness: 300, damping: 30 });

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
        className="group relative block rounded-2xl p-5 transition-all duration-300 overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
        }}
      >
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <AgentAvatar agentId={agent.id} color={agent.color} size={40} />
            <span className="font-mono-jb text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{agent.designation}</span>
          </div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-base font-syne font-bold tracking-wide" style={{ color: '#E4E4EC' }}>{agent.name}</h3>
            {/* Tiny agent colour dot */}
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: agent.color, opacity: 0.6 }} />
          </div>
          <p className="text-xs font-jakarta font-medium mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{agent.role}</p>
          <p className="text-xs font-jakarta italic mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>"{agent.tagline}"</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {agent.traits.map(t => (
              <span key={t} className="text-[10px] font-jakarta px-2 py-0.5 rounded-full transition-colors duration-300" style={{ border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                {t}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-1 mb-4">
            {agent.expertise.map(e => (
              <span key={e} className="font-mono-jb text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.3)' }}>{e}</span>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs font-jakarta font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agent.color, opacity: 0.5 }} />
            Chat now →
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default AgentCard;