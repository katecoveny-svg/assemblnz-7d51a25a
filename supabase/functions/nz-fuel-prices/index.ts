import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * NZ Fuel Prices edge function
 *
 * Tries to fetch current NZ retail fuel prices from MBIE's weekly monitoring page.
 * MBIE publishes at: https://www.mbie.govt.nz/.../weekly-fuel-price-monitoring/
 * Falls back to last-known-good hardcoded values if scraping fails.
 *
 * Returns: { petrol91, petrol95, diesel, ev, source, publishedDate }
 * source: "mbie_live" | "fallback"
 *
 * No API key required. MBIE data is public.
 * EV electricity rate sourced from MBIE electricity price monitoring.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Last-known-good NZ national averages (updated Q1 2026)
// Source: MBIE Weekly Fuel Price Monitoring
const FALLBACK = {
  petrol91: 2.85,
  petrol95: 3.05,
  diesel: 2.40,
  ev: 0.32, // residential overnight tariff NZD/kWh
  source: "fallback" as const,
  publishedDate: "2026-04-01",
};

/**
 * Try to scrape current prices from MBIE's weekly fuel monitoring page.
 * The page has a table with columns: Date, Regular 91, Premium 95, Diesel
 * We look for the most recent row's NZD values.
 */
async function fetchMbieWeeklyPrices(): Promise<typeof FALLBACK | null> {
  try {
    const resp = await fetch(
      "https://www.mbie.govt.nz/building-and-energy/energy-and-natural-resources/energy-statistics-and-modelling/energy-statistics/oil-statistics/weekly-fuel-price-monitoring/",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; AssemblBot/1.0; +https://assembl.co.nz)",
          Accept: "text/html",
        },
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!resp.ok) return null;

    const html = await resp.text();

    // MBIE page has a table — look for price patterns like "2.85" or "$2.85"
    // We match the first set of 3 consecutive prices in range 1.50–4.50
    // This is intentionally loose to handle minor layout changes
    const pricePattern = /\$?([2-4]\.\d{2})/g;
    const matches: number[] = [];
    let m: RegExpExecArray | null;

    while ((m = pricePattern.exec(html)) !== null) {
      const v = parseFloat(m[1]);
      if (v >= 1.80 && v <= 4.50) {
        matches.push(v);
        if (matches.length >= 3) break;
      }
    }

    if (matches.length < 3) return null;

    // Order from MBIE table: Regular 91, Premium 95, Diesel
    const [petrol91, petrol95, diesel] = matches;

    // Sanity check: prices should be in expected NZ range and ordering
    if (petrol91 < 1.80 || petrol91 > 4.50) return null;
    if (petrol95 < petrol91) return null;
    if (diesel < 1.50 || diesel > 4.50) return null;

    // Extract a date from the page (look for YYYY-MM-DD or DD/MM/YYYY near the prices)
    const dateMatch = html.match(/(\d{4}-\d{2}-\d{2})|(\d{1,2}\/\d{1,2}\/\d{4})/);
    let publishedDate = new Date().toISOString().split("T")[0];
    if (dateMatch) {
      const raw = dateMatch[0];
      if (raw.includes("/")) {
        const parts = raw.split("/");
        publishedDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      } else {
        publishedDate = raw;
      }
    }

    return {
      petrol91: Math.round(petrol91 * 100) / 100,
      petrol95: Math.round(petrol95 * 100) / 100,
      diesel: Math.round(diesel * 100) / 100,
      ev: FALLBACK.ev, // EV rate is stable — use fallback
      source: "mbie_live" as const,
      publishedDate,
    };
  } catch (err) {
    console.error("[nz-fuel-prices] MBIE scrape failed:", err);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const live = await fetchMbieWeeklyPrices();
    const prices = live ?? FALLBACK;

    return new Response(JSON.stringify(prices), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[nz-fuel-prices] error:", err);
    return new Response(JSON.stringify(FALLBACK), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
