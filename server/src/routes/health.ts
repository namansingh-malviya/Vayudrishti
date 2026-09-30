import { Router } from 'express';
import { db } from '../db/database.js';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  try {
    const citiesCount = db.queryOne<{ count: number }>('SELECT count(*) as count FROM cities')?.count || 0;
    const stationsCount = db.queryOne<{ count: number }>('SELECT count(*) as count FROM stations')?.count || 0;
    const hotspotsCount = db.queryOne<{ count: number }>('SELECT count(*) as count FROM hotspots')?.count || 0;
    const casesCount = db.queryOne<{ count: number }>('SELECT count(*) as count FROM cases')?.count || 0;

    res.json({
      status: 'ok',
      service: 'Vayu Clean Air & Enforcement Engine',
      version: '1.0.0',
      uptime_seconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        type: 'SQLite (Modular Storage Layer)',
        counts: {
          cities: citiesCount,
          stations: stationsCount,
          hotspots: hotspotsCount,
          cases: casesCount
        }
      }
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: 'Database check failed',
      error: err?.message
    });
  }
});
