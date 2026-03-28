# Italia 2026 Trip Planner — Full Source Reference

This is the complete source code from Kate & Adrian's Italy trip planner app (italia2026.netlify.app).
These are the key files that VOYAGE (the Assembl travel agent) was reverse-engineered from.

**Stack:** React + TypeScript + Tailwind + Supabase (real-time sync) + Vite
**Deployment:** Netlify

---


## `src/types/trip.ts`

```ts
// Shared types for trip sync
export type Profile = {
  id: string;
  display_name: string;
  trip_role: 'k' | 'a';
};

```


## `src/App.tsx`

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProfileSetup } from "@/components/trip/ProfileSetup";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Install from "./pages/Install.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-serif italic text-primary">Kate &amp; Adrian</p>
          <p className="text-xs text-muted-foreground mt-2 tracking-widest uppercase">Italia 2026</p>
        </div>
      </div>
    );
  }

  if (!user) return <Routes><Route path="*" element={<Login />} /></Routes>;
  if (!profile) return <ProfileSetup />;

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/install" element={<Install />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

```


## `src/pages/Index.tsx`

```tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HOTELS, ActivityType } from "@/data/tripData";
import { TripHeader } from "@/components/trip/TripHeader";
import { TimelineView } from "@/components/trip/TimelineView";
import { HotelsView } from "@/components/trip/HotelsView";
import { UrgentView } from "@/components/trip/UrgentView";
import { BudgetView } from "@/components/trip/BudgetView";
import { FoodView } from "@/components/trip/FoodView";
import { PackingView } from "@/components/trip/PackingView";
import { MapView } from "@/components/trip/MapView";
import { ExpenseView } from "@/components/trip/ExpenseView";
import { CountdownView } from "@/components/trip/CountdownView";
import { NotesView } from "@/components/trip/NotesView";
import { ExportView } from "@/components/trip/ExportView";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTripSync } from "@/hooks/useTripSync";
import {
  Map, Calendar, Hotel, AlertTriangle, Wallet, Utensils, ShoppingBag,
  Download, Check, LogOut, Loader2, Receipt, StickyNote, Timer,
} from "lucide-react";

type View = "countdown" | "timeline" | "hotels" | "urgent" | "budget" | "food" | "packing" | "map" | "expenses" | "notes" | "export";

const FLIGHT_PER_PAX = 4850;

// Nav groups for cleaner layout
const PRIMARY_VIEWS: View[] = ["countdown", "timeline", "hotels", "map"];

