import { useState } from "react";
import { TrendingUp, Calculator, BarChart3, ClipboardList, UserMinus, Calendar, ChevronRight, Copy, Award, Heart } from "lucide-react";

const AROHA_COLOR = "#FF6F91";

type Tool = "risk" | "incentive" | "salary" | "survey" | "exit" | "onboarding" | null;

const NZ_SALARY_DATA: Record<string, { low: number; mid: number; high: number }> = {
  "Marketing Manager": { low: 75000, mid: 95000, high: 120000 },
  "Software Developer": { low: 80000, mid: 110000, high: 150000 },
  "Accountant": { low: 65000, mid: 85000, high: 110000 },
  "Chef": { low: 52000, mid: 62000, high: 78000 },
  "Project Manager": { low: 85000, mid: 105000, high: 135000 },
  "Sales Executive": { low: 55000, mid: 72000, high: 100000 },
  "HR Advisor": { low: 65000, mid: 82000, high: 105000 },
  "Site Manager": { low: 90000, mid: 115000, high: 145000 },
  "Registered Nurse": { low: 60000, mid: 72000, high: 88000 },
  "Teacher": { low: 55000, mid: 72000, high: 90000 },
  "Admin/Office Manager": { low: 52000, mid: 65000, high: 82000 },
  "Electrician": { low: 60000, mid: 78000, high: 95000 },
  "Mechanic": { low: 55000, mid: 68000, high: 85000 },
  "Property Manager": { low: 55000, mid: 68000, high: 85000 },
};

const INDUSTRIES = ["Construction", "Hospitality", "Technology", "Retail", "Agriculture", "Professional Services", "Healthcare", "Automotive", "Property", "Sports/Recreation", "Maritime", "Manufacturing"];

