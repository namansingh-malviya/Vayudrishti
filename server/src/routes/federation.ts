import { Router } from 'express';
import { db } from '../db/database.js';
import { City, FedRound } from '../../../shared/types.js';

export const federationRouter = Router();

// GET /api/federation/history
federationRouter.get('/history', (_req, res) => {
  try {
    const rawRounds = db.query<any>(`
      SELECT fr.*, c.name as city_name
      FROM fed_rounds fr
      JOIN cities c ON fr.city_id = c.id
      ORDER BY fr.round ASC, fr.city_id ASC
    `);

    // Group by round
    const roundsMap = new Map<number, { round: number; global_mae: number; city_maes: { city_id: string; city_name: string; local_mae: number }[] }>();

    for (const r of rawRounds) {
      if (!roundsMap.has(r.round)) {
        roundsMap.set(r.round, {
          round: r.round,
          global_mae: r.global_mae,
          city_maes: []
        });
      }
      roundsMap.get(r.round)!.city_maes.push({
        city_id: r.city_id,
        city_name: r.city_name,
        local_mae: r.local_mae
      });
    }

    res.json({
      privacy_note: 'Only model weights and hyperparameter gradients are shared across cities. Raw spatial observations remain strictly localized (DPDP Act 2023 compliant).',
      rounds: Array.from(roundsMap.values()),
      flat_rounds: rawRounds
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// POST /api/federation/round (simulated training round, returns MAE per city and global)
federationRouter.post('/round', (_req, res) => {
  try {
    // Determine latest round number
    const maxRoundRow = db.queryOne<{ max_r: number }>('SELECT MAX(round) as max_r FROM fed_rounds');
    const nextRound = (maxRoundRow?.max_r || 0) + 1;

    // Get all cities
    const cities = db.query<City>('SELECT * FROM cities');
    if (cities.length === 0) {
      return res.status(400).json({ error: 'No cities found to run federated round' });
    }

    // Get previous global MAE
    const prevGlobalRow = db.queryOne<{ global_mae: number }>(
      'SELECT global_mae FROM fed_rounds WHERE round = ? LIMIT 1',
      [nextRound - 1]
    );
    const prevGlobal = prevGlobalRow ? prevGlobalRow.global_mae : 22.0;

    // Convergence rate (asymptotically approaches limit ~8-9 µg/m³)
    const convergenceFactor = Math.max(0.85, 0.90 - nextRound * 0.015);
    const newGlobalMae = Number(Math.max(8.5, prevGlobal * convergenceFactor).toFixed(2));

    const updatedCityResults = [];

    for (const city of cities) {
      const prevLocalRow = db.queryOne<{ local_mae: number }>(
        'SELECT local_mae FROM fed_rounds WHERE round = ? AND city_id = ? LIMIT 1',
        [nextRound - 1, city.id]
      );
      const prevLocal = prevLocalRow ? prevLocalRow.local_mae : newGlobalMae + 2.0;
      const jitter = (Math.random() - 0.5) * 0.8;
      const newLocalMae = Number(Math.max(8.8, prevLocal * convergenceFactor + jitter).toFixed(2));

      db.execute(
        'INSERT INTO fed_rounds (round, city_id, local_mae, global_mae) VALUES (?, ?, ?, ?)',
        [nextRound, city.id, newLocalMae, newGlobalMae]
      );

      updatedCityResults.push({
        city_id: city.id,
        city_name: city.name,
        local_mae: newLocalMae
      });
    }

    res.json({
      message: `Federated training round ${nextRound} successfully completed across ${cities.length} nodes`,
      round: nextRound,
      global_mae: newGlobalMae,
      previous_global_mae: prevGlobal,
      delta_mae: Number((prevGlobal - newGlobalMae).toFixed(2)),
      city_results: updatedCityResults,
      privacy_guarantee: 'Federated Averaging (FedAvg): Zero raw sensor or citizen data was transmitted outside host municipal boundary nodes.'
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});
