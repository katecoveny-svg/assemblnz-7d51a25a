import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import AgentAvatar from "@/components/AgentAvatar";
import { agents } from "@/data/agents";

const FEATURED_IDS = [
  "hospitality", "construction", "marketing", "operations", "maritime",
  "legal", "it", "customs", "architecture", "health",
];

const featured = agents.filter((a) => FEATURED_IDS.includes(a.id));

const AgentShowcase = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % featured.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const agent = featured[index];

  return (
    <div className="w-full max-w-md mx-auto mt-10 mb-4">
      {/* Pill indicators */}
      <div className="flex justify-center gap-1.5 mb-5">
        {featured.map((a, i) => (
          <button
            key={a.id}
            onClick={() => setIndex(i)}
            className="h-1 rounded-full transition-all duration-300"
            style={{
              width: i === index ? 24 : 8,
              background: i === index ? agent.color : "hsl(var(--muted-foreground) / 0.25)",
            }}
          />
        ))}
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={agent.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <Link
            to={`/chat/${agent.id}`}
            className="group block relative rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-5 overflow-hidden hover:border-primary/30 transition-colors"
          >
            {/* Glow background */}
            <div
              className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl opacity-15 transition-opacity group-hover:opacity-25"
              style={{ background: agent.color }}
            />

            <div className="relative z-10 flex items-center gap-4">
              {/* Avatar with floating animation */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="shrink-0"
              >
                <AgentAvatar agentId={agent.id} color={agent.color} size={72} showGlow />
              </motion.div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-sm font-extrabold tracking-wider"
                    style={{ color: agent.color }}
                  >
                    {agent.name}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground opacity-60">
                    {agent.designation}
                  </span>
                </div>
                <p className="text-xs font-medium text-foreground/90 mb-1">
                  {agent.role}
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  {agent.tagline}
                </p>
              </div>
            </div>

            {/* Expertise pills */}
            <div className="relative z-10 flex flex-wrap gap-1.5 mt-3">
              {agent.expertise.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                  style={{
                    borderColor: `${agent.color}30`,
                    color: agent.color,
                    background: `${agent.color}08`,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* CTA hint */}
            <div
              className="relative z-10 mt-3 text-[10px] font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: agent.color }}
            >
              Chat now →
            </div>
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AgentShowcase;
