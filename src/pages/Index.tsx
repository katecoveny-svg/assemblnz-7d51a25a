import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, Send, Check } from "lucide-react";
import KeteHero from "@/components/KeteHero";
import KetePackSelector from "@/components/KetePackSelector";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import SEO from "@/components/SEO";

/* ─── Shared ─── */
const Eyebrow = ({ children }: { children: string }) => (
  <span className="inline-block text-[11px] font-bold tracking-[3px] uppercase mb-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#D4A843" }}>
    {children}
  </span>
);
const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-6" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, color: "#FFFFFF", lineHeight: 1.2 }}>
    {children}
  </h2>
);
const Body = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-base sm:text-lg leading-relaxed ${className}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.6)" }}>
    {children}
  </p>
);

const SECTION_STYLE = "relative px-6 sm:px-8 py-20 sm:py-28";
const INNER = "max-w-5xl mx-auto";

const TanikoDivider = () => (
  <svg width="300" height="8" viewBox="0 0 300 8" fill="none" aria-hidden="true" className="mx-auto mb-4">
    <path d="M0 4L10 0L20 4L30 0L40 4L50 0L60 4L70 0L80 4L90 0L100 4L110 0L120 4L130 0L140 4L150 0L160 4L170 0L180 4L190 0L200 4L210 0L220 4L230 0L240 4L250 0L260 4L270 0L280 4L290 0L300 4" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none"/>
  </svg>
);

/* ─── How-it-works steps ─── */
const STEPS = [
  { num: "01", title: "You ask", body: "Start with a real business task, problem, or workflow." },
  { num: "02", title: "Assembl routes", body: "The platform picks the right specialist agents and applies your business context." },
  { num: "03", title: "You move faster", body: "Get practical output, clearer decisions, and less admin drag." },
];

