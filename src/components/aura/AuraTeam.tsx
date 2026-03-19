import { useState } from "react";
import { NeonTeam, NeonCalendar, NeonCheckmark, NeonStar } from "@/components/NeonIcons";

const color = "#E6B422";

const TRAINING_MODULES = [
  { title: "Food Act 2014 Compliance", category: "Kitchen", priority: "Required" },
  { title: "Liquor Licensing (SSAA 2012)", category: "F&B", priority: "Required" },
  { title: "Health & Safety Induction", category: "All Staff", priority: "Required" },
  { title: "Fire Safety & Evacuation", category: "All Staff", priority: "Required" },
  { title: "Guest Service Excellence", category: "Front of House", priority: "Core" },
  { title: "Wine Knowledge & Pairings", category: "F&B", priority: "Core" },
  { title: "Allergen & Dietary Awareness", category: "Kitchen & F&B", priority: "Required" },
  { title: "Privacy Act — Guest Data", category: "All Staff", priority: "Core" },
  { title: "Cultural Competency (Te Ao Māori)", category: "All Staff", priority: "Recommended" },
  { title: "Luxury Guest Communication", category: "Front of House", priority: "Core" },
  { title: "First Aid Certificate", category: "All Staff", priority: "Required" },
  { title: "Seasonal Staff Onboarding", category: "New Staff", priority: "Required" },
];

const AuraTeam = () => {
  const [section, setSection] = useState<"roster" | "training" | "recognition">("roster");

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex gap-2">
        {([
          { id: "roster" as const, label: "Roster & Briefing" },
          { id: "training" as const, label: "Training" },
          { id: "recognition" as const, label: "Recognition" },
        ]).map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
            style={{ background: section === s.id ? color + "20" : "transparent", color: section === s.id ? color : "hsl(var(--muted-foreground))", border: `1px solid ${section === s.id ? color + "40" : "hsl(var(--border))"}` }}>
            {s.label}
          </button>
        ))}
      </div>

      {section === "roster" && (
        <div className="space-y-3">
          {[
            { title: "Team Roster Manager", desc: "Weekly roster builder with role assignments" },
            { title: "Shift Briefing Generator", desc: "Pre-shift briefing with guest info, VIPs, dietary, activities" },
            { title: "Seasonal Staff Onboarding Plan", desc: "Structured onboarding for seasonal workers" },
            { title: "Staff Contact Directory", desc: "Emergency contacts and roles" },
          ].map(t => (
            <div key={t.title} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-foreground flex items-center gap-2"><NeonTeam size={14} /> {t.title}</div>
                <div className="text-[10px] text-muted-foreground ml-5">{t.desc}</div>
              </div>
              <button className="px-3 py-1 rounded-full text-[10px] font-medium shrink-0" style={{ background: color + "20", color }}>Generate</button>
            </div>
          ))}
        </div>
      )}

      {section === "training" && (
        <div className="rounded-xl border border-border bg-card p-4" style={{ borderColor: color + "20" }}>
          <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2"><NeonCheckmark size={16} /> Training Tracker</h3>
          <div className="space-y-2">
            {TRAINING_MODULES.map(m => (
              <div key={m.title} className="p-2.5 rounded-lg border border-border flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-foreground">{m.title}</div>
                  <div className="text-[10px] text-muted-foreground">{m.category} · <span className={m.priority === "Required" ? "text-destructive" : ""}>{m.priority}</span></div>
                </div>
                <button className="px-2.5 py-1 rounded-full text-[10px] font-medium shrink-0" style={{ background: color + "20", color }}>Train</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === "recognition" && (
        <div className="space-y-3">
          {[
            { title: "Staff Recognition Programme", desc: "Peer nominations, monthly awards, guest feedback highlights" },
            { title: "Guest Feedback — Staff Attribution", desc: "Link guest praise to specific team members" },
            { title: "Performance Review Template", desc: "Quarterly review tailored for hospitality roles" },
            { title: "Long Service Awards", desc: "1, 3, 5, 10 year milestones" },
          ].map(t => (
            <div key={t.title} className="rounded-xl border border-border bg-card p-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-foreground flex items-center gap-2"><NeonStar size={14} /> {t.title}</div>
                <div className="text-[10px] text-muted-foreground ml-5">{t.desc}</div>
              </div>
              <button className="px-3 py-1 rounded-full text-[10px] font-medium shrink-0" style={{ background: color + "20", color }}>Generate</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuraTeam;