export default function ArohaRetention() {
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const [copied, setCopied] = useState(false);

  // Risk Calculator
  const [staffCount, setStaffCount] = useState("");
  const [avgTenure, setAvgTenure] = useState("");
  const [industry, setIndustry] = useState("Construction");
  const [turnoverRate, setTurnoverRate] = useState("");
  const [riskResult, setRiskResult] = useState<any>(null);

  // Salary Benchmarker
  const [roleTitle, setRoleTitle] = useState("");
  const [salaryResult, setSalaryResult] = useState<any>(null);

  // Survey Generator
  const [surveyIndustry, setSurveyIndustry] = useState("Construction");
  const [surveyResult, setSurveyResult] = useState<string[] | null>(null);

  // Exit Interview
  const [exitIndustry, setExitIndustry] = useState("Construction");
  const [exitResult, setExitResult] = useState<string[] | null>(null);

  // Onboarding
  const [obRole, setObRole] = useState("");
  const [obIndustry, setObIndustry] = useState("Construction");
  const [obResult, setObResult] = useState<any>(null);

  const copy = (text: string) => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const calculateRisk = () => {
    const staff = parseInt(staffCount) || 10;
    const rate = parseFloat(turnoverRate) || 19.3;
    const avgSalary = 65000;
    const leaversPerYear = Math.round(staff * (rate / 100));
    const costPerReplacement = avgSalary * 0.75;
    const annualCost = leaversPerYear * costPerReplacement;
    const benchmark = 19.3;
    const riskLevel = rate > 25 ? "High" : rate > benchmark ? "Moderate" : "Low";
    const interventions = [];
    if (rate > 25) interventions.push("Implement stay interviews with top performers within 2 weeks");
    if (rate > benchmark) interventions.push("Review compensation against market benchmarks — staff may be underpaid");
    interventions.push("Launch a professional development programme with clear career pathways");
    if (parseFloat(avgTenure) < 2) interventions.push("Improve onboarding — first 90 days are critical for retention");
    setRiskResult({ staff, rate, leaversPerYear, costPerReplacement, annualCost, benchmark, riskLevel, interventions });
  };

  const benchmarkSalary = () => {
    const match = Object.entries(NZ_SALARY_DATA).find(([k]) => k.toLowerCase().includes(roleTitle.toLowerCase()) || roleTitle.toLowerCase().includes(k.toLowerCase()));
    if (match) {
      setSalaryResult({ role: match[0], ...match[1] });
    } else {
      setSalaryResult({ role: roleTitle, low: 55000, mid: 72000, high: 95000, note: "Estimated range — for precise data consult Seek, Hays, or Robert Half salary guides" });
    }
  };

  const generateSurvey = () => {
    const base = [
      "I feel valued for the work I do here.",
      "I have the tools and resources I need to do my job well.",
      "My manager provides helpful feedback and support.",
      "I see a clear path for career growth in this organisation.",
      "I feel comfortable raising concerns with my manager.",
      "The organisation cares about my wellbeing.",
      "I would recommend this organisation as a great place to work.",
      "I feel fairly compensated for the work I do.",
      "I understand how my work contributes to the organisation's goals.",
      "I have good work-life balance.",
      "Communication from leadership is clear and transparent.",
      "I have opportunities to learn and develop new skills.",
      "My team works well together.",
      "I feel proud to work here.",
      "I intend to still be working here in 12 months.",
    ];
    const industryQs: Record<string, string[]> = {
      Construction: ["I feel safe on site every day.", "My physical health is supported by my employer.", "I have access to the training I need for new regulations.", "Weather disruptions are handled fairly."],
      Hospitality: ["I feel supported during busy service periods.", "My roster gives me adequate rest between shifts.", "I have access to mental health support when needed.", "Tip/tronc distribution is fair and transparent."],
      Technology: ["I have flexibility in where and when I work.", "My technical skills are being developed.", "On-call expectations are reasonable.", "I feel included in remote/hybrid meetings."],
      Healthcare: ["I feel supported with my patient/client load.", "I have access to supervision and debriefing.", "My physical safety at work is prioritised."],
    };
    setSurveyResult([...base, ...(industryQs[surveyIndustry] || [])]);
  };

  const generateExitQuestions = () => {
    const base = [
      "What prompted you to start looking for a new role?",
      "What did you enjoy most about working here?",
      "What would you change about the organisation if you could?",
      "Did you feel you had opportunities for career growth?",
      "How would you describe the management style of your direct manager?",
      "Were you fairly compensated for your role?",
      "Did you feel your work was recognised and valued?",
      "Would you consider returning to this organisation in the future?",
      "What could we have done to keep you?",
      "Is there anything you'd like us to know that might help future employees?",
    ];
    const industryQs: Record<string, string[]> = {
      Construction: ["Did you feel safe on site?", "Were weather and seasonal disruptions managed fairly?", "Was your training and career progression adequate?"],
      Hospitality: ["Were your shifts and roster manageable?", "Did you feel supported during peak periods?", "Was tip/tronc distribution fair?"],
      Technology: ["Was the remote/flexible work policy adequate?", "Did you have opportunities to work with new technologies?", "Were on-call expectations reasonable?"],
    };
    setExitResult([...base, ...(industryQs[exitIndustry] || [])]);
  };

  const generateOnboarding = () => {
    const role = obRole || "New Employee";
    setObResult({
      preboarding: [`Send welcome email with first day details`, `Prepare workstation/equipment`, `Set up IT access and accounts`, `Send employment agreement for signing`, `Assign buddy/mentor`],
      day1: [`Welcome meeting with manager`, `Office/site tour and introductions`, `H&S induction (mandatory under HSWA 2015)`, `IT systems walkthrough`, `Lunch with team`],
      week1: [`Role-specific training sessions`, `Meet key stakeholders`, `Review KPIs and expectations`, `Set up regular 1:1 schedule`, `Complete all compliance training`],
      day30: [`First formal check-in with manager`, `Review initial KPIs`, `Identify any training gaps`, `Gather feedback on onboarding experience`, `Confirm probation progress`],
      day60: [`Mid-probation review`, `Adjust responsibilities if needed`, `Professional development planning`, `Team integration assessment`],
      day90: [`Probation review and confirmation`, `Set 6-month goals`, `Career development discussion`, `Full performance expectations in place`],
    });
  };

  const tools = [
    { id: "risk" as Tool, label: "Retention Risk", icon: <TrendingUp size={14} />, desc: "Calculate turnover cost" },
    { id: "incentive" as Tool, label: "Incentive Builder", icon: <Award size={14} />, desc: "Build reward programmes" },
    { id: "salary" as Tool, label: "Salary Benchmark", icon: <BarChart3 size={14} />, desc: "Compare market rates" },
    { id: "survey" as Tool, label: "Engagement Survey", icon: <ClipboardList size={14} />, desc: "Staff survey generator" },
    { id: "exit" as Tool, label: "Exit Interview", icon: <UserMinus size={14} />, desc: "Exit question templates" },
    { id: "onboarding" as Tool, label: "Onboarding Plan", icon: <Calendar size={14} />, desc: "30/60/90 day plans" },
  ];

  if (!activeTool) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Heart size={18} style={{ color: AROHA_COLOR }} />
          <h2 className="text-lg font-bold text-foreground">Retention & Incentives</h2>
        </div>
        <p className="text-xs text-muted-foreground">NZ staff turnover averages 19.3% — costing 50-200% of salary per replacement. Use these tools to build retention strategies that keep your best people.</p>
        <div className="grid grid-cols-2 gap-2">
          {tools.map(t => (
            <button key={t.id} onClick={() => setActiveTool(t.id)}
              className="flex flex-col items-start gap-1.5 p-3 rounded-xl border border-border bg-card hover:border-foreground/20 transition-all text-left group">
              <div className="flex items-center gap-2 w-full">
                <span style={{ color: AROHA_COLOR }}>{t.icon}</span>
                <span className="text-xs font-bold text-foreground flex-1">{t.label}</span>
                <ChevronRight size={12} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
              <span className="text-[10px] text-muted-foreground">{t.desc}</span>
            </button>
          ))}
        </div>
        <div className="p-3 rounded-xl border border-border bg-muted/50">
          <p className="text-[10px] text-muted-foreground"><strong>Pro tip:</strong> Ask AROHA in chat to "Build an employee incentive programme for my [industry] business" for a complete, tailored programme document.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <button onClick={() => { setActiveTool(null); setRiskResult(null); setSalaryResult(null); setSurveyResult(null); setExitResult(null); setObResult(null); }}
        className="text-xs text-muted-foreground hover:text-foreground">← Back to tools</button>

      {activeTool === "risk" && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><TrendingUp size={16} style={{ color: AROHA_COLOR }} /> Retention Risk Calculator</h3>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] text-muted-foreground">Staff count</label><input type="number" className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={staffCount} onChange={e => setStaffCount(e.target.value)} placeholder="e.g. 15" /></div>
            <div><label className="text-[10px] text-muted-foreground">Avg tenure (years)</label><input type="number" className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={avgTenure} onChange={e => setAvgTenure(e.target.value)} placeholder="e.g. 2.5" /></div>
            <div><label className="text-[10px] text-muted-foreground">Industry</label><select className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={industry} onChange={e => setIndustry(e.target.value)}>{INDUSTRIES.map(i => <option key={i}>{i}</option>)}</select></div>
            <div><label className="text-[10px] text-muted-foreground">Turnover rate (%)</label><input type="number" className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={turnoverRate} onChange={e => setTurnoverRate(e.target.value)} placeholder="19.3" /></div>
          </div>
          <button onClick={calculateRisk} className="px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: AROHA_COLOR, color: "#0A0A14" }}>Calculate Risk</button>
          {riskResult && (
            <div className="space-y-2 p-3 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${riskResult.riskLevel === "High" ? "bg-[#C85A54]/20 text-[#C85A54]" : riskResult.riskLevel === "Moderate" ? "bg-yellow-500/20 text-yellow-400" : "bg-[#5AADA0]/20 text-[#5AADA0]"}`}>{riskResult.riskLevel} Risk</span>
                <span className="text-[10px] text-muted-foreground">vs NZ benchmark: {riskResult.benchmark}%</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-muted"><p className="text-lg font-bold text-foreground">{riskResult.leaversPerYear}</p><p className="text-[9px] text-muted-foreground">Leavers/year</p></div>
                <div className="text-center p-2 rounded-lg bg-muted"><p className="text-lg font-bold" style={{ color: AROHA_COLOR }}>${Math.round(riskResult.costPerReplacement / 1000)}k</p><p className="text-[9px] text-muted-foreground">Cost/replacement</p></div>
                <div className="text-center p-2 rounded-lg bg-muted"><p className="text-lg font-bold text-foreground">${Math.round(riskResult.annualCost / 1000)}k</p><p className="text-[9px] text-muted-foreground">Annual cost</p></div>
              </div>
              <div className="space-y-1 mt-2">
                <p className="text-[10px] font-bold text-foreground">Top Recommended Interventions:</p>
                {riskResult.interventions.map((i: string, idx: number) => (
                  <p key={idx} className="text-[10px] text-muted-foreground flex items-start gap-1"><span style={{ color: AROHA_COLOR }}>→</span> {i}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTool === "incentive" && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Award size={16} style={{ color: AROHA_COLOR }} /> Incentive Programme Builder</h3>
          <p className="text-[10px] text-muted-foreground">For a complete, tailored incentive programme, ask AROHA in chat: <em>"Build an employee incentive programme for my [industry] business with [X] staff and a budget of $[Y] per person"</em></p>
          <div className="space-y-2">
            {[
              { title: "Performance Bonuses", desc: "KPI-based, team-based, or profit-sharing models with NZ tax treatment" },
              { title: "Recognition Programme", desc: "Peer nomination, monthly awards, milestone celebrations (1-25 years)" },
              { title: "Professional Development", desc: "Training budgets, conference allowances, study leave, mentorship" },
              { title: "Flexible Working", desc: "Hybrid policies, compressed weeks, school-hours roles, summer Fridays" },
              { title: "Wellness Programme", desc: "Mental health days, EAP, gym subsidies, health insurance top-ups" },
              { title: "Share/Ownership Scheme", desc: "Employee share schemes with NZ tax implications (ITA 2007)" },
            ].map(item => (
              <div key={item.title} className="p-2.5 rounded-lg border border-border bg-card/50">
                <p className="text-xs font-bold text-foreground">{item.title}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTool === "salary" && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><BarChart3 size={16} style={{ color: AROHA_COLOR }} /> NZ Salary Benchmarker</h3>
          <div><label className="text-[10px] text-muted-foreground">Role title</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={roleTitle} onChange={e => setRoleTitle(e.target.value)} placeholder="e.g. Marketing Manager" /></div>
          <button onClick={benchmarkSalary} disabled={!roleTitle} className="px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-40" style={{ backgroundColor: AROHA_COLOR, color: "#0A0A14" }}>Benchmark</button>
          {salaryResult && (
            <div className="p-3 rounded-xl border border-border bg-card space-y-2">
              <p className="text-xs font-bold text-foreground">{salaryResult.role} — NZ Market Range</p>
              <div className="flex items-end gap-1 h-24">
                {[{ label: "Low", val: salaryResult.low }, { label: "Mid", val: salaryResult.mid }, { label: "High", val: salaryResult.high }].map(b => (
                  <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-foreground">${(b.val / 1000).toFixed(0)}k</span>
                    <div className="w-full rounded-t-lg" style={{ height: `${(b.val / salaryResult.high) * 100}%`, backgroundColor: AROHA_COLOR + (b.label === "Mid" ? "CC" : "66") }} />
                    <span className="text-[9px] text-muted-foreground">{b.label}</span>
                  </div>
                ))}
              </div>
              {salaryResult.note && <p className="text-[9px] text-muted-foreground italic">{salaryResult.note}</p>}
              <p className="text-[9px] text-muted-foreground">Source: Aggregated NZ salary guide data (Seek, Hays, Robert Half 2025-2026)</p>
            </div>
          )}
        </div>
      )}

      {activeTool === "survey" && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><ClipboardList size={16} style={{ color: AROHA_COLOR }} /> Engagement Survey Generator</h3>
          <div><label className="text-[10px] text-muted-foreground">Industry</label><select className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={surveyIndustry} onChange={e => setSurveyIndustry(e.target.value)}>{INDUSTRIES.map(i => <option key={i}>{i}</option>)}</select></div>
          <button onClick={generateSurvey} className="px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: AROHA_COLOR, color: "#0A0A14" }}>Generate Survey</button>
          {surveyResult && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-foreground">{surveyResult.length} Questions — {surveyIndustry}</p>
                <button onClick={() => copy(surveyResult.map((q, i) => `${i + 1}. ${q}`).join("\n"))} className="text-[10px] flex items-center gap-1" style={{ color: AROHA_COLOR }}><Copy size={10} /> {copied ? "Copied!" : "Copy all"}</button>
              </div>
              <p className="text-[9px] text-muted-foreground mb-1">Response scale: Strongly Disagree (1) → Strongly Agree (5)</p>
              {surveyResult.map((q, i) => (
                <div key={i} className="p-2 rounded-lg border border-border bg-card/50 text-[10px] text-foreground">{i + 1}. {q}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTool === "exit" && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><UserMinus size={16} style={{ color: AROHA_COLOR }} /> Exit Interview Generator</h3>
          <div><label className="text-[10px] text-muted-foreground">Industry</label><select className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={exitIndustry} onChange={e => setExitIndustry(e.target.value)}>{INDUSTRIES.map(i => <option key={i}>{i}</option>)}</select></div>
          <button onClick={generateExitQuestions} className="px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: AROHA_COLOR, color: "#0A0A14" }}>Generate Questions</button>
          {exitResult && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-foreground">{exitResult.length} Exit Interview Questions</p>
                <button onClick={() => copy(exitResult.map((q, i) => `${i + 1}. ${q}`).join("\n"))} className="text-[10px] flex items-center gap-1" style={{ color: AROHA_COLOR }}><Copy size={10} /> {copied ? "Copied!" : "Copy all"}</button>
              </div>
              {exitResult.map((q, i) => (
                <div key={i} className="p-2 rounded-lg border border-border bg-card/50 text-[10px] text-foreground">{i + 1}. {q}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTool === "onboarding" && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Calendar size={16} style={{ color: AROHA_COLOR }} /> 30/60/90 Day Onboarding Plan</h3>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10px] text-muted-foreground">Role title</label><input className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={obRole} onChange={e => setObRole(e.target.value)} placeholder="e.g. Marketing Manager" /></div>
            <div><label className="text-[10px] text-muted-foreground">Industry</label><select className="w-full mt-0.5 px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground" value={obIndustry} onChange={e => setObIndustry(e.target.value)}>{INDUSTRIES.map(i => <option key={i}>{i}</option>)}</select></div>
          </div>
          <button onClick={generateOnboarding} className="px-4 py-2 rounded-lg text-xs font-bold" style={{ backgroundColor: AROHA_COLOR, color: "#0A0A14" }}>Generate Plan</button>
          {obResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-foreground">Onboarding: {obRole || "New Employee"}</p>
                <button onClick={() => {
                  const text = Object.entries(obResult).map(([k, v]) => `${k.toUpperCase()}:\n${(v as string[]).map(i => `• ${i}`).join("\n")}`).join("\n\n");
                  copy(text);
                }} className="text-[10px] flex items-center gap-1" style={{ color: AROHA_COLOR }}><Copy size={10} /> {copied ? "Copied!" : "Copy"}</button>
              </div>
              {Object.entries(obResult).map(([phase, items]) => (
                <div key={phase} className="p-2.5 rounded-lg border border-border bg-card/50">
                  <p className="text-[10px] font-bold text-foreground mb-1" style={{ color: AROHA_COLOR }}>
                    {phase === "preboarding" ? "📋 Pre-boarding" : phase === "day1" ? "🎉 Day 1" : phase === "week1" ? "📅 Week 1" : phase === "day30" ? "📊 Day 30" : phase === "day60" ? "🔄 Day 60" : "✅ Day 90"}
                  </p>
                  {(items as string[]).map((item, i) => (
                    <p key={i} className="text-[10px] text-muted-foreground ml-2">• {item}</p>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
