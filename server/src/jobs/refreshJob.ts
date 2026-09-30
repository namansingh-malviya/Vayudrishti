import cron from 'node-cron';
import { db } from '../db/database.js';
import { fetchOpenAQDelhi } from '../services/openaq.js';
import { fetchWindData } from '../services/openmeteo.js';

export async function runDataRefresh() {
  console.log('🔄 [Vayu Job] Running periodic data refresh...');
  const now = new Date().toISOString();

  try {
    // 1. Check OpenAQ
    const { stations, isLive } = await fetchOpenAQDelhi();
    console.log(`[Vayu Job] Retrieved ${stations.length} stations (isLive: ${isLive})`);

    // 2. Refresh wind
    const wind = await fetchWindData();
    console.log(`[Vayu Job] Refreshed wind vector: ${wind.speedKmh} km/h from ${wind.directionDeg}°`);

    // 3. Inject new readings for active stations
    const activeStations = db.query<{ id: string }>('SELECT id FROM stations WHERE city_id = "delhi-ncr"');
    for (const st of activeStations) {
      // Add slight natural fluctuations
      const latest = db.queryOne<{ pm25: number; pm10: number }>(
        'SELECT pm25, pm10 FROM readings WHERE station_id = ? ORDER BY id DESC LIMIT 1',
        [st.id]
      );
      const basePm25 = latest ? latest.pm25 : 240;
      const basePm10 = latest ? latest.pm10 : 340;

      const delta = Math.round((Math.random() - 0.5) * 15);
      const newPm25 = Math.max(30, basePm25 + delta);
      const newPm10 = Math.max(50, basePm10 + Math.round(delta * 1.3));

      db.execute(
        'INSERT INTO readings (station_id, ts, pm25, pm10) VALUES (?, ?, ?, ?)',
        [st.id, now, newPm25, newPm10]
      );
    }

    console.log('✅ [Vayu Job] Data refresh completed successfully');
  } catch (err: any) {
    console.error('❌ [Vayu Job] Data refresh error:', err?.message);
  }
}

export function startCronJobs() {
  // Run every 15 minutes
  cron.schedule('*/15 * * * *', () => {
    runDataRefresh();
  });
  console.log('⏱️  [Vayu Job] Scheduled 15-minute data refresh cron job');
}
