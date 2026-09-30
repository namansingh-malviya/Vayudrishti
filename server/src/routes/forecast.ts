import { Router } from 'express';
import { generateForecast } from '../services/forecastModel.js';
import { interpolateIDW } from '../services/idw.js';
import { db } from '../db/database.js';

export const forecastRouter = Router();

// GET /api/forecast?lat=28.7412&lng=77.1528&current_pm25=418
forecastRouter.get('/', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 28.6139;
    const lng = parseFloat(req.query.lng as string) || 77.2090;

    // If current_pm25 passed explicitly (e.g. from hotspot click), use it
    let currentPm25 = parseFloat(req.query.current_pm25 as string);

    if (isNaN(currentPm25)) {
      // Find nearby station baseline via IDW
      const stationReadings = db.query<any>(`
        SELECT s.lat, s.lng, r.pm25
        FROM stations s
        JOIN (
          SELECT station_id, pm25, ts
          FROM readings
          GROUP BY station_id
          HAVING ts = MAX(ts)
        ) r ON s.id = r.station_id
      `);
      currentPm25 = Math.round(interpolateIDW(lat, lng, stationReadings.map(s => ({ lat: s.lat, lng: s.lng, value: s.pm25 }))));
    }

    const forecast = await generateForecast(lat, lng, currentPm25);
    res.json(forecast);
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});
