import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/database.js';
import { City } from '../../../shared/types.js';

export const citiesRouter = Router();

const AddCitySchema = z.object({
  id: z.string().min(2).max(30),
  name: z.string().min(2).max(50),
  lat: z.number().min(8).max(37),
  lng: z.number().min(68).max(97),
  config_json: z.string().optional(),
  config: z.object({
    zoom: z.number().default(12),
    bounds: z.object({
      minLat: z.number(),
      maxLat: z.number(),
      minLng: z.number(),
      maxLng: z.number()
    }),
    gridResolution: z.number().default(0.025),
    state: z.string().default('India')
  }).optional()
});

// GET /api/cities
citiesRouter.get('/', (_req, res) => {
  try {
    const rawCities = db.query<City>('SELECT * FROM cities ORDER BY id ASC');
    const cities = rawCities.map(c => {
      let config = {};
      try {
        config = JSON.parse(c.config_json);
      } catch (e) {}
      return {
        ...c,
        config
      };
    });
    res.json(cities);
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// POST /api/cities (adds a city from config JSON, zero code change)
citiesRouter.post('/', (req, res) => {
  try {
    const parsed = AddCitySchema.parse(req.body);

    // Prepare config_json string
    let configStr = parsed.config_json;
    if (!configStr && parsed.config) {
      configStr = JSON.stringify(parsed.config);
    } else if (!configStr) {
      configStr = JSON.stringify({
        zoom: 12,
        bounds: {
          minLat: parsed.lat - 0.1,
          maxLat: parsed.lat + 0.1,
          minLng: parsed.lng - 0.1,
          maxLng: parsed.lng + 0.1
        },
        gridResolution: 0.025,
        state: 'India'
      });
    }

    // Check if city already exists
    const existing = db.queryOne('SELECT id FROM cities WHERE id = ?', [parsed.id]);
    if (existing) {
      return res.status(409).json({ error: `City with id '${parsed.id}' already exists.` });
    }

    // Insert city
    db.execute(
      'INSERT INTO cities (id, name, lat, lng, config_json) VALUES (?, ?, ?, ?, ?)',
      [parsed.id, parsed.name, parsed.lat, parsed.lng, configStr]
    );

    // Create 2 initial simulated monitoring stations for the new city
    const now = new Date().toISOString();
    const st1Id = `${parsed.id}-st-01`;
    const st2Id = `${parsed.id}-st-02`;

    db.execute(
      'INSERT INTO stations (id, city_id, name, lat, lng, source) VALUES (?, ?, ?, ?, ?, ?)',
      [st1Id, parsed.id, `${parsed.name} Central Observatory`, parsed.lat + 0.01, parsed.lng + 0.01, 'Seed']
    );
    db.execute(
      'INSERT INTO readings (station_id, ts, pm25, pm10) VALUES (?, ?, ?, ?)',
      [st1Id, now, 185, 270]
    );

    db.execute(
      'INSERT INTO stations (id, city_id, name, lat, lng, source) VALUES (?, ?, ?, ?, ?, ?)',
      [st2Id, parsed.id, `${parsed.name} Industrial Cluster`, parsed.lat - 0.02, parsed.lng - 0.02, 'Seed']
    );
    db.execute(
      'INSERT INTO readings (station_id, ts, pm25, pm10) VALUES (?, ?, ?, ?)',
      [st2Id, now, 235, 340]
    );

    // Create a sample hotspot with an unmonitored gap
    const hsId = `hs-${parsed.id}-01`;
    db.execute(
      'INSERT INTO hotspots (id, city_id, lat, lng, ts, fused_pm25, station_est_pm25, gap, confidence, likely_source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [hsId, parsed.id, parsed.lat + 0.03, parsed.lng - 0.02, now, 320, 195, 125, 0.88, 'industrial']
    );

    // Initialize federated learning record
    db.execute(
      'INSERT INTO fed_rounds (round, city_id, local_mae, global_mae) VALUES (?, ?, ?, ?)',
      [1, parsed.id, 24.5, 22.0]
    );

    return res.status(201).json({
      message: `City '${parsed.name}' registered successfully with config`,
      city: {
        id: parsed.id,
        name: parsed.name,
        lat: parsed.lat,
        lng: parsed.lng,
        config: JSON.parse(configStr)
      }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: err.errors });
    }
    return res.status(500).json({ error: err?.message });
  }
});
