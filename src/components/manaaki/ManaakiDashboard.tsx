import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";
import KeteBrainChat from "@/components/KeteBrainChat";
import GlowIcon from "@/components/GlowIcon";
import KeteDashboardShell from "@/components/kete/KeteDashboardShell";
import DashboardGlassCard from "@/components/kete/DashboardGlassCard";

const ACCENT = "#FFD700";
const ACCENT_LIGHT = "#FFE866";

const occupancyData = [
  { day: "Mon", rate: 82 }, { day: "Tue", rate: 88 }, { day: "Wed", rate: 91 },
  { day: "Thu", rate: 95 }, { day: "Fri", rate: 98 }, { day: "Sat", rate: 100 }, { day: "Sun", rate: 94 },
];
const revenueData = [
  { month: "Jan", rev: 42 }, { month: "Feb", rev: 48 }, { month: "Mar", rev: 51 },
  { month: "Apr", rev: 55 }, { month: "May", rev: 58 }, { month: "Jun", rev: 62 },
];

const agents = [
  { name: "AURA", desc: "Property Operations", icon: "Star", status: "online" },
  { name: "SAFFRON", desc: "Food Safety & Kitchen", icon: "Coffee", status: "online" },
  { name: "CELLAR", desc: "Beverage & Wine", icon: "Wine", status: "online" },
  { name: "LUXE", desc: "Premium Guest Experience", icon: "Gem", status: "online" },
  { name: "MOANA", desc: "Marine & Coastal", icon: "Anchor", status: "online" },
  { name: "COAST", desc: "Sustainability & Eco", icon: "Leaf", status: "online" },
  { name: "KURA", desc: "Events & Functions", icon: "Calendar", status: "online" },
  { name: "PAU", desc: "Spa & Wellness", icon: "Heart", status: "beta" },
  { name: "SUMMIT", desc: "Revenue Management", icon: "TrendingUp", status: "online" },
];

const metrics = [
  { label: "Occupancy", value: "94%", icon: "TrendingUp", trend: "+3.2%" },
  { label: "Guest Score", value: "4.8/5", icon: "Star", trend: "+0.2" },
  { label: "RevPAR", value: "$187", icon: "DollarSign", trend: "+12%" },
  { label: "F&B Revenue", value: "$24.8k", icon: "Coffee", trend: "+8.1%" },
];

export default function ManaakiDashboard() {
  return (
    <KeteDashboardShell
      name="Manaaki"
      subtitle="Hospitality & Tourism Intelligence"
      accentColor={ACCENT}
      accentLight={ACCENT_LIGHT}
      variant="standard"
    >
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map(m => (
          <DashboardGlassCard key={m.label} accentColor={ACCENT} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <GlowIcon name={m.icon} size={16} color={ACCENT} />
              <span className="text-[10px] text-white/40 uppercase tracking-wider">{m.label}</span>
            </div>
            <div className="text-xl font-bold text-white/90" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{m.value}</div>
            <span className="text-[10px] text-emerald-400">{m.trend}</span>
          </DashboardGlassCard>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <DashboardGlassCard accentColor={ACCENT} className="p-4">
          <h3 className="text-xs font-semibold text-white/60 mb-3">Occupancy This Week</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={occupancyData}>
              <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: `1px solid ${ACCENT}33`, borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="rate" fill={ACCENT} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </DashboardGlassCard>
        <DashboardGlassCard accentColor={ACCENT} className="p-4">
          <h3 className="text-xs font-semibold text-white/60 mb-3">Revenue Trend ($k)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={revenueData}>
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: `1px solid ${ACCENT}33`, borderRadius: 8, fontSize: 11 }} />
              <Line type="monotone" dataKey="rev" stroke={ACCENT} strokeWidth={2} dot={{ fill: ACCENT, r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </DashboardGlassCard>
      </div>

      {/* Agents */}
      <DashboardGlassCard accentColor={ACCENT} className="p-4">
        <h3 className="text-xs font-semibold text-white/60 mb-3">Specialist Agents</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {agents.map(a => (
            <div key={a.name} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: `${ACCENT}08` }}>
              <GlowIcon name={a.icon} size={18} color={ACCENT} />
              <div>
                <div className="text-xs font-bold text-white/80">{a.name}</div>
                <div className="text-[9px] text-white/35">{a.desc}</div>
              </div>
              <div className={`ml-auto w-2 h-2 rounded-full ${a.status === "online" ? "bg-emerald-400" : a.status === "beta" ? "bg-amber-400" : "bg-white/20"}`} />
            </div>
          ))}
        </div>
      </DashboardGlassCard>

      <KeteBrainChat keteId="manaaki" keteName="Manaaki" keteNameEn="Hospitality" accentColor={ACCENT} />
    </KeteDashboardShell>
  );
}
