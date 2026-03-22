import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FILTER_AGENTS, OUTPUT_CARDS, type OutputCard } from "@/data/contentHubData";
import { PREVIEW_MAP } from "./MiniPreviews";

const FORMAT_COLORS: Record<string, string> = {
  Calculator: "#00FF88",
  Report: "#00E5FF",
  Document: "#B388FF",
  Template: "#FFB800",
  "Social Post": "#E040FB",
  Dashboard: "#00E5FF",
  Email: "#4FC3F7",
  "Legal Doc": "#7E57C2",
};

const OutputCardComponent = ({ card }: { card: OutputCard }) => {
  const [expanded, setExpanded] = useState(false);
  const PreviewComponent = PREVIEW_MAP[card.id];

  return (
    <div
      className="rounded-xl overflow-hidden break-inside-avoid mb-4"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="h-1" style={{ background: `${card.agentColor}30` }} />
      <div className="p-5 space-y-3">
        {/* Agent badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: card.agentColor }} />
          <span className="font-mono-jb text-[10px] tracking-wide" style={{ color: `${card.agentColor}80` }}>
            {card.agentName} · {card.agentCode}
          </span>
          <span
            className="text-[9px] font-mono-jb px-2 py-0.5 rounded-full"
            style={{
              background: `${FORMAT_COLORS[card.formatBadge] || "#ffffff"}15`,
              color: FORMAT_COLORS[card.formatBadge] || "#ffffff",
              border: `1px solid ${FORMAT_COLORS[card.formatBadge] || "#ffffff"}25`,
            }}
          >
            {card.formatBadge}
          </span>
        </div>

        {/* Output type */}
        <h3 className="font-syne font-bold text-sm" style={{ color: "hsl(var(--foreground))" }}>
          {card.outputType}
        </h3>

        {/* Live preview OR text fallback */}
        {PreviewComponent && !expanded ? (
          <div
            className="rounded-lg p-3"
            style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <PreviewComponent />
          </div>
        ) : (
          <div
            className="font-jakarta text-xs leading-relaxed whitespace-pre-line"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            {expanded ? card.fullContent : card.preview}
          </div>
        )}

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-jakarta transition-colors"
            style={{ color: card.agentColor }}
          >
            {expanded ? (
              <>Collapse <ChevronUp size={12} /></>
            ) : (
              <>{PreviewComponent ? "See raw output" : "See full output"} <ChevronDown size={12} /></>
            )}
          </button>
          <Link
            to={`/chat/${card.agentId}`}
            className="inline-flex items-center gap-1.5 text-xs font-jakarta font-semibold px-3 py-1.5 rounded-md transition-all"
            style={{
              background: `${card.agentColor}15`,
              color: card.agentColor,
              border: `1px solid ${card.agentColor}30`,
            }}
          >
            Try {card.agentName} →
          </Link>
        </div>
      </div>
    </div>
  );
};

const ContentHubCatalogue = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = activeFilter === "All"
    ? OUTPUT_CARDS
    : OUTPUT_CARDS.filter((c) => c.agentName === activeFilter);

  return (
    <section className="px-4 sm:px-8 py-12 max-w-6xl mx-auto">
      <h2
        className="font-syne font-extrabold text-2xl sm:text-3xl text-center mb-8 halo-heading"
        style={{ color: "hsl(var(--foreground))" }}
      >
        Full output catalogue
      </h2>

      {/* Sticky filter bar */}
      <div
        className="sticky top-0 z-40 py-3 -mx-4 px-4 sm:-mx-8 sm:px-8 border-b mb-8"
        style={{
          background: "rgba(9,9,15,0.92)",
          backdropFilter: "blur(16px)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTER_AGENTS.map((agent) => {
            const active = activeFilter === agent.name;
            return (
              <button
                key={agent.name}
                onClick={() => setActiveFilter(agent.name)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-jakarta font-medium transition-all"
                style={{
                  background: active ? `${agent.color}15` : "transparent",
                  color: active ? agent.color : "rgba(255,255,255,0.4)",
                  border: active ? `1px solid ${agent.color}30` : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {agent.name !== "All" && (
                  <span className="w-2 h-2 rounded-full" style={{ background: agent.color }} />
                )}
                {agent.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Masonry grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
        {filtered.map((card) => (
          <OutputCardComponent key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
};

export default ContentHubCatalogue;
