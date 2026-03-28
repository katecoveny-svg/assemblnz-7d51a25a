import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";
import { Shield, Eye, Scale, Lock, Users, FileText, AlertTriangle, Globe, Database, MessageSquare, BookOpen } from "lucide-react";

const SECTIONS = [
  {
    icon: Eye,
    accent: "hsl(var(--primary))",
    title: "1. Transparency & Disclosure",
    items: [
      "All Assembl agents clearly identify as AI. They will never impersonate a human.",
      "Regulatory and compliance guidance always includes a disclaimer that it is AI-generated and not a substitute for professional legal, financial, or accounting advice.",
      "When uncertain, agents explicitly acknowledge limitations rather than fabricating information.",
      "All generated content (emails, documents, reports) is flagged as AI-generated and should be reviewed before use.",
    ],
  },
  {
    icon: Shield,
    accent: "hsl(var(--primary))",
    title: "2. Accuracy & Hallucination Prevention",
    items: [
      "Agents never fabricate legislation names, section numbers, case law, statistics, dates, dollar amounts, compliance deadlines, or government agency statements.",
      "When citing NZ legislation, only Acts that are confidently known are referenced, using the full name and year (e.g., \"Health and Safety at Work Act 2015\").",
      "For compliance deadlines, agents always recommend verification with the relevant authority.",
      "Agents prefer directing users to authoritative sources over guessing at specific details.",
    ],
  },
  {
    icon: Lock,
    accent: "hsl(160, 84%, 50%)",
    title: "3. Privacy & Data Protection (Privacy Act 2020)",
    items: [
      "Agents never ask for personal information beyond what is needed for the conversation.",
      "Sensitive or confidential business information shared by users is not stored or referenced beyond the current conversation.",
      "Users are reminded not to input sensitive personal information (IRD numbers, bank details, employee records) into the chat.",
      "For personal information handling queries, agents reference the Privacy Act 2020 and the Office of the Privacy Commissioner (privacy.org.nz).",
      "All user input is treated as potentially confidential.",
    ],
  },
  {
    icon: Users,
    accent: "hsl(var(--cyan))",
    title: "4. Human-in-the-Loop Decision Making",
    items: [
      "Assembl provides guidance and information — agents do not make decisions for users.",
      "For high-stakes matters (legal compliance, financial decisions, employment disputes, H&S incidents, disciplinary actions), users are always recommended to consult a qualified professional.",
      "Responses are framed as informational guidance, not directives.",
      "For matters involving potential legal liability, financial penalty, or harm, professional advice is explicitly recommended.",
    ],
  },
  {
    icon: Scale,
    accent: "hsl(var(--pink))",
    title: "5. Fairness & Non-Discrimination",
    items: [
      "Equal quality of service is provided regardless of user background, industry, business size, or any protected characteristic under the Human Rights Act 1993.",
      "Agents do not make assumptions about users based on name, location, industry, or writing style.",
      "For employment, recruitment, or HR matters, discrimination risks are flagged proactively.",
      "Agents are designed to recognise and correct potential biases that may disadvantage any group, including Māori, Pacific peoples, women, disabled people, LGBTIQ+ communities, and older people.",
    ],
  },
  {
    icon: Globe,
    accent: "hsl(var(--primary))",
    title: "6. Māori Data & Cultural Considerations",
    items: [
      "Te reo Māori, Māori imagery, tikanga, and mātauranga Māori are treated with respect.",
      "Māori cultural knowledge, traditional practices, or indigenous intellectual property are not reproduced or commercialised without appropriate context.",
      "For Māori land, Treaty settlement entities, iwi governance, or tikanga matters, cultural significance is acknowledged and engagement with Māori experts is recommended.",
      "The distinction between noa (non-sensitive) and tapu (sacred) Māori data is recognised.",
    ],
  },
  {
    icon: FileText,
    accent: "hsl(var(--cyan))",
    title: "7. Consumer Protection",
    items: [
      "Agents never generate misleading claims about products, services, or outcomes.",
      "No false urgency, fake scarcity, or deceptive marketing content is created.",
      "When helping draft marketing materials, any content that could breach the Fair Trading Act 1986 is flagged.",
      "For consumer rights queries, users are directed to the Commerce Commission (comcom.govt.nz).",
    ],
  },
  {
    icon: BookOpen,
    accent: "hsl(var(--pink))",
    title: "8. Intellectual Property",
    items: [
      "Users are informed that AI-generated outputs may not receive full copyright protection under NZ law.",
      "IP risks are flagged when content is based on or substantially similar to existing copyrighted works.",
      "Users are recommended to maintain records of human authorship and editing of AI-assisted creations.",
      "Substantial portions of copyrighted material are never reproduced.",
    ],
  },
  {
    icon: Database,
    accent: "hsl(var(--primary))",
    title: "9. Cybersecurity Awareness",
    items: [
      "Agents never generate, suggest, or assist with actions that could compromise system security.",
      "Secure practices are always recommended (HTTPS, strong passwords, 2FA, least-privilege access).",
      "AI-generated code is flagged for proper QA before production deployment.",
      "For potential security breaches, users are directed to NCSC (ncsc.govt.nz) and reminded of Privacy Act notification obligations.",
    ],
  },
  {
    icon: AlertTriangle,
    accent: "hsl(var(--cyan))",
    title: "10. Recordkeeping & Accountability",
    items: [
      "Users are recommended to document advice received and actions taken.",
      "Maintaining records of how AI is used in business is suggested, per MBIE guidance.",
      "For AI governance queries, the MBIE Responsible AI Guidance for Businesses is referenced.",
    ],
  },
  {
    icon: MessageSquare,
    accent: "hsl(var(--pink))",
    title: "11. Feedback & Escalation",
    items: [
      "If a user expresses dissatisfaction or indicates information may be wrong, this is acknowledged immediately with an offer to contact Assembl support (assembl@assembl.co.nz).",
      "Human assistance is always available as an option.",
      "Agents never argue with users about the accuracy of their own output.",
    ],
  },
];

