import { db } from '../db/database.js';
import { FieldGridResponse, GridPoint, City, Hotspot } from '../../../shared/types.js';
import { interpolateIDW, haversineDistanceKm } from './idw.js';

export function calculateIndianAQI(pm25: number): { aqi: number; category: string } {
  // Indian CPCB PM2.5 AQI Breakpoints (24h avg µg/m³)
  // Good: 0-30 -> AQI 0-50
  // Satisfactory: 31-60 -> AQI 51-100
  // Moderate: 61-90 -> AQI 101-200
  // Poor: 91-120 -> AQI 201-300
  // Very Poor: 121-250 -> AQI 301-400
  // Severe: 250+ -> AQI 401-500
  if (pm25 <= 30) {
    const aqi = Math.round((pm25 / 30) * 50);
    return { aqi, category: 'Good' };
  } else if (pm25 <= 60) {
    const aqi = Math.round(50 + ((pm25 - 30) / 30) * 50);
    return { aqi, category: 'Satisfactory' };
  } else if (pm25 <= 90) {
    const aqi = Math.round(100 + ((pm25 - 60) / 30) * 100);
    return { aqi, category: 'Moderate' };
  } else if (pm25 <= 120) {
    const aqi = Math.round(200 + ((pm25 - 90) / 30) * 100);
    return { aqi, category: 'Poor' };
  } else if (pm25 <= 250) {
    const aqi = Math.round(300 + ((pm25 - 120) / 130) * 100);
    return { aqi, category: 'Very Poor' };
  } else {
    const aqi = Math.min(500, Math.round(400 + ((pm25 - 250) / 130) * 100));
    return { aqi, category: 'Severe' };
  }
}

export function generateFieldGrid(cityId: string, timestamp?: string, mode: 'stations' | 'fused' = 'fused'): FieldGridResponse {
  // Fetch city
  const city = db.queryOne<City>('SELECT * FROM cities WHERE id = ?', [cityId]) || db.queryOne<City>('SELECT * FROM cities LIMIT 1');
  if (!city) {
    throw new Error('City not found');
  }

  const config = JSON.parse(city.config_json);
  const bounds = config.bounds || { minLat: 28.40, maxLat: 28.88, minLng: 76.85, maxLng: 77.45 };
  const step = config.gridResolution || 0.03;

  // Fetch station readings
  const stationRows = db.query<any>(`
    SELECT s.lat, s.lng, r.pm25
    FROM stations s
    JOIN (
      SELECT station_id, pm25, ts
      FROM readings
      GROUP BY station_id
      HAVING ts = MAX(ts)
    ) r ON s.id = r.station_id
    WHERE s.city_id = ?
  `, [city.id]);

  const stationPoints = stationRows.map(r => ({
    lat: r.lat,
    lng: r.lng,
    value: r.pm25
  }));

  // Fetch active hotspots for city
  const hotspots = db.query<Hotspot>('SELECT * FROM hotspots WHERE city_id = ?', [city.id]);

  const grid: GridPoint[] = [];

  for (let lat = bounds.minLat; lat <= bounds.maxLat; lat += step) {
    for (let lng = bounds.minLng; lng <= bounds.maxLng; lng += step) {
      // 1. Station IDW baseline
      let basePm25 = interpolateIDW(lat, lng, stationPoints);

      let isHotspotPoint = false;

      // 2. If fused mode, overlay localized plume anomalies and satellite background
      if (mode === 'fused') {
        let plumeAddition = 0;

        for (const hs of hotspots) {
          const distKm = haversineDistanceKm(lat, lng, hs.lat, hs.lng);
          // Gaussian dispersion plume with ~2.5 km sigma
          if (distKm < 5.0) {
            const influence = Math.exp(-Math.pow(distKm, 2) / (2 * Math.pow(2.2, 2)));
            plumeAddition += hs.gap * influence;
            if (distKm < 2.0 && hs.gap > 80) {
              isHotspotPoint = true;
            }
          }
        }

        // Subtle regional background terrain variation (simulated micro-satellite optical depth)
        const terrainVariation = Math.sin(lat * 50) * Math.cos(lng * 50) * 8;
        basePm25 = Math.round(basePm25 + plumeAddition + terrainVariation);
      } else {
        basePm25 = Math.round(basePm25);
      }

      basePm25 = Math.max(15, basePm25);
      const { aqi, category } = calculateIndianAQI(basePm25);

      grid.push({
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        pm25: basePm25,
        aqi,
        category,
        is_hotspot: isHotspotPoint
      });
    }
  }

  return {
    city_id: city.id,
    mode,
    timestamp: timestamp || new Date().toISOString(),
    is_simulated_layer: mode === 'fused', // Honest badge requirement!
    bounds,
    grid
  };
}
