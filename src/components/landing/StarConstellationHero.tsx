import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/**
 * Premium NZ Signal Landscape Hero — inspired by terrain topology,
 * signal paths flowing through Aotearoa mountains, and illuminated node networks.
 * Midnight Deep (#09161A) base with Pounamu Signal (#2FCB89) paths and Dawn Gold (#CBAE6D) nodes.
 */

const POUNAMU = [47, 203, 137] as const;   // #2FCB89
const GOLD = [203, 174, 109] as const;     // #CBAE6D
const MOANA = [16, 36, 43] as const;       // #10242B
const MIST = [234, 241, 239] as const;     // #EAF1EF
const WHITE = [255, 255, 255] as const;

interface Node {
  x: number; y: number; r: number;
  pulsePhase: number; pulseSpeed: number;
  color: readonly [number, number, number];
  brightness: number;
  connections: number[];
}

interface SignalPath {
  points: { x: number; y: number }[];
  progress: number;
  speed: number;
  color: readonly [number, number, number];
}

interface TerrainLine {
  baseY: number;
  amplitude: number;
  frequency: number;
  phase: number;
  speed: number;
  alpha: number;
}

export default function StarConstellationHero({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    let nodes: Node[] = [];
    let signalPaths: SignalPath[] = [];
    let terrainLines: TerrainLine[] = [];
    let bgStars: { x: number; y: number; r: number; a: number; phase: number }[] = [];

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      w = rect?.width || window.innerWidth;
      h = rect?.height || 700;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      init();
    };

    const init = () => {
      // Background stars
      bgStars = [];
      const starCount = Math.floor((w * h) / 4000);
      for (let i = 0; i < starCount; i++) {
        bgStars.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.5,
          r: Math.random() * 1.2 + 0.2,
          a: Math.random() * 0.3 + 0.05,
          phase: Math.random() * Math.PI * 2,
        });
      }

      // Signal network nodes
      nodes = [];
      const nodeCount = Math.min(Math.floor(w / 25), 35);
      for (let i = 0; i < nodeCount; i++) {
        const isGold = Math.random() < 0.25;
        const isBright = Math.random() < 0.15;
        nodes.push({
          x: Math.random() * w * 0.9 + w * 0.05,
          y: h * 0.35 + Math.random() * h * 0.5,
          r: isBright ? 3 + Math.random() * 3 : 1.5 + Math.random() * 2,
          pulsePhase: Math.random() * Math.PI * 2,
          pulseSpeed: 0.3 + Math.random() * 0.8,
          color: isGold ? GOLD : POUNAMU,
          brightness: isBright ? 1 : 0.4 + Math.random() * 0.4,
          connections: [],
        });
      }

      // Build connections (nearest neighbors)
      for (let i = 0; i < nodes.length; i++) {
        const distances: { idx: number; d: number }[] = [];
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          distances.push({ idx: j, d: Math.sqrt(dx * dx + dy * dy) });
        }
        distances.sort((a, b) => a.d - b.d);
        const maxConn = Math.floor(Math.random() * 3) + 1;
        nodes[i].connections = distances
          .filter(d => d.d < w * 0.22)
          .slice(0, maxConn)
          .map(d => d.idx);
      }

      // Signal paths (animated data flowing between nodes)
      signalPaths = [];
      for (let i = 0; i < Math.min(8, nodes.length); i++) {
        const start = nodes[i];
        if (start.connections.length === 0) continue;
        const endIdx = start.connections[0];
        const end = nodes[endIdx];
        const midX = (start.x + end.x) / 2 + (Math.random() - 0.5) * 60;
        const midY = (start.y + end.y) / 2 + (Math.random() - 0.5) * 40;
        signalPaths.push({
          points: [
            { x: start.x, y: start.y },
            { x: midX, y: midY },
            { x: end.x, y: end.y },
          ],
          progress: Math.random(),
          speed: 0.003 + Math.random() * 0.005,
          color: Math.random() < 0.4 ? GOLD : POUNAMU,
        });
      }

      // Terrain contour lines (NZ mountain silhouette)
      terrainLines = [];
      const lineCount = 12;
      for (let i = 0; i < lineCount; i++) {
        const t = i / lineCount;
        terrainLines.push({
          baseY: h * 0.55 + t * h * 0.35,
          amplitude: 15 + t * 25,
          frequency: 1.5 + Math.random() * 2,
          phase: Math.random() * Math.PI * 2,
          speed: 0.1 + Math.random() * 0.2,
          alpha: 0.03 + t * 0.06,
        });
      }
    };

    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const draw = () => {
      t += 0.008;
      ctx.clearRect(0, 0, w, h);

      // ── Atmosphere gradient ──
      const atmo = ctx.createRadialGradient(w * 0.7, h * 0.3, 0, w * 0.7, h * 0.3, w * 0.7);
      atmo.addColorStop(0, "rgba(47,203,137,0.04)");
      atmo.addColorStop(0.5, "rgba(16,36,43,0.06)");
      atmo.addColorStop(1, "transparent");
      ctx.fillStyle = atmo;
      ctx.fillRect(0, 0, w, h);

      // Horizon glow
      const horizonGlow = ctx.createRadialGradient(w * 0.75, h * 0.45, 0, w * 0.75, h * 0.45, w * 0.4);
      horizonGlow.addColorStop(0, "rgba(203,174,109,0.06)");
      horizonGlow.addColorStop(1, "transparent");
      ctx.fillStyle = horizonGlow;
      ctx.fillRect(0, 0, w, h);

      // ── Stars ──
      for (const s of bgStars) {
        const twinkle = Math.sin(t * 0.5 + s.phase) * 0.4 + 0.6;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(234,241,239,${s.a * twinkle})`;
        ctx.fill();
      }

      // ── Terrain contour lines ──
      for (const line of terrainLines) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${POUNAMU[0]},${POUNAMU[1]},${POUNAMU[2]},${line.alpha})`;
        ctx.lineWidth = 0.6;
        for (let x = 0; x <= w; x += 3) {
          const nx = x / w;
          const y = line.baseY +
            Math.sin(nx * line.frequency * Math.PI * 2 + t * line.speed + line.phase) * line.amplitude +
            Math.sin(nx * line.frequency * 3.7 + t * line.speed * 0.7) * line.amplitude * 0.4;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // ── Node connection lines ──
      ctx.lineWidth = 0.5;
      for (const node of nodes) {
        for (const ci of node.connections) {
          const target = nodes[ci];
          const dx = target.x - node.x;
          const dy = target.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = w * 0.22;
          if (dist > maxDist) continue;
          const lineAlpha = (1 - dist / maxDist) * 0.12;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);
          ctx.strokeStyle = `rgba(${POUNAMU[0]},${POUNAMU[1]},${POUNAMU[2]},${lineAlpha})`;
          ctx.stroke();
        }
      }

      // ── Nodes ──
      for (const node of nodes) {
        const pulse = Math.sin(t * node.pulseSpeed + node.pulsePhase) * 0.3 + 0.7;
        const a = node.brightness * pulse;
        const r = node.r * (0.9 + pulse * 0.2);

        // Glow
        if (node.brightness > 0.6) {
          const g = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 6);
          g.addColorStop(0, `rgba(${node.color[0]},${node.color[1]},${node.color[2]},${a * 0.25})`);
          g.addColorStop(1, `rgba(${node.color[0]},${node.color[1]},${node.color[2]},0)`);
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 6, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${node.color[0]},${node.color[1]},${node.color[2]},${a})`;
        ctx.fill();
      }

      // ── Signal paths (animated data flow) ──
      for (const sp of signalPaths) {
        sp.progress += sp.speed;
        if (sp.progress > 1) sp.progress = 0;

        const p = sp.progress;
        const pts = sp.points;
        // Quadratic bezier interpolation
        const bx = (1 - p) * (1 - p) * pts[0].x + 2 * (1 - p) * p * pts[1].x + p * p * pts[2].x;
        const by = (1 - p) * (1 - p) * pts[0].y + 2 * (1 - p) * p * pts[1].y + p * p * pts[2].y;

        // Signal dot
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, 12);
        g.addColorStop(0, `rgba(${sp.color[0]},${sp.color[1]},${sp.color[2]},0.7)`);
        g.addColorStop(1, `rgba(${sp.color[0]},${sp.color[1]},${sp.color[2]},0)`);
        ctx.beginPath();
        ctx.arc(bx, by, 12, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(bx, by, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${sp.color[0]},${sp.color[1]},${sp.color[2]},0.9)`;
        ctx.fill();
      }

      // ── Assembl constellation logo (three-node triangle) ──
      const triCx = w * 0.82, triCy = h * 0.2;
      const triR = 28 + Math.sin(t * 0.5) * 2;
      const triColors = [GOLD, POUNAMU, [90, 173, 160] as const];
      const triNodes = [0, 1, 2].map(i => {
        const angle = (i * Math.PI * 2) / 3 - Math.PI / 2 + t * 0.05;
        return { x: triCx + Math.cos(angle) * triR, y: triCy + Math.sin(angle) * triR };
      });

      // Triangle lines
      ctx.strokeStyle = `rgba(255,255,255,0.08)`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(triNodes[0].x, triNodes[0].y);
      for (let i = 1; i <= 3; i++) ctx.lineTo(triNodes[i % 3].x, triNodes[i % 3].y);
      ctx.stroke();

      // Triangle nodes
      for (let i = 0; i < 3; i++) {
        const n = triNodes[i];
        const c = triColors[i];
        const na = Math.sin(t * 0.4 + i * 2) * 0.15 + 0.5;
        const ng = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 10);
        ng.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${na})`);
        ng.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = ng;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${na + 0.3})`;
        ctx.fill();
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
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 70% 35%, transparent 10%, rgba(9,22,26,0.4) 40%, rgba(9,22,26,0.8) 70%, rgba(9,22,26,0.98) 100%)",
        }}
      />
    </motion.div>
  );
}