const LEGISLATION = [
  "Privacy Act 2020",
  "Fair Trading Act 1986",
  "Consumer Guarantees Act 1993",
  "Health and Safety at Work Act 2015",
  "Human Rights Act 1993",
  "New Zealand Bill of Rights Act 1990",
  "Companies Act 1993",
  "Employment Relations Act 2000",
  "Incorporated Societies Act 2022",
  "Commerce Act 1986",
  "Contract and Commercial Law Act 2017",
  "Copyright Act 1994",
  "Harmful Digital Communications Act 2015",
];

const DataPrivacyLegal = () => (
  <div className="min-h-screen bg-background text-foreground">
    <SEO
      title="Data Privacy & Responsible AI | Assembl"
      description="How Assembl complies with the MBIE Responsible AI Guidance for Businesses, the Privacy Act 2020, and NZ legislation. Transparency, fairness, and accountability."
    />
    <BrandNav />

    {/* Hero */}
    <section className="relative py-24 px-6 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, hsl(var(--primary) / 0.06), transparent 70%)",
        }}
      />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-mono tracking-wider uppercase mb-8"
          style={{
            background: "hsl(var(--primary) / 0.08)",
            border: "1px solid hsl(var(--primary) / 0.2)",
            color: "hsl(var(--primary))",
          }}
        >
          <Shield size={12} />
          MBIE Responsible AI Aligned
        </div>
        <h1
          className="font-syne font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6"
          style={{
            background: "linear-gradient(135deg, #00FF88, #00E5FF, #A855F7, #1E3A5F)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Data Privacy &<br />Responsible AI
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Assembl is built in Aotearoa and follows the NZ Government's Responsible AI Guidance
          for Businesses (MBIE, July 2025). Here's exactly how we protect your data and ensure
          our AI agents operate transparently, fairly, and accountably.
        </p>
      </div>
    </section>

    {/* Sections */}
    <section className="px-6 pb-20">
      <div className="max-w-4xl mx-auto space-y-8">
        {SECTIONS.map((s) => (
          <div
            key={s.title}
            className="rounded-2xl p-6 sm:p-8"
            style={{
              background: "hsl(var(--surface-1) / 0.03)",
              border: "1px solid hsl(var(--border) / 0.5)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${s.accent}15` }}
              >
                <s.icon size={16} style={{ color: s.accent }} />
              </div>
              <h2 className="font-syne font-bold text-lg text-foreground">{s.title}</h2>
            </div>
            <ul className="space-y-3">
              {s.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: s.accent }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Legislation reference */}
        <div
          className="rounded-2xl p-6 sm:p-8"
          style={{
            background: "hsl(var(--surface-1) / 0.03)",
            border: "1px solid hsl(var(--border) / 0.5)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "hsl(var(--primary) / 0.1)" }}
            >
              <Scale size={16} style={{ color: "hsl(var(--primary))" }} />
            </div>
            <h2 className="font-syne font-bold text-lg text-foreground">
              Relevant NZ Legislation
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {LEGISLATION.map((act) => (
              <span
                key={act}
                className="text-[11px] font-mono px-3 py-1.5 rounded-full text-muted-foreground"
                style={{
                  background: "hsl(var(--surface-2) / 0.4)",
                  border: "1px solid hsl(var(--border) / 0.4)",
                }}
              >
                {act}
              </span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="text-center pt-8">
          <p className="text-sm text-muted-foreground mb-2">
            Questions about our data practices or AI governance?
          </p>
          <a
            href="mailto:assembl@assembl.co.nz"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:opacity-90"
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
            }}
          >
            <MessageSquare size={14} />
            Contact assembl@assembl.co.nz
          </a>
        </div>
      </div>
    </section>

    <BrandFooter />
  </div>
);

export default DataPrivacyLegal;
