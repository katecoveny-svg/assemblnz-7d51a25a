import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface AnimatedHeroProps {
  onScrollToGrid: () => void;
}

const PROOF_STRIP = [
  { value: "44+", label: "specialist agents", color: "#D4A843" },
  { value: "9", label: "industry kete", color: "#3A7D6E" },
  { value: "NZ", label: "built & hosted", color: "#7B68EE" },
  { value: "SMS", label: "-ready", color: "#89CFF0" },
];

const WHENUA_PALETTE = [
  "#D4A843", "#3A7D6E", "#7B68EE", "#C17A3A", "#89CFF0",
  "#E8B4B8", "#90EE90", "#DEB887", "#4A7AB5",
];

/* ── Animated koru flourish SVG ── */
const KoruFlourish = () => (
  <svg width="120" height="40" viewBox="0 0 120 40" className="mx-auto mt-3 opacity-40">
    <motion.path
      d="M10 20 C10 10, 20 5, 30 10 C40 15, 35 25, 25 25 C20 25, 18 22, 18 18 C18 15, 22 13, 25 15"
      stroke="#D4A843"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.6 }}
      transition={{ duration: 2, delay: 1.2, ease: "easeOut" }}
    />
    <motion.path
      d="M110 20 C110 10, 100 5, 90 10 C80 15, 85 25, 95 25 C100 25, 102 22, 102 18 C102 15, 98 13, 95 15"
      stroke="#3A7D6E"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.6 }}
      transition={{ duration: 2, delay: 1.4, ease: "easeOut" }}
    />
    <motion.line
      x1="30" y1="20" x2="90" y2="20"
      stroke="rgba(255,255,255,0.1)"
      strokeWidth="0.5"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 1.5, delay: 1.8 }}
    />
  </svg>
);

/* ── Canvas particle constellation system ── */
interface Particle {
  x: number; y: number; vx: number; vy: number;
  size: number; color: string; alpha: number; targetAlpha: number;
  pulsePhase: number; pulseSpeed: number;
}

