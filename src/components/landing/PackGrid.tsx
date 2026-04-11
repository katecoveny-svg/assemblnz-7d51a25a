import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import KeteOrbHero from "./KeteOrbHero";

/* Industry-specific SVG icons — custom per kete */
function ManaakiIcon({ size = 28, color = "#D4A843" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="manaaki-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {/* Wine glass / hospitality */}
      <path d="M16 4C12 4 9 7 9 11c0 3 2.5 5.5 5.5 6.5V22H12v2h8v-2h-2.5v-4.5C20.5 16.5 23 14 23 11c0-4-3-7-7-7z" fill="url(#manaaki-g)" />
      <path d="M11 11c0-2.8 2.2-5 5-5" stroke={color} strokeWidth="0.8" opacity="0.4" />
      <circle cx="13" cy="9" r="1" fill={color} opacity="0.3" />
    </svg>
  );
}

function WaihangaIcon({ size = 28, color = "#3A7D6E" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="waihanga-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {/* Hard hat + building */}
      <rect x="6" y="22" width="20" height="4" rx="1" fill="url(#waihanga-g)" />
      <path d="M8 22v-2a8 8 0 0116 0v2" stroke={color} strokeWidth="2" fill="none" />
      <path d="M13 22V16h2v6M17 22V14h2v8" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <circle cx="16" cy="10" r="1.5" fill={color} opacity="0.4" />
    </svg>
  );
}

