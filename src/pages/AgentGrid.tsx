import { useState, useRef } from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { agents, packs, echoAgent, pilotAgent } from "@/data/agents";
import AgentAvatar from "@/components/AgentAvatar";
import AgentCard from "@/components/AgentCard";
import ParticleField from "@/components/ParticleField";
import AnimatedHero from "@/components/AnimatedHero";
import BrandNav from "@/components/BrandNav";
import BrandFooter from "@/components/BrandFooter";
import { X, Zap, Users, BookOpen, Clock, Send, ArrowRight, Check } from "lucide-react";
import { NeonWave } from "@/components/NeonIcons";
import { toast } from "sonner";
import { motion } from "framer-motion";
import LiveDemoSection from "@/components/LiveDemoSection";
import EchoSection from "@/components/EchoSection";
import TurfSection from "@/components/TurfSection";
import AuraSection from "@/components/AuraSection";
import ApexSection from "@/components/ApexSection";
import ArohaSection from "@/components/ArohaSection";
import FAQSection from "@/components/FAQSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CompetitorComparison from "@/components/CompetitorComparison";
import TrustSection from "@/components/landing/TrustSection";
import IndustrySolutions from "@/components/landing/IndustrySolutions";
import PipelineSection from "@/components/landing/PipelineSection";
import KeyFeaturesSection from "@/components/landing/KeyFeaturesSection";
import PackShowcase from "@/components/landing/PackShowcase";

const PACK_META: Record<string, { sector: string; description: string }> = {
  manaaki: { sector: "Hospitality & Tourism", description: "Care for customers, hospitality operations, tourism, and venue management" },
  hanga: { sector: "Construction & Property", description: "Building, safety, consenting, and project governance for Aotearoa" },
  auaha: { sector: "Creative & Digital", description: "Brand, content, video, social, and creative production" },
  pakihi: { sector: "Business Operations", description: "Finance, HR, strategy, sales, risk, and operational excellence" },
  hangarau: { sector: "Technology & Infrastructure", description: "Software, security, DevOps, integrations, and monitoring" },
};

