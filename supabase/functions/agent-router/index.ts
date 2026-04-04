import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ═══════════════════════════════════════════════════════════
// KEYWORD CLASSIFIER — 78 agents across 9 kete + Shared Core
// ═══════════════════════════════════════════════════════════

const AGENT_KEYWORDS: Record<string, string[]> = {
  // ── SHARED CORE (8) ──
  charter: ["governance", "director", "board", "constitution", "companies act", "shareholder", "annual return", "company office"],
  arbiter: ["dispute", "mediation", "arbitration", "tribunal", "legal remedy", "claims", "resolution", "small claims"],
  shield: ["privacy", "data", "ipp", "breach notification", "personal information", "privacy act", "data protection", "gdpr", "nzism"],
  anchor: ["non-profit", "nonprofit", "charity", "charities act", "incorporated society", "community", "grant", "funding"],
  aroha: ["employment", "hiring", "firing", "leave", "kiwisaver", "wages", "disciplinary", "grievance", "redundancy", "hr", "salary", "staff", "parental leave", "sick leave", "holiday pay", "era"],
  pulse: ["payroll", "paye", "acc levy", "minimum wage", "wage subsidy", "employment law", "trial period", "collective agreement"],
  scholar: ["education", "school", "training", "nzqa", "curriculum", "ero", "teacher", "student", "tertiary", "polytech"],
  nova: ["troubleshoot", "help", "general", "how do i", "what is", "explain", "operations"],

  // ── MANAAKI — Hospitality & Tourism (9) ──
  aura: ["guest", "front desk", "check-in", "checkout", "room", "housekeeping", "concierge", "accommodation", "hotel", "lodge", "motel"],
  saffron: ["food safety", "food act", "food control plan", "mpi", "allergen", "temperature log", "kitchen", "hygiene", "haccp", "fcp"],
  cellar: ["alcohol", "liquor", "licence", "sale of alcohol", "duty manager", "lcq", "bar", "wine", "spirits", "host responsibility"],
  luxe: ["luxury", "premium", "boutique", "five star", "vip", "suite", "high-end", "exclusive"],
  moana: ["tourism", "adventure", "activity", "tour operator", "booking", "itinerary", "visitor", "tramping", "kayak"],
  coast: ["coastal", "marine tourism", "beach", "snorkel", "dive", "boat tour", "whale watch", "dolphin"],
  kura: ["cultural tourism", "māori tourism", "marae", "hangi", "whakairo", "taonga", "cultural experience"],
  pau: ["event", "catering", "wedding", "function", "banquet", "conference", "venue", "run sheet"],
  summit: ["adventure regulation", "safety activity", "bungy", "jet boat", "rafting", "zipline", "outdoor safety"],

  // ── HANGA — Construction (9) ──
  arai: ["hazard", "safety", "h&s", "risk", "ppe", "incident", "worksafe", "swms", "sssp", "toolbox", "height", "scaffold", "fall", "induction", "notifiable"],
  kaupapa: ["payment claim", "project", "schedule", "variation", "cca", "gantt", "milestone", "budget", "programme", "delay", "progress", "retention", "subcontract"],
  ata: ["bim", "3d", "model", "clash", "revit", "ifc", "mep", "coordination", "digital twin", "autodesk"],
  rawa: ["resource", "procurement", "material", "supply chain", "equipment", "labour", "lbp"],
  whakaae: ["consent", "building consent", "ccc", "council", "code compliance", "bca", "resource consent", "rma"],
  pai: ["quality", "inspection", "defect", "ncr", "punch list", "snag", "producer statement", "itp"],
  arc: ["architecture", "building code", "design", "floor plan", "elevation", "nzs 3604", "branz", "architect"],
  terra: ["land", "property development", "subdivision", "title", "survey", "rma", "land use"],
  pinnacle: ["tender", "gets", "award", "application", "submission", "rfp", "rft", "proposal"],

  // ── AUAHA — Creative & Media (9) ──
  prism: ["brand", "brand identity", "logo", "visual identity", "brand guidelines", "brand dna", "colour palette"],
  muse: ["copy", "copywriting", "content", "blog", "article", "headline", "tagline", "caption", "write"],
  pixel: ["image", "photo", "design", "graphic", "visual", "illustration", "infographic", "canva"],
  verse: ["story", "narrative", "storytelling", "script", "screenplay", "creative writing"],
  echo: ["video", "production", "edit", "footage", "youtube", "reel", "tiktok", "animation"],
  flux: ["social media", "instagram", "facebook", "linkedin", "posting", "schedule", "publish", "feed"],
  chromatic: ["colour", "color", "aesthetic", "visual identity", "typography", "font", "design system"],
  rhythm: ["podcast", "audio", "sound", "music", "episode", "recording", "spotify"],
  market: ["advertising", "fair trading", "asa", "ad standards", "marketing compliance", "consumer guarantees"],

  // ── PAKIHI — Business & Commerce (11) ──
  ledger: ["accounting", "tax", "gst", "ird", "invoice", "bank reconciliation", "xero", "myob", "financial", "profit", "loss", "balance sheet"],
  vault: ["insurance", "policy", "claim", "cover", "premium", "liability", "indemnity", "broker"],
  catalyst: ["recruitment", "talent", "hire", "job listing", "candidate", "interview", "onboarding", "seek"],
  compass: ["immigration", "visa", "work permit", "aewv", "residence", "essential skills", "inz", "accredited employer"],
  haven: ["real estate", "property", "rental", "tenant", "landlord", "rta", "tenancy", "bond", "healthy homes", "letting"],
  counter: ["retail", "consumer", "shop", "store", "consumer guarantees act", "cga", "pos", "merchandise"],
  gateway: ["customs", "import", "export", "tariff", "hs code", "border", "freight", "customs broker", "mpi", "biosecurity"],
  harvest: ["agriculture", "farm", "dairy", "livestock", "pastoral", "fonterra", "irrigation", "feedlot", "agri"],
  grove: ["horticulture", "wine", "viticulture", "orchard", "kiwifruit", "pip fruit", "export"],
  sage: ["strategy", "analytics", "insight", "market research", "benchmarking", "competitor", "swot"],
  ascend: ["growth", "scale", "expansion", "performance", "kpi", "okr", "planning"],

  // ── WAKA — Transport & Vehicles (3) ──
  motor: ["automotive", "car", "vehicle", "dealership", "motor vehicle", "wof", "cof", "rego", "mvsa", "used car"],
  transit: ["transport", "trucking", "logistics", "freight", "nzta", "heavy vehicle", "logbook", "ruc", "chain rule"],
  mariner: ["maritime", "vessel", "ship", "boat", "seafarer", "maritime transport", "coastguard", "port"],

  // ── HANGARAU — Technology (12) ──
  spark: ["app", "software", "code", "deploy", "cloud", "saas", "platform", "api", "build"],
  sentinel: ["monitoring", "uptime", "alert", "incident", "observability", "grafana", "datadog"],
  "nexus-t": ["integration", "api management", "webhook", "connector", "middleware", "zapier"],
  cipher: ["cybersecurity", "encryption", "penetration test", "vulnerability", "owasp", "ssl", "tls"],
  relay: ["messaging", "notification", "email", "sms", "push", "communication system"],
  matrix: ["database", "data architecture", "schema", "migration", "etl", "data warehouse"],
  forge: ["devops", "ci/cd", "pipeline", "deployment", "docker", "kubernetes", "terraform"],
  oracle: ["predictive", "ml", "machine learning", "forecast", "ai model", "analytics"],
  ember: ["energy", "carbon", "sustainability", "emissions", "net zero", "ets"],
  reef: ["environment", "resource management", "rma", "discharge", "consent", "epa"],
  patent: ["ip", "intellectual property", "patent", "trademark", "copyright", "iponz"],
  foundry: ["manufacturing", "production", "factory", "industrial", "lean", "supply"],

  // ── HAUORA — Health, Wellbeing, Sport & Lifestyle (8) ──
  turf: ["sports", "recreation", "club", "incorporated society", "committee", "agm", "fixtures"],
  league: ["competition", "tournament", "league", "season", "draw", "fixture", "event management"],
  vitals: ["workplace health", "hswa", "health and safety", "acc", "injury", "wellbeing"],
  remedy: ["healthcare", "medical", "hpcaa", "practitioner", "clinic", "patient", "nzmc"],
  vitae: ["nutrition", "diet", "food standards", "supplements", "dietary", "meal plan"],
  radiance: ["beauty", "wellness", "spa", "salon", "cosmetics", "skincare", "hairdresser"],
  palette: ["interior design", "décor", "space planning", "renovation", "furniture", "fit-out"],
  odyssey: ["travel", "tourism regulation", "booking", "itinerary", "airline", "accommodation"],

  // ── TE KĀHUI REO — Māori Business Intelligence (8) ──
  whanau: ["whānau", "whanau", "family governance", "hapū", "hapu"],
  rohe: ["rohe", "region", "local governance", "council", "iwi region"],
  "kaupapa-m": ["kaupapa māori", "kaupapa maori", "tikanga", "mātauranga", "te ao māori"],
  mana: ["mana whenua", "te tiriti", "treaty", "iwi engagement", "settlement"],
  kaitiaki: ["kaitiakitanga", "guardianship", "environmental stewardship", "taonga"],
  taura: ["community", "network", "support", "connection", "tāura"],
  whakaaro: ["strategic māori", "māori perspective", "whakaaro", "planning"],
  hiringa: ["resilience", "innovation", "growth", "hiringa", "strength"],

  // ── TŌROA — Family Navigator (1) ──
  toroa: ["family", "school", "kids", "children", "meal", "bus", "homework", "budget", "grocery", "reminder", "whānau navigator"],

  // ── TE REO (legacy, kept for backward compat) ──
  tereo: ["te reo", "māori language", "macron", "pronunciation", "kupu", "translate", "mihi", "karakia"],
};