/* ─── Page ─── */
const Index = () => {
  const isMobile = useIsMobile();
  const packsRef = useRef<HTMLDivElement>(null);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMsg, setContactMsg] = useState("");

  const scrollToPacks = () => packsRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: inserted, error } = await supabase.from("contact_submissions").insert({ name: contactName, email: contactEmail, message: contactMsg }).select("id").single();
      if (error) throw error;
      toast.success("Message sent. We'll get back to you soon.");
      setContactName(""); setContactEmail(""); setContactMsg("");
      supabase.functions.invoke("send-contact-email", { body: { name: contactName, email: contactEmail, message: contactMsg } }).catch(console.error);
      if (inserted?.id) supabase.functions.invoke("qualify-lead", { body: { submissionId: inserted.id } }).catch(console.error);
    } catch { toast.error("Something went wrong. Please try again."); }
  };

  const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-60px" as const }, transition: { duration: 0.6 } };

  return (
    <div className="min-h-screen" style={{ background: "#09090F", color: "#FFFFFF" }}>
      <SEO title="Assembl — The Operating System for NZ Business" description="Nine specialist kete. 78 agents. One platform built for Aotearoa business." />
      <BrandNav />

      {/* ═══ 1. HERO ═══ */}
      <section className="relative flex flex-col items-center text-center px-6 sm:px-8 pt-20 sm:pt-28 pb-16" style={{ zIndex: 1 }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 30%, rgba(212,168,67,0.05) 0%, transparent 70%)", zIndex: 0 }} />

        {[...Array(16)].map((_, i) => (
          <div key={i} className="absolute rounded-full animate-pulse pointer-events-none" style={{
            width: 1.5 + Math.random() * 2, height: 1.5 + Math.random() * 2,
            top: `${10 + Math.random() * 70}%`, left: `${5 + Math.random() * 90}%`,
            background: "#FFFFFF", opacity: 0.12 + Math.random() * 0.18,
            animationDelay: `${Math.random() * 4}s`, animationDuration: `${3 + Math.random() * 4}s`,
            zIndex: 0,
          }} />
        ))}

        <motion.h1
          className="relative max-w-4xl"
          style={{
            fontFamily: "'Lato', sans-serif",
            fontWeight: 300,
            fontSize: isMobile ? "2.25rem" : "4.5rem",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            zIndex: 1,
          }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
        >
          The operating system for{" "}
          <span style={{ color: "#D4A843" }}>NZ business.</span>
        </motion.h1>

        <KeteHero />

        <motion.p
          className="relative max-w-2xl mt-6 text-lg sm:text-xl leading-relaxed"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "rgba(255,255,255,0.65)", zIndex: 1 }}
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
        >
          Nine specialist kete. 78 agents. Built in Aotearoa for the way NZ business actually works.
        </motion.p>

        {/* CTAs */}
        <motion.div className="relative flex flex-col sm:flex-row gap-3 mt-10" style={{ zIndex: 1 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.55 }}>
          <Link to="/contact" className="cta-glass-green inline-flex items-center justify-center gap-2 px-8 py-4 text-base rounded-full font-medium">
            Book a free consultation <ArrowRight size={16} />
          </Link>
          <button onClick={scrollToPacks} className="cta-glass-outline inline-flex items-center justify-center gap-2 px-8 py-4 text-base rounded-full">
            See all nine kete →
          </button>
        </motion.div>

        <motion.button onClick={scrollToPacks} className="mt-12" style={{ color: "rgba(255,255,255,0.25)", zIndex: 1 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <ChevronDown size={24} />
          </motion.div>
        </motion.button>
      </section>

      {/* ═══ 2. WHAT IS A KETE — The core explainer ═══ */}
      <section ref={packsRef} id="kete" className={SECTION_STYLE} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-4">
            <Eyebrow>NGĀ KETE O TE WĀNANGA</Eyebrow>
            <SectionHeading>
              Nine baskets of knowledge.<br />
              <span style={{ color: "#D4A843" }}>One for every kind of NZ business.</span>
            </SectionHeading>
          </motion.div>

          <motion.div {...fade}>
            <Body className="text-center max-w-2xl mx-auto mb-4">
              In te ao Māori, a kete is a woven basket — a vessel for knowledge, tools, and wisdom carried from one place to another.
            </Body>
            <Body className="text-center max-w-2xl mx-auto mb-16">
              Assembl's nine kete work the same way. Each one holds specialist agents who know your industry inside out — the legislation, the workflows, the terminology, the compliance. Pick the kete that fits your business. Everything inside is ready to use.
            </Body>
          </motion.div>

          <TanikoDivider />

          <div className="mt-10">
            <KetePackSelector />
          </div>

          <motion.div {...fade} className="text-center mt-14">
            <p className="text-base mb-4" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              All nine kete are included on every plan.
            </p>
            <Link to="/pricing" className="cta-glass-outline inline-flex items-center gap-2 px-8 py-3.5 text-sm rounded-full">
              See pricing <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ 3. HOW IT WORKS ═══ */}
      <section id="how-it-works" className={SECTION_STYLE} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-10">
            <Eyebrow>HOW IT WORKS</Eyebrow>
            <SectionHeading>One request. The right intelligence.</SectionHeading>
            <Body className="max-w-xl mx-auto">
              You ask. Assembl picks the right specialist agents, applies your business context, and delivers output you can actually use.
            </Body>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <motion.div key={s.num} className="rounded-2xl p-8 relative" style={{ background: "rgba(15,15,26,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}>
                <span className="text-5xl font-light absolute top-5 right-6" style={{ fontFamily: "'Lato', sans-serif", color: "rgba(212,168,67,0.1)" }}>{s.num}</span>
                <h3 className="text-2xl mb-3 mt-4" style={{ fontFamily: "'Lato', sans-serif", fontWeight: 400, color: "#FFFFFF" }}>{s.title}</h3>
                <Body>{s.body}</Body>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 4. PRICING SUMMARY ═══ */}
      <section id="pricing" className={SECTION_STYLE} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className={INNER}>
          <motion.div {...fade} className="text-center mb-12">
            <Eyebrow>PRICING</Eyebrow>
            <SectionHeading>Simple pricing. All kete included.</SectionHeading>
            <Body className="max-w-xl mx-auto mb-2">
              Every plan includes all nine kete, all 78 agents, and all core platform features. No add-ons.
            </Body>
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-full" style={{ background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.25)" }}>
              <span className="text-sm font-semibold" style={{ color: "#D4A843", fontFamily: "'JetBrains Mono', monospace" }}>
                NZ$749 + GST one-time setup fee
              </span>
            </div>
            <p className="text-sm mt-2" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Workflow mapping, agent configuration, tool integration, and onboarding included.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {[
              { name: "Essentials", price: "$199", period: "/mo NZD + GST", users: "2 users", queries: "500 queries/mo", accent: "#3A7D6E", trial: "14-day free trial" },
              { name: "Business", price: "$399", period: "/mo NZD + GST", users: "10 users", queries: "2,000 queries/mo", accent: "#D4A843", trial: "Most popular", popular: true },
              { name: "Enterprise", price: "$799", period: "/mo NZD + GST", users: "Unlimited users", queries: "Unlimited queries", accent: "#5B8FA8", trial: "Custom integrations" },
            ].map((tier, i) => (
              <motion.div
                key={tier.name}
                className="rounded-2xl p-7 relative"
                style={{
                  background: tier.popular ? "rgba(212,168,67,0.06)" : "rgba(15,15,26,0.6)",
                  border: `1px solid ${tier.popular ? "rgba(212,168,67,0.25)" : "rgba(255,255,255,0.07)"}`,
                }}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold tracking-widest px-3 py-1 rounded-full" style={{ background: "#D4A843", color: "#0F1623", fontFamily: "'JetBrains Mono', monospace" }}>
                    MOST POPULAR
                  </span>
                )}
                <h3 className="text-xl font-semibold mb-1" style={{ fontFamily: "'Lato', sans-serif", color: "#FFFFFF" }}>{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-light" style={{ fontFamily: "'Lato', sans-serif", color: tier.accent }}>{tier.price}</span>
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{tier.period}</span>
                </div>
                <div className="space-y-2 mb-6">
                  {[tier.users, tier.queries, "All 9 kete", "All 78+ agents"].map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <Check size={14} style={{ color: tier.accent, flexShrink: 0 }} />
                      <span className="text-sm" style={{ color: "rgba(255,255,255,0.65)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs" style={{ color: `${tier.accent}AA`, fontFamily: "'JetBrains Mono', monospace" }}>{tier.trial}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fade} className="text-center">
            <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Save 20% with annual billing. All prices NZD + GST.
            </p>
            <Link to="/pricing" className="cta-glass-green inline-flex items-center gap-2 px-8 py-3.5 text-sm rounded-full">
              View full pricing <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ 5. CONTACT ═══ */}
      <section id="contact" className={SECTION_STYLE} style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div className={`${INNER} max-w-xl mx-auto`}>
          <motion.div {...fade} className="text-center mb-10">
            <Eyebrow>GET STARTED</Eyebrow>
            <SectionHeading>Talk to us.</SectionHeading>
            <Body className="max-w-md mx-auto">
              Tell us what your business does and we'll show you exactly which kete and agents can run it. Free, no obligation.
            </Body>
          </motion.div>
          <motion.form onSubmit={handleContact} className="rounded-2xl p-8 space-y-4" style={{ background: "rgba(15,15,26,0.6)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 0 30px rgba(212,168,67,0.08), 0 4px 24px rgba(0,0,0,0.4)" }}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Your name" required
              className="w-full px-4 py-3 rounded-xl text-base font-body text-white placeholder:text-white/30 focus:outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
            <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" placeholder="Email" required
              className="w-full px-4 py-3 rounded-xl text-base font-body text-white placeholder:text-white/30 focus:outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
            <textarea value={contactMsg} onChange={(e) => setContactMsg(e.target.value)} placeholder="Tell us about your business and what you need help with" rows={4} required
              className="w-full px-4 py-3 rounded-xl text-base font-body text-white placeholder:text-white/30 focus:outline-none resize-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
            <button type="submit" className="cta-glass-green w-full py-4 rounded-full text-base font-medium flex items-center justify-center gap-2">
              Send message <Send size={16} />
            </button>
          </motion.form>
        </div>
      </section>

      <BrandFooter />
    </div>
  );
};

export default Index;
