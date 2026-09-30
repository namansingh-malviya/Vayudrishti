export interface WindData {
  speedKmh: number;
  directionDeg: number;
  temperatureC: number;
  hourly: {
    time: string;
    speedKmh: number;
    directionDeg: number;
    temperatureC: number;
  }[];
  isLive: boolean;
}

export async function fetchWindData(lat: number = 28.6139, lng: number = 77.2090): Promise<WindData> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,wind_speed_10m,wind_direction_10m&forecast_days=3`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json() as any;
      const current = data.current || {};
      const hourly = data.hourly || { time: [], wind_speed_10m: [], wind_direction_10m: [], temperature_2m: [] };

      const hourlyList = (hourly.time || []).slice(0, 48).map((t: string, i: number) => ({
        time: t,
        speedKmh: hourly.wind_speed_10m?.[i] ?? 12,
        directionDeg: hourly.wind_direction_10m?.[i] ?? 290, // typical northwest winter wind in Delhi
        temperatureC: hourly.temperature_2m?.[i] ?? 18
      }));

      return {
        speedKmh: current.wind_speed_10m ?? 11.5,
        directionDeg: current.wind_direction_10m ?? 295,
        temperatureC: current.temperature_2m ?? 19.2,
        hourly: hourlyList,
        isLive: true
      };
    }
  } catch (err: any) {
    // Fallback if network blocked
  }

  // Fallback realistic Indo-Gangetic winter advection meteorology
  const fallbackHourly = [];
  const now = Date.now();
  for (let h = 0; h < 48; h++) {
    const t = new Date(now + h * 3600 * 1000).toISOString();
    fallbackHourly.push({
      time: t,
      speedKmh: 9 + 4 * Math.sin((h / 12) * Math.PI),
      directionDeg: (290 + 15 * Math.sin(h / 6)) % 360, // prevailing North-Westerly plume transit
      temperatureC: 16 + 8 * Math.sin(((h - 6) / 24) * 2 * Math.PI)
    });
  }

  return {
    speedKmh: 10.4,
    directionDeg: 295, // NW
    temperatureC: 19.5,
    hourly: fallbackHourly,
    isLive: false
  };
}
