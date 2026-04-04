/* cache-bust */ import { useState, useRef } from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ParticleField from "@/components/ParticleField";
import AnimatedHero from "@/components/AnimatedHero";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { Send, ArrowRight } from "lucide-react";
import { manaIcon, maharaIcon, kanohiIcon, ihoIcon, pakihiMark } from "@/assets/brand";
import { toast } from "sonner";
import { motion } from "framer-motion";
import PackGrid from "@/components/landing/PackGrid";
import EmbedDemoSection from "@/components/landing/EmbedDemoSection";

const KoruMotif = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true" className="opacity-80">
    <path
      d="M40 8C40 8 20 16 20 36C20 50 30 56 40 56C50 56 56 48 56 40C56 32 50 28 44 28C38 28 34 32 34 36C34 40 38 44 42 44C46 44 48 42 48 40"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const TanikoMotif = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true" className="opacity-80">
    <path d="M10 20L20 30L30 20L40 30L50 20L60 30L70 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M10 32L20 42L30 32L40 42L50 32L60 42L70 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M10 44L20 54L30 44L40 54L50 44L60 54L70 44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M10 56L20 66L30 56L40 66L50 56L60 66L70 56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

const MauaoMotif = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true" className="opacity-80">
    <path d="M8 68L30 24L40 36L56 16L72 68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M8 68H72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const TanikoDivider = () => (
  <svg width="300" height="8" viewBox="0 0 300 8" fill="none" aria-hidden="true" className="mx-auto mb-4 h-2 w-full max-w-[300px] opacity-70">
    <path
      d="M0 4L10 0L20 4L30 0L40 4L50 0L60 4L70 0L80 4L90 0L100 4L110 0L120 4L130 0L140 4L150 0L160 4L170 0L180 4L190 0L200 4L210 0L220 4L230 0L240 4L250 0L260 4L270 0L280 4L290 0L300 4"
      stroke="currentColor"
      strokeWidth="1"
      fill="none"
    />
  </svg>
);

const OUTCOME_CARDS = [
  {
    title: "Close Faster",
    description:
      "Better proposals start with speed. Assembl cuts the busywork, so your team pitches more, quotes tighter, closes harder.",
    motif: KoruMotif,
    accentClass: "text-[hsl(var(--kowhai))]",
    glowClass: "outcome-card--kowhai",
    motifPosition: "left-0 top-0",
  },
  {
    title: "Run It Right",
    description:
      "Every NZ business juggles payroll, tax, compliance, schedules. Assembl handles it. Your team focuses on the work that makes money.",
    motif: TanikoMotif,
    accentClass: "text-[hsl(var(--pounamu))]",
    glowClass: "outcome-card--pounamu",
    motifPosition: "right-0 top-0",
  },
  {
    title: "Alerts That Count",
    description:
      "NZ compliance changes weekly. Assembl flags what affects you — regulation, deadline, opportunity — so you're never caught flat.",
    motif: MauaoMotif,
    accentClass: "text-[hsl(var(--tangaroa))]",
    glowClass: "outcome-card--tangaroa",
    motifPosition: "left-1/2 bottom-0 -translate-x-1/2",
  },
] as const;