export default function Index() {
  const navigate = useNavigate();
  const { profile, tripRole, user, signOut } = useAuth();
  const {
    days, votes, alreadyBooked, selectedNzd, customHotels, packing, expenses, notes, synced,
    toggleActivity, handleVote,
    handleSetCustomHotel, handleSelectOption, handleMarkBooked,
    handlePackingToggle, handlePackingAdd, handlePackingRemove,
    handleAddExpense, handleDeleteExpense,
    handleAddNote, handleUpdateNote, handleDeleteNote,
  } = useTripSync();

  const [view, setView] = useState<View>("countdown");
  const [pax, setPax] = useState(2);
  const [customActs, setCustomActs] = useState<Record<string, { nm: string; c: number; tp: ActivityType; bk: boolean }[]>>({});
  const [showInstallNudge, setShowInstallNudge] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const dismissed = sessionStorage.getItem("install-nudge-dismissed");
    if (!isStandalone && !dismissed && /iphone|ipad|android/i.test(navigator.userAgent)) {
      setShowInstallNudge(true);
    }
  }, []);

  // Close "More" menu when main view changes
  useEffect(() => { setMoreOpen(false); }, [view]);

  const urgentCount = days.reduce((s, d) => s + d.sg.filter(a => a.nt?.includes("⚠") && !a.bk).length, 0);
  const packingDone = Object.values(packing).reduce((s, items) => s + items.filter(i => i.k && i.a).length, 0);
  const packingTotal = Object.values(packing).reduce((s, items) => s + items.length, 0);

  const addCustomAct = (di: number, nm: string, cost: number) => {
    const key = `d${di}`;
    setCustomActs(prev => ({ ...prev, [key]: [...(prev[key] ?? []), { nm, c: cost, tp: "experience", bk: false }] }));
  };
  const removeCustomAct = (di: number, ci: number) => {
    const key = `d${di}`;
    setCustomActs(prev => { const arr = [...(prev[key] ?? [])]; arr.splice(ci, 1); return { ...prev, [key]: arr }; });
  };
  const toggleCustomAct = (di: number, ci: number) => {
    const key = `d${di}`;
    setCustomActs(prev => ({ ...prev, [key]: (prev[key] ?? []).map((a, i) => i === ci ? { ...a, bk: !a.bk } : a) }));
  };

  // Bottom nav items (primary)
  type NavItem = { id: View; label: string; icon: React.ReactNode; badge?: number | string };
  const BOTTOM_NAV: NavItem[] = [
    { id: "countdown", label: "Home", icon: <Timer className="w-5 h-5" /> },
    { id: "timeline", label: "Days", icon: <Calendar className="w-5 h-5" /> },
    { id: "hotels", label: "Hotels", icon: <Hotel className="w-5 h-5" /> },
    { id: "map", label: "Route", icon: <Map className="w-5 h-5" /> },
  ];

  // "More" drawer items
  const MORE_NAV: NavItem[] = [
    { id: "urgent", label: urgentCount > 0 ? `Urgent (${urgentCount})` : "Urgent", icon: <AlertTriangle className="w-4 h-4" />, badge: urgentCount || undefined },
    { id: "budget", label: "Budget", icon: <Wallet className="w-4 h-4" /> },
    { id: "expenses", label: "Expenses", icon: <Receipt className="w-4 h-4" /> },
    { id: "food", label: "Food Guide", icon: <Utensils className="w-4 h-4" /> },
    { id: "packing", label: packingDone === packingTotal && packingTotal > 0 ? "Packing ✓" : "Packing", icon: packingDone === packingTotal && packingTotal > 0 ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" /> },
    { id: "notes", label: notes.length > 0 ? `Notes (${notes.length})` : "Notes", icon: <StickyNote className="w-4 h-4" /> },
    { id: "export", label: "Export PDFs", icon: <Download className="w-4 h-4" /> },
  ];

  const isMoreActive = MORE_NAV.some(n => n.id === view);

  return (
    <div className="min-h-screen bg-background font-sans pb-20">
      {/* Install nudge */}
      {showInstallNudge && (
        <div className="bg-primary text-primary-foreground px-4 py-2.5 flex items-center gap-3 text-[11px]">
          <Download className="w-4 h-4 shrink-0 opacity-70" />
          <span className="flex-1">Add to your home screen for offline access</span>
          <button onClick={() => navigate("/install")}
            className="bg-white/20 hover:bg-white/30 transition-colors rounded-full px-3 py-1 font-semibold shrink-0">
            Install
          </button>
          <button onClick={() => { setShowInstallNudge(false); sessionStorage.setItem("install-nudge-dismissed", "1"); }}
            className="opacity-60 hover:opacity-100 transition-opacity text-lg leading-none">×</button>
        </div>
      )}

      <TripHeader
        days={days} hotels={HOTELS} customNzd={customHotels}
        selectedNzd={selectedNzd} alreadyBooked={alreadyBooked}
        pax={pax} flightPerPax={FLIGHT_PER_PAX}
      />

      {/* User identity bar */}
      <div className="max-w-3xl mx-auto px-4 pt-2 pb-1 flex items-center justify-end gap-2">
        {!synced && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
        <div className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0",
          tripRole === 'k' ? "bg-primary" : "bg-gold"
        )}>
          {profile?.display_name?.[0] ?? "?"}
        </div>
        <span className="text-[11px] text-muted-foreground">{profile?.display_name ?? ""}</span>
        <button onClick={signOut} title="Sign out"
          className="p-1.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <main className={cn("max-w-3xl mx-auto px-4", view === "map" ? "py-2" : "py-4")}>
        {view === "countdown" && (
          <CountdownView
            days={days} alreadyBooked={alreadyBooked} customHotels={customHotels}
            packing={packing} urgentCount={urgentCount}
            onNavigate={(v) => setView(v as View)}
          />
        )}
        {view === "map" && (
          <MapView days={days} alreadyBooked={alreadyBooked} customHotels={customHotels} onNavigate={(v) => setView(v as View)} />
        )}
        {view === "timeline" && (
          <TimelineView days={days} votes={votes} customActs={customActs}
            onToggle={toggleActivity} onVote={handleVote}
            onAddCustom={addCustomAct} onRemoveCustom={removeCustomAct} onToggleCustom={toggleCustomAct}
          />
        )}
        {view === "hotels" && (
          <HotelsView customHotels={customHotels} selectedNzd={selectedNzd} alreadyBooked={alreadyBooked}
            onSetCustom={handleSetCustomHotel} onSelectOption={handleSelectOption} onMarkBooked={handleMarkBooked}
          />
        )}
        {view === "urgent" && <UrgentView days={days} onToggle={toggleActivity} />}
        {view === "budget" && (
          <BudgetView days={days} pax={pax} setPax={setPax}
            customHotels={customHotels} selectedNzd={selectedNzd} alreadyBooked={alreadyBooked}
            flightPerPax={FLIGHT_PER_PAX} customActs={customActs}
          />
        )}
        {view === "expenses" && (
          <ExpenseView expenses={expenses} onAdd={handleAddExpense} onDelete={handleDeleteExpense} currentUserRole={tripRole ?? "k"} />
        )}
        {view === "food" && <FoodView />}
        {view === "packing" && (
          <PackingView packing={packing} onToggle={handlePackingToggle} onAddItem={handlePackingAdd} onRemoveItem={handlePackingRemove} />
        )}
        {view === "notes" && (
          <NotesView notes={notes} onAdd={handleAddNote} onUpdate={handleUpdateNote} onDelete={handleDeleteNote} currentUserId={user?.id ?? ""} />
        )}
        {view === "export" && <ExportView />}
      </main>

      {/* ── Fixed bottom navigation ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-background/98 backdrop-blur border-t border-border safe-area-pb">
        <div className="max-w-3xl mx-auto flex items-end">
          {BOTTOM_NAV.map(({ id, label, icon }) => {
            const active = view === id;
            return (
              <button
                key={id}
                onClick={() => setView(id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "rounded-xl px-3 py-1 transition-all",
                  active ? "bg-primary/10" : ""
                )}>
                  {icon}
                </div>
                <span className={cn("text-[10px] font-medium", active ? "text-primary" : "")}>{label}</span>
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(v => !v)}
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all relative",
              isMoreActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "rounded-xl px-3 py-1 transition-all",
              isMoreActive ? "bg-primary/10" : ""
            )}>
              <div className="w-5 h-5 flex flex-col justify-center items-center gap-[3px]">
                <span className={cn("w-4 h-[1.5px] rounded-full bg-current transition-all", moreOpen ? "rotate-45 translate-y-[4.5px]" : "")} />
                <span className={cn("w-4 h-[1.5px] rounded-full bg-current transition-all", moreOpen ? "opacity-0" : "")} />
                <span className={cn("w-4 h-[1.5px] rounded-full bg-current transition-all", moreOpen ? "-rotate-45 -translate-y-[4.5px]" : "")} />
              </div>
            </div>
            <span className={cn("text-[10px] font-medium", isMoreActive ? "text-primary" : "")}>More</span>
            {urgentCount > 0 && (
              <span className="absolute top-1.5 right-4 w-4 h-4 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center">
                {urgentCount}
              </span>
            )}
          </button>
        </div>

        {/* More drawer */}
        {moreOpen && (
          <div className="border-t border-border bg-background/98 backdrop-blur animate-in slide-in-from-bottom-2 duration-200">
            <div className="max-w-3xl mx-auto px-4 py-3 grid grid-cols-3 gap-2">
              {MORE_NAV.map(({ id, label, icon, badge }) => {
                const active = view === id;
                return (
                  <button
                    key={id}
                    onClick={() => setView(id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all",
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : id === "urgent" && urgentCount > 0
                          ? "bg-card border-destructive/40 text-destructive hover:bg-destructive/5"
                          : "bg-card border-border text-foreground hover:bg-secondary"
                    )}
                  >
                    <span className="shrink-0">{icon}</span>
                    <span className="text-[11px] font-medium leading-tight">{label}</span>
                    {typeof badge === "number" && badge > 0 && (
                      <span className="ml-auto w-4 h-4 rounded-full bg-destructive text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}

```


## `src/pages/Login.tsx`

```tsx
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

type Mode = "signin" | "signup";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [mode,     setMode]     = useState<Mode>("signin");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [info,     setInfo]     = useState<string | null>(null);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setInfo(null);
    setLoading(true);
    if (mode === "signin") {
      const { error: err } = await signIn(email, password);
      if (err) setError(err.message);
    } else {
      const { error: err } = await signUp(email, password);
      if (err) setError(err.message);
      else setInfo("Check your email to confirm your account, then sign in.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
      {/* Brand header */}
      <div className="text-center mb-10 fade-up">
        <h1 className="text-[38px] font-light italic text-primary font-serif leading-none">Kate &amp; Adrian</h1>
        <p className="text-sm font-sans tracking-[0.2em] uppercase text-muted-foreground mt-2">Italia 2026</p>
        <p className="text-[11px] text-muted-foreground mt-1 opacity-60">25 May – 10 Jun</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-md p-7 fade-up delay-1">
        {/* Mode toggle */}
        <div className="flex rounded-lg border border-border overflow-hidden mb-6">
          {(["signin", "signup"] as Mode[]).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(null); setInfo(null); }}
              className={cn(
                "flex-1 py-2 text-[12px] font-medium transition-colors",
                mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              )}>
              {m === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <form onSubmit={handle} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email" required placeholder="Email address"
              value={email} onChange={e => setEmail(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type={show ? "text" : "password"} required placeholder="Password" minLength={6}
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
            <button type="button" onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Error / info */}
          {error && (
            <p className="text-[12px] text-burg-light bg-burg-light/8 border border-burg-light/25 rounded-lg px-3 py-2">{error}</p>
          )}
          {info && (
            <p className="text-[12px] text-brown bg-gold/10 border border-gold/30 rounded-lg px-3 py-2">{info}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="text-[11px] text-muted-foreground text-center mt-5 leading-relaxed">
          This planner is private to Kate &amp; Adrian.<br />Sign in with your registered email.
        </p>
      </div>
    </div>
  );
}

```


## `src/pages/Install.tsx`

```tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Smartphone, Share, MoreVertical, PlusSquare, CheckCircle2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iphone|ipad|ipod/i.test(ua));
    setIsAndroid(/android/i.test(ua));
    setIsStandalone(
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone === true)
    );

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  };

  const Step = ({ n, icon, text }: { n: number; icon: React.ReactNode; text: string }) => (
    <div className="flex items-start gap-3">
      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{n}</span>
      <div className="flex items-center gap-2 text-sm text-foreground">
        <span className="text-muted-foreground">{icon}</span>
        <span>{text}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-serif flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-foreground via-primary to-[hsl(var(--primary-light))] px-6 pt-12 pb-10 text-primary-foreground text-center">
        <div className="w-20 h-20 rounded-[22px] mx-auto mb-4 overflow-hidden shadow-xl border-2 border-white/20">
          <img src="/pwa-192.png" alt="App icon" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-light italic tracking-wide">Italia 2026</h1>
        <p className="text-sm opacity-70 mt-1 tracking-wide">Kate &amp; Adrian's trip planner</p>
      </div>

      <div className="flex-1 px-5 py-6 max-w-sm mx-auto w-full space-y-6">

        {/* Already installed */}
        {isStandalone || installed ? (
          <div className="text-center space-y-4 pt-4">
            <CheckCircle2 className="w-14 h-14 text-green mx-auto" />
            <p className="font-semibold text-foreground text-lg">Already installed!</p>
            <p className="text-sm text-muted-foreground">The app is on your home screen and works offline.</p>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
            >
              Open the trip planner →
            </button>
          </div>

        /* Android — native install prompt */
        ) : deferredPrompt ? (
          <div className="space-y-5">
            <div className="rounded-xl bg-secondary p-4 text-sm text-foreground leading-relaxed">
              Add <strong>Italia 2026</strong> to your home screen for quick access, offline viewing, and a full-screen app experience.
            </div>
            <button
              onClick={handleInstall}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Download className="w-4 h-4" /> Add to Home Screen
            </button>
            <button onClick={() => navigate("/")} className="w-full text-center text-xs text-muted-foreground py-2">
              Not now — go to the planner
            </button>
          </div>

        /* iOS instructions */
        ) : isIOS ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Follow these steps in <strong>Safari</strong> to install:</p>
            <div className="bg-card rounded-xl border border-border p-4 space-y-4">
              <Step n={1} icon={<Share className="w-4 h-4" />} text='Tap the Share button at the bottom of Safari' />
              <Step n={2} icon={<PlusSquare className="w-4 h-4" />} text='"Add to Home Screen"' />
              <Step n={3} icon={<Smartphone className="w-4 h-4" />} text='Tap "Add" — the app icon appears on your home screen' />
            </div>
            <div className="rounded-xl bg-[hsl(var(--rose)/0.08)] border border-[hsl(var(--rose)/0.2)] px-4 py-3 text-xs text-muted-foreground">
              Must be opened in <strong>Safari</strong> — Chrome and Firefox on iPhone don't support home screen install.
            </div>
            <button onClick={() => navigate("/")} className="w-full text-center text-xs text-muted-foreground py-2">
              Back to the planner
            </button>
          </div>

        /* Android manual instructions */
        ) : isAndroid ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Install from your browser menu:</p>
            <div className="bg-card rounded-xl border border-border p-4 space-y-4">
              <Step n={1} icon={<MoreVertical className="w-4 h-4" />} text='Tap the ⋮ menu (top-right of Chrome)' />
              <Step n={2} icon={<PlusSquare className="w-4 h-4" />} text='"Add to Home screen" or "Install app"' />
              <Step n={3} icon={<Smartphone className="w-4 h-4" />} text='Tap "Install" to confirm' />
            </div>
            <button onClick={() => navigate("/")} className="w-full text-center text-xs text-muted-foreground py-2">
              Back to the planner
            </button>
          </div>

        /* Desktop fallback */
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-secondary p-4 text-sm text-foreground">
              Open this page on your phone to install the app. On iPhone use Safari; on Android use Chrome.
            </div>
            <div className="font-mono text-xs bg-card border border-border rounded-lg px-4 py-3 text-center break-all text-muted-foreground select-all">
              {window.location.origin}/install
            </div>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
            >
              Open the trip planner →
            </button>
          </div>
        )}

        {/* Offline badge */}
        <div className="flex items-center gap-2 rounded-xl bg-[hsl(var(--green)/0.08)] border border-[hsl(var(--green)/0.2)] px-4 py-3">
          <CheckCircle2 className="w-4 h-4 text-green shrink-0" />
          <p className="text-xs text-foreground">Works offline — all activities, hotels &amp; phrases load without Wi-Fi.</p>
        </div>
      </div>
    </div>
  );
}

```


## `src/data/tripData.ts`

```ts
export const REGION_COLORS: Record<string, string> = {
  Milan: "#8B5A3A",
  "Lake Garda": "#4A7A6A",
  Florence: "#7B3F6B",
  Tuscany: "#B8860B",
  Rome: "#8B2252",
  Sorrento: "#B87048",
  Departure: "#8A8A8A",
};

export type ActivityType = "free" | "ticket" | "food" | "experience" | "transport";

export interface Activity {
  nm: string;
  c: number;
  tp: ActivityType;
  bk: boolean;
  nt?: string;
  lnk?: string;
  map?: string;
}

export interface Day {
  dt: string;
  dy: string;
  act: string;
  stay: string;
  rg: string;
  sg: Activity[];
}

export type HotelTier = "budget" | "mid" | "luxury";

export interface HotelOption {
  nm: string;
  q: string;
  s: number;
  nzd: number;
  eur: number;
  v: string;
  tier: HotelTier;
  hood: string; // neighbourhood / location tag
  perks: string[]; // bullet point highlights
  bk?: boolean;
  rb?: boolean;
  site?: string; // official site or notable listing URL
}

export interface HotelEntry {
  ci: string;
  co: string;
  n: number;
  st: string;
  cf?: string;
  note?: string; // contextual booking note
  opts: HotelOption[];
}

export type Hotels = Record<string, HotelEntry>;

export const HOTELS: Hotels = {
  // ── MILAN ─────────────────────────────────────────────────────────────
  Milan: {
    ci: "2026-05-25", co: "2026-05-28", n: 3, st: "confirmed", cf: "Crowne Plaza",
    note: "Near Centrale station — ideal for Como day-trip and luggage storage.",
    opts: [
      {
        nm: "Crowne Plaza Milan City", q: "Crowne Plaza Milan City", s: 4,
        nzd: 0, eur: 0, tier: "mid", hood: "Porta Garibaldi",
        perks: ["Already booked ✓", "Near Centrale for Como train", "Rooftop bar"],
        v: "Your confirmed hotel — no action needed.",
        bk: true,
      },
      {
        nm: "Palazzo Montemartini", q: "Palazzo Montemartini Milan", s: 5,
        nzd: 1040, eur: 560, tier: "luxury", hood: "Piazza della Repubblica",
        perks: ["Rooftop pool & bar", "Art-deco palazzo", "Spa & hammam", "200m from Centrale"],
        v: "5-star art hotel in converted palazzo. Doubles from ~€560/n May. Rooftop is Milan's best kept secret.",
        site: "https://palazzomontemartini.com",
      },
      {
        nm: "Hotel Spadari al Duomo", q: "Spadari al Duomo Milan", s: 4,
        nzd: 560, eur: 300, tier: "mid", hood: "Duomo",
        perks: ["150m from Duomo", "Free minibar & prosecco", "Private art collection", "Quiet side street"],
        v: "Beloved boutique 4-star. Art-filled rooms, attentive staff. One of Milan's best mid-range options.",
        site: "https://www.spadarihotel.com",
      },
      {
        nm: "Ostello Bello Grande", q: "Ostello Bello Grande Milan", s: 3,
        nzd: 280, eur: 150, tier: "budget", hood: "Central Station",
        perks: ["Free breakfast + aperitivo", "Rooftop terrace", "Social atmosphere", "Near Centrale"],
        v: "Milan's best design hostel — also has private rooms. Perfect if budget is the priority.",
        site: "https://www.ostellobello.com",
      },
    ],
  },

  // ── LAKE GARDA ────────────────────────────────────────────────────────
  "Lake Garda": {
    ci: "2026-05-28", co: "2026-05-30", n: 2, st: "needed",
    note: "May is shoulder season — warm but not peak. Most hotels open from mid-April.",
    opts: [
      {
        nm: "Grand Hotel Terme Sirmione", q: "Grand Hotel Terme Sirmione", s: 4,
        nzd: 690, eur: 370, tier: "mid", hood: "Sirmione peninsula",
        perks: ["Thermal spa on the lake", "Direct lake access", "Historic building", "Walk to Scaligero Castle"],
        v: "Iconic 4-star on the Sirmione peninsula. Thermal wellness, lakefront pool, exceptional location.",
        site: "https://www.termesirmione.com",
      },
      {
        nm: "Lido Palace", q: "Lido Palace Riva del Garda", s: 5,
        nzd: 980, eur: 525, tier: "luxury", hood: "Riva del Garda (north)",
        perks: ["Belle Époque 5-star", "Private lakeside park", "Michelin-starred dining", "Water sports"],
        v: "The benchmark for Garda luxury. Historic northern town, dramatic Dolomite backdrop, yacht culture.",
        site: "https://www.lidopalace.com",
      },
      {
        nm: "Hotel Caesius Thermae & Spa", q: "Hotel Caesius Thermae Spa Bardolino", s: 4,
        nzd: 520, eur: 280, tier: "mid", hood: "Bardolino",
        perks: ["Thermal pools", "Full-board option", "Lakefront location", "Great for relaxing"],
        v: "Excellent value thermal resort on the eastern shore. Multiple pools, great for a spa-focused 2 nights.",
        site: "https://www.hotelcaesius.it",
      },
      {
        nm: "B&B Il Sogno di Giulietta", q: "B&B Sirmione Lake Garda", s: 0,
        nzd: 260, eur: 140, tier: "budget", hood: "Sirmione town",
        perks: ["Charming family-run B&B", "Steps from old town", "Included breakfast", "Unbeatable value"],
        v: "A gem for budget travellers. Lovely hosts, great breakfast, right in Sirmione village.",
        site: "",
      },
    ],
  },

  // ── FLORENCE ──────────────────────────────────────────────────────────
  Florence: {
    ci: "2026-05-30", co: "2026-06-01", n: 2, st: "needed",
    note: "⚠ Florence ZTL: don't drive into the centre. Park at Garage Europa (€25/day) before check-in.",
    opts: [
      {
        nm: "Hotel Lungarno", q: "Hotel Lungarno Florence", s: 4,
        nzd: 700, eur: 375, tier: "mid", hood: "Oltrarno (river south)",
        perks: ["Juliet balconies over the Arno", "50m from Ponte Vecchio", "Picasso art collection", "Michelin-starred Borgo San Jacopo"],
        v: "40 of 65 rooms face the Arno. Quieter side, steps from the bridge. One of Florence's most romantic stays.",
        site: "https://www.lungarnohotels.com",
      },
      {
        nm: "Stella d'Italia", q: "Stella d'Italia Florence", s: 4,
        nzd: 370, eur: 200, tier: "budget", hood: "Via Tornabuoni",
        perks: ["16th-century Vasari palazzo", "18th-century fresco breakfast room", "Rooftop terrace bar", "From €180/n"],
        v: "Florence's most character-packed 4-star at a budget price. Ring the gold doorbell on Via Tornabuoni.",
        site: "https://stelladitalia.com",
      },
      {
        nm: "Four Seasons Hotel Firenze", q: "Four Seasons Firenze", s: 5,
        nzd: 1680, eur: 900, tier: "luxury", hood: "Porta Pinti (near Duomo)",
        perks: ["1473 Renaissance palazzo & 11-acre gardens", "28m pool", "Michelin-starred Il Palagio", "Museum-worthy interiors"],
        v: "The unmatched #1 Florence hotel. Built 1473 by Bartolomeo Scala. Frescoed ceilings, private gardens. Worth every cent for one night.",
        site: "https://www.fourseasons.com/florence",
      },
      {
        nm: "Palazzo Guadagni", q: "Palazzo Guadagni Florence", s: 3,
        nzd: 335, eur: 180, tier: "budget", hood: "Santo Spirito (Oltrarno)",
        perks: ["1500s palazzo", "Iconic rooftop negroni bar", "Bohemian artisan neighbourhood", "Piazza Santo Spirito views"],
        v: "Florence's chicest secret. A 16th-century palazzo in the coolest piazza. The terrace bar alone is worth it.",
        site: "https://www.palazzoguadagnihotel.com",
      },
    ],
  },

  // ── TUSCANY ───────────────────────────────────────────────────────────
  Tuscany: {
    ci: "2026-06-01", co: "2026-06-03", n: 2, st: "needed",
    note: "June is stunning — warm, golden, not yet peak-summer crowded. Drive the SS222 Chiantigiana between properties.",
    opts: [
      {
        nm: "Castel Monastero", q: "Castel Monastero Castelnuovo Berardenga", s: 5,
        nzd: 1070, eur: 575, tier: "luxury", hood: "Castelnuovo Berardenga (near Siena)",
        perks: ["Medieval hamlet hotel", "Gordon Ramsay's Contrada restaurant", "Infinity pool + spa", "15km from Siena"],
        v: "A medieval village converted into a resort. Gordon Ramsay's restaurant inside. Stay for 1 night and explore Siena the next day.",
        site: "https://www.castelmonastero.com",
      },
      {
        nm: "Poggio Amoroso", q: "Poggio Amoroso agriturismo Montalcino", s: 0,
        nzd: 520, eur: 280, tier: "mid", hood: "Montalcino hills",
        perks: ["Working Brunello wine estate", "Pool with Val d'Orcia views", "Home-cooked Tuscan dinners", "Cypress-lined drive"],
        v: "Authentic agriturismo on a Brunello di Montalcino estate. The Val d'Orcia view from the pool is iconic.",
        site: "https://www.poggioamoroso.it",
      },
      {
        nm: "Agriturismo Rendola Riding", q: "Rendola Riding agriturismo Chianti", s: 0,
        nzd: 290, eur: 155, tier: "budget", hood: "Chianti Classico",
        perks: ["Farmhouse in Chianti vineyards", "Pool with hills view", "Simple home-cooked meals", "No tourist crowds"],
        v: "Classic Chianti farmhouse with pool. No frills, all soul. Wake up to olive groves and rooster calls.",
        site: "",
      },
      {
        nm: "Borgo San Felice", q: "Borgo San Felice Chianti", s: 5,
        nzd: 1220, eur: 655, tier: "luxury", hood: "Castelnuovo Berardenga (Chianti)",
        perks: ["Own Chianti Classico wine production", "Michelin-starred Poggio Rosso", "Village of suites + cottages", "Infinity pool"],
        v: "The Chianti dream. A medieval hamlet that's actually a Relais & Châteaux property with its own winery.",
        site: "https://www.borgosanfelice.it",
      },
    ],
  },

  // ── ROME ──────────────────────────────────────────────────────────────
  Rome: {
    ci: "2026-06-03", co: "2026-06-05", n: 2, st: "needed",
    note: "Don't drive in Rome. Park at the hotel garage or leave car before entering the city.",
    opts: [
      {
        nm: "Hotel Raphael", q: "Hotel Raphael Rome Navona", s: 5,
        nzd: 910, eur: 490, tier: "luxury", hood: "Piazza Navona",
        perks: ["Ivy-covered façade steps from Navona", "Terrace with St Peter's & Roman rooftop views", "Picasso & Miró art collection", "Unique character"],
        v: "Rome's most romantic hotel. Hidden behind ivy on a cobblestone lane. Rooftop views are breathtaking.",
        site: "https://www.raphaelhotel.com",
      },
      {
        nm: "Relais Palazzo Taverna", q: "Relais Palazzo Taverna Rome", s: 4,
        nzd: 420, eur: 225, tier: "mid", hood: "Campo de' Fiori / Navona",
        perks: ["15th-century palazzo", "125m from Campo de' Fiori", "Rooftop terrace with Tiber views", "Boutique atmosphere"],
        v: "Outstanding mid-range boutique in a 15th-century palace. Prime location between Navona and Campo de' Fiori.",
        site: "https://www.relaispalazzotaverna.com",
      },
      {
        nm: "Ciao Hostel Roma", q: "Ciao Hostel Trastevere Rome", s: 0,
        nzd: 220, eur: 120, tier: "budget", hood: "Trastevere",
        perks: ["Private rooms available", "Bohemian Trastevere neighbourhood", "Night life & restaurants on doorstep", "Excellent value"],
        v: "For budget-conscious: private rooms in Trastevere, Rome's most atmospheric neighbourhood.",
        site: "",
      },
      {
        nm: "Hotel de Russie", q: "Hotel de Russie Rome Spanish Steps", s: 5,
        nzd: 1300, eur: 700, tier: "luxury", hood: "Spanish Steps / Via Condotti",
        perks: ["Rocco Forte flagship", "Secret garden & spa", "Steps from Spanish Steps & Pantheon", "Legendary service"],
        v: "The Rocco Forte Rome classic. Terraced secret garden, 5-star spa. Pure Roman glamour.",
        site: "https://www.roccofortehotels.com/hotels-and-resorts/hotel-de-russie",
      },
    ],
  },

  // ── SORRENTO ──────────────────────────────────────────────────────────
  Sorrento: {
    ci: "2026-06-05", co: "2026-06-09", n: 4, st: "needed",
    note: "June is the sweet spot — Capri and Amalfi busy but not overwhelming. Book early, clifftop rooms sell out.",
    opts: [
      {
        nm: "Grand Hotel Excelsior Vittoria", q: "Grand Hotel Excelsior Vittoria Sorrento", s: 5,
        nzd: 1110, eur: 595, tier: "luxury", hood: "Clifftop Centro",
        perks: ["Historic 5-star since 1834", "Michelin-starred Terrazza Bosquet", "Lush gardens & pool over the Bay", "Direct Capri ferry views"],
        v: "The #1 rated hotel in Sorrento. Wagner, Caruso and Pavarotti stayed here. Unforgettable clifftop gardens.",
        site: "https://www.exvitt.it",
      },
      {
        nm: "Hilton Sorrento Palace", q: "Hilton Sorrento Palace", s: 4,
        nzd: 650, eur: 350, tier: "mid", hood: "Via Califano hillside",
        perks: ["6 outdoor pools", "Vesuvius panorama", "Spa & fitness", "Walking distance from Piazza Tasso"],
        v: "Best value luxury in Sorrento. Six pools on a hillside with unbeatable Vesuvius and bay views.",
        site: "https://www.hiltonsorrento.com",
      },
      {
        nm: "Hotel Loreley", q: "Hotel Loreley Sorrento", s: 3,
        nzd: 320, eur: 170, tier: "budget", hood: "Marina Piccola",
        perks: ["Direct sea access via lift", "Terrace over the water", "Family-run charm", "Walk to ferries"],
        v: "Sorrento's best-kept secret. Small family hotel with a terrace right over the sea. Book room with balcony.",
        site: "https://www.loreley.it",
      },
      {
        nm: "Bellevue Syrene", q: "Bellevue Syrene Sorrento", s: 5,
        nzd: 1200, eur: 645, tier: "luxury", hood: "Marina Piccola clifftop",
        perks: ["Built on Roman ruins (1st century)", "Clifftop solarium with Bay of Naples views", "Private lift to beach club", "Only 18 rooms — very intimate"],
        v: "Built on Roman ruins. Only 18 rooms. The most exclusive stay in Sorrento — completely booked out by May.",
        site: "https://www.bellevue.it",
      },
    ],
  },

  // ── ROME (FINAL NIGHT) ────────────────────────────────────────────────
  "Rome Final": {
    ci: "2026-06-09", co: "2026-06-10", n: 1, st: "needed",
    note: "Last night before Fiumicino. Prioritise near Termini or EUR for easy airport access next morning.",
    opts: [
      {
        nm: "Same Rome hotel as Jun 3–5", q: "", s: 0, nzd: 0, eur: 0,
        tier: "mid", hood: "Same as before",
        perks: ["Already know it", "No re-orientation needed"],
        v: "Simplest option — rebook your earlier Rome hotel for the final night.", rb: true,
      },
      {
        nm: "iQ Hotel Roma", q: "iQ Hotel Roma Termini", s: 4,
        nzd: 490, eur: 265, tier: "mid", hood: "Near Termini",
        perks: ["5-min walk to Termini", "Leonardo Express from Termini in 32min", "Pool & gym", "Modern design"],
        v: "Smart 4-star close to Termini. Practical for early departures, unexpectedly stylish.",
        site: "https://www.iqhotelroma.it",
      },
      {
        nm: "Hotel Artemide", q: "Hotel Artemide Rome Termini", s: 4,
        nzd: 420, eur: 225, tier: "mid", hood: "Via Nazionale (Termini)",
        perks: ["Historic palazzo on Via Nazionale", "Rooftop restaurant", "500m from Termini", "Free minibar"],
        v: "Belle époque palazzo near Termini. Rooftop dining, excellent breakfasts, very friendly staff.",
        site: "https://www.hotelartemide.it",
      },
    ],
  },
};

export interface TransportDay {
  ic: string;
  s: string;
  d: string;
  t: string;
}

export interface RouteOption {
  mode: string;
  detail: string;
  cost: string;
  lnk?: string;
}

export interface RouteDay {
  from: string;
  to: string;
  opts: RouteOption[];
}

export interface GemItem {
  cat: "must" | "wow" | "gem";
  n: string;
  d: string;
  map?: string;
  lnk?: string;
}

export interface FoodItem {
  dish: string;
  tip: string;
  kind: string;
}

export interface Phrase {
  it: string;
  en: string;
}

export const TRANSPORT: Record<string, TransportDay> = {
  "25/05/26": { ic: "A", s: "Arrive Malpensa 6:30am", d: "Malpensa Express to Centrale (50min, ~€13). Taxi ~€100.", t: "Milan = walk + metro. No car needed." },
  "27/05/26": { ic: "T", s: "Milan → Como train (40min)", d: "Train €5–13. Buy free circulation ferry ticket.", t: "Train + ferry is the way." },
  "28/05/26": { ic: "D", s: "Milan → Garda: 1.5–2hr (A4)", d: "A4 east, tolls ~€12. Stop Sirmione en route. RENT CAR here.", t: "Pick up car Milan, drop Rome airport 10/06." },
  "29/05/26": { ic: "F", s: "Explore by ferry, not car", d: "Park car, ferry between towns. Garda→Malcesine ~50min.", t: "Ferry between towns. Parking is terrible." },
  "30/05/26": { ic: "D", s: "Garda → Florence: 3hr", d: "⚠ ZTL: Florence centre = camera fines! Park outside.", t: "Florence = walking city. Park & forget the car." },
  "01/06/26": { ic: "D", s: "Florence → Tuscany: 1–1.5hr", d: "SS222 Chiantigiana through Chianti — Italy's best drive.", t: "Car essential. Hill towns impossible by bus." },
  "03/06/26": { ic: "D", s: "Tuscany → Rome: 2.5–3hr", d: "Stop Orvieto en route: hilltop cathedral, caves, white wine.", t: "Don't drive in Rome. Park at hotel." },
  "05/06/26": { ic: "D", s: "Rome → Pompeii → Sorrento: 3.5hr", d: "A1 south, visit Pompeii, 30min to Sorrento.", t: "Consider dropping rental in Sorrento." },
  "06/06/26": { ic: "F", s: "Sorrento → Amalfi: ferry 1hr", d: "Ferry ~€10. Coast road = stressful + €30 parking.", t: "Take the ferry!" },
  "07/06/26": { ic: "B", s: "Sorrento → Positano: bus 40min", d: "SITA bus €2.50 for cliff views. Ferry back.", t: "Bus there, ferry back = perfect." },
  "08/06/26": { ic: "F", s: "Sorrento → Capri: ferry 25min", d: "First ferry 7:25am. ~€22 each way.", t: "No cars on Capri." },
  "09/06/26": { ic: "D", s: "Sorrento → Rome: 3.5hr", d: "Or train: Circumvesuviana + Frecciarossa (70min, €25).", t: "Return car at Fiumicino." },
  "10/06/26": { ic: "A", s: "Hotel → Fiumicino", d: "Leonardo Express 32min €14. Taxi ~€50.", t: "Don't risk delays." },
};

export const ROUTES: Record<string, RouteDay> = {
  "28/05/26": {
    from: "Milan", to: "Lake Garda",
    opts: [
      { mode: "Car rental", detail: "Pick up Milan Centrale. Hertz/Europcar/Sixt. Drop Rome Fiumicino 10/06.", cost: "€400–600 total", lnk: "https://www.rentalcars.com/SearchResults.do?country=Italy&pick=Milan&drop=Rome+Fiumicino" },
      { mode: "A4 Motorway", detail: "1.5–2hr. Tolls ~€12. Stop at Sirmione peninsula en route.", cost: "€12 tolls + fuel" },
      { mode: "Train alternative", detail: "Milano Centrale → Desenzano del Garda (55min, Trenitalia).", cost: "€15–25", lnk: "https://www.trenitalia.com/en.html" },
    ],
  },
  "30/05/26": {
    from: "Lake Garda", to: "Florence",
    opts: [
      { mode: "A22 + A1 Motorway", detail: "3hr. Verona→Bologna→Florence. Tolls ~€25.", cost: "€25 tolls + fuel" },
      { mode: "Park in Florence", detail: "⚠ Do NOT drive into centre. Use Garage Europa or Parcheggio Beccaria.", cost: "€20–30/day", lnk: "https://maps.google.com/?q=Garage+Europa+Florence" },
    ],
  },
  "01/06/26": {
    from: "Florence", to: "Tuscany",
    opts: [
      { mode: "SS222 Chiantigiana", detail: "The famous Chianti wine road. Slower but stunning. 1–1.5hr.", cost: "Free" },
      { mode: "Superstrada (FI-SI)", detail: "Fast route to Siena, 1hr. Then local roads to your stay.", cost: "Free" },
    ],
  },
  "03/06/26": {
    from: "Tuscany", to: "Rome",
    opts: [
      { mode: "A1 Autostrada", detail: "2.5–3hr via Orvieto. Stop for lunch — cathedral + white wine.", cost: "€20 tolls + fuel" },
      { mode: "Park in Rome", detail: "Use hotel garage or Parcheggio Ludovisi. Do NOT drive in centre.", cost: "€25–40/day", lnk: "https://maps.google.com/?q=Parcheggio+Ludovisi+Rome" },
    ],
  },
  "05/06/26": {
    from: "Rome", to: "Sorrento",
    opts: [
      { mode: "Drive via Pompeii", detail: "A1 south 2.5hr to Pompeii, then 30min to Sorrento.", cost: "€18 tolls + fuel" },
      { mode: "Train (no car)", detail: "Frecciarossa Roma→Napoli (70min, €25) + Circumvesuviana to Sorrento (65min, €4).", cost: "€29 pp", lnk: "https://www.trenitalia.com/en.html" },
      { mode: "Drop car in Sorrento?", detail: "Sorrento has parking. You won't need a car for 4 days of ferries. Could save €100+.", cost: "" },
    ],
  },
  "09/06/26": {
    from: "Sorrento", to: "Rome",
    opts: [
      { mode: "Drive A1 north", detail: "3.5hr. Return car at Fiumicino for easy airport access next day.", cost: "€15 tolls + fuel" },
      { mode: "Train", detail: "Circumvesuviana → Napoli Centrale + Frecciarossa → Roma. Total ~2.5hr.", cost: "€29 pp", lnk: "https://www.trenitalia.com/en.html" },
    ],
  },
  "10/06/26": {
    from: "Rome", to: "Airport",
    opts: [
      { mode: "Leonardo Express", detail: "Roma Termini → Fiumicino. Every 15min. 32min non-stop.", cost: "€14 pp", lnk: "https://www.trenitalia.com/en.html" },
      { mode: "Taxi", detail: "Fixed rate Roma centre → Fiumicino. 30–50min depending on traffic.", cost: "€50 fixed" },
      { mode: "Private transfer", detail: "Pre-book for hotel pickup. No stress on departure day.", cost: "€60–80", lnk: "https://www.getyourguide.com/rome-l33/airport-transfer-tc167/" },
    ],
  },
};

export const GEMS: Record<string, GemItem[]> = {
  Milan: [
    { cat: "must", n: "Duomo rooftop at sunset", d: "The marble glows pink. Best view in Milan.", map: "https://maps.google.com/?q=Duomo+di+Milano" },
    { cat: "wow", n: "San Bernardino alle Ossa", d: "Bone chapel covered in skulls, 5min from Duomo. Tourists walk right past.", map: "https://maps.google.com/?q=San+Bernardino+alle+Ossa+Milan" },
    { cat: "gem", n: "Navigli sunset aperitivo", d: "€8–12 for a drink and unlimited buffet. Canals glow golden.", map: "https://maps.google.com/?q=Navigli+District+Milan" },
    { cat: "wow", n: "Last Supper", d: "15 people allowed every 15 min. Life-changing art. Book months ahead.", lnk: "https://www.getyourguide.com/milan-l139/last-supper-tickets-tc24/" },
  ],
  "Lake Garda": [
    { cat: "wow", n: "Madonna della Corona", d: "Church built INTO a cliff at 775m. Free. Italy's most dramatic sight.", map: "https://maps.google.com/?q=Santuario+Madonna+della+Corona" },
    { cat: "must", n: "Monte Baldo cable car", d: "Rotating cabin, 360° views. Paragliders launch from the top.", lnk: "https://www.getyourguide.com/lake-garda-l901/monte-baldo-tc284/" },
    { cat: "gem", n: "Limonaia del Castèl, Limone", d: "1700s lemon terraces on cliffs. Fresh limoncello tasting.", map: "https://maps.google.com/?q=Limonaia+del+Castel+Limone+sul+Garda" },
    { cat: "must", n: "Verona — Arena + Juliet", d: "45min away. Roman amphitheatre, Juliet's balcony, wine bars.", map: "https://maps.google.com/?q=Arena+di+Verona" },
  ],
  Florence: [
    { cat: "must", n: "Piazzale Michelangelo golden hour", d: "Bring Aperol Spritz. Sky turns pink behind the Duomo. Unforgettable.", map: "https://maps.google.com/?q=Piazzale+Michelangelo+Florence" },
    { cat: "wow", n: "Officina Santa Maria Novella", d: "World's oldest pharmacy (1221). Frescoed rooms, perfumes, elixirs. Free.", map: "https://maps.google.com/?q=Officina+Profumo+Farmaceutica+Santa+Maria+Novella" },
    { cat: "gem", n: "Bardini Gardens", d: "Skip crowded Boboli. Same views, almost nobody. Wisteria tunnel in late May!", map: "https://maps.google.com/?q=Giardino+Bardini+Florence" },
    { cat: "must", n: "Giotto's Bell Tower", d: "Better than climbing Duomo — because you GET the Duomo in your photo.", lnk: "https://www.getyourguide.com/florence-l32/duomo-complex-tc386/" },
  ],
  Tuscany: [
    { cat: "wow", n: "Bagno Vignoni hot springs", d: "Medieval village around a thermal pool. Free natural springs in the river below.", map: "https://maps.google.com/?q=Bagno+Vignoni" },
    { cat: "must", n: "Dario Cecchini, Panzano", d: "World's most famous butcher. €50 feast with unlimited wine. Book ahead.", map: "https://maps.google.com/?q=Dario+Cecchini+Panzano" },
    { cat: "gem", n: "Certaldo Alto", d: "Funicular to medieval hilltop. Terracotta, barely any tourists.", map: "https://maps.google.com/?q=Certaldo+Alto" },
    { cat: "wow", n: "Val d'Orcia at golden hour", d: "Drive the cypress-lined roads at sunset. THE Tuscan postcard. Stop and breathe.", map: "https://maps.google.com/?q=Val+d+Orcia" },
  ],
  Rome: [
    { cat: "wow", n: "Aventine Keyhole", d: "Peer through Knights of Malta gate — St Peter's dome framed by hedges. Free. Magical.", map: "https://maps.google.com/?q=Buco+della+Serratura+Rome" },
    { cat: "gem", n: "Quartiere Coppedè", d: "Fairy-tale Art Nouveau neighborhood. Gargoyles, turrets, mosaics. Zero tourists.", map: "https://maps.google.com/?q=Quartiere+Coppede+Rome" },
    { cat: "must", n: "San Clemente — 3 layers", d: "Descend: 12th-c church → 4th-c church → 1st-c Roman house. Mind-blowing. €10.", map: "https://maps.google.com/?q=Basilica+di+San+Clemente+Rome" },
    { cat: "must", n: "Trastevere after dark", d: "Cobblestone streets, live music, candlelit dinners. The most romantic Rome.", map: "https://maps.google.com/?q=Trastevere+Rome" },
  ],
  Sorrento: [
    { cat: "wow", n: "Path of the Gods hike", d: "Walk 300m cliffs above the Amalfi Coast. Starts Agerola, ends above Positano. 3–4hr.", map: "https://maps.google.com/?q=Sentiero+degli+Dei+Agerola" },
    { cat: "gem", n: "Procida Island", d: "Talented Mr Ripley island. Colourful, zero tourists. Fraction of Capri's price.", map: "https://maps.google.com/?q=Procida+Italy" },
    { cat: "wow", n: "Fjord of Furore", d: "Hidden beach in a dramatic gorge. Italy's only fjord. Stairs from the bridge.", map: "https://maps.google.com/?q=Fiordo+di+Furore" },
    { cat: "must", n: "Valley of the Mills, Sorrento", d: "Collapsed gorge with jungle-reclaimed 13th-c mills. Public viewpoint.", map: "https://maps.google.com/?q=Vallone+dei+Mulini+Sorrento" },
    { cat: "gem", n: "Herculaneum (not Pompeii)", d: "Better preserved, far fewer crowds. Wooden furniture survived. 20min by train.", lnk: "https://www.getyourguide.com/herculaneum-l2619/" },
  ],
};

export const FOOD: Record<string, FoodItem[]> = {
  Milan: [
    { dish: "Risotto alla Milanese", tip: "Saffron rice, bone marrow. Try Trattoria Masuelli.", kind: "S" },
    { dish: "Cotoletta alla Milanese", tip: "Massive breaded veal cutlet fried in butter.", kind: "M" },
    { dish: "Panzerotti at Luini", tip: "Deep-fried stuffed dough near Duomo. €3. Queue worth it.", kind: "St" },
    { dish: "Aperitivo = dinner", tip: "€8–12 drink + unlimited buffet. Navigli bars 6–9pm.", kind: "Tip" },
  ],
  "Lake Garda": [
    { dish: "Bigoli con le sarde", tip: "Thick pasta with lake sardines. Only found here.", kind: "S" },
    { dish: "Tortellini di Valeggio", tip: "Handmade pasta from Valeggio sul Mincio.", kind: "M" },
    { dish: "Olive oil tasting", tip: "Italy's most northern olive oil. Visit a frantoio.", kind: "Tip" },
  ],
  Florence: [
    { dish: "Bistecca alla Fiorentina", tip: "Massive T-bone, served rare. Sostanza or Buca Mario.", kind: "S" },
    { dish: "Lampredotto", tip: "Tripe sandwich from a cart. €5 at Sant'Ambrogio.", kind: "St" },
    { dish: "Ribollita", tip: "Thick bread & vegetable soup. Peasant perfection.", kind: "M" },
    { dish: "Gelato at Vivoli", tip: "Skip neon-coloured tourist gelato. Natural colours only.", kind: "Tip" },
  ],
  Tuscany: [
    { dish: "Pici cacio e pepe", tip: "Fat hand-rolled pasta with pecorino. Pienza does it best.", kind: "S" },
    { dish: "Wild boar ragù", tip: "Slow-cooked cinghiale on pappardelle. Available everywhere in Chianti.", kind: "M" },
    { dish: "Pecorino di Pienza", tip: "Sample aged, semi-aged, fresh. Pair with honey and walnuts.", kind: "M" },
    { dish: "Dario Cecchini feast", tip: "€50 set menu + unlimited wine. Book ahead!", kind: "Tip" },
  ],
  Rome: [
    { dish: "Cacio e Pepe", tip: "Pecorino + black pepper pasta. Roma Sparita or Roscioli.", kind: "S" },
    { dish: "Supplì", tip: "Fried rice balls, melting mozzarella inside. €2 at Testaccio.", kind: "St" },
    { dish: "Carbonara", tip: "Egg, guanciale, pecorino. NEVER cream. Da Enzo, Trastevere.", kind: "M" },
    { dish: "Avoid landmark restaurants", tip: "3 blocks from the Colosseum = 10x better food.", kind: "Tip" },
  ],
  Sorrento: [
    { dish: "Scialatielli ai limoni", tip: "Flat pasta with Sorrento lemons, butter, basil. Only here.", kind: "S" },
    { dish: "Delizia al limone", tip: "Lemon sponge cake in limoncello cream. The Amalfi dessert.", kind: "M" },
    { dish: "Sfogliatella", tip: "Crispy shell pastry with ricotta. Best warm from a bakery.", kind: "St" },
    { dish: "Fish lunch in Minori", tip: "Half the price of Positano. Double the quality.", kind: "Tip" },
  ],
};

export const PHRASES: Phrase[] = [
  { it: "Buongiorno / Buonasera", en: "Good morning / evening" },
  { it: "Un tavolo per due, per favore", en: "A table for two, please" },
  { it: "Il conto, per favore", en: "The bill, please" },
  { it: "Che cosa mi consiglia?", en: "What do you recommend?" },
  { it: "Salute!", en: "Cheers!" },
  { it: "È buonissimo!", en: "It's delicious!" },
  { it: "Quanto costa?", en: "How much?" },
  { it: "Grazie mille", en: "Thank you so much" },
  { it: "Scusi / Permesso", en: "Excuse me / May I pass" },
  { it: "Vorrei un Aperol Spritz", en: "I'd like an Aperol Spritz" },
];

export const DAYS: Day[] = [
  { dt: "25/05/26", dy: "Sun", act: "Arrive Milan (6:30am)", stay: "Crowne Plaza ✓", rg: "Milan", sg: [
    { nm: "Navigli District", c: 0, tp: "free", bk: false, nt: "Canalside walk, first espresso" },
    { nm: "Duomo Rooftop Terraces", c: 22, tp: "ticket", bk: false, nt: "Book elevator, sunset views" },
    { nm: "Aperitivo Galleria V. Emanuele", c: 15, tp: "food", bk: false, nt: "World's oldest shopping mall" },
  ]},
  { dt: "26/05/26", dy: "Mon", act: "Explore Milan", stay: "Crowne Plaza ✓", rg: "Milan", sg: [
    { nm: "The Last Supper", c: 15, tp: "ticket", bk: false, nt: "⚠ BOOK NOW — sells out months ahead", lnk: "https://www.getyourguide.com/milan-l139/last-supper-tickets-tc24/" },
    { nm: "Sforza Castle & Brera", c: 15, tp: "ticket", bk: false, nt: "Renaissance masterpieces", map: "https://maps.google.com/?q=Castello+Sforzesco+Milan" },
    { nm: "Pasta Cooking Class", c: 65, tp: "experience", bk: false, nt: "Learn risotto alla Milanese", lnk: "https://www.getyourguide.com/milan-l139/cooking-class-tc70/" },
    { nm: "La Scala Museum", c: 12, tp: "ticket", bk: false, nt: "Europe's finest opera house", lnk: "https://www.getyourguide.com/milan-l139/la-scala-tc390/" },
  ]},
  { dt: "27/05/26", dy: "Tue", act: "Day trip Como", stay: "Crowne Plaza ✓", rg: "Milan", sg: [
    { nm: "Ferry Como→Bellagio→Varenna", c: 20, tp: "transport", bk: false, nt: "Golden Triangle route" },
    { nm: "Villa del Balbianello", c: 13, tp: "ticket", bk: false, nt: "Star Wars & Bond location" },
    { nm: "Lunch in Bellagio", c: 35, tp: "food", bk: false, nt: "Book ahead" },
    { nm: "Como-Brunate Funicular", c: 6, tp: "transport", bk: false, nt: "Panoramic ride" },
  ]},
  { dt: "28/05/26", dy: "Wed", act: "Drive to Garda (1.5–2hr)", stay: "— Needs booking", rg: "Lake Garda", sg: [
    { nm: "Sirmione stop en route", c: 25, tp: "ticket", bk: false, nt: "Scaligero Castle + Roman ruins" },
    { nm: "Explore Garda lakefront", c: 0, tp: "free", bk: false, nt: "Palazzo dei Capitani, sunset walk" },
    { nm: "Bardolino wine dinner", c: 40, tp: "food", bk: false, nt: "Eastern shore wines" },
  ]},
  { dt: "29/05/26", dy: "Thu", act: "Explore Garda", stay: "— Needs booking", rg: "Lake Garda", sg: [
    { nm: "Punta San Vigilio beach", c: 8, tp: "ticket", bk: false, nt: "Mermaids' Bay" },
    { nm: "Monte Baldo Cable Car", c: 22, tp: "experience", bk: false, nt: "360° rotating, alpine views", lnk: "https://www.getyourguide.com/lake-garda-l901/monte-baldo-tc284/" },
    { nm: "Ferry to Limone", c: 15, tp: "transport", bk: false, nt: "Lemon groves + bike path" },
    { nm: "Verona day trip (45min)", c: 0, tp: "free", bk: false, nt: "Roman Arena, Juliet balcony", map: "https://maps.google.com/?q=Arena+di+Verona" },
  ]},
  { dt: "30/05/26", dy: "Fri", act: "Drive to Florence (3hr)", stay: "— Needs booking", rg: "Florence", sg: [
    { nm: "Piazzale Michelangelo sunset", c: 0, tp: "free", bk: false, nt: "Best view + Aperol Spritz", map: "https://maps.google.com/?q=Piazzale+Michelangelo+Florence" },
    { nm: "Ponte Vecchio & Oltrarno", c: 0, tp: "free", bk: false, nt: "Artisan shops, less touristy" },
    { nm: "Bistecca alla Fiorentina", c: 50, tp: "food", bk: false, nt: "Massive T-bone, must-try" },
  ]},
  { dt: "31/05/26", dy: "Sat", act: "Explore Florence", stay: "— Needs booking", rg: "Florence", sg: [
    { nm: "Accademia (David)", c: 20, tp: "ticket", bk: false, nt: "⚠ PRE-BOOK skip-the-line", lnk: "https://www.getyourguide.com/florence-l32/accademia-gallery-tc51/" },
    { nm: "Uffizi Gallery", c: 25, tp: "ticket", bk: false, nt: "⚠ PRE-BOOK — Italy's top museum", lnk: "https://www.getyourguide.com/florence-l32/uffizi-gallery-tc50/" },
    { nm: "Giotto's Bell Tower", c: 15, tp: "ticket", bk: false, nt: "Best Duomo photo angle", lnk: "https://www.getyourguide.com/florence-l32/duomo-complex-tc386/" },
    { nm: "San Lorenzo Market", c: 0, tp: "free", bk: false, nt: "Leather bargains", map: "https://maps.google.com/?q=Mercato+San+Lorenzo+Florence" },
  ]},
  { dt: "01/06/26", dy: "Sun", act: "Drive to Tuscany (1–1.5hr)", stay: "— Needs booking", rg: "Tuscany", sg: [
    { nm: "Chianti wine tour", c: 55, tp: "experience", bk: false, nt: "Rolling hills, world-class", lnk: "https://www.getyourguide.com/florence-l32/chianti-wine-tour-tc71/" },
    { nm: "San Gimignano towers", c: 0, tp: "free", bk: false, nt: "UNESCO, gelato champion", map: "https://maps.google.com/?q=San+Gimignano" },
    { nm: "Siena Piazza del Campo", c: 0, tp: "free", bk: false, nt: "Shell-shaped square", map: "https://maps.google.com/?q=Piazza+del+Campo+Siena" },
  ]},
  { dt: "02/06/26", dy: "Mon", act: "Explore Tuscany", stay: "— Needs booking", rg: "Tuscany", sg: [
    { nm: "Val d'Orcia drive", c: 0, tp: "free", bk: false, nt: "Iconic cypress roads" },
    { nm: "Montepulciano wine", c: 20, tp: "experience", bk: false, nt: "Vino Nobile hilltop" },
    { nm: "Pienza cheese", c: 10, tp: "food", bk: false, nt: "Pecorino + Renaissance city" },
    { nm: "Truffle hunting", c: 80, tp: "experience", bk: false, nt: "With a truffle dog!" },
  ]},
  { dt: "03/06/26", dy: "Tue", act: "Drive to Rome (2.5–3hr)", stay: "— Needs booking", rg: "Rome", sg: [
    { nm: "Orvieto stop en route", c: 0, tp: "free", bk: false, nt: "Cathedral, caves, white wine", map: "https://maps.google.com/?q=Orvieto+Cathedral" },
    { nm: "Trastevere evening", c: 0, tp: "free", bk: false, nt: "Best food neighbourhood" },
    { nm: "Trevi Fountain (after 9pm)", c: 0, tp: "free", bk: false, nt: "Fewer crowds" },
    { nm: "Trastevere dinner", c: 35, tp: "food", bk: false, nt: "Authentic trattorias" },
  ]},
  { dt: "04/06/26", dy: "Wed", act: "Explore Rome", stay: "— Needs booking", rg: "Rome", sg: [
    { nm: "Colosseum + Forum", c: 18, tp: "ticket", bk: false, nt: "⚠ PRE-BOOK combined ticket", lnk: "https://www.getyourguide.com/rome-l33/colosseum-tc10/" },
    { nm: "Vatican & Sistine", c: 20, tp: "ticket", bk: false, nt: "⚠ PRE-BOOK — go early", lnk: "https://www.getyourguide.com/rome-l33/vatican-museums-tc46/" },
    { nm: "Pantheon", c: 5, tp: "ticket", bk: false, nt: "Best Roman building", map: "https://maps.google.com/?q=Pantheon+Rome" },
    { nm: "Gelato Giolitti", c: 5, tp: "food", bk: false, nt: "Famous since 1890", map: "https://maps.google.com/?q=Giolitti+Rome" },
  ]},
  { dt: "05/06/26", dy: "Thu", act: "Rome→Pompeii→Sorrento", stay: "— Needs booking", rg: "Sorrento", sg: [
    { nm: "Pompeii", c: 18, tp: "ticket", bk: false, nt: "⚠ PRE-BOOK — allow 3+ hours", lnk: "https://www.getyourguide.com/pompeii-l616/pompeii-tickets-tc1/" },
    { nm: "Guided Pompeii tour", c: 45, tp: "experience", bk: false, nt: "Hidden details worth it", lnk: "https://www.getyourguide.com/pompeii-l616/guided-tour-tc2/" },
    { nm: "Sorrento passeggiata", c: 0, tp: "free", bk: false, nt: "Piazza Tasso, limoncello", map: "https://maps.google.com/?q=Piazza+Tasso+Sorrento" },
  ]},
  { dt: "06/06/26", dy: "Fri", act: "Ferry to Amalfi (1hr)", stay: "— Needs booking", rg: "Sorrento", sg: [
    { nm: "Ferry Sorrento→Amalfi", c: 10, tp: "transport", bk: false, nt: "Way better than driving" },
    { nm: "Amalfi Cathedral", c: 3, tp: "ticket", bk: false, nt: "Stunning 9th-century" },
    { nm: "Seafood lunch, sea view", c: 40, tp: "food", bk: false, nt: "Lemon everything" },
  ]},
  { dt: "07/06/26", dy: "Sat", act: "Positano (bus + ferry)", stay: "— Needs booking", rg: "Sorrento", sg: [
    { nm: "Path of the Gods", c: 0, tp: "free", bk: false, nt: "Cliffside trail, 3–4hr", map: "https://maps.google.com/?q=Sentiero+degli+Dei+Agerola" },
    { nm: "Spiaggia Grande", c: 20, tp: "experience", bk: false, nt: "Iconic colourful backdrop" },
    { nm: "Coast boat tour", c: 50, tp: "experience", bk: false, nt: "Hidden coves, Fjord of Furore" },
  ]},
  { dt: "08/06/26", dy: "Sun", act: "Ferry to Capri (25min)", stay: "— Needs booking", rg: "Sorrento", sg: [
    { nm: "Ferry Capri (7:25am!)", c: 25, tp: "transport", bk: false, nt: "Beat the crowds", lnk: "https://www.getyourguide.com/sorrento-l718/capri-ferry-tc324/" },
    { nm: "Blue Grotto", c: 18, tp: "ticket", bk: false, nt: "Magical cave, weather dep.", lnk: "https://www.getyourguide.com/capri-l256/blue-grotto-tc121/" },
    { nm: "Chairlift Monte Solaro", c: 12, tp: "experience", bk: false, nt: "360° island views" },
    { nm: "Lunch Piazzetta", c: 45, tp: "food", bk: false, nt: "People-watching capital" },
  ]},
  { dt: "09/06/26", dy: "Mon", act: "Travel to Rome (3.5hr)", stay: "— Needs booking", rg: "Rome", sg: [
    { nm: "Spanish Steps", c: 0, tp: "free", bk: false, nt: "Iconic steps, designer shops" },
    { nm: "Final Piazza Navona aperitivo", c: 15, tp: "food", bk: false, nt: "Bernini fountain, last night" },
  ]},
  { dt: "10/06/26", dy: "Tue", act: "Flight Auckland 1pm", stay: "—", rg: "Departure", sg: [
    { nm: "Roscioli Caffè", c: 5, tp: "food", bk: false, nt: "Last Roman coffee" },
  ]},
];

```


## `src/hooks/useTripSync.ts`

```ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DAYS } from '@/data/tripData';
import { DEFAULT_PACKING, PackingItem } from '@/components/trip/PackingView';
import { useAuth } from '@/contexts/AuthContext';
import type { Profile } from '@/types/trip';
import type { Expense } from '@/components/trip/ExpenseView';
import type { TripNote } from '@/components/trip/NotesView';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

type Day = typeof DAYS[number] & { sg: (typeof DAYS[number]['sg'][number] & { bk: boolean })[] };
type PackingState = Record<string, PackingItem[]>;

export type CustomHotel = {
  nm: string;
  nzd: number;
  st?: 'none' | 'selected' | 'booked';
};

function freshDays(): Day[] {
  return DAYS.map(d => ({ ...d, sg: d.sg.map(sg => ({ ...sg })) })) as Day[];
}
function freshPacking(): PackingState {
  return Object.fromEntries(DEFAULT_PACKING.map(c => [c.id, c.items.map(i => ({ ...i, k: false, a: false }))]));
}

export function useTripSync() {
  const { user, tripRole } = useAuth();

  const [days,          setDays]          = useState<Day[]>(freshDays);
  const [votes,         setVotes]         = useState<Record<string, { k?: boolean; a?: boolean }>>({});
  const [alreadyBooked, setAlreadyBooked] = useState<Record<string, boolean>>({ Milan: true });
  const [selectedNzd,   setSelectedNzd]   = useState<Record<string, number>>({ Milan: 0 });
  const [customHotels,  setCustomHotels]  = useState<Record<string, CustomHotel>>({ Milan: { nm: 'Crowne Plaza', nzd: 0 } });
  const [packing,       setPacking]       = useState<PackingState>(freshPacking);
  const [expenses,      setExpenses]      = useState<Expense[]>([]);
  const [notes,         setNotes]         = useState<TripNote[]>([]);
  const [synced,        setSynced]        = useState(false);

  const profilesRef    = useRef<Profile[]>([]);
  const alreadyBookedRef = useRef<Record<string, boolean>>({ Milan: true });
  const selectedNzdRef   = useRef<Record<string, number>>({ Milan: 0 });
  const customHotelsRef  = useRef<Record<string, CustomHotel>>({ Milan: { nm: 'Crowne Plaza', nzd: 0 } });

  useEffect(() => { alreadyBookedRef.current = alreadyBooked; }, [alreadyBooked]);
  useEffect(() => { selectedNzdRef.current   = selectedNzd;   }, [selectedNzd]);
  useEffect(() => { customHotelsRef.current  = customHotels;  }, [customHotels]);

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    async function loadAll() {
      const [
        { data: profs },
        { data: bookings },
        { data: voteRows },
        { data: hotels },
        { data: checks },
        { data: expenseRows },
        { data: noteRows },
      ] = await Promise.all([
        db.from('profiles').select('id, display_name, trip_role'),
        db.from('activity_bookings').select('*'),
        db.from('activity_votes').select('*'),
        db.from('hotel_state').select('*'),
        db.from('packing_checks').select('*'),
        db.from('expenses').select('*').order('expense_date', { ascending: false }),
        db.from('trip_notes').select('*').order('created_at', { ascending: false }),
      ]);

      profilesRef.current = (profs ?? []) as Profile[];

      if (bookings?.length) {
        setDays(prev => {
          const next = prev.map(d => ({ ...d, sg: d.sg.map(sg => ({ ...sg })) })) as Day[];
          for (const b of bookings) {
            if (next[b.day_index]?.sg[b.segment_index]) {
              next[b.day_index].sg[b.segment_index].bk = b.booked;
            }
          }
          return next;
        });
      }

      if (voteRows?.length) {
        const newVotes: Record<string, { k?: boolean; a?: boolean }> = {};
        for (const v of voteRows) {
          if (!v.voted) continue;
          const role = profilesRef.current.find(p => p.id === v.user_id)?.trip_role;
          if (!role) continue;
          const key = `${v.day_index}-${v.segment_index}`;
          if (!newVotes[key]) newVotes[key] = {};
          (newVotes[key] as Record<string, boolean>)[role] = true;
        }
        setVotes(newVotes);
      }

      if (hotels?.length) {
        const newBooked: Record<string, boolean>     = { Milan: true };
        const newSel:    Record<string, number>      = { Milan: 0 };
        const newCust:   Record<string, CustomHotel> = { Milan: { nm: 'Crowne Plaza', nzd: 0 } };
        for (const h of hotels) {
          if (h.already_booked) newBooked[h.region] = true;
          if (h.selected_nzd > 0) newSel[h.region] = h.selected_nzd;
          if (h.custom_name || h.custom_nzd > 0) {
            newCust[h.region] = { nm: h.custom_name, nzd: h.custom_nzd, st: h.custom_status };
          }
        }
        setAlreadyBooked(newBooked);
        setSelectedNzd(newSel);
        setCustomHotels(newCust);
      }

      if (checks?.length) {
        setPacking(prev => {
          const next: PackingState = Object.fromEntries(
            Object.entries(prev).map(([cid, items]) => [cid, items.map(i => ({ ...i, k: false, a: false }))])
          );
          for (const c of checks) {
            if (!c.checked) continue;
            const role = profilesRef.current.find(p => p.id === c.user_id)?.trip_role;
            if (!role) continue;
            const items = next[c.cat_id];
            if (!items) continue;
            const item = items.find((i: PackingItem) => i.id === c.item_id);
            if (item) (item as unknown as Record<string, unknown>)[role] = true;
          }
          return next;
        });
      }

      if (expenseRows?.length) {
        setExpenses(expenseRows as Expense[]);
      }

      if (noteRows?.length) {
        setNotes(noteRows as TripNote[]);
      }

      setSynced(true);
    }

    loadAll();
  }, [user]);

  // ── Realtime subscriptions ──────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !synced) return;

    const channel = supabase.channel('trip-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_bookings' }, (payload: { new: Record<string, unknown> }) => {
        const b = payload.new as { day_index: number; segment_index: number; booked: boolean };
        setDays(prev => {
          const next = prev.map(d => ({ ...d, sg: d.sg.map(sg => ({ ...sg })) })) as Day[];
          if (next[b.day_index]?.sg[b.segment_index]) {
            next[b.day_index].sg[b.segment_index].bk = b.booked;
          }
          return next;
        });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_votes' }, (payload: { new: Record<string, unknown> }) => {
        const v = payload.new as { user_id: string; day_index: number; segment_index: number; voted: boolean };
        const role = profilesRef.current.find(p => p.id === v.user_id)?.trip_role;
        if (!role) return;
        const key = `${v.day_index}-${v.segment_index}`;
        setVotes(prev => ({ ...prev, [key]: { ...prev[key], [role]: v.voted } }));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hotel_state' }, (payload: { new: Record<string, unknown> }) => {
        const h = payload.new as { region: string; already_booked: boolean; selected_nzd: number; custom_name: string; custom_nzd: number; custom_status: string };
        setAlreadyBooked(prev => ({ ...prev, [h.region]: h.already_booked }));
        setSelectedNzd(prev => ({ ...prev, [h.region]: h.selected_nzd }));
        setCustomHotels(prev => ({ ...prev, [h.region]: { nm: h.custom_name, nzd: h.custom_nzd, st: h.custom_status as CustomHotel['st'] } }));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'packing_checks' }, (payload: { new: Record<string, unknown> }) => {
        const c = payload.new as { user_id: string; item_id: string; cat_id: string; checked: boolean };
        const role = profilesRef.current.find(p => p.id === c.user_id)?.trip_role;
        if (!role) return;
        setPacking(prev => ({
          ...prev,
          [c.cat_id]: (prev[c.cat_id] ?? []).map(item =>
            item.id === c.item_id ? { ...item, [role]: c.checked } : item
          ),
        }));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'expenses' }, (payload: { new: Record<string, unknown> }) => {
        setExpenses(prev => {
          // avoid duplicates (our own insert may trigger this)
          if (prev.some(e => e.id === (payload.new as Expense).id)) return prev;
          return [payload.new as Expense, ...prev];
        });
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'expenses' }, (payload: { old: Record<string, unknown> }) => {
        const old = payload.old as { id: string };
        setExpenses(prev => prev.filter(e => e.id !== old.id));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trip_notes' }, (payload: { new: Record<string, unknown> }) => {
        setNotes(prev => {
          if (prev.some(n => n.id === (payload.new as TripNote).id)) return prev;
          return [payload.new as TripNote, ...prev];
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'trip_notes' }, (payload: { new: Record<string, unknown> }) => {
        const updated = payload.new as TripNote;
        setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'trip_notes' }, (payload: { old: Record<string, unknown> }) => {
        const old = payload.old as { id: string };
        setNotes(prev => prev.filter(n => n.id !== old.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, synced]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const syncHotelFull = useCallback((
    region: string,
    booked: boolean,
    selNzd: number,
    cust: CustomHotel,
  ) => {
    db.from('hotel_state').upsert(
      {
        region,
        already_booked: booked,
        selected_nzd:   selNzd,
        custom_name:    cust.nm   ?? '',
        custom_nzd:     cust.nzd  ?? 0,
        custom_status:  cust.st   ?? 'none',
        updated_at:     new Date().toISOString(),
      },
      { onConflict: 'region' }
    ).then(() => {});
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const toggleActivity = useCallback((di: number, si: number) => {
    setDays(prev => {
      const next = prev.map(d => ({ ...d, sg: d.sg.map(sg => ({ ...sg })) })) as Day[];
      const newBk = !next[di].sg[si].bk;
      next[di].sg[si].bk = newBk;
      db.from('activity_bookings').upsert(
        { day_index: di, segment_index: si, booked: newBk, updated_at: new Date().toISOString() },
        { onConflict: 'day_index,segment_index' }
      ).then(() => {});
      return next;
    });
  }, []);

  const handleVote = useCallback((di: number, si: number, who: 'k' | 'a') => {
    if (who !== tripRole || !user) return;
    const key = `${di}-${si}`;
    setVotes(prev => {
      const cur = prev[key] ?? {};
      const newVal = !(cur as Record<string, boolean>)[who];
      db.from('activity_votes').upsert(
        { user_id: user.id, day_index: di, segment_index: si, voted: newVal, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,day_index,segment_index' }
      ).then(() => {});
      return { ...prev, [key]: { ...cur, [who]: newVal } };
    });
  }, [tripRole, user]);

  const handleSetCustomHotel = useCallback((region: string, val: Partial<CustomHotel>) => {
    setCustomHotels(prev => {
      const h = { nm: '', nzd: 0, st: 'none' as const, ...(prev[region] ?? {}), ...val };
      const next = { ...prev, [region]: h };
      syncHotelFull(region, alreadyBookedRef.current[region] ?? false, selectedNzdRef.current[region] ?? 0, h);
      return next;
    });
  }, [syncHotelFull]);

  const handleSelectOption = useCallback((region: string, nzd: number) => {
    setSelectedNzd(prev => {
      const next = { ...prev, [region]: nzd };
      syncHotelFull(region, alreadyBookedRef.current[region] ?? false, nzd, customHotelsRef.current[region] ?? { nm: '', nzd: 0 });
      return next;
    });
  }, [syncHotelFull]);

  const handleMarkBooked = useCallback((region: string) => {
    setAlreadyBooked(prev => {
      const newVal = !prev[region];
      syncHotelFull(region, newVal, selectedNzdRef.current[region] ?? 0, customHotelsRef.current[region] ?? { nm: '', nzd: 0 });
      return { ...prev, [region]: newVal };
    });
  }, [syncHotelFull]);

  const handlePackingToggle = useCallback((catId: string, itemId: string, who: 'k' | 'a') => {
    if (who !== tripRole || !user) return;
    setPacking(prev => {
      const items = (prev[catId] ?? []).map(item => {
        if (item.id !== itemId) return item;
        const newVal = !(item as unknown as Record<string, unknown>)[who];
        db.from('packing_checks').upsert(
          { user_id: user.id, item_id: itemId, cat_id: catId, checked: newVal, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,item_id' }
        ).then(() => {});
        return { ...item, [who]: newVal };
      });
      return { ...prev, [catId]: items };
    });
  }, [tripRole, user]);

  const handlePackingAdd = useCallback((catId: string, nm: string) => {
    const id = `custom-${catId}-${Date.now()}`;
    setPacking(prev => ({
      ...prev,
      [catId]: [...(prev[catId] ?? []), { id, nm, k: false, a: false }],
    }));
  }, []);

  const handlePackingRemove = useCallback((catId: string, itemId: string) => {
    setPacking(prev => ({
      ...prev,
      [catId]: (prev[catId] ?? []).filter(item => item.id !== itemId),
    }));
  }, []);

  // ── Expense handlers ────────────────────────────────────────────────────────

  const handleAddExpense = useCallback(async (exp: Omit<Expense, 'id' | 'created_by'>) => {
    if (!user) return;
    const { data } = await db.from('expenses').insert({
      amount_eur:   exp.amount_eur,
      category:     exp.category,
      paid_by:      exp.paid_by,
      description:  exp.description,
      expense_date: exp.expense_date,
      created_by:   user.id,
    }).select().single();
    if (data) {
      setExpenses(prev => [data as Expense, ...prev]);
    }
  }, [user]);

  const handleDeleteExpense = useCallback(async (id: string) => {
    await db.from('expenses').delete().eq('id', id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  // ── Note handlers ───────────────────────────────────────────────────────────

  const handleAddNote = useCallback(async (note: Omit<TripNote, 'id' | 'created_by' | 'created_at'>) => {
    if (!user) return;
    const { data } = await db.from('trip_notes').insert({
      day_index:  note.day_index,
      content:    note.content,
      created_by: user.id,
    }).select().single();
    if (data) {
      setNotes(prev => [data as TripNote, ...prev]);
    }
  }, [user]);

  const handleUpdateNote = useCallback(async (id: string, content: string) => {
    await db.from('trip_notes').update({ content, updated_at: new Date().toISOString() }).eq('id', id);
    setNotes(prev => prev.map(n => n.id === id ? { ...n, content } : n));
  }, []);

  const handleDeleteNote = useCallback(async (id: string) => {
    await db.from('trip_notes').delete().eq('id', id);
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    days, votes, alreadyBooked, selectedNzd, customHotels, packing, expenses, notes, synced,
    toggleActivity, handleVote,
    handleSetCustomHotel, handleSelectOption, handleMarkBooked,
    handlePackingToggle, handlePackingAdd, handlePackingRemove,
    handleAddExpense, handleDeleteExpense,
    handleAddNote, handleUpdateNote, handleDeleteNote,
  };
}

```


## `src/contexts/AuthContext.tsx`

```tsx
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/types/trip';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  tripRole: 'k' | 'a' | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  createProfile: (role: 'k' | 'a', name: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    const { data } = await (supabase as ReturnType<typeof supabase.from> & typeof supabase)
      .from('profiles')
      .select('id, display_name, trip_role')
      .eq('id', uid)
      .maybeSingle() as unknown as { data: Profile | null };
    setProfile(data ?? null);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) setTimeout(() => fetchProfile(s.user.id), 0);
      else setProfile(null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchProfile(s.user.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const createProfile = async (role: 'k' | 'a', name: string) => {
    if (!user) return { error: new Error('Not signed in') };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('profiles').insert({
      id: user.id,
      display_name: name,
      trip_role: role,
    });
    if (!error) await fetchProfile(user.id);
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile,
      tripRole: (profile?.trip_role as 'k' | 'a') ?? null,
      loading,
      signIn, signUp, signOut, createProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

```


## `src/components/trip/CountdownView.tsx`

```tsx
import { useMemo } from "react";
import { HOTELS } from "@/data/tripData";
import { Plane, Hotel, CheckCircle2, ShoppingBag, AlertTriangle, Calendar, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const DEPARTURE = new Date("2026-05-25T06:30:00+02:00"); // Arrive Milan 6:30am local

interface Props {
  days: { sg: { bk: boolean; nt?: string; nm?: string; lnk?: string }[] }[];
  alreadyBooked: Record<string, boolean>;
  customHotels: Record<string, { st?: string }>;
  packing: Record<string, { k?: boolean; a?: boolean }[]>;
  urgentCount: number;
  onNavigate?: (view: string) => void;
}

export function CountdownView({ days, alreadyBooked, customHotels, packing, urgentCount }: Props) {
  const now = new Date();
  const msLeft = DEPARTURE.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60 * 24)));
  const hoursLeft = Math.max(0, Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  const isPast = msLeft <= 0;
  const isInProgress = now >= DEPARTURE && now <= new Date("2026-06-10T23:59:59");

  // Hotel progress
  const hotelEntries = Object.entries(HOTELS);
  const bookedHotels = hotelEntries.filter(([r, d]) => {
    const c = customHotels[r];
    return alreadyBooked[r] || d.st === "confirmed" || c?.st === "booked";
  }).length;
  const selectedHotels = hotelEntries.filter(([r]) => customHotels[r]?.st === "selected").length;
  const hotelPct = Math.round(((bookedHotels + selectedHotels * 0.5) / hotelEntries.length) * 100);

  // Activity progress
  const totalActs = days.reduce((s, d) => s + d.sg.length, 0);
  const bookedActs = days.reduce((s, d) => s + d.sg.filter(a => a.bk).length, 0);
  const actPct = totalActs > 0 ? Math.round((bookedActs / totalActs) * 100) : 0;

  // Packing progress (Kate's perspective — own items)
  const allPackItems = Object.values(packing).flat();
  const kPacked = allPackItems.filter(i => i.k).length;
  const aPacked = allPackItems.filter(i => i.a).length;
  const packPct = allPackItems.length > 0
    ? Math.round(((kPacked + aPacked) / (allPackItems.length * 2)) * 100)
    : 0;

  // Today's focus — most urgent booking
  const urgentItems = days.flatMap((d, di) =>
    d.sg
      .map((a, si) => ({ ...a, di, si }))
      .filter(a => a.nt?.includes("⚠") && !a.bk)
  );
  const topFocus = urgentItems[0];

  const rings = [
    {
      label: "Hotels",
      icon: <Hotel className="w-4 h-4" />,
      pct: hotelPct,
      detail: `${bookedHotels} booked, ${selectedHotels} selected of ${hotelEntries.length}`,
      col: "text-gold",
      stroke: "hsl(34,48%,56%)",
    },
    {
      label: "Activities",
      icon: <CheckCircle2 className="w-4 h-4" />,
      pct: actPct,
      detail: `${bookedActs} of ${totalActs} confirmed`,
      col: "text-primary",
      stroke: "hsl(345,54%,22%)",
    },
    {
      label: "Packing",
      icon: <ShoppingBag className="w-4 h-4" />,
      pct: packPct,
      detail: `${kPacked}+${aPacked} items checked`,
      col: "text-brown",
      stroke: "hsl(18,42%,26%)",
    },
  ];

  // Key upcoming milestones
  const milestones = useMemo(() => [
    { label: "Book Lake Garda hotel",   done: !!(alreadyBooked["Lake Garda"] || customHotels["Lake Garda"]?.st === "booked" || customHotels["Lake Garda"]?.st === "selected") },
    { label: "Book Florence hotel",     done: !!(alreadyBooked["Florence"]    || customHotels["Florence"]?.st    === "booked" || customHotels["Florence"]?.st    === "selected") },
    { label: "Book Tuscany hotel",      done: !!(alreadyBooked["Tuscany"]     || customHotels["Tuscany"]?.st     === "booked" || customHotels["Tuscany"]?.st     === "selected") },
    { label: "Book Rome hotel",         done: !!(alreadyBooked["Rome"]        || customHotels["Rome"]?.st        === "booked" || customHotels["Rome"]?.st        === "selected") },
    { label: "Book Sorrento hotel",     done: !!(alreadyBooked["Sorrento"]    || customHotels["Sorrento"]?.st    === "booked" || customHotels["Sorrento"]?.st    === "selected") },
    { label: "Start packing",           done: packPct > 5 },
    { label: "All urgent bookings done",done: urgentCount === 0 },
  ], [alreadyBooked, customHotels, packPct, urgentCount]);

  const milestonesDone = milestones.filter(m => m.done).length;

  return (
    <div className="space-y-5">
      {/* Hero countdown */}
      <div className={cn(
        "rounded-xl p-6 text-primary-foreground shadow-md text-center relative overflow-hidden",
        isInProgress ? "bg-gradient-to-br from-primary to-brown" : "bg-primary"
      )}>
        {/* decorative */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-2 right-4 text-[80px] leading-none select-none">🇮🇹</div>
        </div>

        <div className="relative">
          <div className="flex items-center justify-center gap-2 text-[10px] opacity-60 tracking-widest uppercase mb-3">
            <Plane className="w-3.5 h-3.5" />
            {isInProgress ? "Currently in Italy" : isPast ? "Trip complete" : "Until departure · Milan 25 May 2026"}
          </div>

          {isPast || isInProgress ? (
            <div className="text-4xl font-bold text-gold font-serif">
              {isInProgress ? "Buon viaggio! 🥂" : "Arrivederci! 🇮🇹"}
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-center gap-3">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gold font-serif tabular-nums leading-none">{daysLeft}</div>
                  <div className="text-[10px] opacity-60 mt-1">days</div>
                </div>
                <div className="text-3xl opacity-30 font-light mb-2">:</div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-gold font-serif tabular-nums leading-none">{String(hoursLeft).padStart(2, "0")}</div>
                  <div className="text-[10px] opacity-60 mt-1">hours</div>
                </div>
              </div>
              <div className="text-[11px] opacity-50 mt-3">
                {milestonesDone}/{milestones.length} pre-trip tasks done
              </div>
            </>
          )}
        </div>
      </div>

      {/* Progress rings */}
      <div className="grid grid-cols-3 gap-3">
        {rings.map((r) => (
          <div key={r.label} className="bg-card border border-border rounded-xl p-3 flex flex-col items-center shadow-sm">
            <svg width="64" height="64" viewBox="0 0 64 64" className="mb-2">
              <circle cx="32" cy="32" r="26" fill="none" stroke="hsl(28,24%,87%)" strokeWidth="6" />
              <circle
                cx="32" cy="32" r="26" fill="none"
                stroke={r.stroke} strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - r.pct / 100)}`}
                transform="rotate(-90 32 32)"
                style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)" }}
              />
              <text x="32" y="37" textAnchor="middle" className="font-bold" fontSize="13" fill="currentColor" style={{ fill: r.stroke }}>
                {r.pct}%
              </text>
            </svg>
            <div className={cn("text-[11px] font-semibold flex items-center gap-1", r.col)}>
              {r.icon}{r.label}
            </div>
            <div className="text-[9px] text-muted-foreground text-center mt-0.5 leading-tight">{r.detail}</div>
          </div>
        ))}
      </div>

      {/* Today's focus */}
      {topFocus && (
        <div className="bg-card border border-burg-light/40 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-burg-light uppercase tracking-widest mb-2">
            <Star className="w-3.5 h-3.5" /> Today's Focus
          </div>
          <div className="text-[14px] font-semibold text-foreground">{topFocus.nm}</div>
          {topFocus.nt && (
            <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{topFocus.nt.replace("⚠", "").trim()}</div>
          )}
          {topFocus.lnk && (
            <a href={topFocus.lnk} target="_blank" rel="noopener noreferrer"
              className="inline-block mt-2 text-[11px] font-semibold text-primary underline hover:no-underline">
              Book now →
            </a>
          )}
        </div>
      )}

      {/* Status cards */}
      <div className="space-y-2">
        {urgentCount > 0 && (
          <div className="flex items-center gap-3 bg-card border border-burg-light/40 rounded-lg px-3 py-2.5 shadow-sm">
            <AlertTriangle className="w-4 h-4 text-burg-light shrink-0" />
            <span className="text-[13px] font-semibold text-burg-light">{urgentCount} urgent booking{urgentCount !== 1 ? "s" : ""} remaining</span>
          </div>
        )}
        {hotelEntries.length - bookedHotels - selectedHotels > 0 && (
          <div className="flex items-center gap-3 bg-card border border-gold/30 rounded-lg px-3 py-2.5 shadow-sm">
            <Hotel className="w-4 h-4 text-gold shrink-0" />
            <span className="text-[13px] text-brown font-medium">{hotelEntries.length - bookedHotels - selectedHotels} hotel{hotelEntries.length - bookedHotels - selectedHotels !== 1 ? "s" : ""} still to select</span>
          </div>
        )}
        {packPct === 0 && (
          <div className="flex items-center gap-3 bg-card border border-border rounded-lg px-3 py-2.5 shadow-sm">
            <ShoppingBag className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-[13px] text-muted-foreground">Packing not started yet</span>
          </div>
        )}
      </div>

      {/* Milestone checklist */}
      <div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-warm uppercase tracking-widest mb-2">
          <Calendar className="w-3.5 h-3.5" /> Pre-Trip Checklist
        </div>
        <div className="space-y-1.5">
          {milestones.map((m, i) => (
            <div key={i} className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 border transition-colors",
              m.done ? "bg-secondary border-transparent opacity-60" : "bg-card border-border shadow-sm"
            )}>
              <div className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                m.done ? "bg-primary border-primary" : "border-muted-foreground"
              )}>
                {m.done && <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
              </div>
              <span className={cn("text-[12px]", m.done ? "line-through text-muted-foreground" : "text-foreground font-medium")}>
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

```


## `src/components/trip/TimelineView.tsx`

```tsx
import { useState } from "react";
import { Day, ActivityType, TRANSPORT, ROUTES, GEMS } from "@/data/tripData";
import { TypeBadge } from "./TypeBadge";
import { REGION_COLORS } from "@/data/tripData";
import { cn } from "@/lib/utils";
import { MapPin, ExternalLink, Plus, Trash2, Gem, Check, AlertTriangle } from "lucide-react";

const ACT_FILTER: { value: "all" | ActivityType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ticket", label: "Tickets" },
  { value: "food", label: "Dining" },
  { value: "experience", label: "Experiences" },
  { value: "transport", label: "Routes" },
  { value: "free", label: "Free" },
];

const CAT_STYLE: Record<string, string> = {
  must: "bg-primary/10 text-primary border-primary/30",
  wow: "bg-gold/10 text-brown border-gold/30",
  gem: "bg-brown/10 text-brown border-brown/30",
};
const CAT_LABEL: Record<string, string> = { must: "Must", wow: "Wow", gem: "Hidden Gem" };

interface Props {
  days: Day[];
  votes: Record<string, { k?: boolean; a?: boolean }>;
  customActs: Record<string, { nm: string; c: number; tp: ActivityType; bk: boolean }[]>;
  onToggle: (di: number, si: number) => void;
  onVote: (di: number, si: number, who: "k" | "a") => void;
  onAddCustom: (di: number, nm: string, cost: number) => void;
  onRemoveCustom: (di: number, ci: number) => void;
  onToggleCustom: (di: number, ci: number) => void;
}

export function TimelineView({ days, votes, customActs, onToggle, onVote, onAddCustom, onRemoveCustom, onToggleCustom }: Props) {
  const [sel, setSel] = useState(0);
  const [filter, setFilter] = useState<"all" | ActivityType>("all");
  const [addNm, setAddNm] = useState("");
  const [addCost, setAddCost] = useState("");

  const cur = days[sel];
  const regionColor = REGION_COLORS[cur.rg] ?? "#5C1A2A";
  const transport = TRANSPORT[cur.dt];
  const routes = ROUTES[cur.dt];
  const gems = GEMS[cur.rg] ?? [];
  const myActs = customActs["d" + sel] ?? [];

  const filtered = filter === "all" ? cur.sg : cur.sg.filter(sg => sg.tp === filter);

  // Booking progress for this day
  const totalBookable = cur.sg.filter(a => a.lnk || a.bk).length;
  const bookedCount = cur.sg.filter(a => a.bk).length;
  const urgentUnbooked = cur.sg.filter(a => a.nt?.includes("⚠") && !a.bk);

  const handleAdd = () => {
    if (!addNm.trim()) return;
    onAddCustom(sel, addNm.trim(), parseInt(addCost) || 0);
    setAddNm(""); setAddCost("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
      {/* ── Day selector sidebar ── */}
      <div className="flex flex-col gap-0.5 max-h-[75vh] overflow-y-auto pr-1">
        {days.map((d, i) => {
          const rc = REGION_COLORS[d.rg] ?? "#5C1A2A";
          const dayBooked = d.sg.filter(a => a.bk).length;
          const dayUrgent = d.sg.filter(a => a.nt?.includes("⚠") && !a.bk).length;
          const isToday = i === sel;

          return (
            <button
              key={i}
              onClick={() => setSel(i)}
              className={cn(
                "text-left px-3 py-2.5 rounded-xl transition-all border",
                isToday
                  ? "text-primary-foreground shadow-sm border-transparent"
                  : "hover:bg-secondary/60 text-foreground border-transparent hover:border-border"
              )}
              style={isToday ? { background: rc } : undefined}
            >
              <div className="flex justify-between items-center gap-2">
                <span className={cn("text-[10px] font-medium tracking-wide", isToday ? "opacity-60" : "text-muted-foreground")}>{d.dt}</span>
                <div className="flex items-center gap-1">
                  {dayUrgent > 0 && !isToday && (
                    <span className="w-4 h-4 rounded-full bg-destructive/15 flex items-center justify-center">
                      <AlertTriangle className="w-2.5 h-2.5 text-destructive" />
                    </span>
                  )}
                  {dayBooked > 0 && (
                    <span className={cn(
                      "text-[9px] font-semibold px-1.5 rounded-full",
                      isToday ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                    )}>
                      {dayBooked}/{d.sg.length}
                    </span>
                  )}
                </div>
              </div>
              <div className={cn("text-[12px] font-semibold leading-snug mt-0.5", isToday ? "" : "text-foreground")}>{d.act}</div>
              <div className={cn("text-[10px] mt-0.5", isToday ? "opacity-55" : "text-muted-foreground")}>{d.rg}</div>
            </button>
          );
        })}
      </div>

      {/* ── Day detail ── */}
      <div className="space-y-3">
        {/* Day hero */}
        <div className="rounded-xl overflow-hidden shadow-sm" style={{ background: regionColor }}>
          <div className="px-4 py-4 text-white">
            <div className="text-[10px] opacity-50 tracking-widest uppercase">{cur.dt} · {cur.dy}</div>
            <h2 className="text-[18px] font-semibold mt-1 leading-tight">{cur.act}</h2>
            <div className="text-[11px] opacity-65 mt-1">{cur.stay}</div>
            {/* Booking progress bar */}
            {totalBookable > 0 && (
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[9px] opacity-55 uppercase tracking-wide">Day progress</span>
                  <span className="text-[9px] opacity-70">{bookedCount}/{cur.sg.length} confirmed</span>
                </div>
                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/60 rounded-full transition-all duration-500"
                    style={{ width: `${cur.sg.length > 0 ? (bookedCount / cur.sg.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Urgent alert */}
        {urgentUnbooked.length > 0 && (
          <div className="flex items-start gap-2 bg-destructive/8 border border-destructive/25 rounded-xl px-3 py-2.5">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <div className="text-[12px] font-semibold text-destructive">
                {urgentUnbooked.length} item{urgentUnbooked.length > 1 ? "s" : ""} need booking on this day
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {urgentUnbooked.map(a => a.nm).join(" · ")}
              </div>
            </div>
          </div>
        )}

        {/* Transport tip */}
        {transport && (
          <div className="bg-card rounded-xl p-3.5 border border-border shadow-sm">
            <div className="flex items-start gap-2.5">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-primary/10 text-primary text-[10px] font-bold flex-shrink-0 mt-0.5">{transport.ic}</span>
              <div>
                <div className="text-[13px] font-semibold">{transport.s}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{transport.d}</div>
                <div className="text-[11px] text-brown font-medium mt-1.5 italic border-l-2 border-gold/50 pl-2 leading-snug">{transport.t}</div>
              </div>
            </div>
          </div>
        )}

        {/* Route options */}
        {routes && (
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="px-4 py-2.5 border-b border-border bg-secondary/40">
              <span className="text-[11px] font-semibold text-warm tracking-wide">{routes.from} → {routes.to}</span>
            </div>
            <div className="divide-y divide-border">
              {routes.opts.map((o, i) => (
                <div key={i} className="px-4 py-3 flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="text-[12px] font-semibold">{o.mode}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{o.detail}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    {o.cost && <span className="text-[11px] font-semibold text-terra">{o.cost}</span>}
                    {o.lnk && (
                      <a href={o.lnk} target="_blank" rel="noopener noreferrer"
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-primary text-primary-foreground font-semibold inline-flex items-center gap-1 hover:opacity-80 transition-opacity">
                        Book <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity type filter */}
        <div className="flex flex-wrap gap-1.5">
          {ACT_FILTER.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={cn(
                "text-[10px] px-3 py-1.5 rounded-full border transition-all",
                filter === f.value
                  ? "bg-primary text-primary-foreground border-primary font-semibold"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40"
              )}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Activities list */}
        <div className="space-y-2.5">
          {filtered.map((act, i) => {
            const origIdx = cur.sg.indexOf(act);
            const vk = votes[`${sel}-${origIdx}`];
            const isUrgent = act.nt?.includes("⚠");
            const needsBooking = !!act.lnk && !act.bk;

            return (
              <div
                key={i}
                className={cn(
                  "bg-card rounded-xl border shadow-sm transition-all duration-200",
                  act.bk
                    ? "border-primary/25 bg-primary/[0.03]"
                    : isUrgent
                      ? "border-destructive/35"
                      : "border-border"
                )}
              >
                <div className="p-3.5">
                  {/* Top row: toggle + name + cost */}
                  <div className="flex items-start gap-3">
                    {/* Booking toggle — larger, more prominent */}
                    <button
                      onClick={() => onToggle(sel, origIdx)}
                      className={cn(
                        "shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all mt-0.5",
                        act.bk
                          ? "bg-primary border-primary text-primary-foreground shadow-sm"
                          : isUrgent
                            ? "border-destructive/50 hover:border-destructive hover:bg-destructive/5"
                            : "border-border hover:border-primary"
                      )}
                    >
                      {act.bk && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <TypeBadge type={act.tp} />
                        {isUrgent && !act.bk && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded border bg-destructive/10 text-destructive border-destructive/25 font-semibold">
                            <AlertTriangle className="w-2.5 h-2.5" /> Urgent
                          </span>
                        )}
                        <span className={cn(
                          "text-[13px] font-semibold leading-tight",
                          act.bk ? "line-through opacity-50" : ""
                        )}>
                          {act.nm}
                        </span>
                        {act.c > 0 && (
                          <span className="text-[11px] text-muted-foreground font-medium">€{act.c}</span>
                        )}
                      </div>

                      {act.nt && (
                        <p className={cn(
                          "text-[11px] mt-1 leading-snug",
                          isUrgent && !act.bk ? "text-destructive/80 font-medium" : "text-muted-foreground"
                        )}>
                          {act.nt.replace("⚠ ", "")}
                        </p>
                      )}

                      {/* Action row */}
                      <div className="flex gap-1.5 mt-2 flex-wrap items-center">
                        {act.lnk && !act.bk && (
                          <a href={act.lnk} target="_blank" rel="noopener noreferrer"
                            className={cn(
                              "inline-flex items-center gap-1 text-[10px] px-3 py-1.5 rounded-lg font-semibold hover:opacity-80 transition-opacity",
                              isUrgent
                                ? "bg-destructive text-white"
                                : "bg-primary text-primary-foreground"
                            )}>
                            Book now <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {act.lnk && act.bk && (
                          <a href={act.lnk} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg border border-border text-muted-foreground hover:border-primary/40 transition-colors">
                            View booking <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {act.map && (
                          <a href={act.map} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg border border-border text-muted-foreground hover:border-primary/40 transition-colors">
                            <MapPin className="w-3 h-3" /> Map
                          </a>
                        )}

                        {/* Who's keen votes */}
                        <div className="ml-auto flex gap-1.5">
                          {(["k", "a"] as const).map(who => {
                            const on = vk?.[who];
                            return (
                              <button
                                key={who}
                                onClick={() => onVote(sel, origIdx, who)}
                                className={cn(
                                  "text-[9px] px-2 py-1 rounded-lg border transition-all font-medium",
                                  on
                                    ? who === "k"
                                      ? "border-primary bg-primary/10 text-primary"
                                      : "border-gold bg-gold/15 text-brown"
                                    : "border-border text-muted-foreground hover:border-primary/30"
                                )}
                              >
                                {on ? "✓ " : ""}{who === "k" ? "Kate" : "Adrian"}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Custom activities */}
          {myActs.map((act, ci) => (
            <div key={ci} className={cn(
              "bg-card rounded-xl border p-3.5 shadow-sm",
              act.bk ? "border-primary/25 bg-primary/[0.03]" : "border-gold/40"
            )}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onToggleCustom(sel, ci)}
                  className={cn(
                    "shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all",
                    act.bk ? "bg-primary border-primary text-primary-foreground" : "border-border hover:border-primary"
                  )}
                >
                  {act.bk && <Check className="w-3.5 h-3.5" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <TypeBadge type={act.tp} />
                    <span className={cn("text-[13px] font-semibold", act.bk && "line-through opacity-50")}>{act.nm}</span>
                    {act.c > 0 && <span className="text-[11px] text-muted-foreground">€{act.c}</span>}
                  </div>
                  <span className="text-[9px] text-gold font-medium">Added by you</span>
                </div>
                <button
                  onClick={() => onRemoveCustom(sel, ci)}
                  className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-destructive/40 hover:text-destructive hover:bg-destructive/5 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}

          {/* Add custom activity */}
          <div className="bg-card rounded-xl border border-dashed border-border p-3.5">
            <div className="text-[11px] font-semibold text-muted-foreground mb-2">Add your own activity</div>
            <div className="flex gap-2 flex-wrap">
              <input
                value={addNm}
                onChange={e => setAddNm(e.target.value)}
                placeholder="e.g. Cooking class, boat trip…"
                className="flex-1 min-w-[140px] text-[12px] px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/40"
                onKeyDown={e => e.key === "Enter" && handleAdd()}
              />
              <input
                value={addCost}
                onChange={e => setAddCost(e.target.value)}
                type="number"
                placeholder="€ cost"
                className="w-20 text-[12px] px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/40"
                onKeyDown={e => e.key === "Enter" && handleAdd()}
              />
              <button
                onClick={handleAdd}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-[12px] font-semibold hover:opacity-80 transition-opacity flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        </div>

        {/* Hidden gems */}
        {gems.length > 0 && (
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-secondary/30 flex items-center gap-1.5">
              <Gem className="w-3.5 h-3.5 text-gold" />
              <span className="text-[11px] font-semibold text-warm tracking-wide">Hidden Gems — {cur.rg}</span>
            </div>
            <div className="divide-y divide-border">
              {gems.map((g, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3">
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-semibold flex-shrink-0 mt-0.5", CAT_STYLE[g.cat])}>
                    {CAT_LABEL[g.cat]}
                  </span>
                  <div className="flex-1">
                    <div className="text-[12px] font-semibold">{g.n}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{g.d}</div>
                    <div className="flex gap-1.5 mt-2">
                      {g.lnk && (
                        <a href={g.lnk} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-80 transition-opacity">
                          Book <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {g.map && (
                        <a href={g.map} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg border border-border text-muted-foreground hover:border-primary/40 transition-colors">
                          <MapPin className="w-2.5 h-2.5" /> Map
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

```


## `src/components/trip/HotelsView.tsx`

```tsx
import { useState } from "react";
import { HOTELS, HotelTier } from "@/data/tripData";
import { cn } from "@/lib/utils";
import {
  ExternalLink, Star, Check, BookmarkCheck, CircleDot,
  MapPin, Sparkles, Leaf, Crown, ChevronDown, ChevronUp, Globe,
  Info, CheckCircle2, Hotel,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────── */
interface CustomHotel {
  nm: string;
  nzd: number;
  st?: "none" | "selected" | "booked";
}

interface Props {
  customHotels: Record<string, CustomHotel>;
  selectedNzd: Record<string, number>;
  alreadyBooked: Record<string, boolean>;
  onSetCustom: (region: string, val: Partial<CustomHotel>) => void;
  onSelectOption: (region: string, nzd: number) => void;
  onMarkBooked: (region: string) => void;
}

/* ─── Tier config ────────────────────────────────────────────────────── */
const TIER_CONFIG: Record<HotelTier, {
  label: string;
  icon: React.FC<{ className?: string }>;
  chip: string;
  bar: string;
  dot: string;
}> = {
  budget: {
    label: "Budget",
    icon: Leaf,
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
    bar: "bg-emerald-400",
    dot: "bg-emerald-500",
  },
  mid: {
    label: "Mid-range",
    icon: Sparkles,
    chip: "bg-amber-50 text-amber-700 border-amber-200",
    bar: "bg-amber-400",
    dot: "bg-amber-500",
  },
  luxury: {
    label: "Luxury",
    icon: Crown,
    chip: "bg-purple-50 text-purple-700 border-purple-200",
    bar: "bg-purple-400",
    dot: "bg-purple-500",
  },
};

const TIER_ORDER: HotelTier[] = ["budget", "mid", "luxury"];

/* ─── Helpers ────────────────────────────────────────────────────────── */
function bkDates(q: string, ci: string, co: string) {
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(q)}&checkin=${ci}&checkout=${co}&group_adults=2&no_rooms=1`;
}
function bkBrowse(q: string) {
  return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(q)}&group_adults=2&no_rooms=1`;
}
function fmtDate(d: string) {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-NZ", { day: "numeric", month: "short" });
}

function StarRow({ n }: { n: number }) {
  if (n === 0) return null;
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} className="w-2.5 h-2.5 fill-gold text-gold" />
      ))}
    </span>
  );
}

function PriceBar({ eur, tier }: { eur: number; tier: HotelTier }) {
  const max = tier === "budget" ? 250 : tier === "mid" ? 450 : 800;
  const pct = Math.min(100, (eur / max) * 100);
  const cfg = TIER_CONFIG[tier];
  return (
    <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
      <div className={cn("h-full rounded-full", cfg.bar)} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ─── Booked region summary card ─────────────────────────────────────── */
function BookedCard({
  region,
  bookedHotelName,
  nights,
  ci,
  co,
  onUnbook,
  isConfirmed,
}: {
  region: string;
  bookedHotelName: string;
  nights: number;
  ci: string;
  co: string;
  onUnbook: () => void;
  isConfirmed: boolean;
}) {
  return (
    <div className="bg-card rounded-xl border border-primary/20 shadow-sm overflow-hidden">
      <div className="bg-primary px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-gold" />
          <div>
            <div className="text-[13px] font-semibold text-primary-foreground">{region}</div>
            <div className="text-[10px] text-primary-foreground/70">{fmtDate(ci)} → {fmtDate(co)} · {nights}n</div>
          </div>
        </div>
        {!isConfirmed && (
          <button
            onClick={onUnbook}
            className="text-[9px] px-2 py-1 rounded border border-white/20 text-white/70 hover:bg-white/10 transition-colors"
          >
            Unbook
          </button>
        )}
      </div>
      <div className="px-4 py-3 flex items-center gap-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", "bg-primary/10")}>
          <Hotel className="w-4 h-4 text-primary" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-foreground">{bookedHotelName}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {isConfirmed ? "Pre-confirmed — no action needed" : "Marked as booked"}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Single hotel option card ───────────────────────────────────────── */
function OptionCard({
  opt,
  nights,
  ci,
  co,
  isSel,
  onSelect,
}: {
  opt: typeof HOTELS[string]["opts"][number];
  nights: number;
  ci: string;
  co: string;
  isSel: boolean;
  onSelect: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = TIER_CONFIG[opt.tier];
  const Icon = cfg.icon;

  if (opt.rb) {
    return (
      <div className="px-4 py-3 flex items-start gap-3">
        <div className={cn("w-2 h-2 rounded-full shrink-0 mt-1.5", cfg.dot)} />
        <div>
          <div className="text-[12px] font-semibold">{opt.nm}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{opt.v}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative transition-all duration-200",
      isSel ? "bg-cream/60" : ""
    )}>
      {isSel && <div className={cn("absolute left-0 top-0 bottom-0 w-0.5 rounded-r", cfg.bar)} />}

      <div className="px-4 py-3.5">
        {/* Top row */}
        <div className="flex items-start gap-3">
          {/* Left: name, tier, location */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className={cn(
                "inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded border",
                cfg.chip
              )}>
                <Icon className="w-2.5 h-2.5" />
                {cfg.label}
              </span>
              {opt.bk && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded border bg-primary/10 text-primary border-primary/20">
                  <BookmarkCheck className="w-2.5 h-2.5" /> Confirmed
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[14px] font-semibold leading-tight">{opt.nm}</span>
              <StarRow n={opt.s} />
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
              <span className="text-[10px] text-muted-foreground">{opt.hood}</span>
            </div>
          </div>

          {/* Right: price */}
          {!opt.bk && opt.nzd > 0 && (
            <div className="text-right shrink-0">
              <div className="text-[16px] font-bold leading-none">
                ${opt.nzd}
                <span className="text-[10px] font-normal text-muted-foreground">/n</span>
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">€{opt.eur}/n</div>
              <div className="flex items-center gap-1 mt-1 justify-end">
                <PriceBar eur={opt.eur} tier={opt.tier} />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {nights}n = <span className="font-bold text-foreground">${(opt.nzd * nights).toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-[11px] text-muted-foreground leading-snug mt-2">{opt.v}</p>

        {/* Expandable perks */}
        {opt.perks && opt.perks.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary font-medium"
            >
              <Info className="w-3 h-3" />
              {expanded ? "Hide details" : "What's included"}
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {expanded && (
              <ul className="mt-2 space-y-1">
                {opt.perks.map((p, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-[11px] text-foreground/80">
                    <Check className="w-3 h-3 text-primary shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Action buttons */}
        {!opt.bk && (
          <div className="flex flex-wrap gap-2 mt-3 items-center">
            {opt.q && (
              <>
                <a
                  href={bkDates(opt.q, ci, co)}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-80 transition-opacity"
                >
                  Check availability <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={bkBrowse(opt.q)}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
                >
                  Browse
                </a>
              </>
            )}
            {opt.site && (
              <a
                href={opt.site}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
              >
                <Globe className="w-3 h-3" /> Official site
              </a>
            )}
            {opt.nzd > 0 && (
              <button
                onClick={onSelect}
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] px-3 py-1.5 rounded-lg border transition-all ml-auto",
                  isSel
                    ? "border-gold bg-cream text-brown font-bold"
                    : "border-border text-muted-foreground hover:border-gold/50 hover:text-brown"
                )}
              >
                {isSel ? <><Check className="w-3 h-3" /> Selected</> : "Select for budget"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
export function HotelsView({
  customHotels, selectedNzd, alreadyBooked,
  onSetCustom, onSelectOption, onMarkBooked,
}: Props) {
  const [activeTier, setActiveTier] = useState<HotelTier | "all">("all");
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({});

  const toggleRegion = (r: string) =>
    setExpandedRegions(prev => ({ ...prev, [r]: !prev[r] }));

  const regions = Object.entries(HOTELS);
  const totalSelected = Object.values(selectedNzd).reduce((a, b) => a + b, 0);
  const regionsBooked = regions.filter(([r, d]) =>
    alreadyBooked[r] || d.st === "confirmed" || customHotels[r]?.st === "booked"
  ).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-xl italic font-light text-primary mb-0.5 font-serif">Where to Stay</h2>
        <p className="text-xs text-muted-foreground">
          Researched options at three price levels. Booked regions are collapsed — tap to review.
        </p>
      </div>

      {/* Summary */}
      <div className="bg-card border border-border rounded-xl px-4 py-3 flex gap-4 items-center">
        <div className="text-center">
          <div className="text-[20px] font-bold text-primary leading-none">{regionsBooked}/{regions.length}</div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wide mt-0.5">Booked</div>
        </div>
        <div className="w-px h-8 bg-border" />
        <div className="flex-1">
          <div className="flex gap-2">
            {regions.map(([r, d]) => {
              const isBooked = alreadyBooked[r] || d.st === "confirmed" || customHotels[r]?.st === "booked";
              const isSelected = customHotels[r]?.st === "selected";
              return (
                <div
                  key={r}
                  title={r}
                  className={cn(
                    "h-2 flex-1 rounded-full transition-all",
                    isBooked ? "bg-primary" : isSelected ? "bg-gold" : "bg-muted"
                  )}
                />
              );
            })}
          </div>
          <div className="flex gap-3 mt-1.5">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary" /><span className="text-[9px] text-muted-foreground">Booked</span></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gold" /><span className="text-[9px] text-muted-foreground">Selected</span></div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-muted" /><span className="text-[9px] text-muted-foreground">To do</span></div>
          </div>
        </div>
        {totalSelected > 0 && (
          <>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-[16px] font-bold leading-none">${totalSelected.toLocaleString()}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wide mt-0.5">Selected NZD</div>
            </div>
          </>
        )}
      </div>

      {/* Tier filter */}
      <div className="flex gap-1.5 flex-wrap">
        {(["all", ...TIER_ORDER] as const).map(t => {
          const active = activeTier === t;
          const cfg = t !== "all" ? TIER_CONFIG[t] : null;
          const Icon = cfg?.icon;
          return (
            <button
              key={t}
              onClick={() => setActiveTier(t)}
              className={cn(
                "inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full border font-medium transition-all",
                active
                  ? t === "all"
                    ? "bg-primary text-primary-foreground border-primary"
                    : cn(cfg!.chip, "border font-bold")
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/30"
              )}
            >
              {Icon && <Icon className="w-3 h-3" />}
              {t === "all" ? "All" : cfg!.label}
            </button>
          );
        })}
      </div>

      {/* Region cards */}
      {regions.map(([region, d]) => {
        const cust = customHotels[region];
        const isConfirmedByData = d.st === "confirmed";
        const isBooked = alreadyBooked[region] || isConfirmedByData || cust?.st === "booked";
        const isExpanded = expandedRegions[region] ?? !isBooked; // booked = collapsed by default

        // Find the booked hotel's name
        const bookedOpt = d.opts.find(o => o.bk);
        const bookedHotelName = isConfirmedByData
          ? (bookedOpt?.nm ?? d.cf ?? region)
          : cust?.nm || "Custom hotel";

        // Show only collapsed summary for booked regions
        if (isBooked && !isExpanded) {
          return (
            <div key={region}>
              <BookedCard
                region={region}
                bookedHotelName={bookedHotelName}
                nights={d.n}
                ci={d.ci}
                co={d.co}
                isConfirmed={isConfirmedByData}
                onUnbook={() => {
                  onMarkBooked(region); // toggle off
                  if (cust) onSetCustom(region, { st: "none" });
                }}
              />
              <button
                onClick={() => toggleRegion(region)}
                className="w-full text-[10px] text-muted-foreground text-center py-1.5 hover:text-primary transition-colors flex items-center justify-center gap-1"
              >
                <ChevronDown className="w-3 h-3" /> Show all options
              </button>
            </div>
          );
        }

        const filteredOpts = activeTier === "all"
          ? d.opts
          : d.opts.filter(o => o.tier === activeTier || o.bk || o.rb);

        return (
          <div key={region} className="bg-card rounded-xl overflow-hidden shadow-sm border border-border">
            {/* Region header */}
            <button
              onClick={() => isBooked && toggleRegion(region)}
              className={cn(
                "w-full px-4 py-3 flex justify-between items-start gap-2 text-left",
                isBooked ? "bg-primary text-primary-foreground cursor-pointer" : "bg-primary/90 text-primary-foreground"
              )}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[14px] font-semibold">{region}</span>
                  {isBooked && (
                    <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 bg-white/20 rounded-full font-medium">
                      <Check className="w-2.5 h-2.5" /> Booked
                    </span>
                  )}
                </div>
                <div className="text-[10px] opacity-75 mt-0.5">
                  {fmtDate(d.ci)} → {fmtDate(d.co)} · {d.n} nights
                  {d.note && <span> · <span className="opacity-60">{d.note.substring(0, 50)}</span></span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!isConfirmedByData && !isBooked && (
                  <button
                    onClick={e => { e.stopPropagation(); onMarkBooked(region); }}
                    className="text-[9px] px-2.5 py-1 rounded border border-white/30 hover:bg-white/15 transition-colors font-medium"
                  >
                    Mark booked
                  </button>
                )}
                {isBooked && <ChevronUp className="w-4 h-4 opacity-60" />}
              </div>
            </button>

            {/* Context note */}
            {d.note && (
              <div className="px-4 py-2 bg-secondary/30 border-b border-border flex items-start gap-1.5">
                <Info className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-[10px] text-muted-foreground leading-snug">{d.note}</span>
              </div>
            )}

            {/* Tier legend */}
            <div className="flex border-b border-border bg-muted/20 px-4 py-1.5 gap-4">
              {TIER_ORDER.map(t => {
                const cfg = TIER_CONFIG[t];
                const TIcon = cfg.icon;
                const count = d.opts.filter(o => o.tier === t).length;
                if (count === 0) return null;
                return (
                  <div key={t} className="flex items-center gap-1">
                    <TIcon className={cn("w-2.5 h-2.5",
                      t === "budget" ? "text-emerald-600" : t === "mid" ? "text-amber-600" : "text-purple-600"
                    )} />
                    <span className="text-[9px] text-muted-foreground">{count} {cfg.label.toLowerCase()}</span>
                  </div>
                );
              })}
            </div>

            {/* Options */}
            <div className="divide-y divide-border">
              {filteredOpts.length === 0 ? (
                <div className="px-4 py-6 text-center text-[12px] text-muted-foreground">
                  No {activeTier} options for this region
                </div>
              ) : (
                filteredOpts.map((opt, i) => {
                  const isSel = selectedNzd[region] === opt.nzd && opt.nzd > 0;
                  return (
                    <OptionCard
                      key={i}
                      opt={opt}
                      nights={d.n}
                      ci={d.ci}
                      co={d.co}
                      isSel={isSel}
                      onSelect={() => onSelectOption(region, isSel ? 0 : opt.nzd)}
                    />
                  );
                })
              )}
            </div>

            {/* Custom entry */}
            <div className="px-4 py-3 bg-cream/40 border-t border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-semibold text-warm uppercase tracking-wide">Add your own find</span>
                <a
                  href={bkDates(region === "Rome Final" ? "hotel Rome near Termini" : `hotel ${region} Italy`, d.ci, d.co)}
                  target="_blank" rel="noopener noreferrer"
                  className="text-[10px] px-3 py-1 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-80 transition-opacity inline-flex items-center gap-1"
                >
                  Search Booking.com <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  type="text" placeholder="Hotel name"
                  value={cust?.nm ?? ""}
                  onChange={e => onSetCustom(region, { nm: e.target.value })}
                  className="flex-1 min-w-[120px] text-[12px] px-2.5 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-muted-foreground">$NZD/n</span>
                  <input
                    type="number" placeholder="0"
                    value={cust?.nzd || ""}
                    onChange={e => onSetCustom(region, { nzd: parseInt(e.target.value) || 0 })}
                    className="w-20 text-[12px] px-2.5 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/40"
                  />
                </div>
              </div>

              {cust?.nm && (
                <div className="flex gap-2 mt-2">
                  {(["none", "selected", "booked"] as const).map(st => {
                    const cur = cust?.st ?? "none";
                    const on = cur === st;
                    const cols = {
                      none: "border-muted-foreground/40 text-muted-foreground",
                      selected: "border-gold text-brown",
                      booked: "border-primary text-primary",
                    };
                    return (
                      <button
                        key={st}
                        onClick={() => onSetCustom(region, { st })}
                        className={cn(
                          "inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-lg border transition-all",
                          on ? `${cols[st]} font-bold border-2 bg-primary/5` : "border-border text-muted-foreground hover:border-primary/30"
                        )}
                      >
                        {on && <CircleDot className="w-2.5 h-2.5" />}
                        {st === "none" ? "Not booked" : st === "selected" ? "Selected" : "Booked ✓"}
                      </button>
                    );
                  })}
                </div>
              )}

              {cust?.nzd && cust.nzd > 0 && (
                <div className={cn(
                  "inline-flex items-center gap-1 text-[11px] font-semibold mt-2",
                  cust.st === "booked" ? "text-primary" : cust.st === "selected" ? "text-brown" : "text-muted-foreground"
                )}>
                  {cust.st === "booked" && <Check className="w-3 h-3" />}
                  {cust.nm || "Your hotel"}: ${cust.nzd}/n × {d.n}n = ${(cust.nzd * d.n).toLocaleString()} NZD
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

```


## `src/components/trip/BudgetView.tsx`

```tsx
import { Day, HOTELS, ActivityType } from "@/data/tripData";
import { cn } from "@/lib/utils";
import { Plane, Hotel, Train, Ticket, Utensils, Sparkles, Check, Circle, AlertCircle } from "lucide-react";

interface CustomHotel {
  nm: string;
  nzd: number;
  st?: "none" | "selected" | "booked";
}

interface Props {
  days: Day[];
  pax: number;
  setPax: (n: number) => void;
  customHotels: Record<string, CustomHotel>;
  selectedNzd: Record<string, number>;
  alreadyBooked: Record<string, boolean>;
  flightPerPax: number;
  customActs: Record<string, { c: number; tp: ActivityType }[]>;
}

export function BudgetView({ days, pax, setPax, customHotels, selectedNzd, alreadyBooked, flightPerPax, customActs }: Props) {
  const FLIGHT_TOTAL = flightPerPax * pax;
  const hotelEntries = Object.entries(HOTELS);

  const byCat: Record<string, number> = { ticket: 0, food: 0, experience: 0, transport: 0, free: 0 };
  days.forEach(d => d.sg.forEach(sg => { byCat[sg.tp] = (byCat[sg.tp] ?? 0) + sg.c; }));
  Object.values(customActs).forEach(arr => arr.forEach(ca => { byCat.experience = (byCat.experience ?? 0) + ca.c; }));

  const accomNzd = hotelEntries.reduce((s, [r, d]) => {
    const cNzd = customHotels[r]?.nzd ?? 0;
    const sNzd = selectedNzd[r] ?? 0;
    return s + Math.max(cNzd, sNzd) * d.n;
  }, 0);

  const actTotal = days.reduce((s, d) => s + d.sg.reduce((s2, a) => s2 + a.c, 0), 0);
  const grand = accomNzd > 0 ? FLIGHT_TOTAL + accomNzd + Math.round(actTotal * 1.85) : 0;

  const hBooked = hotelEntries.filter(([r, d]) => {
    const c = customHotels[r];
    return alreadyBooked[r] || d.st === "confirmed" || c?.st === "booked";
  }).length;
  const hSelected = hotelEntries.filter(([r]) => customHotels[r]?.st === "selected").length;

  const LINE = [
    { label: "Flights",               icon: <Plane className="w-3.5 h-3.5" />,   col: "bg-primary",      eur: null,             nzd: FLIGHT_TOTAL,                      detail: `${pax} pax × $${flightPerPax.toLocaleString()}` },
    { label: "Accommodation",         icon: <Hotel className="w-3.5 h-3.5" />,   col: "bg-gold",         eur: null,             nzd: accomNzd,                          detail: `${hBooked} booked, ${hSelected} selected, ${hotelEntries.length - hBooked - hSelected} pending · 16 nights` },
    { label: "Transport",             icon: <Train className="w-3.5 h-3.5" />,   col: "bg-brown",        eur: byCat.transport,  nzd: Math.round(byCat.transport * 1.85), detail: "Ferries, trains, cable cars" },
    { label: "Tickets & Attractions", icon: <Ticket className="w-3.5 h-3.5" />,  col: "bg-primary",      eur: byCat.ticket,     nzd: Math.round(byCat.ticket * 1.85),   detail: "Museums, galleries, monuments" },
    { label: "Food & Drink",          icon: <Utensils className="w-3.5 h-3.5" />,col: "bg-brown-light",  eur: byCat.food,       nzd: Math.round(byCat.food * 1.85),     detail: "Planned dining — budget €40–80/day on top" },
    { label: "Experiences",           icon: <Sparkles className="w-3.5 h-3.5" />,col: "bg-gold",         eur: byCat.experience, nzd: Math.round(byCat.experience * 1.85), detail: "Cooking classes, wine tours, boat trips" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl italic font-light text-primary font-serif">Cost Tracker</h2>

      {/* pax selector */}
      <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 flex-wrap shadow-sm">
        <span className="text-sm font-semibold text-warm">Travelers:</span>
        {[1, 2, 3, 4].map(n => (
          <button key={n} onClick={() => setPax(n)}
            className={cn("w-8 h-8 rounded-full border-2 text-sm font-bold transition-all",
              pax === n ? "bg-primary border-primary text-primary-foreground" : "border-border text-foreground hover:border-primary/40")}>
            {n}
          </button>
        ))}
        <span className="text-[11px] text-muted-foreground ml-1">× ${flightPerPax.toLocaleString()} = ${FLIGHT_TOTAL.toLocaleString()}</span>
      </div>

      {/* grand total */}
      <div className="bg-primary rounded-xl p-5 text-primary-foreground shadow-md">
        <div className="text-[10px] opacity-60 tracking-widest uppercase mb-1 font-sans">Grand Total (NZD)</div>
        <div className="text-4xl font-bold text-gold font-serif">
          {grand > 0 ? `$${grand.toLocaleString()}` : "Enter hotels to see total"}
        </div>
        {grand > 0 && <div className="text-[10px] opacity-50 mt-1">Flights + Accommodation + Activities (×1.85 NZD/EUR est.)</div>}
      </div>

      {/* breakdown */}
      <div>
        <div className="text-sm font-semibold text-warm mb-2">Breakdown</div>
        <div className="space-y-2">
          {LINE.map((cat, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-3 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0", cat.col)}>
                    {cat.icon}
                  </span>
                  <div>
                    <div className="text-[13px] font-semibold">{cat.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{cat.detail}</div>
                  </div>
                </div>
                <div className="text-right">
                  {cat.eur !== null && <div className="text-[10px] text-muted-foreground">€{cat.eur}</div>}
                  <div className="text-base font-bold">{cat.nzd > 0 ? `$${cat.nzd.toLocaleString()}` : "—"}</div>
                  <div className="text-[9px] text-muted-foreground">NZD</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* daily tip */}
      <div className="bg-cream rounded-xl border border-border p-4">
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">Daily Budget Tip</div>
        <p className="text-[12px] text-warm leading-relaxed">
          The food & drink above only counts planned activities. Budget an extra <strong>€40–80/day</strong> for meals not listed
          (about <strong>$1,200–2,400 NZD</strong> for the trip).
          A coffee is €1.50, lunch €12–20, dinner €25–45 per person.
        </p>
      </div>

      {/* accommodation by stop */}
      <div>
        <div className="text-sm font-semibold text-warm mb-2">Accommodation by Stop</div>
        <div className="space-y-1.5">
          {hotelEntries.map(([r, d], i) => {
            const ch = customHotels[r]?.nzd ? customHotels[r] : null;
            const sn = selectedNzd[r] ?? 0;
            const pn = ch ? ch.nzd : sn;
            const tt = pn * d.n;
            const isBooked = alreadyBooked[r] || d.st === "confirmed" || ch?.st === "booked";
            const isSel = ch?.st === "selected";
            const bdrCol = isBooked ? "border-primary" : isSel ? "border-gold" : "border-burg-light";
            const stCol = isBooked ? "text-primary" : isSel ? "text-brown" : "text-burg-light";
            const StIcon = isBooked ? Check : isSel ? Circle : AlertCircle;
            const stLbl = isBooked ? "Booked" : isSel ? "Selected" : "Needed";
            return (
              <div key={i} className={cn("bg-card rounded-lg border-l-4 px-3 py-2.5 flex justify-between items-center text-[12px] shadow-sm", bdrCol)}>
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold">{r}</span>
                  <span className="text-[10px] text-muted-foreground">{d.n}n</span>
                  {ch?.nm && <span className={cn("text-[10px]", stCol)}>· {ch.nm}</span>}
                </div>
                <div className="flex items-center gap-1.5">
                  {pn > 0 && <span className="font-bold">${tt.toLocaleString()}</span>}
                  <span className={cn("inline-flex items-center gap-0.5 text-[10px]", stCol)}>
                    <StIcon className="w-3 h-3" />{stLbl}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

```


## `src/components/trip/ExpenseView.tsx`

```tsx
import { useState } from "react";
import { Plus, Trash2, Plane, Hotel, Train, Ticket, Utensils, ShoppingBag, CircleHelp, TrendingUp, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type ExpenseCategory = "accommodation" | "transport" | "food" | "activities" | "shopping" | "other";
export type Expense = {
  id: string;
  amount_eur: number;
  category: ExpenseCategory;
  paid_by: "k" | "a";
  description: string;
  expense_date: string;
  created_by: string;
};

const EUR_TO_NZD = 1.85;

const CAT_CONFIG: Record<ExpenseCategory, { label: string; icon: React.ReactNode; col: string; bg: string }> = {
  accommodation: { label: "Accommodation", icon: <Hotel className="w-3.5 h-3.5" />,   col: "text-primary",     bg: "bg-primary" },
  transport:     { label: "Transport",      icon: <Train className="w-3.5 h-3.5" />,   col: "text-brown",       bg: "bg-brown" },
  food:          { label: "Food & Drink",   icon: <Utensils className="w-3.5 h-3.5" />, col: "text-brown-light", bg: "bg-brown-light" },
  activities:    { label: "Activities",     icon: <Ticket className="w-3.5 h-3.5" />,  col: "text-primary",     bg: "bg-primary" },
  shopping:      { label: "Shopping",       icon: <ShoppingBag className="w-3.5 h-3.5" />, col: "text-gold",    bg: "bg-gold" },
  other:         { label: "Other",          icon: <CircleHelp className="w-3.5 h-3.5" />, col: "text-muted-foreground", bg: "bg-muted" },
};

interface Props {
  expenses: Expense[];
  onAdd: (e: Omit<Expense, "id" | "created_by">) => void;
  onDelete: (id: string) => void;
  currentUserRole: "k" | "a";
}

export function ExpenseView({ expenses, onAdd, onDelete, currentUserRole }: Props) {
  const [form, setForm] = useState({
    description: "",
    amount_eur: "",
    category: "food" as ExpenseCategory,
    paid_by: currentUserRole,
    expense_date: new Date().toISOString().slice(0, 10),
  });
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = () => {
    const amt = parseFloat(form.amount_eur);
    if (!form.description.trim() || isNaN(amt) || amt <= 0) return;
    onAdd({
      description: form.description.trim(),
      amount_eur: amt,
      category: form.category,
      paid_by: form.paid_by as "k" | "a",
      expense_date: form.expense_date,
    });
    setForm(f => ({ ...f, description: "", amount_eur: "" }));
    setShowForm(false);
  };

  // Totals
  const kTotal = expenses.filter(e => e.paid_by === "k").reduce((s, e) => s + e.amount_eur, 0);
  const aTotal = expenses.filter(e => e.paid_by === "a").reduce((s, e) => s + e.amount_eur, 0);
  const grandEur = kTotal + aTotal;
  const grandNzd = grandEur * EUR_TO_NZD;
  const eachShare = grandEur / 2;
  const kOwes = aTotal > eachShare ? aTotal - eachShare : 0;
  const aOwes = kTotal > eachShare ? kTotal - eachShare : 0;

  // By category
  const byCat = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount_eur;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl italic font-light text-primary font-serif">Expenses</h2>
        <button
          onClick={() => setShowForm(v => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold transition-all active:scale-95 hover:bg-primary/90"
        >
          <Plus className="w-3 h-3" /> Add Expense
        </button>
      </div>

      {/* Add expense form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-3 shadow-sm">
          <div className="text-[11px] font-semibold text-warm uppercase tracking-widest">New Expense</div>
          <input
            type="text"
            placeholder="Description (e.g. Uffizi tickets)"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-[13px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[13px]">€</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount_eur}
                onChange={e => setForm(f => ({ ...f, amount_eur: e.target.value }))}
                className="w-full rounded-lg border border-input bg-background pl-7 pr-3 py-2 text-[13px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <input
              type="date"
              value={form.expense_date}
              onChange={e => setForm(f => ({ ...f, expense_date: e.target.value }))}
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))}
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {Object.entries(CAT_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <div className="flex gap-1.5 items-center">
              {(["k", "a"] as const).map(who => (
                <button
                  key={who}
                  onClick={() => setForm(f => ({ ...f, paid_by: who }))}
                  className={cn(
                    "w-9 h-9 rounded-full text-[11px] font-bold border-2 transition-all",
                    form.paid_by === who ? "bg-primary border-primary text-primary-foreground" : "border-border text-foreground"
                  )}
                >
                  {who === "k" ? "K" : "A"}
                </button>
              ))}
              <span className="text-[10px] text-muted-foreground ml-0.5">paid</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 rounded-lg bg-primary text-primary-foreground py-2 text-[13px] font-semibold hover:bg-primary/90 transition-colors active:scale-95"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 rounded-lg border border-border text-[13px] text-muted-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Grand total */}
      <div className="bg-primary rounded-xl p-5 text-primary-foreground shadow-md">
        <div className="text-[10px] opacity-60 tracking-widest uppercase mb-1">Total Spent</div>
        <div className="text-4xl font-bold text-gold font-serif">€{grandEur.toFixed(2)}</div>
        <div className="text-[11px] opacity-60 mt-1">≈ ${grandNzd.toFixed(0)} NZD at ×{EUR_TO_NZD}</div>
      </div>

      {/* Settle-up */}
      {grandEur > 0 && (
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-warm uppercase tracking-widest">
            <ArrowLeftRight className="w-3.5 h-3.5" /> Settle Up
          </div>
          <div className="flex gap-3">
            <div className="flex-1 bg-secondary rounded-lg p-3 text-center">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center mx-auto mb-1.5">K</div>
              <div className="text-base font-bold">€{kTotal.toFixed(2)}</div>
              <div className="text-[10px] text-muted-foreground">Kate paid</div>
            </div>
            <div className="flex-1 bg-secondary rounded-lg p-3 text-center">
              <div className="w-8 h-8 rounded-full bg-gold text-white text-[11px] font-bold flex items-center justify-center mx-auto mb-1.5">A</div>
              <div className="text-base font-bold">€{aTotal.toFixed(2)}</div>
              <div className="text-[10px] text-muted-foreground">Adrian paid</div>
            </div>
          </div>
          <div className={cn(
            "rounded-lg p-3 text-center text-[13px] font-semibold",
            (kOwes > 0 || aOwes > 0) ? "bg-gold/15 border border-gold/30 text-brown" : "bg-secondary text-muted-foreground"
          )}>
            {kOwes > 0.01
              ? `Kate owes Adrian €${kOwes.toFixed(2)} (≈$${(kOwes * EUR_TO_NZD).toFixed(0)} NZD)`
              : aOwes > 0.01
              ? `Adrian owes Kate €${aOwes.toFixed(2)} (≈$${(aOwes * EUR_TO_NZD).toFixed(0)} NZD)`
              : "All square! 🎉"}
          </div>
        </div>
      )}

      {/* By category breakdown */}
      {Object.keys(byCat).length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-warm uppercase tracking-widest mb-2">
            <TrendingUp className="w-3.5 h-3.5" /> By Category
          </div>
          <div className="space-y-1.5">
            {Object.entries(byCat)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, eur]) => {
                const cfg = CAT_CONFIG[cat as ExpenseCategory];
                const pct = grandEur > 0 ? Math.round((eur / grandEur) * 100) : 0;
                return (
                  <div key={cat} className="bg-card border border-border rounded-lg px-3 py-2 flex items-center gap-3 shadow-sm">
                    <span className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0", cfg.bg)}>
                      {cfg.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-[12px] font-medium mb-0.5">
                        <span>{cfg.label}</span>
                        <span className="font-bold">€{eur.toFixed(2)}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", cfg.bg)} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground shrink-0 w-8 text-right">{pct}%</div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Expense list */}
      <div>
        <div className="text-[11px] font-semibold text-warm uppercase tracking-widest mb-2">All Expenses</div>
        {expenses.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Plane className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-[13px] text-muted-foreground">No expenses logged yet.</p>
            <p className="text-[11px] text-muted-foreground mt-1">Add your first expense above.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {[...expenses]
              .sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime())
              .map(exp => {
                const cfg = CAT_CONFIG[exp.category];
                const nzd = exp.amount_eur * EUR_TO_NZD;
                return (
                  <div key={exp.id} className="bg-card border border-border rounded-lg px-3 py-2.5 flex items-center gap-3 shadow-sm group">
                    <span className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0", cfg.bg)}>
                      {cfg.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium truncate">{exp.description}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(exp.expense_date).toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}
                        {" · "}{cfg.label}
                        {" · "}<span className={cn("font-semibold", exp.paid_by === "k" ? "text-primary" : "text-gold")}>{exp.paid_by === "k" ? "Kate" : "Adrian"} paid</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] font-bold">€{exp.amount_eur.toFixed(2)}</div>
                      <div className="text-[10px] text-muted-foreground">${nzd.toFixed(0)} NZD</div>
                    </div>
                    <button
                      onClick={() => onDelete(exp.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-destructive/10 text-destructive ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

```


## `src/components/trip/FoodView.tsx`

```tsx
import { FOOD, PHRASES } from "@/data/tripData";
import { cn } from "@/lib/utils";
import { Utensils, BookOpen } from "lucide-react";

const KIND_STYLE: Record<string, string> = {
  S:   "bg-primary/10 text-primary border-primary/30",
  M:   "bg-brown/10 text-brown border-brown/30",
  St:  "bg-gold/10 text-brown border-gold/30",
  Tip: "bg-gold/15 text-brown border-gold/40",
};
const KIND_LABEL: Record<string, string> = {
  S: "Speciality", M: "Main", St: "Street food", Tip: "Tip",
};

const REGIONS = ["Milan", "Lake Garda", "Florence", "Tuscany", "Rome", "Sorrento"];

export function FoodView() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl italic font-light text-primary font-serif">Food & Culture</h2>

      {REGIONS.map(region => {
        const items = FOOD[region];
        if (!items) return null;
        return (
          <div key={region} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-secondary/40 border-b border-border flex items-center gap-2">
              <Utensils className="w-3.5 h-3.5 text-gold shrink-0" />
              <span className="text-[13px] font-semibold text-warm">{region}</span>
            </div>
            <div className="divide-y divide-border">
              {items.map((item, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-3">
                  <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-semibold flex-shrink-0 mt-0.5", KIND_STYLE[item.kind])}>
                    {KIND_LABEL[item.kind] ?? item.kind}
                  </span>
                  <div>
                    <div className="text-[13px] font-semibold">{item.dish}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{item.tip}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Italian phrases */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-secondary/40 border-b border-border flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-gold shrink-0" />
          <span className="text-[13px] font-semibold text-warm">Essential Phrases</span>
        </div>
        <div className="divide-y divide-border">
          {PHRASES.map((p, i) => (
            <div key={i} className="px-4 py-2.5 flex justify-between items-start gap-4">
              <div className="text-[13px] font-semibold italic text-primary font-serif">{p.it}</div>
              <div className="text-[11px] text-muted-foreground text-right flex-shrink-0">{p.en}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

```


## `src/components/trip/MapView.tsx`

```tsx
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Day, HOTELS, HotelEntry, ActivityType } from "@/data/tripData";
import { cn } from "@/lib/utils";
import {
  X, CalendarDays, BedDouble, MapPin, Zap, ChevronRight,
  ChevronLeft, Globe, List, Layers,
} from "lucide-react";

// ── Region stop definitions ─────────────────────────────────────────
export interface MapStop {
  id: string;
  label: string;
  emoji: string;
  latlng: [number, number];
  dates: string;
  nights: number;
  color: string;
  hslVar: string;
}

export const MAP_STOPS: MapStop[] = [
  { id: "Milan",      label: "Milan",      emoji: "I",   latlng: [45.4654,  9.1860], dates: "25–28 May",    nights: 3, color: "#6B3520", hslVar: "terra"   },
  { id: "Lake Garda", label: "Lake Garda", emoji: "II",  latlng: [45.6389, 10.6780], dates: "28–30 May",    nights: 2, color: "#5C1A2A", hslVar: "primary" },
  { id: "Florence",   label: "Florence",   emoji: "III", latlng: [43.7696, 11.2558], dates: "30 May–1 Jun",  nights: 2, color: "#7A2535", hslVar: "primary" },
  { id: "Tuscany",    label: "Tuscany",    emoji: "IV",  latlng: [43.3187, 11.3307], dates: "1–3 Jun",      nights: 2, color: "#8B5A3A", hslVar: "terra"   },
  { id: "Rome",       label: "Rome",       emoji: "V",   latlng: [41.9028, 12.4964], dates: "3–5 Jun",      nights: 2, color: "#5C1A2A", hslVar: "primary" },
  { id: "Sorrento",   label: "Sorrento",   emoji: "VI",  latlng: [40.6263, 14.3752], dates: "5–9 Jun",      nights: 4, color: "#7A3A1A", hslVar: "terra"   },
  { id: "Rome Final", label: "Rome (fly)", emoji: "VII", latlng: [41.9328, 12.5164], dates: "9–10 Jun",     nights: 1, color: "#4A3028", hslVar: "brown"   },
];

const ROUTE_COORDS: [number, number][] = MAP_STOPS.map(s => s.latlng);

// ── Activity coordinates (hardcoded per known landmark) ─────────────
const ACTIVITY_COORDS: Record<string, [number, number]> = {
  // Milan
  "Navigli District":               [45.4494,  9.1785],
  "Duomo Rooftop Terraces":         [45.4641,  9.1919],
  "Aperitivo Galleria V. Emanuele": [45.4657,  9.1895],
  "The Last Supper":                [45.4660,  9.1706],
  "Sforza Castle & Brera":          [45.4706,  9.1796],
  "Pasta Cooking Class":            [45.4654,  9.1860],
  "La Scala Museum":                [45.4676,  9.1893],
  "Ferry Como→Bellagio→Varenna":   [45.8085,  9.0852],
  "Villa del Balbianello":          [45.9597,  9.1462],
  "Lunch in Bellagio":              [45.9847,  9.2613],
  "Como-Brunate Funicular":         [45.8110,  9.0848],
  // Lake Garda
  "Sirmione stop en route":         [45.4949, 10.6062],
  "Explore Garda lakefront":        [45.5773, 10.6980],
  "Bardolino wine dinner":          [45.5497, 10.7247],
  "Punta San Vigilio beach":        [45.5942, 10.7257],
  "Monte Baldo Cable Car":          [45.7360, 10.8430],
  "Ferry to Limone":                [45.8115, 10.7930],
  "Verona day trip (45min)":        [45.4384, 10.9916],
  // Florence
  "Piazzale Michelangelo sunset":   [43.7631, 11.2658],
  "Ponte Vecchio & Oltrarno":       [43.7681, 11.2531],
  "Bistecca alla Fiorentina":       [43.7696, 11.2558],
  "Accademia (David)":              [43.7767, 11.2587],
  "Uffizi Gallery":                 [43.7678, 11.2553],
  "Giotto's Bell Tower":            [43.7733, 11.2560],
  "San Lorenzo Market":             [43.7751, 11.2543],
  // Tuscany
  "Chianti wine tour":              [43.5557, 11.2628],
  "San Gimignano towers":           [43.4676, 11.0437],
  "Siena Piazza del Campo":         [43.3186, 11.3307],
  "Val d'Orcia drive":              [43.0860, 11.6305],
  "Montepulciano wine":             [43.0985, 11.7831],
  "Pienza cheese":                  [43.0752, 11.6806],
  "Truffle hunting":                [43.3187, 11.4000],
  // Rome
  "Orvieto stop en route":          [42.7189, 12.1082],
  "Trastevere evening":             [41.8896, 12.4698],
  "Trevi Fountain (after 9pm)":     [41.9009, 12.4833],
  "Trastevere dinner":              [41.8896, 12.4698],
  "Colosseum + Forum":              [41.8902, 12.4922],
  "Vatican & Sistine":              [41.9029, 12.4534],
  "Pantheon":                       [41.8986, 12.4769],
  "Gelato Giolitti":                [41.8993, 12.4757],
  "Spanish Steps":                  [41.9059, 12.4823],
  "Final Piazza Navona aperitivo":  [41.8990, 12.4730],
  // Sorrento / Amalfi
  "Pompeii":                        [40.7508, 14.4890],
  "Guided Pompeii tour":            [40.7508, 14.4890],
  "Sorrento passeggiata":           [40.6263, 14.3752],
  "Ferry Sorrento→Amalfi":         [40.6342, 14.5995],
  "Amalfi Cathedral":               [40.6342, 14.5996],
  "Seafood lunch, sea view":        [40.6342, 14.5998],
  "Path of the Gods":               [40.6631, 14.5003],
  "Spiaggia Grande":                [40.6275, 14.4840],
  "Coast boat tour":                [40.6275, 14.4841],
  "Ferry Capri (7:25am!)":          [40.5534, 14.2429],
  "Blue Grotto":                    [40.5534, 14.1778],
  "Chairlift Monte Solaro":         [40.5620, 14.2222],
  "Lunch Piazzetta":                [40.5501, 14.2424],
  // Departure
  "Roscioli Caffè":                 [41.8975, 12.4718],
};

// ── Pin colours per activity type ───────────────────────────────────
const TYPE_CONFIG: Record<ActivityType, { color: string; label: string; dot: string }> = {
  ticket:     { color: "#5C1A2A", label: "Ticket",     dot: "bg-primary"   },
  experience: { color: "#C4956A", label: "Experience",  dot: "bg-gold"      },
  food:       { color: "#8B5A3A", label: "Food",        dot: "bg-terra"     },
  transport:  { color: "#7A7060", label: "Transport",   dot: "bg-brown"     },
  free:       { color: "#4A7A5A", label: "Free",        dot: "bg-muted-foreground" },
};

// ── Props ────────────────────────────────────────────────────────────
interface Props {
  days: Day[];
  alreadyBooked: Record<string, boolean>;
  customHotels: Record<string, { nm: string; nzd: number; st?: string }>;
  onNavigate: (view: "timeline" | "hotels") => void;
}

type MapMode = "trip" | "day";

// ── Small circle icon for activity pins ─────────────────────────────
function buildActivityIcon(type: ActivityType, booked: boolean) {
  const cfg = TYPE_CONFIG[type];
  const bg  = booked ? "#5C1A2A" : cfg.color;
  const sz  = 22;
  return L.divIcon({
    html: `<div style="
      width:${sz}px;height:${sz}px;border-radius:50%;
      background:${bg};border:2px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,.35);
      display:flex;align-items:center;justify-content:center;
    "></div>`,
    className: "",
    iconSize: [sz, sz],
    iconAnchor: [sz / 2, sz / 2],
  });
}

function buildRegionIcon(stop: MapStop, active: boolean) {
  const size = active ? 46 : 36;
  const ring = active ? `box-shadow:0 0 0 3px white,0 0 0 5px ${stop.color};` : "";
  const svg = `<svg width="${size}" height="${Math.round(size*1.3)}" viewBox="0 0 36 47" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 1C9.163 1 2 8.163 2 17c0 10.5 16 29 16 29S34 27.5 34 17C34 8.163 26.837 1 18 1z"
      fill="${stop.color}" stroke="white" stroke-width="2"/>
    <text x="18" y="21" text-anchor="middle" dominant-baseline="middle"
      font-family="'DM Sans',sans-serif" font-size="${active ? 9 : 8}" font-weight="600"
      fill="white" letter-spacing="0.5">${stop.emoji}</text>
  </svg>`;
  return L.divIcon({
    html: `<div style="${ring}transition:all .2s;">${svg}</div>`,
    className: "",
    iconSize: [size, Math.round(size * 1.3)],
    iconAnchor: [size / 2, Math.round(size * 1.3)],
  });
}

// ── Component ────────────────────────────────────────────────────────
export function MapView({ days, alreadyBooked, customHotels, onNavigate }: Props) {
  const mapRef     = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const regionMarkersRef  = useRef<L.Marker[]>([]);
  const activityLayerRef  = useRef<L.LayerGroup | null>(null);
  const routeLayerRef     = useRef<L.Polyline | null>(null);

  const [mode,       setMode]       = useState<MapMode>("trip");
  const [activeStop, setActiveStop] = useState<MapStop | null>(null);
  const [dayIndex,   setDayIndex]   = useState(0);
  const [activeAct,  setActiveAct]  = useState<{ nm: string; tp: ActivityType; c: number; bk: boolean; nt?: string; lnk?: string } | null>(null);

  // ── Init map ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: [43.5, 12.2], zoom: 6,
      zoomControl: false, attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap © CARTO",
      subdomains: "abcd", maxZoom: 19,
    }).addTo(map);

    L.control.attribution({ position: "bottomleft", prefix: false }).addTo(map);
    L.control.zoom({ position: "topright" }).addTo(map);

    // Region markers (always present)
    MAP_STOPS.forEach((stop, i) => {
      const marker = L.marker(stop.latlng, { icon: buildRegionIcon(stop, false) })
        .addTo(map)
        .on("click", () => {
          setMode("trip");
          setActiveAct(null);
          setActiveStop(s => s?.id === stop.id ? null : stop);
        });
      regionMarkersRef.current[i] = marker;
    });

    // Route polyline (trip mode)
    routeLayerRef.current = L.polyline(ROUTE_COORDS, {
      color: "#5C1A2A", weight: 2.5, opacity: 0.5, dashArray: "6 8",
    }).addTo(map);

    activityLayerRef.current = L.layerGroup().addTo(map);

    leafletMap.current = map;
    return () => { map.remove(); leafletMap.current = null; };
  }, []);

  // ── Update region marker icons on active change ───────────────────
  useEffect(() => {
    MAP_STOPS.forEach((stop, i) => {
      const m = regionMarkersRef.current[i];
      if (m) m.setIcon(buildRegionIcon(stop, activeStop?.id === stop.id));
    });
  }, [activeStop]);

  // ── Fly to stop in trip mode ──────────────────────────────────────
  useEffect(() => {
    if (!leafletMap.current) return;
    if (mode === "trip") {
      if (activeStop) {
        leafletMap.current.flyTo(activeStop.latlng, 9, { duration: 0.9 });
      } else {
        leafletMap.current.flyTo([43.5, 12.2], 6, { duration: 0.8 });
      }
    }
  }, [activeStop, mode]);

  // ── Day mode: render activity pins + intra-day route ─────────────
  useEffect(() => {
    if (!leafletMap.current || !activityLayerRef.current) return;
    const layer = activityLayerRef.current;
    layer.clearLayers();
    if (routeLayerRef.current) {
      routeLayerRef.current.setStyle({ opacity: mode === "trip" ? 0.5 : 0.12 });
    }

    if (mode !== "day") return;

    const day = days[dayIndex];
    if (!day) return;

    const pts: [number, number][] = [];

    day.sg.forEach(act => {
      const coords = ACTIVITY_COORDS[act.nm];
      if (!coords) return;
      pts.push(coords);
      L.marker(coords, { icon: buildActivityIcon(act.tp, act.bk) })
        .addTo(layer)
        .on("click", () => setActiveAct(a => a?.nm === act.nm ? null : act));
    });

    // Intra-day route line
    if (pts.length > 1) {
      L.polyline(pts, { color: "#5C1A2A", weight: 2, opacity: 0.7, dashArray: "4 6" }).addTo(layer);
    }

    // Fly to day's region
    const stop = MAP_STOPS.find(s => s.id === day.rg || (day.rg === "Departure" && s.id === "Rome Final"));
    if (stop) {
      leafletMap.current.flyTo(
        pts.length > 0 ? centroid(pts) : stop.latlng,
        pts.length > 0 ? 12 : 9,
        { duration: 0.9 }
      );
    }
  }, [mode, dayIndex, days]);

  function centroid(pts: [number, number][]): [number, number] {
    const lat = pts.reduce((s, p) => s + p[0], 0) / pts.length;
    const lng = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    return [lat, lng];
  }

  // ── Trip-mode stop data ───────────────────────────────────────────
  function stopData(stop: MapStop) {
    const hotel = HOTELS[stop.id] as HotelEntry | undefined;
    const booked = alreadyBooked[stop.id] || hotel?.st === "confirmed" || customHotels[stop.id]?.st === "booked";
    const selected = customHotels[stop.id]?.st === "selected";
    const customNm = customHotels[stop.id]?.nm;
    const hotelName = booked && customNm && customNm !== "Crowne Plaza" ? customNm : hotel?.cf ?? (booked ? "Booked" : null);
    const stopDays = days.filter(d => d.rg === stop.id || (stop.id === "Rome Final" && d.rg === "Departure"));
    const totalActs  = stopDays.reduce((s, d) => s + d.sg.length, 0);
    const bookedActs = stopDays.reduce((s, d) => s + d.sg.filter(a => a.bk).length, 0);
    const urgentActs = stopDays.reduce((s, d) => s + d.sg.filter(a => a.nt?.includes("⚠") && !a.bk).length, 0);
    const highlights = stopDays.flatMap(d => d.sg.filter(a => a.tp === "experience" || a.tp === "ticket")).slice(0, 3);
    return { booked, selected, hotelName, totalActs, bookedActs, urgentActs, highlights };
  }

  const currentDay = days[dayIndex];
  const dayPins = currentDay ? currentDay.sg.filter(a => ACTIVITY_COORDS[a.nm]) : [];

  return (
    <div className="relative" style={{ height: "calc(100vh - 160px)", minHeight: 480 }}>
      {/* Map canvas */}
      <div ref={mapRef} className="absolute inset-0 rounded-xl overflow-hidden z-0" />

      {/* ── Mode toggle ── */}
      <div className="absolute top-3 left-3 z-[999] flex rounded-lg border border-border overflow-hidden shadow-md">
        <button
          onClick={() => { setMode("trip"); setActiveAct(null); }}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold transition-colors",
            mode === "trip" ? "bg-primary text-primary-foreground" : "bg-card/95 text-muted-foreground hover:bg-secondary"
          )}
        >
          <Globe className="w-3 h-3" /> Trip
        </button>
        <button
          onClick={() => { setMode("day"); setActiveStop(null); setActiveAct(null); }}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold transition-colors",
            mode === "day" ? "bg-primary text-primary-foreground" : "bg-card/95 text-muted-foreground hover:bg-secondary"
          )}
        >
          <Layers className="w-3 h-3" /> Day
        </button>
      </div>

      {/* ── TRIP MODE: stop list strip ── */}
      {mode === "trip" && !activeStop && (
        <div className="absolute bottom-3 left-3 right-3 z-[999]">
          <div className="bg-card/95 backdrop-blur rounded-xl border border-border shadow-lg p-3">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-2 px-1">Tap a pin or stop</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {MAP_STOPS.map((stop, i) => {
                const d = stopData(stop);
                return (
                  <button key={stop.id} onClick={() => setActiveStop(stop)}
                    className="flex flex-col items-center gap-1 min-w-[58px] px-2 py-2 rounded-lg border border-border hover:bg-secondary transition-colors active:scale-95 shrink-0"
                  >
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                      style={{ background: stop.color }}>{i + 1}</span>
                    <span className="text-[9px] font-medium text-foreground leading-tight text-center">{stop.label}</span>
                    <span className={cn(
                      "text-[8px] font-bold rounded-full px-1.5 py-0.5",
                      d.booked ? "bg-primary/12 text-primary" : "bg-gold/15 text-brown"
                    )}>{d.booked ? "✓" : "needed"}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TRIP MODE: stop detail panel ── */}
      {mode === "trip" && activeStop && (() => {
        const active = stopData(activeStop);
        return (
          <div className="absolute bottom-3 left-3 right-3 z-[999]">
            <div className="bg-card/97 backdrop-blur rounded-xl border border-border shadow-xl overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3"
                style={{ background: activeStop.color + "22", borderBottom: `3px solid ${activeStop.color}` }}
              >
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                  style={{ background: activeStop.color }}>
                  {MAP_STOPS.findIndex(s => s.id === activeStop.id) + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-foreground">{activeStop.label}</div>
                  <div className="text-[10px] text-muted-foreground">{activeStop.dates} · {activeStop.nights} night{activeStop.nights !== 1 ? "s" : ""}</div>
                </div>
                <span className={cn(
                  "text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0",
                  active.booked ? "bg-primary/12 text-primary border-primary/25"
                    : active.selected ? "bg-gold/15 text-brown border-gold/35"
                    : "bg-primary/8 text-primary-light border-primary-light/30"
                )}>
                  {active.booked ? "Hotel ✓" : active.selected ? "Selected" : "Needs hotel"}
                </span>
                <button onClick={() => setActiveStop(null)} className="ml-1 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-4 py-3 space-y-3">
                <div className="flex gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-foreground">
                    <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{active.bookedActs}/{active.totalActs} activities booked</span>
                  </div>
                  {active.urgentActs > 0 && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: "hsl(var(--rose))" }}>
                      <Zap className="w-3 h-3" /> {active.urgentActs} urgent
                    </div>
                  )}
                  {active.hotelName && (
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground ml-auto">
                      <BedDouble className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[120px]">{active.hotelName}</span>
                    </div>
                  )}
                </div>
                {active.highlights.length > 0 && (
                  <div>
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-1.5">Highlights</p>
                    <div className="space-y-1">
                      {active.highlights.map((act, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-foreground">
                          <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span className={act.bk ? "line-through text-muted-foreground" : ""}>{act.nm}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  <button onClick={() => onNavigate("timeline")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-[11px] font-semibold text-foreground hover:bg-secondary transition-colors active:scale-95">
                    <CalendarDays className="w-3.5 h-3.5" /> View days <ChevronRight className="w-3 h-3 ml-auto" />
                  </button>
                  <button onClick={() => onNavigate("hotels")}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold hover:opacity-90 transition-opacity active:scale-95">
                    <BedDouble className="w-3.5 h-3.5" />
                    {active.booked ? "Hotel details" : "Book hotel"}
                    <ChevronRight className="w-3 h-3 ml-auto" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── DAY MODE: day selector ── */}
      {mode === "day" && (
        <div className="absolute bottom-3 left-3 right-3 z-[999] space-y-2">
          {/* Activity popup */}
          {activeAct && (
            <div className="bg-card/97 backdrop-blur rounded-xl border border-border shadow-xl px-4 py-3 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: TYPE_CONFIG[activeAct.tp].color }} />
                  <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">{TYPE_CONFIG[activeAct.tp].label}</span>
                  {activeAct.bk && <span className="text-[10px] text-primary font-bold ml-auto">✓ Booked</span>}
                  {activeAct.c > 0 && <span className="text-[11px] font-bold text-foreground">€{activeAct.c}</span>}
                </div>
                <div className="text-sm font-semibold text-foreground">{activeAct.nm}</div>
                {activeAct.nt && (
                  <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                    {activeAct.nt.replace("⚠ ", "").replace("⚠", "")}
                  </div>
                )}
                {activeAct.lnk && (
                  <a href={activeAct.lnk} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-primary font-semibold mt-1.5 hover:opacity-70 transition-opacity">
                    Book online <ChevronRight className="w-3 h-3" />
                  </a>
                )}
              </div>
              <button onClick={() => setActiveAct(null)} className="text-muted-foreground hover:text-foreground shrink-0 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Day nav + pin list */}
          <div className="bg-card/95 backdrop-blur rounded-xl border border-border shadow-lg p-3">
            {/* Day header with arrows */}
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => { setDayIndex(i => Math.max(0, i - 1)); setActiveAct(null); }}
                disabled={dayIndex === 0}
                className="p-1 rounded-md hover:bg-secondary disabled:opacity-30 transition-colors active:scale-90">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex-1 text-center">
                <div className="text-[12px] font-bold text-foreground">{currentDay?.dt} · {currentDay?.dy}</div>
                <div className="text-[10px] text-muted-foreground truncate">{currentDay?.act}</div>
              </div>
              <button onClick={() => { setDayIndex(i => Math.min(days.length - 1, i + 1)); setActiveAct(null); }}
                disabled={dayIndex === days.length - 1}
                className="p-1 rounded-md hover:bg-secondary disabled:opacity-30 transition-colors active:scale-90">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Pin legend + activity list */}
            {dayPins.length > 0 ? (
              <div className="space-y-1">
                {dayPins.map((act, i) => (
                  <button key={i} onClick={() => setActiveAct(a => a?.nm === act.nm ? null : act)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors active:scale-[0.98]",
                      activeAct?.nm === act.nm ? "bg-secondary border border-border" : "hover:bg-secondary/60"
                    )}
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: act.bk ? "#5C1A2A" : TYPE_CONFIG[act.tp].color }} />
                    <span className={cn("text-[11px] flex-1 leading-snug", act.bk && "line-through text-muted-foreground")}>
                      {act.nm}
                    </span>
                    {act.c > 0 && <span className="text-[10px] text-muted-foreground shrink-0">€{act.c}</span>}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-1 py-1">
                <List className="w-3.5 h-3.5 shrink-0" />
                <span>No mapped pins for this day yet</span>
              </div>
            )}

            {/* Type legend */}
            <div className="flex gap-3 mt-2 pt-2 border-t border-border flex-wrap">
              {(Object.entries(TYPE_CONFIG) as [ActivityType, typeof TYPE_CONFIG[ActivityType]][]).map(([tp, cfg]) => (
                <div key={tp} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                  <span className="text-[9px] text-muted-foreground">{cfg.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

```


## `src/components/trip/PackingView.tsx`

```tsx
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, Shirt, FileText, Sparkles, Laptop, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export interface PackingItem {
  id: string;
  nm: string;
  k: boolean; // Kate checked
  a: boolean; // Adrian checked
}

export interface PackingCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: PackingItem[];
}

export const DEFAULT_PACKING: PackingCategory[] = [
  {
    id: "clothes",
    label: "Clothes",
    icon: <Shirt className="w-4 h-4" />,
    items: [
      { id: "c1", nm: "Lightweight summer dresses / shirts", k: false, a: false },
      { id: "c2", nm: "Smart evening outfit (restaurants)", k: false, a: false },
      { id: "c3", nm: "Comfortable walking shoes", k: false, a: false },
      { id: "c4", nm: "Sandals for the coast", k: false, a: false },
      { id: "c5", nm: "Light cardigan / jacket (evenings)", k: false, a: false },
      { id: "c6", nm: "Swimwear × 2", k: false, a: false },
      { id: "c7", nm: "Scarf / wrap (churches require coverage)", k: false, a: false },
      { id: "c8", nm: "Underwear & socks × 7", k: false, a: false },
      { id: "c9", nm: "Sun hat / cap", k: false, a: false },
      { id: "c10", nm: "Rain jacket (just in case)", k: false, a: false },
      { id: "c11", nm: "Jeans or trousers × 2", k: false, a: false },
      { id: "c12", nm: "Hiking shoes (Path of the Gods)", k: false, a: false },
    ],
  },
  {
    id: "documents",
    label: "Documents",
    icon: <FileText className="w-4 h-4" />,
    items: [
      { id: "d1", nm: "Passports (check expiry!)", k: false, a: false },
      { id: "d2", nm: "Flight confirmations (NZ → Milan, Rome → NZ)", k: false, a: false },
      { id: "d3", nm: "Travel insurance policy", k: false, a: false },
      { id: "d4", nm: "Driving licence (international)", k: false, a: false },
      { id: "d5", nm: "Hotel bookings printed / saved offline", k: false, a: false },
      { id: "d6", nm: "Pre-booked tickets (Last Supper, Uffizi…)", k: false, a: false },
      { id: "d7", nm: "Credit / debit cards (notify bank!)", k: false, a: false },
      { id: "d8", nm: "Travel card / forex cash (€200–300)", k: false, a: false },
      { id: "d9", nm: "Emergency contacts list", k: false, a: false },
      { id: "d10", nm: "EHIC / health card", k: false, a: false },
    ],
  },
  {
    id: "toiletries",
    label: "Toiletries",
    icon: <Sparkles className="w-4 h-4" />,
    items: [
      { id: "t1", nm: "SPF 50 sunscreen (pack big!)", k: false, a: false },
      { id: "t2", nm: "After-sun lotion", k: false, a: false },
      { id: "t3", nm: "Insect repellent", k: false, a: false },
      { id: "t4", nm: "Shampoo & conditioner (travel size)", k: false, a: false },
      { id: "t5", nm: "Moisturiser", k: false, a: false },
      { id: "t6", nm: "Deodorant", k: false, a: false },
      { id: "t7", nm: "Toothbrush & toothpaste", k: false, a: false },
      { id: "t8", nm: "Razor / shaving kit", k: false, a: false },
      { id: "t9", nm: "Medications & prescriptions", k: false, a: false },
      { id: "t10", nm: "Blister plasters (essential!)", k: false, a: false },
      { id: "t11", nm: "Hand sanitiser", k: false, a: false },
      { id: "t12", nm: "Lip balm with SPF", k: false, a: false },
    ],
  },
  {
    id: "tech",
    label: "Tech",
    icon: <Laptop className="w-4 h-4" />,
    items: [
      { id: "tc1", nm: "Phones + chargers", k: false, a: false },
      { id: "tc2", nm: "International power adaptors (Italy = Type F)", k: false, a: false },
      { id: "tc3", nm: "Portable power bank", k: false, a: false },
      { id: "tc4", nm: "Camera + SD cards", k: false, a: false },
      { id: "tc5", nm: "Headphones / earbuds", k: false, a: false },
      { id: "tc6", nm: "Offline maps downloaded (Google / Maps.me)", k: false, a: false },
      { id: "tc7", nm: "Duolingo Italian practice done", k: false, a: false },
      { id: "tc8", nm: "Netflix / shows downloaded for flights", k: false, a: false },
    ],
  },
];

type CategoryState = Record<string, PackingItem[]>;

function categoryProgress(items: PackingItem[]) {
  const k = items.filter(i => i.k).length;
  const a = items.filter(i => i.a).length;
  const total = items.length;
  return { k, a, total };
}

interface Props {
  packing: CategoryState;
  onToggle: (catId: string, itemId: string, who: "k" | "a") => void;
  onAddItem: (catId: string, nm: string) => void;
  onRemoveItem: (catId: string, itemId: string) => void;
}

const CATEGORY_META = DEFAULT_PACKING.map(c => ({ id: c.id, label: c.label, icon: c.icon }));

const catColor: Record<string, string> = {
  clothes:    "text-primary",
  documents:  "text-gold",
  toiletries: "text-brown",
  tech:       "text-primary-light",
};
const catBorder: Record<string, string> = {
  clothes:    "border-l-primary",
  documents:  "border-l-gold",
  toiletries: "border-l-brown",
  tech:       "border-l-primary-light",
};
const catBg: Record<string, string> = {
  clothes:    "bg-primary/5",
  documents:  "bg-gold/8",
  toiletries: "bg-brown/5",
  tech:       "bg-primary/5",
};

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="h-1 rounded-full bg-border overflow-hidden flex-1">
      <div
        className={cn("h-full rounded-full transition-all duration-500", color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function PackingView({ packing, onToggle, onAddItem, onRemoveItem }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [adding, setAdding] = useState<Record<string, string>>({});

  const totalItems = DEFAULT_PACKING.reduce((s, c) => s + (packing[c.id]?.length ?? c.items.length), 0);
  const kDone = DEFAULT_PACKING.reduce((s, c) => s + (packing[c.id] ?? c.items).filter(i => i.k).length, 0);
  const aDone = DEFAULT_PACKING.reduce((s, c) => s + (packing[c.id] ?? c.items).filter(i => i.a).length, 0);

  return (
    <div className="space-y-4">
      {/* Header summary */}
      <div className="rounded-xl bg-primary text-primary-foreground px-5 py-4">
        <div className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Packing Progress</div>
        <div className="flex gap-6">
          <div>
            <span className="text-gold text-xl font-bold font-serif">{kDone}/{totalItems}</span>
            <span className="text-[11px] opacity-70 ml-1.5">Kate packed</span>
          </div>
          <div>
            <span className="text-gold text-xl font-bold font-serif">{aDone}/{totalItems}</span>
            <span className="text-[11px] opacity-70 ml-1.5">Adrian packed</span>
          </div>
        </div>
        <div className="flex gap-2 mt-3 items-center">
          <span className="text-[10px] opacity-50 w-8">K</span>
          <ProgressBar value={kDone} max={totalItems} color="bg-rose" />
        </div>
        <div className="flex gap-2 mt-1 items-center">
          <span className="text-[10px] opacity-50 w-8">A</span>
          <ProgressBar value={aDone} max={totalItems} color="bg-gold" />
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-3 text-[10px] text-warm px-1">
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded border-2 border-rose bg-rose/10 flex items-center justify-center text-rose"><Check className="w-2.5 h-2.5" /></span> Kate</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 rounded border-2 border-gold bg-gold/10 flex items-center justify-center text-gold"><Check className="w-2.5 h-2.5" /></span> Adrian</span>
        <span className="text-muted-foreground ml-auto italic">Tap to check off your items</span>
      </div>

      {/* Categories */}
      {DEFAULT_PACKING.map((cat) => {
        const items = packing[cat.id] ?? cat.items;
        const { k, a, total } = categoryProgress(items);
        const isCollapsed = collapsed[cat.id];
        const addVal = adding[cat.id] ?? "";
        const allKDone = k === total;
        const allADone = a === total;

        return (
          <div key={cat.id} className={cn("rounded-xl border bg-card overflow-hidden shadow-sm border-l-4", catBorder[cat.id])}>
            {/* Category header */}
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
              onClick={() => setCollapsed(p => ({ ...p, [cat.id]: !p[cat.id] }))}
            >
              <span className={cn("shrink-0", catColor[cat.id])}>{cat.icon}</span>
              <span className="font-semibold text-sm text-foreground flex-1">{cat.label}</span>
              <span className="text-[10px] text-muted-foreground mr-1">
                {allKDone && allADone ? "✓ All done!" : `${k}/${total} K · ${a}/${total} A`}
              </span>
              {isCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
            </button>

            {/* Mini progress */}
            <div className="px-4 pb-2 flex gap-1.5">
              <ProgressBar value={k} max={total} color="bg-rose" />
              <ProgressBar value={a} max={total} color="bg-gold" />
            </div>

            {/* Items */}
            {!isCollapsed && (
              <div className="px-2 pb-2">
                {items.map((item) => (
                  <div key={item.id} className={cn(
                    "flex items-center gap-2 rounded-lg px-2 py-2.5 group",
                    item.k && item.a ? "opacity-50" : ""
                  )}>
                    {/* Kate button */}
                    <button
                      onClick={() => onToggle(cat.id, item.id, "k")}
                      className={cn(
                        "w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 transition-all active:scale-95",
                        item.k
                          ? "border-rose bg-rose/15 text-rose"
                          : "border-border text-transparent hover:border-rose/50"
                      )}
                    >
                      <Check className="w-3 h-3" />
                    </button>

                    {/* Item name */}
                    <span className={cn(
                      "flex-1 text-[12px] leading-snug",
                      item.k && item.a ? "line-through text-muted-foreground" : "text-foreground"
                    )}>
                      {item.nm}
                    </span>

                    {/* Adrian button */}
                    <button
                      onClick={() => onToggle(cat.id, item.id, "a")}
                      className={cn(
                        "w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 transition-all active:scale-95",
                        item.a
                          ? "border-gold bg-gold/15 text-gold"
                          : "border-border text-transparent hover:border-gold/50"
                      )}
                    >
                      <Check className="w-3 h-3" />
                    </button>

                    {/* Remove custom items */}
                    <button
                      onClick={() => onRemoveItem(cat.id, item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-rose"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Add item row */}
                <div className={cn("flex gap-2 mt-1 px-2 rounded-lg", catBg[cat.id], "p-2")}>
                  <input
                    type="text"
                    placeholder="Add an item…"
                    value={addVal}
                    onChange={e => setAdding(p => ({ ...p, [cat.id]: e.target.value }))}
                    onKeyDown={e => {
                      if (e.key === "Enter" && addVal.trim()) {
                        onAddItem(cat.id, addVal.trim());
                        setAdding(p => ({ ...p, [cat.id]: "" }));
                      }
                    }}
                    className="flex-1 text-[11px] bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  />
                  <button
                    onClick={() => {
                      if (addVal.trim()) {
                        onAddItem(cat.id, addVal.trim());
                        setAdding(p => ({ ...p, [cat.id]: "" }));
                      }
                    }}
                    className={cn("text-muted-foreground hover:text-foreground transition-colors", !addVal.trim() && "opacity-30")}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Note about sync */}
      <p className="text-[10px] text-muted-foreground text-center italic pb-4">
        Connect Lovable Cloud to sync Kate &amp; Adrian's packing in real-time
      </p>
    </div>
  );
}

```


## `src/components/trip/NotesView.tsx`

```tsx
import { useState } from "react";
import { Plus, Trash2, StickyNote, Calendar, Edit3, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DAYS } from "@/data/tripData";

export type TripNote = {
  id: string;
  day_index: number | null;
  content: string;
  created_by: string;
  created_at: string;
};

interface Props {
  notes: TripNote[];
  onAdd: (note: Omit<TripNote, "id" | "created_by" | "created_at">) => void;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  currentUserId: string;
}

export function NotesView({ notes, onAdd, onUpdate, onDelete, currentUserId }: Props) {
  const [tab, setTab] = useState<"general" | "daily">("general");
  const [draftContent, setDraftContent] = useState("");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const generalNotes = notes.filter(n => n.day_index === null);
  const notesByDay = DAYS.reduce<Record<number, TripNote[]>>((acc, _, i) => {
    acc[i] = notes.filter(n => n.day_index === i);
    return acc;
  }, {});

  const handleAdd = () => {
    const content = draftContent.trim();
    if (!content) return;
    onAdd({ day_index: tab === "general" ? null : selectedDay ?? null, content });
    setDraftContent("");
  };

  const handleSaveEdit = (id: string) => {
    const content = editContent.trim();
    if (content) onUpdate(id, content);
    setEditingId(null);
  };

  const startEdit = (note: TripNote) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl italic font-light text-primary font-serif">Notes</h2>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-muted rounded-lg p-1">
        {(["general", "daily"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-1.5 rounded-md text-[12px] font-medium transition-all",
              tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "general" ? "General Notes" : "Per Day"}
          </button>
        ))}
      </div>

      {/* Day selector for daily tab */}
      {tab === "daily" && (
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-1.5 w-max pb-1">
            {DAYS.map((d, i) => (
              <button
                key={i}
                onClick={() => setSelectedDay(i)}
                className={cn(
                  "shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-medium border transition-all whitespace-nowrap",
                  selectedDay === i
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border text-foreground hover:border-primary/30",
                  notesByDay[i]?.length > 0 && selectedDay !== i && "border-gold/50"
                )}
              >
                {d.dy.split(" ").slice(0, 2).join(" ")}
                {notesByDay[i]?.length > 0 && <span className="ml-1 text-gold">·</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add note */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-2">
        <div className="text-[10px] font-semibold text-warm uppercase tracking-widest flex items-center gap-1.5">
          <Edit3 className="w-3 h-3" />
          {tab === "general" ? "New general note" : selectedDay !== null ? `Note for ${DAYS[selectedDay]?.dy}` : "Select a day above"}
        </div>
        <textarea
          rows={3}
          placeholder={tab === "general"
            ? "Anything important — confirmation numbers, tips, reminders…"
            : selectedDay !== null ? `Notes for ${DAYS[selectedDay]?.act}…` : "Select a day first"}
          value={draftContent}
          disabled={tab === "daily" && selectedDay === null}
          onChange={e => setDraftContent(e.target.value)}
          onKeyDown={e => e.key === "Enter" && e.metaKey && handleAdd()}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-[13px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-40"
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">⌘↵ to save</span>
          <button
            onClick={handleAdd}
            disabled={!draftContent.trim() || (tab === "daily" && selectedDay === null)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-semibold disabled:opacity-40 hover:bg-primary/90 transition-colors active:scale-95"
          >
            <Plus className="w-3 h-3" /> Add Note
          </button>
        </div>
      </div>

      {/* Notes list */}
      {tab === "general" ? (
        <NoteList
          notes={generalNotes}
          editingId={editingId}
          editContent={editContent}
          currentUserId={currentUserId}
          onStartEdit={startEdit}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={() => setEditingId(null)}
          onEditChange={setEditContent}
          onDelete={onDelete}
          emptyLabel="No general notes yet"
        />
      ) : selectedDay !== null ? (
        <NoteList
          notes={notesByDay[selectedDay] ?? []}
          editingId={editingId}
          editContent={editContent}
          currentUserId={currentUserId}
          onStartEdit={startEdit}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={() => setEditingId(null)}
          onEditChange={setEditContent}
          onDelete={onDelete}
          emptyLabel={`No notes for ${DAYS[selectedDay]?.dy} yet`}
        />
      ) : (
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <Calendar className="w-8 h-8 mx-auto mb-3 text-muted-foreground opacity-40" />
          <p className="text-[13px] text-muted-foreground">Select a day to see or add notes</p>
        </div>
      )}
    </div>
  );
}

function NoteList({
  notes, editingId, editContent, currentUserId,
  onStartEdit, onSaveEdit, onCancelEdit, onEditChange, onDelete, emptyLabel
}: {
  notes: TripNote[];
  editingId: string | null;
  editContent: string;
  currentUserId: string;
  onStartEdit: (n: TripNote) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onEditChange: (v: string) => void;
  onDelete: (id: string) => void;
  emptyLabel: string;
}) {
  if (notes.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <StickyNote className="w-7 h-7 mx-auto mb-2 text-muted-foreground opacity-40" />
        <p className="text-[12px] text-muted-foreground">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {[...notes]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map(note => (
          <div key={note.id} className="bg-card border border-border rounded-xl p-4 shadow-sm group">
            {editingId === note.id ? (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={editContent}
                  onChange={e => onEditChange(e.target.value)}
                  autoFocus
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={onCancelEdit}
                    className="p-1.5 rounded-full border border-border text-muted-foreground hover:bg-secondary transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onSaveEdit(note.id)}
                    className="p-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-[13px] text-foreground leading-relaxed whitespace-pre-wrap">{note.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(note.created_at).toLocaleDateString("en-NZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {note.created_by === currentUserId && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => onStartEdit(note)}
                        className="p-1 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button onClick={() => onDelete(note.id)}
                        className="p-1 rounded-full hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
    </div>
  );
}

```


## `src/components/trip/UrgentView.tsx`

```tsx
import { Day } from "@/data/tripData";
import { cn } from "@/lib/utils";
import { ExternalLink, CheckCircle2, AlertTriangle } from "lucide-react";

interface UrgentItem {
  nm: string;
  nt?: string;
  c: number;
  dt: string;
  di: number;
  si: number;
  lnk?: string;
}

interface Props {
  days: Day[];
  onToggle: (di: number, si: number) => void;
}

export function UrgentView({ days, onToggle }: Props) {
  const urgent: UrgentItem[] = days.flatMap((d, di) =>
    d.sg.map((sg, si) => ({ ...sg, di, si, dt: d.dt }))
       .filter(sg => sg.nt?.includes("⚠") && !sg.bk)
  );

  if (urgent.length === 0) {
    return (
      <div className="text-center py-16 bg-primary/5 border border-primary/15 rounded-xl">
        <CheckCircle2 className="w-10 h-10 mx-auto text-gold mb-3" />
        <div className="text-base italic text-primary font-medium font-serif">Tutto fatto!</div>
        <div className="text-sm text-muted-foreground mt-1">All urgent items are booked.</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-xl italic font-light text-primary mb-1 font-serif">Urgent Bookings</h2>
        <p className="text-xs text-muted-foreground">These sell out months in advance — book as soon as possible.</p>
      </div>

      {urgent.map((item, i) => (
        <div key={i} className="bg-card rounded-xl border-2 border-burg-light/40 p-4 flex flex-wrap justify-between items-start gap-3 shadow-sm">
          <div className="flex-1">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-burg-light shrink-0 mt-0.5" />
              <div>
                <div className="text-[13px] font-semibold">{item.nm}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{item.dt}</div>
                {item.nt && (
                  <div className="text-[11px] text-burg-light mt-1">
                    {item.nt.replace("⚠ ", "").replace("⚠", "")}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {item.c > 0 && <span className="text-sm font-bold text-primary">€{item.c}</span>}
            {item.lnk && (
              <a href={item.lnk} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] px-3 py-1.5 rounded bg-primary text-primary-foreground font-semibold hover:opacity-80 transition-opacity">
                Book <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button onClick={() => onToggle(item.di, item.si)}
              className="inline-flex items-center gap-1 text-[10px] px-3 py-1.5 rounded bg-gold/20 text-brown border border-gold/40 font-semibold hover:bg-gold/30 transition-colors">
              <CheckCircle2 className="w-3 h-3" /> Done
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

```


## `src/components/trip/ExportView.tsx`

```tsx
import { FileDown, BookOpen, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const EXPORTS = [
  {
    id: "full",
    label: "Full Itinerary PDF",
    desc: "All 17 days · Cover page · ToC · Every region · Hidden gems & food guide",
    icon: <BookOpen className="w-5 h-5" />,
    col: "bg-primary",
    file: "Kate_Adrian_Italia_2026_Full.pdf",
  },
  {
    id: "milan",
    label: "Milan",
    desc: "3 nights · 25–28 May · Day trip Como",
    icon: <MapPin className="w-4 h-4" />,
    col: "bg-[#7B5038]",
    file: "Kate_Adrian_Italia_2026_Milan.pdf",
  },
  {
    id: "garda",
    label: "Lake Garda",
    desc: "2 nights · 28–30 May · Monte Baldo & Verona",
    icon: <MapPin className="w-4 h-4" />,
    col: "bg-[#4A7A6A]",
    file: "Kate_Adrian_Italia_2026_Lake_Garda.pdf",
  },
  {
    id: "florence",
    label: "Florence",
    desc: "2 nights · 30 May–1 Jun · Uffizi & David",
    icon: <MapPin className="w-4 h-4" />,
    col: "bg-[#7B3F6B]",
    file: "Kate_Adrian_Italia_2026_Florence.pdf",
  },
  {
    id: "tuscany",
    label: "Tuscany",
    desc: "2 nights · 1–3 Jun · Chianti, Siena, Val d'Orcia",
    icon: <MapPin className="w-4 h-4" />,
    col: "bg-[#B8860B]",
    file: "Kate_Adrian_Italia_2026_Tuscany.pdf",
  },
  {
    id: "rome",
    label: "Rome",
    desc: "2+1 nights · 3–5 Jun & 9 Jun · Colosseum, Vatican",
    icon: <MapPin className="w-4 h-4" />,
    col: "bg-[#8B2252]",
    file: "Kate_Adrian_Italia_2026_Rome.pdf",
  },
  {
    id: "sorrento",
    label: "Sorrento & Amalfi",
    desc: "4 nights · 5–9 Jun · Capri, Positano, Path of the Gods",
    icon: <MapPin className="w-4 h-4" />,
    col: "bg-[#B87048]",
    file: "Kate_Adrian_Italia_2026_Sorrento.pdf",
  },
];

export function ExportView() {
  const full = EXPORTS[0];
  const regional = EXPORTS.slice(1);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl italic font-light text-primary font-serif">Export PDFs</h2>
        <p className="text-[12px] text-muted-foreground mt-1">
          Download the full itinerary or individual region guides — beautifully formatted A4 PDFs.
        </p>
      </div>

      {/* Full itinerary — featured */}
      <a
        href={`/${full.file}`}
        download={full.file}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-primary rounded-xl p-5 text-primary-foreground shadow-md hover:bg-primary/90 transition-colors active:scale-[0.99] cursor-pointer"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-bold">{full.label}</div>
            <div className="text-[11px] opacity-70 mt-0.5">{full.desc}</div>
          </div>
          <FileDown className="w-5 h-5 opacity-60 shrink-0 mt-1" />
        </div>
      </a>

      {/* Regional guides */}
      <div>
        <div className="text-[11px] font-semibold text-warm uppercase tracking-widest mb-2">Regional Guides</div>
        <div className="space-y-2">
          {regional.map(exp => (
            <a
              key={exp.id}
              href={`/${exp.file}`}
              download={exp.file}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 shadow-sm hover:border-primary/30 hover:bg-secondary/50 transition-all active:scale-[0.99] cursor-pointer"
            >
              <span className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0", exp.col)}>
                {exp.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-foreground">{exp.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{exp.desc}</div>
              </div>
              <FileDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </a>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 text-[11px] text-muted-foreground leading-relaxed">
        <strong className="text-warm">Tip:</strong> Save the PDFs to your phone before the trip for offline access — each guide includes activities, hidden gems, food recommendations, and a daily cost summary.
      </div>
    </div>
  );
}

```


## `src/components/trip/TripHeader.tsx`

```tsx
import { Day, HotelEntry, Hotels } from "@/data/tripData";

interface Props {
  days: Day[];
  hotels: Hotels;
  customNzd: Record<string, { nm: string; nzd: number; st?: string }>;
  selectedNzd: Record<string, number>;
  alreadyBooked: Record<string, boolean>;
  pax: number;
  flightPerPax: number;
}

export function TripHeader({ days, hotels, customNzd, selectedNzd, alreadyBooked, pax, flightPerPax }: Props) {
  const bookedCount = days.reduce((s, d) => s + d.sg.filter(a => a.bk).length, 0);
  const totalActs   = days.reduce((s, d) => s + d.sg.length, 0);
  const actCost     = days.reduce((s, d) => s + d.sg.reduce((s2, a) => s2 + a.c, 0), 0);

  const hotelEntries = Object.entries(hotels) as [string, HotelEntry][];
  const hBooked  = hotelEntries.filter(([r, d]) => {
    const c = customNzd[r];
    return alreadyBooked[r] || d.st === "confirmed" || c?.st === "booked";
  }).length;
  const hSelected = hotelEntries.filter(([r]) => customNzd[r]?.st === "selected").length;
  const hTotal = hotelEntries.length;

  const accomNzd = hotelEntries.reduce((s, [r, d]) => {
    const cNzd = customNzd[r]?.nzd ?? 0;
    const sNzd = selectedNzd[r] ?? 0;
    return s + (Math.max(cNzd, sNzd) * d.n);
  }, 0);
  const flightTotal = flightPerPax * pax;
  const grandTotal  = accomNzd > 0 ? flightTotal + accomNzd + Math.round(actCost * 1.85) : 0;

  const hotelSub = hBooked === hTotal
    ? "All booked"
    : `${hSelected > 0 ? hSelected + " selected, " : ""}${hTotal - hBooked - hSelected} to book`;

  const stat = (label: string, value: string, sub?: string) => (
    <div className="flex flex-col items-start bg-white/10 rounded-lg px-3 py-2.5 min-w-[76px] border border-white/15">
      <span className="text-[15px] font-bold font-sans text-gold leading-tight">{value}</span>
      <span className="text-[9px] uppercase tracking-[0.08em] opacity-55 mt-0.5 font-sans">{label}</span>
      {sub && <span className="text-[9px] opacity-38 mt-0.5 leading-tight font-sans">{sub}</span>}
    </div>
  );

  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-foreground via-primary to-primary-light py-8 px-5 text-primary-foreground">
      {/* Texture — gold radial hints */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(ellipse at 15% 60%, hsl(34 48% 56% / 0.6) 0%, transparent 55%), radial-gradient(ellipse at 85% 25%, hsl(34 48% 56% / 0.25) 0%, transparent 45%)" }} />

      <div className="relative max-w-3xl mx-auto">
        <div className="fade-up">
          <h1 className="text-[32px] font-light italic leading-none mb-1 font-serif tracking-wide">Kate &amp; Adrian</h1>
          <p className="text-[18px] font-sans font-light opacity-75 tracking-[0.18em] uppercase">Italia 2026</p>
          <p className="text-[11px] font-sans opacity-45 tracking-[0.06em] mt-2">25 May – 10 Jun · 17 days</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-5 fade-up delay-2">
          {stat("Activities", `${bookedCount}/${totalActs}`)}
          {stat("Hotels", `${hBooked}/${hTotal}`, hotelSub)}
          {stat("Flights", `$${flightTotal.toLocaleString()}`, `${pax} pax`)}
          {stat("Accom", accomNzd > 0 ? `$${accomNzd.toLocaleString()}` : "—", "NZD")}
          {stat("Est. Total", grandTotal > 0 ? `$${grandTotal.toLocaleString()}` : "—", "NZD")}
        </div>
      </div>
    </header>
  );
}

```


## `src/components/trip/TypeBadge.tsx`

```tsx
// Re-export from BrandIcons for backward compatibility
export { TypeBadge } from "./BrandIcons";

```


## `src/components/trip/BrandIcons.tsx`

```tsx
// Custom SVG icon set — brand colours only (burgundy / brown / gold)
// Drop-in replacement for emoji and generic letter badges throughout the app.

import { cn } from "@/lib/utils";
import { ActivityType } from "@/data/tripData";

// ── Activity type icons ─────────────────────────────────────────────

const icons = {
  // Ticket / entry — stylised arch
  ticket: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="1.5" y="4.5" width="13" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5.5 4.5v-.5a2.5 2.5 0 0 1 5 0v.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5.5 11.5v.5a2.5 2.5 0 0 0 5 0v-.5" stroke="currentColor" strokeWidth="1.4"/>
      <line x1="5.5" y1="8" x2="10.5" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  // Food / dining — fork and knife
  food: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M5 2v4a2 2 0 0 0 2 2v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M5 2v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="7" y1="2" x2="7" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="9" y1="2" x2="9" y2="6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="11" y1="2" x2="11" y2="14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M9 6a2 2 0 0 0 2-2" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  ),
  // Experience — star spark
  experience: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M8 2v2M8 12v2M2 8h2M12 8h2M3.93 3.93l1.41 1.41M10.66 10.66l1.41 1.41M3.93 12.07l1.41-1.41M10.66 5.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  ),
  // Transport / route — compass
  transport: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M10.5 5.5 9 9l-3.5 1.5L7 7l3.5-1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  ),
  // Free — open hand / gift
  free: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M8 2.5A1.5 1.5 0 0 1 9.5 4H8M8 2.5A1.5 1.5 0 0 0 6.5 4H8M8 2.5V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <rect x="5" y="4" width="6" height="1.5" rx=".75" stroke="currentColor" strokeWidth="1.3"/>
      <rect x="5.5" y="5.5" width="5" height="6" rx=".75" stroke="currentColor" strokeWidth="1.3"/>
      <line x1="8" y1="5.5" x2="8" y2="11.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  ),
  // Map pin for location
  mapPin: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M8 1.5C5.79 1.5 4 3.29 4 5.5c0 3.25 4 9 4 9s4-5.75 4-9c0-2.21-1.79-4-4-4z" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="8" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
    </svg>
  ),
  // Urgent / warning
  urgent: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M8 2L1.5 13.5h13L8 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <line x1="8" y1="7" x2="8" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="8" cy="11.8" r=".8" fill="currentColor"/>
    </svg>
  ),
  // Plane for flights / travel
  plane: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M2 9.5l2.5-1L7 13l1.5-.5V10l5-3.5V5l-1.5.5-2 2.5-3-1-1-1.5-1 .5.5 2L4 9l-2 .5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  ),
  // Hotel / bed
  hotel: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="1.5" y="8" width="13" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M1.5 8V5a1 1 0 0 1 1-1H5a1 1 0 0 1 1 1v3" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M6 8V6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="1.4"/>
      <line x1="1.5" y1="11" x2="14.5" y2="11" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
  // Budget / coins
  budget: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="9" cy="9" r="5" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M7 5v.5M7 9.5V10M5.5 7h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  // Clothes / hanger
  clothes: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M8 3.5A1.5 1.5 0 0 1 9.5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M9.5 5L14 9H2l4.5-4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <line x1="8" y1="2" x2="8" y2="3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <rect x="2" y="9" width="12" height="5" rx=".75" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  ),
  // Documents / passport
  documents: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="3" y="1.5" width="10" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="8" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.3"/>
      <line x1="5" y1="11" x2="11" y2="11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="5.5" y1="12.5" x2="10.5" y2="12.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  ),
  // Toiletries / bottle
  toiletries: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M6 4h4v1.5a2 2 0 0 1 2 2V12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2V4z" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="6.5" y="2" width="3" height="2" rx=".5" stroke="currentColor" strokeWidth="1.2"/>
      <line x1="7" y1="9" x2="9" y2="9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  // Tech / device
  tech: (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="2" y="3.5" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <line x1="5" y1="13.5" x2="11" y2="13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="8" y1="11.5" x2="8" y2="13.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="8" cy="7.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  ),
};

// ── Activity type badge ─────────────────────────────────────────────

const BADGE_CONFIG: Record<ActivityType, { label: string; icon: keyof typeof icons; classes: string }> = {
  free:       { label: "Free",       icon: "free",       classes: "bg-gold/10 text-brown border-gold/30" },
  ticket:     { label: "Ticket",     icon: "ticket",     classes: "bg-primary/10 text-primary border-primary/30" },
  food:       { label: "Dine",       icon: "food",       classes: "bg-brown/10 text-brown border-brown/30" },
  experience: { label: "Experience", icon: "experience", classes: "bg-gold/15 text-brown border-gold/40" },
  transport:  { label: "Route",      icon: "transport",  classes: "bg-primary/8 text-primary border-primary/20" },
};

export function TypeBadge({ type, className }: { type: ActivityType; className?: string }) {
  const { label, icon, classes } = BADGE_CONFIG[type];
  return (
    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold tracking-wide border", classes, className)}>
      <span className="w-3 h-3 shrink-0">{icons[icon]}</span>
      {label}
    </span>
  );
}

// ── Named icon components ───────────────────────────────────────────

export function Icon({ name, className }: { name: keyof typeof icons; className?: string }) {
  return (
    <span className={cn("inline-flex items-center justify-center", className)}>
      {icons[name]}
    </span>
  );
}

// Map stop icons — round branded pin with SVG symbol
export const STOP_ICONS: Record<string, keyof typeof icons> = {
  "Milan":       "plane",
  "Lake Garda":  "mapPin",
  "Florence":    "experience",
  "Tuscany":     "food",
  "Rome":        "ticket",
  "Sorrento":    "transport",
  "Rome Final":  "plane",
};

export { icons };

```


## `src/components/trip/ProfileSetup.tsx`

```tsx
/**
 * Shown once after first sign-up, before the planner.
 * Lets the user tell the app whether they are Kate or Adrian.
 */
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PEOPLE = [
  { role: "k" as const, name: "Kate",   initial: "K", color: "border-primary bg-primary/8 hover:bg-primary/15" },
  { role: "a" as const, name: "Adrian", initial: "A", color: "border-gold   bg-gold/8   hover:bg-gold/15"   },
];

export function ProfileSetup() {
  const { createProfile, signOut } = useAuth();
  const [loading, setLoading] = useState<"k" | "a" | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  const handle = async (role: "k" | "a", name: string) => {
    setLoading(role); setError(null);
    const { error: err } = await createProfile(role, name);
    if (err) { setError(err.message); setLoading(null); }
    // On success, AuthContext updates profile → planner renders automatically
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
      <div className="text-center mb-8 fade-up">
        <h1 className="text-[36px] font-light italic text-primary font-serif leading-none">Welcome!</h1>
        <p className="text-sm text-muted-foreground mt-3 font-sans">Which traveller are you?</p>
      </div>

      <div className="flex gap-4 fade-up delay-1">
        {PEOPLE.map(p => (
          <button key={p.role}
            onClick={() => handle(p.role, p.name)}
            disabled={!!loading}
            className={cn(
              "w-36 h-44 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 transition-all active:scale-95",
              p.color,
              loading === p.role && "opacity-70"
            )}>
            <span className="w-16 h-16 rounded-full bg-primary text-primary-foreground text-3xl font-bold font-serif flex items-center justify-center shadow-md">
              {p.initial}
            </span>
            <span className="text-base font-semibold text-foreground">{p.name}</span>
            {loading === p.role && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 text-[12px] text-burg-light fade-up">{error}</p>
      )}

      <button onClick={signOut} className="mt-8 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
        Sign out
      </button>
    </div>
  );
}

```


## `package.json`

```json
{
  "name": "vite_react_shadcn_ts",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-accordion": "^1.2.11",
    "@radix-ui/react-alert-dialog": "^1.1.14",
    "@radix-ui/react-aspect-ratio": "^1.1.7",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-checkbox": "^1.3.2",
    "@radix-ui/react-collapsible": "^1.1.11",
    "@radix-ui/react-context-menu": "^2.2.15",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-dropdown-menu": "^2.1.15",
    "@radix-ui/react-hover-card": "^1.1.14",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-menubar": "^1.1.15",
    "@radix-ui/react-navigation-menu": "^1.2.13",
    "@radix-ui/react-popover": "^1.1.14",
    "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-radio-group": "^1.3.7",
    "@radix-ui/react-scroll-area": "^1.2.9",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slider": "^1.3.5",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.5",
    "@radix-ui/react-tabs": "^1.1.12",
    "@radix-ui/react-toast": "^1.2.14",
    "@radix-ui/react-toggle": "^1.1.9",
    "@radix-ui/react-toggle-group": "^1.1.10",
    "@radix-ui/react-tooltip": "^1.2.7",
    "@supabase/supabase-js": "^2.99.3",
    "@tanstack/react-query": "^5.83.0",
    "@types/leaflet": "^1.9.14",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.6.0",
    "input-otp": "^1.4.2",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.462.0",
    "next-themes": "^0.3.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.61.1",
    "react-leaflet": "^4.2.1",
    "react-resizable-panels": "^2.1.9",
    "react-router-dom": "^6.30.1",
    "recharts": "^2.15.4",
    "sonner": "^1.7.4",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.9",
    "vite-plugin-pwa": "^0.20.5",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@eslint/js": "^9.32.0",
    "@playwright/test": "^1.57.0",
    "@tailwindcss/typography": "^0.5.16",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.0.0",
    "@types/node": "^22.16.5",
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7",
    "@vitejs/plugin-react-swc": "^3.11.0",
    "autoprefixer": "^10.4.21",
    "eslint": "^9.32.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.20",
    "globals": "^15.15.0",
    "jsdom": "^20.0.3",
    "lovable-tagger": "^1.1.13",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.38.0",
    "vite": "^5.4.19",
    "vitest": "^3.2.4"
  }
}

```


## `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border:     "hsl(var(--border))",
        input:      "hsl(var(--input))",
        ring:       "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          light:      "hsl(var(--primary-light))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Brand palette — burgundy/brown/gold only
        gold:          "hsl(var(--gold))",
        "gold-light":  "hsl(var(--gold-light))",
        brown:         "hsl(var(--brown))",
        "brown-light": "hsl(var(--brown-light))",
        "burg-light":  "hsl(var(--burg-light))",
        cream:         "hsl(var(--cream))",
        // Legacy aliases (kept so existing components don't break)
        rose:          "hsl(var(--rose))",
        warm:          "hsl(var(--warm))",
        terra:         "hsl(var(--terra))",
        green:         "hsl(var(--green))",
        "green-light": "hsl(var(--green-light))",
        plum:          "hsl(var(--plum))",
        olive:         "hsl(var(--olive))",
        sidebar: {
          DEFAULT:              "hsl(var(--sidebar-background))",
          foreground:           "hsl(var(--sidebar-foreground))",
          primary:              "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent:               "hsl(var(--sidebar-accent))",
          "accent-foreground":  "hsl(var(--sidebar-accent-foreground))",
          border:               "hsl(var(--sidebar-border))",
          ring:                 "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "Georgia", "serif"],
        sans:  ["'DM Sans'", "system-ui", "sans-serif"],
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up":   { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

```


## `vite.config.ts`

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["pwa-192.png", "pwa-512.png"],
      workbox: {
        // Never intercept OAuth redirects
        navigateFallbackDenylist: [/^\/~oauth/],
        // Cache the app shell and all assets for offline use
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            // Cache CartoDB map tiles for offline viewing
            urlPattern: /^https:\/\/[a-d]\.basemaps\.cartocdn\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "map-tiles",
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: "Kate & Adrian — Italia 2026",
        short_name: "Italia 2026",
        description: "Our Italy trip planner — 17 days of la dolce vita",
        theme_color: "#5C1A2A",
        background_color: "#FFF8F0",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
        categories: ["travel", "lifestyle"],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

```


## `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>Kate &amp; Adrian — Italia 2026</title>
    <meta name="description" content="Our Italy trip planner — 17 days of la dolce vita, 25 May – 10 Jun 2026" />
    <meta name="author" content="Kate &amp; Adrian" />

    <!-- PWA / Mobile -->
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Italia 2026" />
    <meta name="theme-color" content="#5C1A2A" />
    <meta name="msapplication-TileColor" content="#5C1A2A" />

    <!-- Icons -->
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🇮🇹</text></svg>" />
    <link rel="apple-touch-icon" href="/pwa-192.png" />
    <link rel="apple-touch-icon" sizes="192x192" href="/pwa-192.png" />
    <link rel="apple-touch-icon" sizes="512x512" href="/pwa-512.png" />

    <!-- Open Graph -->
    <meta property="og:title" content="Kate &amp; Adrian — Italia 2026" />
    <meta property="og:description" content="17 days of la dolce vita — May 25 to June 10, 2026" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="/pwa-512.png" />

    <!-- Splash screen colour for iOS -->
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

```


## `src/index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ── Kate & Adrian Italia 2026 — Design System ── */

@layer base {
  :root {
    /* surfaces */
    --background:       30 55% 97%;     /* warm parchment */
    --foreground:       15 55% 12%;     /* deep espresso */
    --card:             30 40% 99%;
    --card-foreground:  15 55% 12%;
    --popover:          30 40% 99%;
    --popover-foreground: 15 55% 12%;

    /* brand — burgundy only */
    --primary:          345 54% 22%;    /* deep burgundy */
    --primary-foreground: 30 55% 97%;
    --primary-light:    345 42% 34%;    /* mid burgundy */

    /* accent — gold */
    --accent:           34 48% 56%;     /* warm gold */
    --accent-foreground: 15 55% 12%;

    /* secondary — parchment */
    --secondary:        30 38% 91%;
    --secondary-foreground: 18 42% 26%;

    /* muted */
    --muted:            28 24% 87%;
    --muted-foreground: 20 16% 50%;

    /* feedback */
    --destructive:      0 72% 50%;
    --destructive-foreground: 0 0% 100%;

    --border:           26 28% 83%;
    --input:            26 28% 83%;
    --ring:             345 54% 22%;
    --radius:           0.55rem;

    /* ── Brand semantic tokens (burgundy/brown/gold palette only) ── */
    --gold:             34 48% 56%;     /* #C4956A — main accent */
    --gold-light:       36 48% 72%;     /* lighter gold */
    --brown:            18 42% 26%;     /* warm brown */
    --brown-light:      20 32% 40%;     /* mid brown */
    --burg-light:       345 36% 48%;    /* lighter burg for borders */
    --cream:            30 38% 91%;

    /* kept for backward-compat (mapped to palette) */
    --rose:             345 36% 48%;    /* remapped → burg-light */
    --warm:             18 42% 26%;     /* = brown */
    --terra:            22 44% 38%;     /* warm brown-orange */
    --green:            345 54% 22%;    /* remapped → primary (used sparingly for "booked") */
    --green-light:      345 36% 48%;
    --plum:             345 42% 34%;    /* = primary-light */
    --olive:            18 32% 36%;     /* = brown-light */

    /* sidebar */
    --sidebar-background: 30 55% 97%;
    --sidebar-foreground: 15 55% 12%;
    --sidebar-primary:    345 54% 22%;
    --sidebar-primary-foreground: 30 55% 97%;
    --sidebar-accent:     30 38% 91%;
    --sidebar-accent-foreground: 15 55% 12%;
    --sidebar-border:     26 28% 83%;
    --sidebar-ring:       345 54% 22%;
  }
}

@layer base {
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground antialiased;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 15px;
    line-height: 1.6;
  }
  h1, h2, h3, h4 {
    font-family: 'Cormorant Garamond', Georgia, serif;
    @apply tracking-tight;
  }
  .font-serif {
    font-family: 'Cormorant Garamond', Georgia, serif;
  }
  .font-sans {
    font-family: 'DM Sans', system-ui, sans-serif;
  }
}

@layer utilities {
  .text-balance { text-wrap: balance; }
}

/* scroll-reveal */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(14px); filter: blur(3px); }
  to   { opacity: 1; transform: translateY(0);    filter: blur(0);   }
}
.fade-up { animation: fade-up 0.55s cubic-bezier(0.16,1,0.3,1) both; }
.delay-1 { animation-delay: 0.07s; }
.delay-2 { animation-delay: 0.14s; }
.delay-3 { animation-delay: 0.21s; }
.delay-4 { animation-delay: 0.28s; }

```


## `src/integrations/supabase/client.ts`

```ts
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```


## `src/integrations/supabase/types.ts`

```ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_bookings: {
        Row: {
          booked: boolean
          day_index: number
          segment_index: number
          updated_at: string | null
        }
        Insert: {
          booked?: boolean
          day_index: number
          segment_index: number
          updated_at?: string | null
        }
        Update: {
          booked?: boolean
          day_index?: number
          segment_index?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      activity_votes: {
        Row: {
          day_index: number
          segment_index: number
          updated_at: string | null
          user_id: string
          voted: boolean
        }
        Insert: {
          day_index: number
          segment_index: number
          updated_at?: string | null
          user_id: string
          voted?: boolean
        }
        Update: {
          day_index?: number
          segment_index?: number
          updated_at?: string | null
          user_id?: string
          voted?: boolean
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount_eur: number
          category: string
          created_at: string
          created_by: string
          description: string
          expense_date: string
          id: string
          paid_by: string
          updated_at: string
        }
        Insert: {
          amount_eur?: number
          category?: string
          created_at?: string
          created_by: string
          description?: string
          expense_date?: string
          id?: string
          paid_by: string
          updated_at?: string
        }
        Update: {
          amount_eur?: number
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          expense_date?: string
          id?: string
          paid_by?: string
          updated_at?: string
        }
        Relationships: []
      }
      hotel_state: {
        Row: {
          already_booked: boolean
          custom_name: string
          custom_nzd: number
          custom_status: string
          region: string
          selected_nzd: number
          updated_at: string | null
        }
        Insert: {
          already_booked?: boolean
          custom_name?: string
          custom_nzd?: number
          custom_status?: string
          region: string
          selected_nzd?: number
          updated_at?: string | null
        }
        Update: {
          already_booked?: boolean
          custom_name?: string
          custom_nzd?: number
          custom_status?: string
          region?: string
          selected_nzd?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      packing_checks: {
        Row: {
          cat_id: string
          checked: boolean
          item_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cat_id: string
          checked?: boolean
          item_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cat_id?: string
          checked?: boolean
          item_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          trip_role: string
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id: string
          trip_role: string
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          trip_role?: string
        }
        Relationships: []
      }
      trip_notes: {
        Row: {
          content: string
          created_at: string
          created_by: string
          day_index: number | null
          id: string
          updated_at: string
        }
        Insert: {
          content?: string
          created_at?: string
          created_by: string
          day_index?: number | null
          id?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          day_index?: number | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

```


## `supabase/migrations/20260321233419_8769f474-422b-4976-bc26-c72c13275cc0.sql`

```sql
create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, display_name text not null, trip_role text not null check (trip_role in ('k', 'a')), created_at timestamptz default now()); alter table public.profiles enable row level security; create policy "Profiles viewable by authenticated" on public.profiles for select to authenticated using (true); create policy "Users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id); create policy "Users update own profile" on public.profiles for update to authenticated using (auth.uid() = id); create table if not exists public.activity_bookings (day_index integer not null, segment_index integer not null, booked boolean not null default false, updated_at timestamptz default now(), primary key (day_index, segment_index)); alter table public.activity_bookings enable row level security; create policy "Bookings select" on public.activity_bookings for select to authenticated using (true); create policy "Bookings insert" on public.activity_bookings for insert to authenticated with check (true); create policy "Bookings update" on public.activity_bookings for update to authenticated using (true); create table if not exists public.activity_votes (user_id uuid references auth.users(id) on delete cascade not null, day_index integer not null, segment_index integer not null, voted boolean not null default false, updated_at timestamptz default now(), primary key (user_id, day_index, segment_index)); alter table public.activity_votes enable row level security; create policy "Votes select all" on public.activity_votes for select to authenticated using (true); create policy "Votes insert own" on public.activity_votes for insert to authenticated with check (auth.uid() = user_id); create policy "Votes update own" on public.activity_votes for update to authenticated using (auth.uid() = user_id); create table if not exists public.hotel_state (region text primary key, selected_nzd integer not null default 0, already_booked boolean not null default false, custom_name text not null default '', custom_nzd integer not null default 0, custom_status text not null default 'none', updated_at timestamptz default now()); alter table public.hotel_state enable row level security; create policy "Hotel select" on public.hotel_state for select to authenticated using (true); create policy "Hotel insert" on public.hotel_state for insert to authenticated with check (true); create policy "Hotel update" on public.hotel_state for update to authenticated using (true); create table if not exists public.packing_checks (user_id uuid references auth.users(id) on delete cascade not null, item_id text not null, cat_id text not null, checked boolean not null default false, updated_at timestamptz default now(), primary key (user_id, item_id)); alter table public.packing_checks enable row level security; create policy "Packing select all" on public.packing_checks for select to authenticated using (true); create policy "Packing insert own" on public.packing_checks for insert to authenticated with check (auth.uid() = user_id); create policy "Packing update own" on public.packing_checks for update to authenticated using (auth.uid() = user_id); alter publication supabase_realtime add table public.activity_bookings; alter publication supabase_realtime add table public.activity_votes; alter publication supabase_realtime add table public.hotel_state; alter publication supabase_realtime add table public.packing_checks;
```


## `supabase/migrations/20260321233445_6f64cbf3-7fc8-4d02-a2d7-b8ed4b73b99e.sql`

```sql
-- Fix: replace permissive WITH CHECK (true) with auth check on shared tables
drop policy if exists "Bookings insert" on public.activity_bookings;
drop policy if exists "Bookings update" on public.activity_bookings;
drop policy if exists "Hotel insert" on public.hotel_state;
drop policy if exists "Hotel update" on public.hotel_state;

create policy "Bookings insert" on public.activity_bookings for insert to authenticated with check (auth.uid() is not null);
create policy "Bookings update" on public.activity_bookings for update to authenticated using (auth.uid() is not null);
create policy "Hotel insert" on public.hotel_state for insert to authenticated with check (auth.uid() is not null);
create policy "Hotel update" on public.hotel_state for update to authenticated using (auth.uid() is not null);
```


## `supabase/migrations/20260321235240_194cd67b-a8ed-4086-9e08-da5e9676bc52.sql`

```sql
-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  amount_eur NUMERIC(10,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'other',
  paid_by TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Expenses viewable by authenticated"
  ON public.expenses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Expenses insert by authenticated"
  ON public.expenses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Expenses delete by creator"
  ON public.expenses FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Expenses update by creator"
  ON public.expenses FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

-- Create trip_notes table
CREATE TABLE public.trip_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  day_index INTEGER NULL,
  content TEXT NOT NULL DEFAULT '',
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notes viewable by authenticated"
  ON public.trip_notes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Notes insert by authenticated"
  ON public.trip_notes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Notes update by creator"
  ON public.trip_notes FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Notes delete by creator"
  ON public.trip_notes FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

ALTER PUBLICATION supabase_realtime ADD TABLE public.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_notes;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trip_notes_updated_at
  BEFORE UPDATE ON public.trip_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

