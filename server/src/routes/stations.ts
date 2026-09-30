import { Router } from 'express';
import { db } from '../db/database.js';
import { Station } from '../../../shared/types.js';
import { fetchOpenAQDelhi } from '../services/openaq.js';

export const stationsRouter = Router();

// GET /api/stations?city=delhi-ncr
stationsRouter.get('/', async (req, res) => {
  try {
    const cityId = (req.query.city as string) || 'delhi-ncr';

    // If Delhi NCR, optionally incorporate live OpenAQ signals
    let liveOpenAQStations: Station[] = [];
    let isLiveOpenAQ = false;
    if (cityId === 'delhi-ncr' && req.query.live === 'true') {
      const openaqResult = await fetchOpenAQDelhi();
      liveOpenAQStations = openaqResult.stations;
      isLiveOpenAQ = openaqResult.isLive;
    }

    const stations = db.query<any>(`
      SELECT s.*, r.pm25 as last_pm25, r.pm10 as last_pm10, r.ts as last_ts
      FROM stations s
      LEFT JOIN (
        SELECT station_id, pm25, pm10, ts
        FROM readings
        GROUP BY station_id
        HAVING ts = MAX(ts)
      ) r ON s.id = r.station_id
      WHERE s.city_id = ?
    `, [cityId]);

    // Format stations
    const result = stations.map(s => ({
      ...s,
      is_simulated: s.source === 'Seed' || cityId !== 'delhi-ncr',
      status: 'active'
    }));

    res.json({
      city_id: cityId,
      count: result.length,
      is_live_source: isLiveOpenAQ,
      stations: result
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});
