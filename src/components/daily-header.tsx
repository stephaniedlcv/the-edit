"use client";

import { useEffect, useState } from "react";

type WeatherState = {
  status: "idle" | "loading" | "ready" | "denied" | "error";
  city: string | null;
  region: string | null;
  tempF: number | null;
  feelsF: number | null;
  humidity: number | null;
  rainChance: number | null;
  weatherCode: number | null;
};

const initialWeather: WeatherState = {
  status: "loading",
  city: null,
  region: null,
  tempF: null,
  feelsF: null,
  humidity: null,
  rainChance: null,
  weatherCode: null,
};

function getGreeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function describeWeather(code: number | null): string {
  if (code === null) return "";
  if (code === 0) return "Clear skies";
  if (code <= 2) return "Mostly sunny";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Light drizzle";
  if (code <= 67) return "Rainy";
  if (code <= 77) return "Snowy";
  if (code <= 82) return "Rain showers";
  if (code <= 99) return "Thunderstorms";
  return "";
}

function styleVerdict(w: WeatherState): { line: string; aside: string } {
  const temp = w.tempF ?? 0;
  const humidity = w.humidity ?? 0;
  const rain = w.rainChance ?? 0;

  if (rain >= 55) {
    return {
      line: "Carry rain-ready layers and skip suede or delicate fabrics.",
      aside: "Rain likely — protect your pieces and keep footwear practical.",
    };
  }
  if (temp >= 82 && humidity >= 60) {
    return {
      line: "Choose breathable pieces and keep structure light.",
      aside: "Humid heat — light fabrics, open layers, and no heavy styling.",
    };
  }
  if (temp >= 80) {
    return {
      line: "Lean into airy fabrics and relaxed silhouettes.",
      aside: "Warm and dry — easy, breathable styling wins today.",
    };
  }
  if (temp <= 58) {
    return {
      line: "Layer up — bring a warm topper you can build around.",
      aside: "Cool air — structured layers and warmer textures work best.",
    };
  }
  return {
    line: "Comfortable, balanced layers work well today.",
    aside: "Mild conditions — versatile layering gives you the most options.",
  };
}

export function DailyHeader() {
  // "Good day" is a safe SSR-neutral initial value; updated to real greeting on mount.
  const [greeting, setGreeting] = useState("Good day");
  const [weather, setWeather] = useState<WeatherState>(initialWeather);

  useEffect(() => {
    // Intentional two-step render: "Good day" is the SSR-safe placeholder;
    // the real greeting updates on mount after hydration to avoid mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGreeting(getGreeting(new Date().getHours()));
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      // Browser capability detection — only runs client-side after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWeather((w) => ({ ...w, status: "error" }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const weatherUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code` +
            `&daily=precipitation_probability_max` +
            `&temperature_unit=fahrenheit&timezone=auto&forecast_days=1`;
          const geoUrl =
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}` +
            `&longitude=${longitude}&localityLanguage=en`;

          const [weatherRes, geoRes] = await Promise.all([
            fetch(weatherUrl),
            fetch(geoUrl).catch(() => null),
          ]);

          if (!weatherRes.ok) throw new Error("weather request failed");
          const wData = await weatherRes.json();
          const gData = geoRes && geoRes.ok ? await geoRes.json() : null;

          if (cancelled) return;

          setWeather({
            status: "ready",
            city: gData?.city || gData?.locality || null,
            region: gData?.principalSubdivision || gData?.countryName || null,
            tempF: Math.round(wData.current.temperature_2m),
            feelsF: Math.round(wData.current.apparent_temperature),
            humidity: Math.round(wData.current.relative_humidity_2m),
            rainChance: Math.round(
              wData.daily?.precipitation_probability_max?.[0] ?? 0,
            ),
            weatherCode: wData.current.weather_code ?? null,
          });
        } catch {
          if (!cancelled) setWeather((w) => ({ ...w, status: "error" }));
        }
      },
      () => {
        if (!cancelled) setWeather((w) => ({ ...w, status: "denied" }));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  const ready = weather.status === "ready";
  const verdict = styleVerdict(weather);
  const locationLabel = ready
    ? [weather.city, weather.region].filter(Boolean).join(", ") || "Your location"
    : "Today";
  const conditionLabel = ready ? describeWeather(weather.weatherCode) : "";

  const metrics = [
    { label: "Temperature", value: ready ? `${weather.tempF}°F` : "—" },
    { label: "Feels like", value: ready ? `${weather.feelsF}°F` : "—" },
    { label: "Humidity", value: ready ? `${weather.humidity}%` : "—" },
    { label: "Rain chance", value: ready ? `${weather.rainChance}%` : "—" },
  ];

  return (
    <section className="border-b border-[var(--line)] pb-9 pt-9 md:pb-14 md:pt-14">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
        <div>
          <p className="eyebrow mb-4">Daily Edit</p>
          <h1 className="font-display text-[2.8rem] leading-[0.96] text-[var(--espresso)] md:text-5xl lg:text-6xl">
            {greeting}, Stephanie.
          </h1>
        </div>

        <div className="lg:text-right">
          <p className="text-[0.6rem] font-semibold uppercase tracking-[0.32em] text-[var(--gold)]">
            {ready
              ? `${locationLabel}${conditionLabel ? ` · ${conditionLabel}` : ""}`
              : "Today"}
          </p>
          <p className="font-display mt-3 text-[1.28rem] italic leading-[1.4] text-[var(--coffee)]">
            {weather.status === "denied"
              ? "Enable location access for live weather styling."
              : weather.status === "error"
                ? "Live weather is unavailable right now."
                : ready
                  ? verdict.aside
                  : "Reading your local conditions…"}
          </p>
        </div>
      </div>

      <div className="mt-8 border-t border-[var(--line)] pt-7">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4 lg:grid-cols-5">
          {metrics.map((d) => (
            <div key={d.label}>
              <p className="eyebrow mb-2">{d.label}</p>
              <p className="font-display mt-2 text-[2.4rem] leading-none text-[var(--espresso)]">
                {d.value}
              </p>
            </div>
          ))}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <p className="eyebrow mb-2">Style verdict</p>
            <p className="mt-2 text-[0.88rem] leading-[1.75] text-[var(--ink-soft)]">
              {ready ? verdict.line : "Waiting for today's conditions…"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
