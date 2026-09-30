import { Router } from 'express';
import { generateFieldGrid } from '../services/fusion.js';

export const fieldRouter = Router();

// GET /api/field?city=delhi-ncr&mode=fused
fieldRouter.get('/', (req, res) => {
  try {
    const cityId = (req.query.city as string) || 'delhi-ncr';
    const mode = (req.query.mode as string) === 'stations' ? 'stations' : 'fused';
    const timestamp = (req.query.t as string) || new Date().toISOString();

    const fieldData = generateFieldGrid(cityId, timestamp, mode);
    res.json(fieldData);
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});