const useConstellationCanvas = (canvasRef: React.RefObject<HTMLCanvasElement | null>, isMobile: boolean) => {
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const timeRef = useRef(0);

  const initParticles = useCallback((w: number, h: number) => {
    const count = isMobile ? 50 : 120;
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 3 + 1,
        color: WHENUA_PALETTE[Math.floor(Math.random() * WHENUA_PALETTE.length)],
        alpha: 0,
        targetAlpha: Math.random() * 0.5 + 0.2,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.01 + 0.005,
      });
    }
    particlesRef.current = particles;
  }, [isMobile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
      if (particlesRef.current.length === 0) initParticles(rect.width, rect.height);
    };

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouse);

    // Check reduced motion preference
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const draw = () => {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);
      timeRef.current += 1;
      const t = timeRef.current;
      const mouse = mouseRef.current;
      const particles = particlesRef.current;

      // Update & draw particles
      for (const p of particles) {
        // Fade in
        if (p.alpha < p.targetAlpha) p.alpha += 0.003;

        if (!prefersReduced) {
          // Gentle drift
          p.x += p.vx;
          p.y += p.vy;

          // Mouse attraction (subtle)
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200 && dist > 10) {
            p.vx += dx / dist * 0.02;
            p.vy += dy / dist * 0.02;
          }

          // Dampen velocity
          p.vx *= 0.99;
          p.vy *= 0.99;

          // Wrap around edges
          if (p.x < -20) p.x = w + 20;
          if (p.x > w + 20) p.x = -20;
          if (p.y < -20) p.y = h + 20;
          if (p.y > h + 20) p.y = -20;
        }

        // Pulse
        const pulse = Math.sin(p.pulsePhase + t * p.pulseSpeed) * 0.3 + 0.7;
        const alpha = p.alpha * pulse;

        // Glow ring
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        grad.addColorStop(0, p.color + Math.round(alpha * 80).toString(16).padStart(2, "0"));
        grad.addColorStop(0.5, p.color + Math.round(alpha * 20).toString(16).padStart(2, "0"));
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = p.color + Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw constellation lines between nearby particles
      const connectionDist = isMobile ? 120 : 160;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < connectionDist) {
            const lineAlpha = (1 - d / connectionDist) * Math.min(a.alpha, b.alpha) * 0.4;
            ctx.strokeStyle = `rgba(212,168,67,${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, [canvasRef, isMobile, initParticles]);
};

/* ── Animated gradient mesh background ── */
const GradientMesh = () => (
  <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
    {/* Primary gold nebula */}
    <motion.div
      className="absolute"
      style={{
        width: "80vw", height: "80vh",
        top: "10%", left: "10%",
        background: "radial-gradient(ellipse at center, rgba(212,168,67,0.08) 0%, transparent 65%)",
        filter: "blur(60px)",
      }}
      animate={{
        scale: [1, 1.15, 1],
        x: [0, 30, -20, 0],
        y: [0, -20, 15, 0],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
    />
    {/* Pounamu drift */}
    <motion.div
      className="absolute"
      style={{
        width: "60vw", height: "60vh",
        top: "30%", left: "-5%",
        background: "radial-gradient(ellipse at center, rgba(58,125,110,0.06) 0%, transparent 60%)",
        filter: "blur(80px)",
      }}
      animate={{
        scale: [1.1, 1, 1.15],
        x: [0, 40, 0],
        y: [0, 20, -10, 0],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
    />
    {/* Purple accent */}
    <motion.div
      className="absolute"
      style={{
        width: "50vw", height: "50vh",
        top: "15%", right: "-10%",
        background: "radial-gradient(ellipse at center, rgba(123,104,238,0.05) 0%, transparent 55%)",
        filter: "blur(70px)",
      }}
      animate={{
        scale: [1, 1.2, 0.95, 1],
        x: [0, -30, 10, 0],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
    />
    {/* Rose warmth bottom */}
    <motion.div
      className="absolute"
      style={{
        width: "40vw", height: "30vh",
        bottom: "5%", left: "30%",
        background: "radial-gradient(ellipse at center, rgba(232,180,184,0.04) 0%, transparent 60%)",
        filter: "blur(60px)",
      }}
      animate={{
        scale: [1, 1.1, 1],
        y: [0, -15, 0],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

/* ── Tāniko pattern border ── */
const TanikoBar = () => (
  <motion.div
    className="absolute bottom-0 left-0 right-0 h-[3px] z-20"
    initial={{ scaleX: 0 }}
    animate={{ scaleX: 1 }}
    transition={{ duration: 1.5, delay: 2, ease: [0.16, 1, 0.3, 1] }}
  >
    <svg width="100%" height="3" preserveAspectRatio="none">
      <defs>
        <linearGradient id="taniko-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="20%" stopColor="#D4A843" stopOpacity="0.6" />
          <stop offset="40%" stopColor="#3A7D6E" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#7B68EE" stopOpacity="0.4" />
          <stop offset="80%" stopColor="#D4A843" stopOpacity="0.6" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <rect width="100%" height="3" fill="url(#taniko-grad)" />
    </svg>
  </motion.div>
);

const AnimatedHero = ({ onScrollToGrid }: AnimatedHeroProps) => {
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useConstellationCanvas(canvasRef, isMobile);

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden" style={{ minHeight: "100vh" }}>
      {/* Dark base */}
      <div className="absolute inset-0 z-0" style={{ background: "#09090F" }} />

      {/* Animated gradient mesh */}
      <GradientMesh />

      {/* Canvas constellation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-[2] w-full h-full"
        style={{ opacity: 0.85 }}
      />

      {/* Vignette overlay */}
      <div className="absolute inset-0 z-[3] pointer-events-none" style={{
        background: "radial-gradient(ellipse 70% 60% at 50% 45%, transparent 0%, rgba(9,9,15,0.5) 100%)",
      }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 sm:px-8" style={{ paddingTop: isMobile ? "6rem" : "10rem", paddingBottom: "4rem" }}>
        {/* Supertitle badge */}
        <motion.div
          className="mb-6 px-5 py-2 rounded-full"
          style={{
            background: "rgba(15,15,26,0.7)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(212,168,67,0.25)",
            boxShadow: "0 0 30px rgba(212,168,67,0.08)",
          }}
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-[10px] tracking-[4px] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#D4A843", fontWeight: 500 }}>
            THE AI OPERATING SYSTEM FOR AOTEAROA
          </span>
        </motion.div>

        {/* Main headline — dramatic stagger */}
        <div className="max-w-4xl mx-auto mb-4 overflow-hidden">
          <motion.h1
            style={{
              fontFamily: "'Lato', sans-serif",
              fontWeight: 300,
              fontSize: isMobile ? "2rem" : "3.75rem",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
            }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            44+ specialist agents.{" "}
            <motion.span
              className="inline-block"
              style={{
                background: "linear-gradient(135deg, #D4A843, #3A7D6E, #7B68EE)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "200% 200%",
              }}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              9 industry kete.
            </motion.span>
            <br />
            One intelligent brain.
          </motion.h1>
        </div>

        {/* Koru flourish under headline */}
        <KoruFlourish />

        {/* Subheading */}
        <motion.p
          className="max-w-[640px] mb-2 mt-4"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 400,
            fontSize: isMobile ? "15px" : "17px",
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.6)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Quoting, payroll, compliance, marketing, construction, hospitality — every workflow connected and automated. Built and hosted in New Zealand.
        </motion.p>

        {/* Pricing hook */}
        <motion.p
          className="mb-6"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 400,
            fontSize: "13px",
            color: "rgba(255,255,255,0.35)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          From $199/mo + GST. 14-day free trial — no credit card required.
        </motion.p>

        {/* Proof strip */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          {PROOF_STRIP.map((s, i) => (
            <motion.span
              key={s.label}
              className="px-4 py-2 rounded-full text-xs"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 500,
                background: "rgba(15,15,26,0.7)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.65)",
                letterSpacing: "0.05em",
                boxShadow: `0 0 20px ${s.color}10`,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + i * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.05, boxShadow: `0 0 25px ${s.color}25` }}
            >
              <span style={{ color: s.color, fontWeight: 600 }}>{s.value}</span>{" "}{s.label}
            </motion.span>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          <Link
            to="/pricing"
            className="cta-glass-green inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm group"
          >
            Start free trial <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button
            onClick={() => document.querySelector("#try-assembl")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-ghost inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm group"
          >
            <Play size={14} className="group-hover:scale-110 transition-transform" /> Watch it work
          </button>
        </motion.div>
      </div>

      {/* Tāniko gradient bar at bottom */}
      <TanikoBar />

      {/* Scroll indicator */}
      <motion.button
        onClick={onScrollToGrid}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 transition-colors"
        style={{ color: "rgba(255,255,255,0.3)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown size={28} />
        </motion.div>
      </motion.button>
    </section>
  );
};

export default AnimatedHero;
