import { Router } from 'express';
import { db } from '../db/database.js';
import { haversineDistanceKm } from '../services/idw.js';

export const hotspotsRouter = Router();

// GET /api/hotspots?city=delhi-ncr
hotspotsRouter.get('/', (req, res) => {
  try {
    const cityId = (req.query.city as string) || 'delhi-ncr';

    const hotspots = db.query<any>(`
      SELECT 
        h.*,
        c.id as case_id,
        c.status as case_status,
        c.owner as case_owner,
        c.authority as case_authority,
        c.due_at as case_due_at
      FROM hotspots h
      LEFT JOIN cases c ON h.id = c.hotspot_id
      WHERE h.city_id = ?
    `, [cityId]);

    // Find nearest station for each hotspot to show why it's a blindspot
    const stations = db.query<any>('SELECT id, name, lat, lng FROM stations WHERE city_id = ?', [cityId]);

    const enriched = hotspots.map(hs => {
      let nearestName = 'Monitoring Station';
      let minDist = 9999;

      for (const st of stations) {
        const d = haversineDistanceKm(hs.lat, hs.lng, st.lat, st.lng);
        if (d < minDist) {
          minDist = d;
          nearestName = st.name;
        }
      }

      return {
        ...hs,
        nearest_station_name: nearestName,
        nearest_station_dist_km: Number(minDist.toFixed(1)),
        is_simulated: true // Honest badge requirement
      };
    });

    res.json({
      city_id: cityId,
      count: enriched.length,
      hotspots: enriched
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});
