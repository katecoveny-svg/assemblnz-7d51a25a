/**
 * Symbiotic Brain — Global Brand DNA Context
 * Shares brand identity across all AUAHA NZ modules so that
 * Video, Copy, Podcast, and App Forge auto-adapt to the scanned brand.
 */
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { setGlobalBrandPrompt } from "@/lib/agentChat";
import { toast } from "sonner";

export interface BrandDna {
  businessName: string;
  industry: string;
  tagline: string;
  voiceTone: string;
  colors: { primary: string; secondary: string; accent: string };
  keywords: string[];
  targetAudience: string;
  logoUrl?: string;
  scanUrl?: string;
  suggestions: {
    videoIdeas: string[];
    podcastTopics: string[];
    copyAngles: string[];
    appIdeas: string[];
  };
}

interface BrandDnaContextValue {
  brand: BrandDna | null;
  isScanning: boolean;
  scanUrl: (url: string) => Promise<void>;
  setBrand: (brand: BrandDna | null) => void;
  getSuggestion: (module: "video" | "podcast" | "copy" | "app") => string[];
  /** Returns a system prompt snippet injecting brand voice for any kete */
  getBrandPromptInjection: () => string;
}

const BrandDnaContext = createContext<BrandDnaContextValue | null>(null);

export function useBrandDna() {
  const ctx = useContext(BrandDnaContext);
  if (!ctx) throw new Error("useBrandDna must be used within BrandDnaProvider");
  return ctx;
}

export function BrandDnaProvider({ children }: { children: ReactNode }) {
  const [brand, setBrand] = useState<BrandDna | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const scanUrl = useCallback(async (url: string) => {
    setIsScanning(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error("Please sign in to run a brand scan");
      }

      const { data, error } = await supabase.functions.invoke("scan-website", {
        headers: { Authorization: `Bearer ${accessToken}` },
        body: { url },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.brandDna) throw new Error("Could not parse brand data");

      const scanned = data.brandDna;
      const traits = scanned.voice_tone?.personality_traits || [];
      const brandData: BrandDna = {
        businessName: scanned.business_name || "Unknown",
        industry: scanned.industry || "General",
        tagline: scanned.tagline || scanned.brand_summary || "",
        voiceTone: scanned.voice_tone?.tone_category || traits.join(", ") || "professional",
        colors: {
          primary: scanned.visual_identity?.primary_color || "#00A86B",
          secondary: scanned.visual_identity?.secondary_color || "#0A0A0A",
          accent: scanned.visual_identity?.accent_color || "#00CED1",
        },
        keywords: scanned.usps || scanned.key_products || [],
        targetAudience: scanned.target_audience || "",
        logoUrl: scanned.logo_url || undefined,
        scanUrl: url,
        suggestions: {
          videoIdeas: (scanned.key_products || []).slice(0, 3).map((item: string) => `${scanned.business_name || "Brand"} feature spotlight: ${item}`),
          podcastTopics: (scanned.usps || []).slice(0, 3).map((item: string) => `${scanned.business_name || "Brand"} on ${item}`),
          copyAngles: (scanned.usps || []).slice(0, 3).map((item: string) => `Lead with ${item}`),
          appIdeas: (scanned.key_products || []).slice(0, 2).map((item: string) => `${item} customer workflow`),
        },
      };

      setBrand(brandData);

      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from("brand_identities").upsert({
          user_id: userData.user.id,
          brand_name: brandData.businessName,
          voice_tone: brandData.voiceTone,
          keywords: brandData.keywords,
          target_audience: brandData.targetAudience,
          mission: brandData.tagline,
          scanned_url: url,
          colors: brandData.colors as any,
          logo_url: brandData.logoUrl || null,
          scan_data: scanned as any,
        }, { onConflict: "user_id" });
      }

      if (data?.scanWarning) {
        toast.warning(data.scanWarning);
      }
      toast.success(`Brand DNA extracted for ${brandData.businessName}`);
    } catch (e: any) {
      toast.error(e.message || "Brand scan failed");
    } finally {
      setIsScanning(false);
    }
  }, []);

  const getSuggestion = useCallback((module: "video" | "podcast" | "copy" | "app"): string[] => {
    if (!brand) return [];
    const map = {
      video: brand.suggestions.videoIdeas,
      podcast: brand.suggestions.podcastTopics,
      copy: brand.suggestions.copyAngles,
      app: brand.suggestions.appIdeas,
    };
    return map[module] || [];
  }, [brand]);

  /** Injects brand voice context into any agent's system prompt */
  const getBrandPromptInjection = useCallback((): string => {
    if (!brand) return "";
    return `\n\n[BRAND DNA CONTEXT]\nBusiness: ${brand.businessName}\nIndustry: ${brand.industry}\nVoice/Tone: ${brand.voiceTone}\nTagline: "${brand.tagline}"\nTarget audience: ${brand.targetAudience}\nKeywords: ${brand.keywords.join(", ")}\nBrand colours: primary ${brand.colors.primary}, secondary ${brand.colors.secondary}, accent ${brand.colors.accent}\n\nAdapt your language, tone, and recommendations to match this brand identity. Use NZ English throughout.\n[/BRAND DNA CONTEXT]`;
  }, [brand]);

  // Sync brand DNA to global agentChat so ALL 42+ agents inherit brand voice
  useEffect(() => {
    setGlobalBrandPrompt(getBrandPromptInjection());
  }, [getBrandPromptInjection]);

  return (
    <BrandDnaContext.Provider value={{ brand, isScanning, scanUrl, setBrand, getSuggestion, getBrandPromptInjection }}>
      {children}
    </BrandDnaContext.Provider>
  );
}
