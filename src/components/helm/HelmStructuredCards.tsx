import { useState } from "react";

const CARD_STYLE: React.CSSProperties = {
  background: "#0F0F1C",
  border: "1px solid #B388FF15",
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
};

/* ─── Meal Plan Card ─── */
interface MealDay {
  day: string;
  meals: string[];
  cost?: string;
}

export const MealPlanCard = ({
  days,
  onGenerateList,
}: {
  days: MealDay[];
  onGenerateList: () => void;
}) => (
  <div style={CARD_STYLE} className="p-4 space-y-3">
    <h4 className="text-sm font-bold" style={{ color: "#B388FF" }}>
      🍽️ Weekly Meal Plan
    </h4>
    {days.map((d) => (
      <div key={d.day} className="border-b border-[#B388FF10] pb-2 last:border-0">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold" style={{ color: "#B388FF" }}>
            {d.day}
          </span>
          {d.cost && <span className="text-[10px] text-foreground/40">{d.cost}</span>}
        </div>
        {d.meals.map((m, i) => (
          <p key={i} className="text-xs text-foreground/70 pl-2">
            {m}
          </p>
        ))}
      </div>
    ))}
    <button
      onClick={onGenerateList}
      className="w-full text-xs font-medium py-2 rounded-lg transition-colors"
      style={{
        background: "#B388FF15",
        color: "#B388FF",
        border: "1px solid #B388FF25",
      }}
    >
      Generate Shopping List
    </button>
  </div>
);

/* ─── Budget Card ─── */
interface BudgetRow {
  category: string;
  amount: number;
}

export const BudgetCard = ({
  rows,
  income,
}: {
  rows: BudgetRow[];
  income: number;
}) => {
  const total = rows.reduce((s, r) => s + r.amount, 0);
  const pct = income > 0 ? (total / income) * 100 : 0;
  const barColor = pct > 100 ? "#FF4D6A" : pct > 85 ? "#FFB800" : "#00FF88";

  return (
    <div style={CARD_STYLE} className="p-4 space-y-2">
      <h4 className="text-sm font-bold" style={{ color: "#B388FF" }}>
        💰 Household Budget
      </h4>
      {rows.map((r) => (
        <div key={r.category} className="flex justify-between text-xs">
          <span className="text-foreground/70">{r.category}</span>
          <span className="text-foreground/90 font-mono text-[11px]">
            ${r.amount.toLocaleString()}
          </span>
        </div>
      ))}
      <div className="pt-2 border-t border-[#B388FF10]">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-foreground">Total</span>
          <span className="text-foreground">${total.toLocaleString()}</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-[#ffffff08] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }}
          />
        </div>
        <p className="text-[10px] text-foreground/40 mt-1">
          {pct.toFixed(0)}% of income (${income.toLocaleString()})
        </p>
      </div>
    </div>
  );
};

/* ─── Schedule Card ─── */
interface ScheduleBlock {
  time: string;
  activity: string;
  person?: string;
  color?: string;
}

interface ScheduleDay {
  day: string;
  blocks: ScheduleBlock[];
}

export const ScheduleCard = ({ days }: { days: ScheduleDay[] }) => (
  <div style={CARD_STYLE} className="p-4 overflow-x-auto">
    <h4 className="text-sm font-bold mb-3" style={{ color: "#B388FF" }}>
      📅 Weekly Schedule
    </h4>
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(days.length, 7)}, minmax(100px, 1fr))` }}>
      {days.map((d) => (
        <div key={d.day}>
          <p className="text-[10px] font-bold text-center mb-1.5" style={{ color: "#B388FF" }}>
            {d.day}
          </p>
          <div className="space-y-1">
            {d.blocks.map((b, i) => (
              <div
                key={i}
                className="rounded-md px-1.5 py-1 text-[9px]"
                style={{
                  backgroundColor: (b.color || "#B388FF") + "18",
                  borderLeft: `2px solid ${b.color || "#B388FF"}`,
                }}
              >
                <span className="font-semibold text-foreground/60">{b.time}</span>
                <p className="text-foreground/80 leading-tight">{b.activity}</p>
                {b.person && <p className="text-foreground/40">{b.person}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);