// Pack membership for context loading
const AGENT_PACK: Record<string, string> = {
  // Shared Core
  charter: "shared", arbiter: "shared", shield: "shared", anchor: "shared",
  aroha: "shared", pulse: "shared", scholar: "shared", nova: "shared",
  // Manaaki
  aura: "manaaki", saffron: "manaaki", cellar: "manaaki", luxe: "manaaki",
  moana: "manaaki", coast: "manaaki", kura: "manaaki", pau: "manaaki", summit: "manaaki",
  // Hanga
  arai: "hanga", kaupapa: "hanga", ata: "hanga", rawa: "hanga",
  whakaae: "hanga", pai: "hanga", arc: "hanga", terra: "hanga", pinnacle: "hanga",
  // Auaha
  prism: "auaha", muse: "auaha", pixel: "auaha", verse: "auaha",
  echo: "auaha", flux: "auaha", chromatic: "auaha", rhythm: "auaha", market: "auaha",
  // Pakihi
  ledger: "pakihi", vault: "pakihi", catalyst: "pakihi", compass: "pakihi",
  haven: "pakihi", counter: "pakihi", gateway: "pakihi", harvest: "pakihi",
  grove: "pakihi", sage: "pakihi", ascend: "pakihi",
  // Waka
  motor: "waka", transit: "waka", mariner: "waka",
  // Hangarau
  spark: "hangarau", sentinel: "hangarau", "nexus-t": "hangarau", cipher: "hangarau",
  relay: "hangarau", matrix: "hangarau", forge: "hangarau", oracle: "hangarau",
  ember: "hangarau", reef: "hangarau", patent: "hangarau", foundry: "hangarau",
  // Hauora
  turf: "hauora", league: "hauora", vitals: "hauora", remedy: "hauora",
  vitae: "hauora", radiance: "hauora", palette: "hauora", odyssey: "hauora",
  // Te Kāhui Reo
  whanau: "te-kahui-reo", rohe: "te-kahui-reo", "kaupapa-m": "te-kahui-reo",
  mana: "te-kahui-reo", kaitiaki: "te-kahui-reo", taura: "te-kahui-reo",
  whakaaro: "te-kahui-reo", hiringa: "te-kahui-reo",
  // Tōroa
  toroa: "toroa",
  // Legacy
  tereo: "shared",
};

