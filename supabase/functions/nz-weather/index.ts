import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * NZ Weather edge function
 *
 * Wraps Open-Meteo (https://api.open-meteo.com)
 * Free, no API key, high quality, NZ coverage.
 * Returns current conditions + daily forecast + construction-relevant alerts.
 *
 * No secrets required.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { latitude, longitude, days = 3 } = await req.json();

    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: "latitude and longitude required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set(
      "daily",
      "temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,uv_index_max,weather_code",
    );
    url.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code",
    );
    url.searchParams.set("timezone", "Pacific/Auckland");
    url.searchParams.set("forecast_days", String(Math.min(days, 7)));

    const res = await fetch(url.toString(), {
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      throw new Error(`Open-Meteo returned ${res.status}`);
    }

    const data = await res.json();

    // Generate construction-relevant alerts
    const alerts: {
      type: string;
      message: string;
      severity: "high" | "medium" | "info";
      day: string;
    }[] = [];

    const daily = data.daily;
    if (daily?.time) {
      for (let i = 0; i < daily.time.length; i++) {
        const day = daily.time[i];
        const wind = daily.wind_speed_10m_max[i];
        const rain = daily.precipitation_sum[i];
        const tempMin = daily.temperature_2m_min[i];
        const uv = daily.uv_index_max[i];

        if (wind > 40) {
          alerts.push({
            type: "wind",
            message: `Wind gusts up to ${wind}km/h — review crane and scaffolding operations`,
            severity: "high",
            day,
          });
        }
        if (rain > 10) {
          alerts.push({
            type: "rain",
            message: `${rain}mm rainfall forecast — excavation and earthworks safety review`,
            severity: "high",
            day,
          });
        }
        if (tempMin < 5) {
          alerts.push({
            type: "cold",
            message: `Temperature dropping to ${tempMin}°C — concrete curing concerns, frost risk`,
            severity: "medium",
            day,
          });
        }
        if (uv > 6) {
          alerts.push({
            type: "uv",
            message: `UV index ${uv} — sun protection required for outdoor workers`,
            severity: "medium",
            day,
          });
        }
        if (rain < 2 && wind < 15) {
          alerts.push({
            type: "spray_window",
            message: `Good spray/painting conditions on ${day} — low wind, minimal rain`,
            severity: "info",
            day,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        current: data.current,
        daily: data.daily,
        alerts,
        source: "open_meteo",
        fetchedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[nz-weather] error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Weather fetch failed",
        source: "fallback",
        current: null,
        daily: null,
        alerts: [],
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