const SPECIALIST_GROUP = {
  label: "Specialist & Cross-Pack",
  description: "Purpose-built tools that work across every industry pack",
  sectors: ["Family & Life", "Māori & Te Tiriti", "Immigration", "Cross-pack"],
};

      {/* ═══════════════════════ LIVE DEMO / STATS ═══════════════════════ */}
      <LiveDemoSection />

      {/* ═══════════════════════ PACK SHOWCASE ═══════════════════════ */}
      <PackShowcase />

      {/* ═══════════════════════ PIPELINE ═══════════════════════ */}
      <PipelineSection />

      {/* ═══════════════════════ KEY FEATURES ═══════════════════════ */}
      <KeyFeaturesSection />

      {/* ═══════════════════════ FEATURED AGENTS ═══════════════════════ */}
      <TurfSection />
      <AuraSection />
      <ApexSection />
      <ArohaSection />
      <EchoSection />

      {/* ═══════════════════════ HOW IT WORKS ═══════════════════════ */}
      <section className="relative z-10 py-20 sm:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.h2
            className="text-2xl sm:text-4xl font-syne font-extrabold text-center mb-14 text-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            How it <span className="text-gradient-hero">works</span>
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div
                key={item.step}
                className="relative rounded-2xl p-6 group transition-colors duration-300 overflow-hidden border border-border bg-card"
                style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono-jb text-[10px] font-bold text-muted-foreground">{item.step}</span>
                  <div className="text-foreground">{item.icon}</div>
                </div>
                <h3 className="text-sm font-syne font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs font-jakarta text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ TRUST & TESTIMONIALS ═══════════════════════ */}
      <TrustSection />

      {/* ═══════════════════════ COMPETITOR COMPARISON ═══════════════════════ */}
      <CompetitorComparison />

      {/* ═══════════════════════ INDUSTRY SOLUTIONS ═══════════════════════ */}
      <IndustrySolutions />

      {/* ═══════════════════════ PRICING ═══════════════════════ */}
      <section className="relative z-10 py-20 sm:py-28 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-4xl font-syne font-extrabold text-foreground mb-3">
              Enterprise-grade business intelligence. <span className="text-gradient-hero">SME-friendly pricing.</span>
            </h2>
            <p className="text-sm font-jakarta text-muted-foreground mb-6">From $14/month. No lock-in. Cancel anytime.</p>

            {/* Annual/Monthly toggle */}
            <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-1.5 py-1.5">
              <button
                onClick={() => setIsAnnual(false)}
                className="px-4 py-1.5 rounded-full text-xs font-syne font-bold transition-all"
                style={{
                  background: !isAnnual ? "hsl(var(--primary))" : "transparent",
                  color: !isAnnual ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className="px-4 py-1.5 rounded-full text-xs font-syne font-bold transition-all"
                style={{
                  background: isAnnual ? "hsl(var(--primary))" : "transparent",
                  color: isAnnual ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                }}
              >
                Annual
                <span className="ml-1.5 text-[9px] font-mono-jb opacity-80">-15%</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PRICING_PLANS.map((plan) => {
              const price = plan.monthlyPrice === 0
                ? "$0"
                : isAnnual
                  ? `$${Math.round(plan.monthlyPrice * 0.85)}`
                  : `$${plan.monthlyPrice}`;
              const period = plan.monthlyPrice === 0 ? "" : "/mo";

              return (
                <div key={plan.name} className="relative pt-4">
                  {plan.highlighted && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 z-10 text-[10px] font-syne font-bold px-3 py-1 rounded-full" style={{ background: plan.color, color: "hsl(var(--background))" }}>
                      MOST POPULAR
                    </span>
                  )}
                  <div
                    className="relative rounded-2xl p-5 flex flex-col h-full border border-border bg-card"
                    style={{
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      borderColor: plan.highlighted ? plan.color + "30" : undefined,
                    }}
                  >
                    <span className="absolute top-0 left-[15%] right-[15%] h-px opacity-30" style={{ background: `linear-gradient(90deg, transparent, ${plan.color}, transparent)` }} />
                    <h3 className="text-base font-syne font-bold text-foreground">{plan.name}</h3>
                    <div className="flex items-baseline gap-0.5 my-3">
                      <span className="text-2xl font-syne font-extrabold" style={{ color: plan.color }}>{price}</span>
                      {period && <span className="text-[10px] font-jakarta text-muted-foreground">{period}</span>}
                    </div>
                    {isAnnual && plan.monthlyPrice > 0 && (
                      <p className="text-[9px] font-jakarta text-muted-foreground -mt-2 mb-2">
                        Billed ${Math.round(plan.monthlyPrice * 0.85 * 12)}/year
                      </p>
                    )}
                    <ul className="flex-1 space-y-1.5 mb-5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-[11px] font-jakarta text-foreground/70">
                          <Check size={11} className="mt-0.5 shrink-0" style={{ color: plan.color }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {plan.external ? (
                      <a
                        href={plan.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-center text-xs font-syne font-bold py-2.5 rounded-xl transition-all duration-300 hover:shadow-lg"
                        style={{
                          background: plan.highlighted ? plan.color : "transparent",
                          color: plan.highlighted ? "#0A0A14" : plan.color,
                          border: `1px solid ${plan.color}30`,
                          boxShadow: plan.highlighted ? `0 0 20px ${plan.color}20` : 'none',
                        }}
                      >
                        {plan.cta}
                      </a>
                    ) : (
                      <Link
                        to={plan.href}
                        className="block text-center text-xs font-syne font-bold py-2.5 rounded-xl transition-all duration-300"
                        style={{
                          background: plan.highlighted ? plan.color : "transparent",
                          color: plan.highlighted ? "#0A0A14" : plan.color,
                          border: `1px solid ${plan.color}30`,
                        }}
                      >
                        {plan.cta}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ HELM SPOTLIGHT ═══════════════════════ */}
      <section className="relative z-10 py-20 sm:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="font-mono-jb text-[10px] text-muted-foreground">ASM-013</span>
              <h2 className="text-2xl sm:text-4xl font-syne font-extrabold mt-1 mb-4 text-foreground">
                Meet <span className="text-gradient-hero">HELM</span>
              </h2>
              <p className="text-sm font-jakarta text-muted-foreground leading-relaxed mb-6">
                Your personal Life Admin & Household Manager. Upload receipts, plan meals, track budgets, and tame the chaos of daily life — purpose-built for New Zealand families.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {["Meal planning", "Budget tracking", "Document parsing", "School admin", "Life checklists"].map((t) => (
                  <span key={t} className="text-[10px] font-jakarta px-2.5 py-1 rounded-full border border-border text-muted-foreground">{t}</span>
                ))}
              </div>
              <Link to="/chat/operations" className="inline-flex items-center gap-2 text-sm font-syne font-bold text-foreground hover:text-gradient-hero transition-all duration-300">
                Try HELM <ArrowRight size={14} />
              </Link>
            </div>
            <div className="flex justify-center">
              <div className="w-64 h-64 rounded-2xl border border-border flex items-center justify-center overflow-hidden bg-card">
                <AgentAvatar agentId="operations" color="#B388FF" size={160} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ MARINER SPOTLIGHT ═══════════════════════ */}
      <section className="relative z-10 py-20 sm:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="flex justify-center order-2 lg:order-1">
              <div className="w-64 h-64 rounded-2xl border border-border flex items-center justify-center overflow-hidden bg-card">
                <AgentAvatar agentId="maritime" color="#26C6DA" size={160} />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <span className="font-mono-jb text-[10px] text-muted-foreground">ASM-028</span>
              <h2 className="text-2xl sm:text-4xl font-syne font-extrabold mt-1 mb-4 text-foreground">
                Meet <span className="text-gradient-hero">MARINER</span>
              </h2>
              <p className="text-sm font-jakarta text-muted-foreground leading-relaxed mb-6">
                Maritime NZ rules, crew safety obligations, and vessel compliance — translated from legislation into plain English. MARINER knows the waters of Aotearoa inside out.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {["Fishing regs", "Boat maintenance", "Marine weather", "Maritime compliance", "Coastguard courses"].map((t) => (
                  <span key={t} className="text-[10px] font-jakarta px-2.5 py-1 rounded-full border border-border text-muted-foreground">{t}</span>
                ))}
              </div>
              <Link to="/mariner" className="inline-flex items-center gap-2 text-sm font-syne font-bold text-foreground hover:text-gradient-hero transition-all duration-300">
                Explore MARINER <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ ALSO BY ASSEMBL ═══════════════════════ */}
      <section className="relative z-10 py-20 sm:py-28 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-4xl font-syne font-extrabold text-center text-foreground mb-14">
            Also by <span className="text-gradient-hero">Assembl</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {ALSO_BY_ASSEMBL.map((item) => (
              <div
                key={item.title}
                className="relative rounded-2xl p-6 overflow-hidden border border-border bg-card group transition-all duration-300 hover:-translate-y-1"
                style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
              >
                <span className="absolute top-0 left-[15%] right-[15%] h-px opacity-0 group-hover:opacity-40 transition-opacity" style={{ background: `linear-gradient(90deg, transparent, ${item.color}80, transparent)` }} />
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-4 bg-muted">
                  <Zap size={16} style={{ color: item.color }} />
                </div>
                <h3 className="text-sm font-syne font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs font-jakarta text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FAQ ═══════════════════════ */}
      <FAQSection />

      {/* ═══════════════════════ FOUNDER ═══════════════════════ */}
      <section className="relative z-10 py-20 sm:py-28 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.img
            src="/img/kate-neon.png"
            alt="Kate, Founder of Assembl"
            className="w-32 h-32 rounded-full mx-auto mb-6 object-contain border-2 border-border"
            loading="lazy"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          />
           <h2 className="text-2xl sm:text-3xl font-syne font-extrabold text-foreground mb-3 flex items-center justify-center gap-2">Built in Aotearoa</h2>
          <p className="text-sm font-jakarta text-muted-foreground leading-relaxed max-w-lg mx-auto mb-4">
            "I built Assembl because NZ businesses deserve specialist tools that understand our laws, our culture, and the way we work.
            Every tool is trained on real NZ legislation — not generic overseas advice."
          </p>
          <p className="text-xs font-syne font-bold text-foreground">Kate</p>
          <p className="text-[11px] font-jakarta text-muted-foreground">Founder, Assembl · Auckland</p>
        </div>
      </section>

      {/* ═══════════════════════ CONTACT ═══════════════════════ */}
      <section id="contact" className="relative z-10 py-20 sm:py-28 border-t border-border">
        <div className="max-w-lg mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-syne font-extrabold text-foreground mb-3">Get in touch</h2>
            <p className="text-sm font-jakarta text-muted-foreground">Custom builds, enterprise pricing, or just to say kia ora.</p>
          </div>
          <form
            onSubmit={handleContactSubmit}
            className="space-y-4 rounded-2xl p-6 border border-border bg-card"
            style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          >
            <div>
              <label className="block text-xs font-jakarta font-medium text-foreground/70 mb-1.5">Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-border bg-muted text-foreground font-jakarta focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs font-jakarta font-medium text-muted-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-border bg-muted text-foreground font-jakarta focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="your@email.co.nz"
              />
            </div>
            <div>
              <label className="block text-xs font-jakarta font-medium text-muted-foreground mb-1.5">Message</label>
              <textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl text-sm border border-border bg-muted text-foreground font-jakarta focus:outline-none focus:ring-2 focus:ring-ring resize-none transition-all"
                placeholder="Tell us what you need..."
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-syne font-bold bg-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] transition-all duration-300"
            >
              <Send size={14} /> Send message
            </button>
          </form>
        </div>
      </section>

      <div className="relative z-10">
        <BrandFooter />
      </div>
    </div>
  );
};

export default AgentGrid;
