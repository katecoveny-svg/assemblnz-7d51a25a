import { useEffect } from "react";
import SEO from "@/components/SEO";

export default function BrandGuidelinesPage() {
  useEffect(() => {
    window.location.href = "/unified-brand-system-v2.html";
  }, []);

  return (
    <>
      <SEO
        title="Brand Guidelines | Assembl Mārama Brand System"
        description="Official Assembl brand guidelines — celestial Mārama design system, Whenua palette, typography, and logo usage for NZ business intelligence."
      />
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground text-sm font-body">Loading brand assets…</p>
      </div>
    </>
  );
}
