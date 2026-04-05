import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/**
 * Animated pixel star constellation background for the hero section.
 * Renders a canvas with twinkling stars and slowly drawing constellation lines.
 */

interface Star {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  phase: number;
  speed: number;
  color: string;
}

interface ConstellationNode {
  x: number;
  y: number;
  r: number;
}

const GOLD = [212, 168, 67];
const TEAL = [58, 125, 110];
const WHITE = [255, 255, 255];

function randomColor() {
  const roll = Math.random();
  if (roll < 0.15) return GOLD;
  if (roll < 0.25) return TEAL;
  return WHITE;
}

// Pre-defined constellation patterns (relative 0-1 coords)
const CONSTELLATIONS = [
  // Matariki cluster (top-left area)
  {
    nodes: [
      { x: 0.12, y: 0.25 }, { x: 0.08, y: 0.35 }, { x: 0.16, y: 0.32 },
      { x: 0.06, y: 0.42 }, { x: 0.18, y: 0.40 }, { x: 0.11, y: 0.48 },
      { x: 0.14, y: 0.50 }, { x: 0.10, y: 0.56 }, { x: 0.13, y: 0.38 },
    ],
    edges: [[0,1],[0,2],[0,8],[1,3],[2,4],[3,5],[4,6],[5,7],[6,7],[8,5],[8,6]],
    color: GOLD,
  },
  // Southern Cross (right area)
  {
    nodes: [
      { x: 0.82, y: 0.20 }, { x: 0.88, y: 0.35 },
      { x: 0.78, y: 0.30 }, { x: 0.92, y: 0.28 },
      { x: 0.85, y: 0.42 },
    ],
    edges: [[0,1],[2,3],[0,4],[1,4]],
    color: TEAL,
  },
  // Triangulum (center-bottom)
  {
    nodes: [
      { x: 0.45, y: 0.60 }, { x: 0.55, y: 0.60 }, { x: 0.50, y: 0.72 },
    ],
    edges: [[0,1],[1,2],[2,0]],
    color: GOLD,
  },
  // Small cluster (top-right)
  {
    nodes: [
      { x: 0.65, y: 0.15 }, { x: 0.70, y: 0.22 },
      { x: 0.60, y: 0.20 }, { x: 0.68, y: 0.30 },
    ],
    edges: [[0,1],[0,2],[1,3],[2,3]],
    color: WHITE,
  },
];

export default function StarConstellationHero({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    const stars: Star[] = [];
    const constellationNodes: { x: number; y: number; r: number; color: number[] }[][] = [];

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      w = rect?.width || window.innerWidth;
      h = rect?.height || 600;
      canvas.width = w * 2;
      canvas.height = h * 2;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(2, 0, 0, 2, 0, 0);

      // Regenerate stars
      stars.length = 0;
      const count = Math.floor((w * h) / 2800);
      for (let i = 0; i < count; i++) {
        const col = randomColor();
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.8 + 0.3,
          baseAlpha: Math.random() * 0.5 + 0.1,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.8 + 0.3,
          color: `${col[0]},${col[1]},${col[2]}`,
        });
      }

      // Map constellation nodes to pixel coords
      constellationNodes.length = 0;
      for (const c of CONSTELLATIONS) {
        constellationNodes.push(
          c.nodes.map(n => ({
            x: n.x * w,
            y: n.y * h,
            r: 2 + Math.random() * 1.5,
            color: c.color,
          }))
        );
      }
    };

    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);

      // Draw background stars
      for (const s of stars) {
        const twinkle = Math.sin(t * s.speed + s.phase) * 0.3 + 0.7;
        const alpha = s.baseAlpha * twinkle;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color},${alpha})`;
        ctx.fill();

        // Glow for larger stars
        if (s.r > 1.2) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 3);
          grad.addColorStop(0, `rgba(${s.color},${alpha * 0.3})`);
          grad.addColorStop(1, `rgba(${s.color},0)`);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }

      // Draw constellation lines with draw-on animation
      const lineProgress = Math.min(t / 4, 1); // fully drawn by 4s
      for (let ci = 0; ci < CONSTELLATIONS.length; ci++) {
        const c = CONSTELLATIONS[ci];
        const nodes = constellationNodes[ci];
        if (!nodes) continue;

        const edgesToDraw = Math.floor(lineProgress * c.edges.length);
        const partialProgress = (lineProgress * c.edges.length) - edgesToDraw;

        for (let ei = 0; ei < c.edges.length; ei++) {
          const [from, to] = c.edges[ei];
          const n1 = nodes[from];
          const n2 = nodes[to];

          let prog = 1;
          if (ei > edgesToDraw) continue;
          if (ei === edgesToDraw) prog = partialProgress;

          const pulse = Math.sin(t * 0.5 + ci) * 0.1 + 0.2;

          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n1.x + (n2.x - n1.x) * prog, n1.y + (n2.y - n1.y) * prog);
          ctx.strokeStyle = `rgba(${c.color[0]},${c.color[1]},${c.color[2]},${pulse * prog})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Draw constellation nodes
        const nodeAlpha = Math.min(t / 2, 1);
        for (const n of nodes) {
          const pulse = Math.sin(t * 0.8 + n.x * 0.01) * 0.2 + 0.8;
          // Glow
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
          grad.addColorStop(0, `rgba(${n.color[0]},${n.color[1]},${n.color[2]},${0.25 * pulse * nodeAlpha})`);
          grad.addColorStop(1, `rgba(${n.color[0]},${n.color[1]},${n.color[2]},0)`);
          ctx.fillStyle = grad;
          ctx.fill();
          // Core
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${n.color[0]},${n.color[1]},${n.color[2]},${0.7 * pulse * nodeAlpha})`;
          ctx.fill();
        }
      }

      // Occasional shooting star
      if (Math.random() < 0.002) {
        const sx = Math.random() * w;
        const sy = Math.random() * h * 0.4;
        const angle = Math.PI * 0.15 + Math.random() * 0.2;
        const len = 40 + Math.random() * 60;
        const grad = ctx.createLinearGradient(sx, sy, sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
        grad.addColorStop(0, "rgba(212,168,67,0.6)");
        grad.addColorStop(1, "rgba(212,168,67,0)");
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(angle) * len, sy + Math.sin(angle) * len);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <motion.div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {/* Gradient overlay for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center top, transparent 30%, rgba(9,9,15,0.7) 70%, rgba(9,9,15,0.95) 100%)",
        }}
      />
    </motion.div>
  );
}