function AuahaIcon({ size = 28, color = "#F0D078" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="auaha-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {/* Palette / creative */}
      <circle cx="16" cy="16" r="11" fill="url(#auaha-g)" opacity="0.15" />
      <circle cx="16" cy="16" r="11" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
      <circle cx="11" cy="12" r="2.5" fill={color} opacity="0.8" />
      <circle cx="21" cy="12" r="2" fill={color} opacity="0.6" />
      <circle cx="12" cy="20" r="1.8" fill={color} opacity="0.5" />
      <circle cx="20" cy="20" r="2.2" fill={color} opacity="0.7" />
      <path d="M24 16a3 3 0 01-3 3" stroke={color} strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

function AratakiIcon({ size = 28, color = "#E8E8E8" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="arataki-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {/* Car silhouette */}
      <path d="M6 20h20v3a1 1 0 01-1 1H7a1 1 0 01-1-1v-3z" fill="url(#arataki-g)" />
      <path d="M8 20l2-6h12l2 6" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M10 14h12" stroke={color} strokeWidth="0.8" opacity="0.3" />
      <circle cx="10" cy="22" r="2" fill={color} opacity="0.6" />
      <circle cx="22" cy="22" r="2" fill={color} opacity="0.6" />
      <rect x="12" y="16" width="8" height="3" rx="0.5" stroke={color} strokeWidth="0.8" fill="none" opacity="0.4" />
    </svg>
  );
}

function PikauIcon({ size = 28, color = "#5AADA0" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="pikau-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      {/* Container / freight */}
      <rect x="5" y="8" width="22" height="16" rx="2" fill="url(#pikau-g)" opacity="0.2" />
      <rect x="5" y="8" width="22" height="16" rx="2" stroke={color} strokeWidth="1.5" fill="none" />
      <line x1="12" y1="8" x2="12" y2="24" stroke={color} strokeWidth="1" opacity="0.4" />
      <line x1="20" y1="8" x2="20" y2="24" stroke={color} strokeWidth="1" opacity="0.4" />
      <path d="M2 24h28" stroke={color} strokeWidth="1" opacity="0.3" />
      <circle cx="9" cy="26" r="1.5" fill={color} opacity="0.5" />
      <circle cx="23" cy="26" r="1.5" fill={color} opacity="0.5" />
    </svg>
  );
}

function ToroBirdIcon({ size = 28, color = "#D4A843" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 20" fill="none">
      <defs>
        <linearGradient id="toro-bird-g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.6" />
          <stop offset="50%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {/* Albatross in flight */}
      <path
        d="M20 10 C17 7, 10 4, 2 7 C7 6, 12 8, 16 9.5 L20 10 L24 9.5 C28 8, 33 6, 38 7 C30 4, 23 7, 20 10Z"
        fill="url(#toro-bird-g)"
      />
      <ellipse cx="20" cy="10.5" rx="3" ry="1.5" fill={color} />
      <path d="M23 10.5 L28 10 L29 10.3" stroke={color} strokeWidth="0.8" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* Guiding star */}
      <circle cx="34" cy="4" r="1.5" fill={color} opacity="0.5" />
      <circle cx="34" cy="4" r="0.5" fill="#fff" opacity="0.8" />
    </svg>
  );
}

const ICON_MAP: Record<string, (props: { size?: number; color?: string }) => JSX.Element> = {
  manaaki: ManaakiIcon,
  waihanga: WaihangaIcon,
  auaha: AuahaIcon,
  arataki: AratakiIcon,
  pikau: PikauIcon,
};

type PackCard = {
  id: string;
  name: string;
  label: string;
  description: string;
  accent: string;
  route: string;
};

const PACKS: PackCard[] = [
  {
    id: "manaaki",
    name: "Manaaki",
    label: "HOSPITALITY & TOURISM",
    description:
      "Fewer missed checks. Cleaner compliance. Guests looked after without the paperwork pile-up.",
    accent: "#D4A843",
    route: "/manaaki",
  },
  {
    id: "waihanga",
    name: "Waihanga",
    label: "CONSTRUCTION",
    description:
      "Site safety, schedule risks surfaced earlier, cleaner audit trails, approvals that don't stall.",
    accent: "#3A7D6E",
    route: "/waihanga",
  },
  {
    id: "auaha",
    name: "Auaha",
    label: "CREATIVE & MEDIA",
    description:
      "Brief to published with fewer handoffs. Content that stays on-brand and on-deadline.",
    accent: "#F0D078",
    route: "/auaha",
  },
  {
    id: "arataki",
    name: "Arataki",
    label: "AUTOMOTIVE",
    description:
      "Enquiry → test drive → sale → delivery → service → loyalty. No handoff dropped across DMS, CRM, and OEM portals.",
    accent: "#E8E8E8",
    route: "/arataki",
  },
  {
    id: "pikau",
    name: "Pikau",
    label: "FREIGHT & CUSTOMS",
    description:
      "Route optimisation, declarations, broker hand-off, customs compliance.",
    accent: "#5AADA0",
    route: "/packs/pikau",
  },
];

const ease = [0.16, 1, 0.3, 1] as const;

const PackGrid = () => {
  return (
    <section
      id="expert-team"
      className="relative z-10 pt-[100px] pb-[100px]"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Hero orb */}
        <KeteOrbHero />

        {/* The 5 industry kete */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {PACKS.map((pack, idx) => {
            const IconComponent = ICON_MAP[pack.id];
            return (
              <motion.div
                key={pack.id}
                className="relative rounded-xl overflow-hidden group"
                style={{
                  background: "rgba(15, 15, 26, 0.85)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1.5px solid rgba(255,255,255,0.09)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
                  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                whileHover={{
                  y: -3,
                  boxShadow: `0 12px 48px rgba(0,0,0,0.45), 0 0 40px ${pack.accent}20`,
                }}
              >
                <span
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-20 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${pack.accent}, transparent)`,
                  }}
                />

                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: `rgba(${hexToRgb(pack.accent)}, 0.08)`,
                        border: `1px solid rgba(${hexToRgb(pack.accent)}, 0.15)`,
                      }}
                    >
                      {IconComponent && <IconComponent size={24} color={pack.accent} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[10px] tracking-[3px] uppercase mb-0.5"
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          color: pack.accent,
                        }}
                      >
                        {pack.label}
                      </p>
                      <h3
                        className="text-lg tracking-[2px] uppercase text-foreground"
                        style={{ fontWeight: 300, fontFamily: "'Lato', sans-serif" }}
                      >
                        {pack.name}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs font-body text-muted-foreground leading-relaxed mb-3">
                    {pack.description}
                  </p>

                  <Link
                    to={pack.route}
                    className="inline-flex items-center gap-1.5 text-[11px] font-body transition-all duration-200 hover:gap-2.5 group/link"
                    style={{ color: pack.accent }}
                  >
                    Explore kete <ArrowRight size={10} className="transition-transform group-hover/link:translate-x-0.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Whānau kete — Toro */}
        <div className="max-w-md mx-auto mb-8">
          <motion.div
            className="flex items-center gap-3 mb-3"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-1 h-6 rounded-full" style={{ background: "#D4A843" }} />
            <div>
              <p
                className="text-[10px] tracking-[3px] uppercase"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  color: "#D4A843",
                }}
              >
                FAMILY NAVIGATOR
              </p>
            </div>
          </motion.div>
          <Link to="/toroa" className="block">
            <motion.div
              className="relative rounded-xl p-5 group"
              style={{
                background: "rgba(15, 15, 26, 0.8)",
                backdropFilter: "blur(12px)",
                border: "2px solid rgba(255,255,255,0.08)",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{
                borderColor: "rgba(212,168,67,0.3)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 30px rgba(212,168,67,0.08)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 shrink-0 flex items-center justify-center rounded-lg"
                  style={{
                    background: "rgba(212,168,67,0.06)",
                    border: "1px solid rgba(212,168,67,0.15)",
                    filter: "drop-shadow(0 0 8px rgba(212,168,67,0.3))",
                  }}
                >
                  <ToroBirdIcon size={36} color="#D4A843" />
                </div>
                <div>
                  <h3
                    className="text-lg tracking-[3px] uppercase text-foreground"
                    style={{ fontWeight: 300, fontFamily: "'Lato', sans-serif" }}
                  >
                    Toro
                  </h3>
                  <p className="text-[11px] font-body text-muted-foreground mt-0.5">
                    SMS-first whānau coordination. School notices, kai plans, appointments, budgets — just text.
                  </p>
                </div>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/kete"
            className="inline-flex items-center gap-2 text-xs font-display font-light px-6 py-3 rounded-xl transition-all duration-300 hover:gap-3"
            style={{
              color: "hsl(var(--kowhai))",
              border: "1px solid rgba(212,168,67,0.25)",
              background: "rgba(212,168,67,0.05)",
            }}
          >
            See all five kete <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

export default PackGrid;
