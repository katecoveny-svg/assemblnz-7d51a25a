import { useEffect, useRef, Component, type ReactNode } from "react";

class ParticleErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? null : this.props.children; }
}

/**
 * Constellation Particle Field — Electric Blue + Aurora Green
 * Glowing data nodes, liquid glass orbs, flowing signal particles.
 */

const ELECTRIC = [0, 207, 255];
const ELECTRIC_DIM = [0, 150, 200];
const AURORA = [0, 255, 156];
const WHITE = [255, 255, 255];
const OCEAN = [27, 94, 107];

interface NetNode {
  x: number; y: number; r: number;
  baseAlpha: number;
  pulsePhase: number; pulseSpeed: number;
  color: number[];
  connections: number[];
}

interface GlassOrb {
  x: number; y: number; r: number;
  vx: number; vy: number;
  phase: number; breatheSpeed: number;
  opacity: number;
  color: number[];
}

interface FlowDot {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number; color: number[];
}

function buildNetwork(W: number, H: number) {
  const nodes: NetNode[] = [];
  const clusterCount = Math.max(8, Math.min(16, Math.floor((W * H) / 70000)));
  for (let c = 0; c < clusterCount; c++) {
    const cx = 50 + Math.random() * (W - 100);
    const cy = 50 + Math.random() * (H - 100);
    const size = 4 + Math.floor(Math.random() * 6);
    for (let i = 0; i < size; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 10 + Math.random() * 60;
      const isAurora = Math.random() < 0.3;
      const isWhite = Math.random() < 0.2;
      const isBright = i === 0 || Math.random() < 0.2;
      nodes.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        r: isBright ? 2.5 + Math.random() * 2.5 : 0.8 + Math.random() * 1.5,
        baseAlpha: isBright ? 0.6 + Math.random() * 0.35 : 0.15 + Math.random() * 0.3,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.003 + Math.random() * 0.007,
        color: isWhite ? WHITE : (isAurora ? AURORA : ELECTRIC),
        connections: [],
      });
    }
  }

  const maxDist = Math.min(W, H) * 0.13;
  for (let i = 0; i < nodes.length; i++) {
    const dists: { idx: number; d: number }[] = [];
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      dists.push({ idx: j, d: Math.sqrt(dx * dx + dy * dy) });
    }
    dists.sort((a, b) => a.d - b.d);
    nodes[i].connections = dists
      .filter(d => d.d < maxDist)
      .slice(0, 2 + Math.floor(Math.random() * 3))
      .map(d => d.idx);
  }

  return nodes;
}

const NetworkCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let animFrame: number;
    let cancelled = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let nodes: NetNode[] = [];
    let orbs: GlassOrb[] = [];
    let flows: FlowDot[] = [];
    let bgStars: { x: number; y: number; r: number; a: number; phase: number }[] = [];

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    const resize = () => {
      if (cancelled) return;
      canvas.width = W() * dpr;
      canvas.height = H() * dpr;
      canvas.style.width = W() + "px";
      canvas.style.height = H() + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      nodes = buildNetwork(W(), H());

      orbs = [];
      const orbCount = Math.max(5, Math.min(10, Math.floor(W() / 180)));
      for (let i = 0; i < orbCount; i++) {
        const isAurora = Math.random() < 0.35;
        orbs.push({
          x: Math.random() * W(),
          y: Math.random() * H(),
          r: 35 + Math.random() * 70,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.1,
          phase: Math.random() * Math.PI * 2,
          breatheSpeed: 0.15 + Math.random() * 0.35,
          opacity: 0.02 + Math.random() * 0.04,
          color: isAurora ? AURORA : ELECTRIC,
        });
      }

      bgStars = [];
      const starCount = Math.max(100, Math.min(200, Math.floor((W() * H()) / 8000)));
      for (let i = 0; i < starCount; i++) {
        bgStars.push({
          x: Math.random() * W(),
          y: Math.random() * H(),
          r: Math.random() < 0.08 ? 1.2 + Math.random() : 0.3 + Math.random() * 0.7,
          a: Math.random() < 0.08 ? 0.5 + Math.random() * 0.3 : 0.06 + Math.random() * 0.18,
          phase: Math.random() * Math.PI * 2,
        });
      }

      flows = [];
    };

    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const draw = () => {
      if (cancelled) return;
      try {
        const w = W(), h = H();
        ctx.clearRect(0, 0, w, h);
        t += 1;

        // Spawn flow particles
        if (!prefersReduced && Math.random() < 0.25 && flows.length < 50 && nodes.length > 1) {
          const src = nodes[Math.floor(Math.random() * nodes.length)];
          if (src.connections.length > 0) {
            const tgt = nodes[src.connections[Math.floor(Math.random() * src.connections.length)]];
            const dx = tgt.x - src.x;
            const dy = tgt.y - src.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 5) {
              const spd = 0.35 + Math.random() * 0.6;
              flows.push({
                x: src.x, y: src.y,
                vx: (dx / dist) * spd, vy: (dy / dist) * spd,
                life: 0, maxLife: dist / spd,
                size: 1 + Math.random() * 1.8,
                color: Math.random() < 0.5 ? ELECTRIC : (Math.random() < 0.5 ? AURORA : WHITE),
              });
            }
          }
        }

        // Background stars
        for (const s of bgStars) {
          const tw = prefersReduced ? 1 : Math.sin(t * 0.02 + s.phase) * 0.4 + 0.6;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${s.a * tw})`;
          ctx.fill();
        }

        // Liquid glass orbs
        for (const orb of orbs) {
          if (!prefersReduced) {
            orb.x += orb.vx;
            orb.y += orb.vy;
            if (orb.x < -orb.r * 2) orb.x = w + orb.r;
            if (orb.x > w + orb.r * 2) orb.x = -orb.r;
            if (orb.y < -orb.r * 2) orb.y = h + orb.r;
            if (orb.y > h + orb.r * 2) orb.y = -orb.r;
          }

          const breathe = Math.sin(t * 0.01 * orb.breatheSpeed + orb.phase) * 0.25 + 0.75;
          const r = orb.r * (0.95 + breathe * 0.1);
          const a = orb.opacity * breathe;
          const [cr, cg, cb] = orb.color;
          const [dr, dg, db] = orb.color === AURORA ? [0, 180, 110] : ELECTRIC_DIM;

          const g = ctx.createRadialGradient(orb.x, orb.y, r * 0.1, orb.x, orb.y, r);
          g.addColorStop(0, `rgba(${cr},${cg},${cb},${a * 1.8})`);
          g.addColorStop(0.4, `rgba(${dr},${dg},${db},${a * 0.5})`);
          g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();

          // Glass rim highlight
          ctx.beginPath();
          ctx.arc(orb.x, orb.y, r * 0.78, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,255,255,${a * 0.4})`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }

        // Connection lines
        ctx.lineWidth = 0.4;
        for (const node of nodes) {
          for (const ci of node.connections) {
            const target = nodes[ci];
            const dx = target.x - node.x;
            const dy = target.y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = Math.min(w, h) * 0.13;
            if (dist > maxDist) continue;
            const lineA = (1 - dist / maxDist) * 0.18;
            const [cr, cg, cb] = node.color === AURORA ? AURORA : ELECTRIC;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = `rgba(${cr},${cg},${cb},${lineA})`;
            ctx.stroke();
          }
        }

        // Data nodes with halos
        for (const node of nodes) {
          const pulse = prefersReduced ? 1 : Math.sin(t * 0.015 + node.pulsePhase) * 0.3 + 0.7;
          const a = node.baseAlpha * pulse;
          const r = node.r * (0.9 + pulse * 0.15);
          const [cr, cg, cb] = node.color;

          // Outer halo for bright nodes
          if (node.baseAlpha > 0.5) {
            const g = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 8);
            g.addColorStop(0, `rgba(${cr},${cg},${cb},${a * 0.25})`);
            g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
            ctx.beginPath();
            ctx.arc(node.x, node.y, r * 8, 0, Math.PI * 2);
            ctx.fillStyle = g;
            ctx.fill();
          }

          // Core dot
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${a})`;
          ctx.fill();

          // Inner white specular on bright nodes
          if (node.baseAlpha > 0.5 && r > 2) {
            ctx.beginPath();
            ctx.arc(node.x - r * 0.2, node.y - r * 0.2, r * 0.35, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${a * 0.35})`;
            ctx.fill();
          }
        }

        // Flow particles
        for (let i = flows.length - 1; i >= 0; i--) {
          const fp = flows[i];
          fp.x += fp.vx;
          fp.y += fp.vy;
          fp.life++;
          if (fp.life > fp.maxLife) { flows.splice(i, 1); continue; }
          const lr = fp.life / fp.maxLife;
          const fadeA = lr < 0.1 ? lr / 0.1 : lr > 0.85 ? (1 - lr) / 0.15 : 1;
          const a = fadeA * 0.8;
          const [cr, cg, cb] = fp.color;

          const tg = ctx.createRadialGradient(fp.x, fp.y, 0, fp.x, fp.y, fp.size * 5);
          tg.addColorStop(0, `rgba(${cr},${cg},${cb},${a * 0.35})`);
          tg.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
          ctx.beginPath();
          ctx.arc(fp.x, fp.y, fp.size * 5, 0, Math.PI * 2);
          ctx.fillStyle = tg;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(fp.x, fp.y, fp.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${a})`;
          ctx.fill();
        }

        animFrame = requestAnimationFrame(draw);
      } catch {
        // Canvas detached
      }
    };

    animFrame = requestAnimationFrame(draw);
    return () => {
      cancelled = true;
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 1 }}
    />
  );
};

const ParticleField = () => (
  <ParticleErrorBoundary>
    <NetworkCanvas />
  </ParticleErrorBoundary>
);

export default ParticleField;