const AgentGrid = () => {
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const packsRef = useRef<HTMLDivElement>(null);

  const scrollToPacks = () => {
    packsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = contactName.trim();
    const trimmedEmail = contactEmail.trim();
    const trimmedMessage = contactMessage.trim();
    try {
      const { data: inserted, error } = await supabase.from("contact_submissions").insert({
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
      }).select("id").single();
      if (error) throw error;

      supabase.functions.invoke("send-contact-email", {
        body: { name: trimmedName, email: trimmedEmail, message: trimmedMessage },
      }).catch((err) => console.error("Contact email error:", err));

      if (inserted?.id) {
        supabase.functions.invoke("qualify-lead", {
          body: { submissionId: inserted.id },
        }).catch((err) => console.error("Lead qualification error:", err));
      }

      toast.success("Message sent! We'll be in touch soon.");
      setContactName("");
      setContactEmail("");
      setContactMessage("");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      console.error("Contact form error:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <SEO
        title="Assembl | The Operating System for NZ Business | 42 Specialist AI Agents"
        description="42 specialist AI agents across five industry packs. Quoting, payroll, planning, marketing, compliance, and execution — built for Aotearoa. From $89/mo."
        path="/"
      />
      <ParticleField />

      <div className="relative z-10">
        <BrandNav />
      </div>

      {/* ═══════ HERO ═══════ */}
      <div className="relative z-10">
        <AnimatedHero onScrollToGrid={scrollToPacks} />
      </div>

      {/* ═══════ OUTCOME SECTION ═══════ */}
      <section className="relative z-10 py-20" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "1.75rem", color: "#FFFFFF", marginBottom: "0.75rem" }}>
              What Assembl does for your business
            </h2>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "14px", color: "rgba(255,255,255,0.5)", maxWidth: "480px", margin: "0 auto" }}>
              Three outcomes that matter. Everything else follows.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                mark: ihoIcon,
                title: "Win work",
                desc: "Faster quotes, sharper proposals, better follow-up. Assembl helps you win more of the work you're already chasing.",
              },
              {
                mark: pakihiMark,
                title: "Run work",
                desc: "Payroll, compliance, scheduling, client comms — the operational grind handled by specialists that know NZ law.",
              },
              {
                mark: manaIcon,
                title: "Stay sharp",
                desc: "Legislation changes, deadline alerts, industry shifts — Assembl keeps you ahead without the reading.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="rounded-xl p-6"
                style={{
                  background: "rgba(15,15,26,0.7)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <img src={item.mark} alt="" className="w-6 h-6 mb-3 opacity-70" />
                <h3 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "18px", color: "#FFFFFF", marginBottom: "8px" }}>
                  {item.title}
                </h3>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ INDUSTRY PACKS ═══════ */}
      <div ref={packsRef}>
        <PackGrid />
      </div>

      {/* ═══════ WHY ASSEMBL ═══════ */}
      <section className="relative z-10 py-20" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "1.75rem", color: "#FFFFFF", marginBottom: "0.75rem" }}>
              Why Assembl
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                mark: manaIcon,
                title: "NZ context",
                desc: "Trained on 50+ New Zealand Acts. Employment, health & safety, building, food safety, privacy — your obligations, not American advice.",
              },
              {
                mark: maharaIcon,
                title: "Shared business memory",
                desc: "Every agent shares context about your business. Ask one, and the others already know. No re-explaining.",
              },
              {
                mark: ihoIcon,
                title: "Specialist agents",
                desc: "42 agents, each an expert in their domain. Not a chatbot pretending to know everything — dedicated specialists that go deep.",
              },
              {
                mark: kanohiIcon,
                title: "Multi-channel delivery",
                desc: "Chat, SMS, voice, email, embedded widgets. Your team gets answers wherever they already work.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="rounded-xl p-6"
                style={{
                  background: "rgba(15,15,26,0.7)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <img src={item.mark} alt="" className="w-5 h-5 mb-2.5 opacity-70" />
                <h3 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "16px", color: "#FFFFFF", marginBottom: "6px" }}>
                  {item.title}
                </h3>
                <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "13px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ LIVE DEMO ═══════ */}
      <EmbedDemoSection />

      {/* ═══════ LAUNCH SPRINT ═══════ */}
      <section id="launch-sprint" className="relative z-10 py-20" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "1.75rem", color: "#FFFFFF", marginBottom: "0.75rem" }}>
              Book a Launch Sprint — <span style={{ color: "#D4A843" }}>now open</span>
            </h2>
            <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "14px", color: "rgba(255,255,255,0.5)", maxWidth: "480px", margin: "0 auto 2rem" }}>
              We map your workflows, design your automation, and deploy your Assembl instance. Early access pricing locked in.
            </p>
          </motion.div>

          <form
            onSubmit={handleContactSubmit}
            className="space-y-4 rounded-xl p-6 text-left"
            style={{
              background: "rgba(15,15,26,0.8)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div>
              <label className="block text-xs mb-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground focus:outline-none transition-all duration-300"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground focus:outline-none transition-all duration-300"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                placeholder="your@email.co.nz"
              />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>Tell us about your business</label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-foreground focus:outline-none resize-none transition-all duration-300"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
                placeholder="Industry, team size, biggest pain point..."
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm transition-all duration-300"
              style={{
                fontFamily: "'Lato', sans-serif",
                fontWeight: 400,
                background: "#D4A843",
                border: "1px solid #D4A843",
                color: "#09090F",
                boxShadow: "0 0 20px rgba(212,168,67,0.2)",
              }}
            >
              <Send size={14} /> Book a Launch Sprint
            </button>
          </form>
        </div>
      </section>

      {/* ═══════ CONTACT ═══════ */}
      <section id="contact" className="relative z-10 py-16" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-lg mx-auto px-4 sm:px-6 text-center">
          <h2 style={{ fontFamily: "'Lato', sans-serif", fontWeight: 300, fontSize: "1.5rem", color: "#FFFFFF", marginBottom: "0.5rem" }}>
            Get in touch
          </h2>
          <p style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "14px", color: "rgba(255,255,255,0.5)" }}>
            Enterprise pricing, custom builds, or just to say kia ora.
          </p>
          <p className="mt-3">
            <a href="mailto:assembl@assembl.co.nz" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "14px", color: "#D4A843" }}>
              assembl@assembl.co.nz
            </a>
          </p>
        </div>
      </section>

      <div className="relative z-10">
        <BrandFooter />
      </div>
    </div>
  );
};

export default AgentGrid;
