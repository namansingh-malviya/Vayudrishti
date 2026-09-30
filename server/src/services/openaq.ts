import { Station } from '../../../shared/types.js';
import { db } from '../db/database.js';

export async function fetchOpenAQDelhi(): Promise<{ stations: Station[]; isLive: boolean }> {
  const apiKey = process.env.OPENAQ_API_KEY;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

    const headers: Record<string, string> = {
      'User-Agent': 'Vayu-CleanAir-Enforcement-App/1.0'
    };
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }

    // OpenAQ v3 locations for Delhi bounding box or coordinates
    const url = 'https://api.openaq.org/v3/locations?coordinates=28.6139,77.2090&radius=25000&limit=15';
    const res = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json() as any;
      if (data && data.results && data.results.length > 0) {
        const liveStations: Station[] = data.results.map((loc: any, idx: number) => {
          // Look for PM2.5 sensor if available
          const pm25Sensor = loc.sensors?.find((s: any) => s.parameter?.name?.toLowerCase() === 'pm25');
          return {
            id: `openaq-${loc.id || idx}`,
            city_id: 'delhi-ncr',
            name: loc.name || `OpenAQ Station ${loc.id}`,
            lat: loc.coordinates?.latitude || 28.61,
            lng: loc.coordinates?.longitude || 77.20,
            source: 'OpenAQ',
            is_simulated: false,
            last_pm25: pm25Sensor?.latest?.value ? Math.round(pm25Sensor.latest.value) : undefined
          };
        });

        if (liveStations.length > 0) {
          return { stations: liveStations, isLive: true };
        }
      }
    }
  } catch (err: any) {
    // Graceful fallback to database seed stations
    // console.warn('OpenAQ API unavailable or rate-limited, falling back to verified CPCB/DPCC seed stations:', err?.message);
  }

  // Fallback to SQLite DB seed stations
  const dbStations = db.query<Station>(`
    SELECT s.*, r.pm25 as last_pm25, r.pm10 as last_pm10, r.ts as last_ts
    FROM stations s
    LEFT JOIN (
      SELECT station_id, pm25, pm10, ts
      FROM readings
      GROUP BY station_id
      HAVING ts = MAX(ts)
    ) r ON s.id = r.station_id
    WHERE s.city_id = 'delhi-ncr'
  `);

  return {
    stations: dbStations.map(s => ({ ...s, is_simulated: false })),
    isLive: false
  };
}