function classifyAgent(message: string, explicitAgent?: string): string {
  if (explicitAgent && AGENT_KEYWORDS[explicitAgent]) return explicitAgent;
  const lc = message.toLowerCase();
  let bestAgent = "nova"; // Default to NOVA (general ops) instead of iho
  let bestScore = 0;
  for (const [agent, keywords] of Object.entries(AGENT_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lc.includes(kw)) score += kw.length > 5 ? 2 : 1;
    }
    if (score > bestScore) { bestScore = score; bestAgent = agent; }
  }
  return bestAgent;
}

// ═══════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, packId, agentId, messages = [] } = await req.json();
    if (!message) {
      return new Response(JSON.stringify({ error: "message is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Classify which agent should handle this
    const selectedAgent = classifyAgent(message, agentId);
    const agentPack = AGENT_PACK[selectedAgent] || packId || "shared";

    // Load agent prompt from DB
    const { data: agentPrompt } = await supabase
      .from("agent_prompts")
      .select("*")
      .eq("agent_name", selectedAgent)
      .eq("is_active", true)
      .single();

    // Load shared compliance prompts (privacy, tikanga, copywriter)
    const { data: sharedPrompts } = await supabase
      .from("agent_prompts")
      .select("system_prompt")
      .eq("pack", "shared")
      .eq("is_active", true)
      .in("agent_name", ["shield", "charter", "aroha"]);

    const basePrompt = agentPrompt?.system_prompt ||
      `You are ${selectedAgent.toUpperCase()}, an Assembl specialist agent for New Zealand businesses. Help with queries in your area of expertise. Reference relevant NZ legislation where applicable. Write in NZ English with macrons on all Māori words.`;

    const complianceRules = (sharedPrompts || []).map(p => p.system_prompt).join("\n\n");

    const systemPrompt = `${basePrompt}\n\n--- COMPLIANCE & GOVERNANCE LAYER ---\n${complianceRules}\n\nAlways respond in a helpful, professional tone. Use markdown formatting. Reference NZ legislation where applicable. Use NZ English spelling. Include macrons on all Māori words.`;

    const conversationMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role, content: m.content,
      })),
      { role: "user", content: message },
    ];

    // Model selection from DB preference
    const MODEL_MAP: Record<string, string> = {
      "gemini-2.5-flash": "google/gemini-2.5-flash",
      "gemini-2.5-pro": "google/gemini-2.5-pro",
      "gemini-3.1-pro-preview": "google/gemini-3.1-pro-preview",
      "gemini-3-flash-preview": "google/gemini-3-flash-preview",
      "gemini-2.5-flash-lite": "google/gemini-2.5-flash-lite",
      "gpt-5": "openai/gpt-5",
      "gpt-5-mini": "openai/gpt-5-mini",
    };
    const rawPref = agentPrompt?.model_preference || "gemini-3-flash-preview";
    const model = MODEL_MAP[rawPref] || `google/${rawPref}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: conversationMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please top up." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", status, errText);
      throw new Error(`AI error: ${status}`);
    }

    const headers = new Headers(corsHeaders);
    headers.set("Content-Type", "text/event-stream");
    headers.set("X-Agent-Name", encodeURIComponent(agentPrompt?.display_name || selectedAgent.toUpperCase()));
    headers.set("X-Agent-Code", selectedAgent);
    headers.set("X-Agent-Icon", agentPrompt?.icon || "Brain");
    headers.set("X-Agent-Pack", agentPack);
    headers.set("X-Agent-Model", model);
    headers.set("Access-Control-Expose-Headers", "X-Agent-Name, X-Agent-Code, X-Agent-Icon, X-Agent-Pack, X-Agent-Model");

    return new Response(response.body, { headers });
  } catch (e) {
    console.error("agent-router error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
