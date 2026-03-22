import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import outputEcho from "@/assets/output-echo-content.png";
import outputFlux from "@/assets/output-flux-pipeline.png";
import outputHaven from "@/assets/output-haven-compliance.png";
import outputForge from "@/assets/output-forge-fi.png";
import outputAroha from "@/assets/output-aroha-calculator.png";
import outputPrism from "@/assets/output-prism-campaign.png";

const FEATURED = [
  { image: outputEcho, name: "ECHO", color: "#E4A0FF", id: "echo", title: "Content Command Centre", desc: "Daily content queue, DM drafts, and performance analytics — all running on autopilot" },
  { image: outputFlux, name: "FLUX", color: "#00E5FF", id: "sales", title: "Sales Pipeline Dashboard", desc: "AI-scored leads, deal health alerts, and revenue forecasting for NZ businesses" },
  { image: outputHaven, name: "HAVEN", color: "#FF80AB", id: "property", title: "Healthy Homes Compliance Report", desc: "Instant property compliance check with pass/fail scoring and tradie assignment" },
  { image: outputForge, name: "FORGE", color: "#FF4D6A", id: "automotive", title: "F&I Payment Comparison", desc: "3-lender comparison with CCCFA-compliant disclosure generated in seconds" },
  { image: outputAroha, name: "AROHA", color: "#FF6F91", id: "hr", title: "Employment Cost Calculator", desc: "True employer cost breakdown showing the 19.6% gap most employers don't know about" },
  { image: outputPrism, name: "PRISM", color: "#E040FB", id: "marketing", title: "Campaign Generator", desc: "One brief generates email, LinkedIn, Instagram, Reel script, blog outline, and ad copy" },
];

const ContentHubShowcase = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => {
        const next = (prev + 1) % FEATURED.length;
        scrollRef.current?.children[next]?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = container.children[0]?.clientWidth || 1;
    const gap = 24;
    const idx = Math.round(scrollLeft / (cardWidth + gap));
    setActiveIdx(Math.min(idx, FEATURED.length - 1));
  };

  const scrollTo = (idx: number) => {
    setActiveIdx(idx);
    scrollRef.current?.children[idx]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  return (
    <section className="pb-12">
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto px-4 sm:px-8 snap-x snap-mandatory scrollbar-hide"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onScroll={handleScroll}
      >
        {FEATURED.map((item, i) => (
          <div
            key={i}
            className="snap-center shrink-0 w-[85vw] sm:w-[600px] lg:w-[800px] rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "2px solid rgba(255,255,255,0.06)",
              boxShadow: `0 0 60px -20px ${item.color}15`,
            }}
          >
            <img
              src={item.image}
              alt={`${item.name} ${item.title}`}
              className="w-full aspect-[16/10] object-cover"
              loading="lazy"
            />
            <div className="p-5 space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: item.color }}
                />
                <span
                  className="font-syne font-bold text-sm"
                  style={{ color: item.color }}
                >
                  {item.name}
                </span>
                <span className="font-jakarta text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                  · {item.title}
                </span>
              </div>
              <p className="font-jakarta text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {item.desc}
              </p>
              <Link
                to={`/chat/${item.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-jakarta font-semibold px-4 py-2 rounded-lg transition-all mt-1"
                style={{
                  background: `${item.color}15`,
                  color: item.color,
                  border: `1px solid ${item.color}30`,
                }}
              >
                Try {item.name} →
              </Link>
            </div>
          </div>
        ))}
      </div>
      {/* Navigation dots */}
      <div className="flex justify-center gap-2 mt-6">
        {FEATURED.map((item, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: i === activeIdx ? item.color : "rgba(255,255,255,0.15)",
              transform: i === activeIdx ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default ContentHubShowcase;
