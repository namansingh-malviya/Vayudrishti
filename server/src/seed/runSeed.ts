import fs from 'fs';
import path from 'path';
import { db } from '../db/database.js';
import {
  CITIES_SEED,
  ROUTING_RULES_SEED,
  STATIONS_SEED,
  INITIAL_READINGS_SEED,
  HOTSPOTS_SEED,
  CASES_SEED,
  REPORTS_SEED,
  FED_ROUNDS_SEED
} from './seedData.js';

export function runSeed() {
  console.log('🌱 Starting Vayu database seeding...');

  // Ensure uploads directory exists
  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Create sample image files in uploads directory so they render properly
  const sampleImages = [
    'bhalaswa-smoke-sample.jpg',
    'dwarka-site-mitigation.jpg',
    'mayapuri-chimney.jpg',
    'sample-closure-inspection.jpg'
  ];

  for (const img of sampleImages) {
    const filePath = path.join(uploadsDir, img);
    if (!fs.existsSync(filePath)) {
      // Create a neat SVG representation saved as placeholder
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
        <rect width="600" height="400" fill="#12262B"/>
        <circle cx="300" cy="200" r="120" fill="#1B6B8A" opacity="0.3"/>
        <text x="300" y="190" font-family="sans-serif" font-size="20" font-weight="bold" fill="#EEF2F1" text-anchor="middle">VAYU FIELD EVIDENCE</text>
        <text x="300" y="225" font-family="sans-serif" font-size="14" fill="#DDE5E4" text-anchor="middle">${img}</text>
        <text x="300" y="260" font-family="monospace" font-size="12" fill="#B3321E" text-anchor="middle">GPS Verified & AI Inspected</text>
      </svg>`;
      fs.writeFileSync(filePath, svg, 'utf8');
    }
  }

  // Clear existing records to ensure clean state
  db.exec('DELETE FROM case_events;');
  db.exec('DELETE FROM cases;');
  db.exec('DELETE FROM hotspots;');
  db.exec('DELETE FROM reports;');
  db.exec('DELETE FROM readings;');
  db.exec('DELETE FROM stations;');
  db.exec('DELETE FROM routing_rules;');
  db.exec('DELETE FROM fed_rounds;');
  db.exec('DELETE FROM cities;');

  // 1. Seed Cities
  for (const c of CITIES_SEED) {
    db.execute(
      'INSERT INTO cities (id, name, lat, lng, config_json) VALUES (?, ?, ?, ?, ?)',
      [c.id, c.name, c.lat, c.lng, c.config_json]
    );
  }
  console.log(`✓ Seeded ${CITIES_SEED.length} cities`);

  // 2. Seed Routing Rules
  for (const r of ROUTING_RULES_SEED) {
    db.execute(
      'INSERT INTO routing_rules (source_type, authority, action) VALUES (?, ?, ?)',
      [r.source_type, r.authority, r.action]
    );
  }
  console.log(`✓ Seeded ${ROUTING_RULES_SEED.length} routing rules`);

  // 3. Seed Stations
  for (const s of STATIONS_SEED) {
    db.execute(
      'INSERT INTO stations (id, city_id, name, lat, lng, source) VALUES (?, ?, ?, ?, ?, ?)',
      [s.id, s.city_id, s.name, s.lat, s.lng, s.source]
    );
  }
  console.log(`✓ Seeded ${STATIONS_SEED.length} stations`);

  // 4. Seed Readings (past 24 hours of readings per station)
  const now = Date.now();
  for (const r of INITIAL_READINGS_SEED) {
    for (let h = 0; h < 24; h++) {
      const ts = new Date(now - h * 3600 * 1000).toISOString();
      // Slight diurnal variation
      const diurnalFactor = 1 + 0.25 * Math.sin(((h + 6) / 24) * 2 * Math.PI);
      const pm25 = Math.round(r.pm25 * diurnalFactor + (Math.random() * 20 - 10));
      const pm10 = Math.round(r.pm10 * diurnalFactor + (Math.random() * 25 - 12));
      db.execute(
        'INSERT INTO readings (station_id, ts, pm25, pm10) VALUES (?, ?, ?, ?)',
        [r.station_id, ts, pm25, pm10]
      );
    }
  }
  console.log('✓ Seeded historical station readings (24h)');

  // 5. Seed Hotspots
  for (const hs of HOTSPOTS_SEED) {
    db.execute(
      'INSERT INTO hotspots (id, city_id, lat, lng, ts, fused_pm25, station_est_pm25, gap, confidence, likely_source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [hs.id, hs.city_id, hs.lat, hs.lng, hs.ts, hs.fused_pm25, hs.station_est_pm25, hs.gap, hs.confidence, hs.likely_source]
    );
  }
  console.log(`✓ Seeded ${HOTSPOTS_SEED.length} hotspots`);

  // 6. Seed Cases & Events
  for (const item of CASES_SEED) {
    const c = item.case;
    db.execute(
      'INSERT INTO cases (id, hotspot_id, owner, authority, status, due_at, closure_photo, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [c.id, c.hotspot_id, c.owner, c.authority, c.status, c.due_at, c.closure_photo, c.created_at]
    );

    for (const ev of item.events) {
      const evTs = new Date(now - ev.offsetHours * 3600 * 1000).toISOString();
      db.execute(
        'INSERT INTO case_events (case_id, type, note, ts) VALUES (?, ?, ?, ?)',
        [c.id, ev.type, ev.note, evTs]
      );
    }
  }
  console.log(`✓ Seeded ${CASES_SEED.length} cases with audit trail events`);

  // 7. Seed Reports
  for (const rep of REPORTS_SEED) {
    db.execute(
      'INSERT INTO reports (id, lat, lng, category, photo_path, ai_label, ai_confidence, trust_score, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [rep.id, rep.lat, rep.lng, rep.category, rep.photo_path, rep.ai_label, rep.ai_confidence, rep.trust_score, rep.created_at]
    );
  }
  console.log(`✓ Seeded ${REPORTS_SEED.length} citizen reports`);

  // 8. Seed Fed Rounds
  for (const fr of FED_ROUNDS_SEED) {
    db.execute(
      'INSERT INTO fed_rounds (round, city_id, local_mae, global_mae) VALUES (?, ?, ?, ?)',
      [fr.round, fr.city_id, fr.local_mae, fr.global_mae]
    );
  }
  console.log(`✓ Seeded ${FED_ROUNDS_SEED.length} federated learning rounds`);

  console.log('✅ Vayu database successfully seeded!');
}

// Allow direct execution
if (process.argv[1]?.includes('runSeed')) {
  runSeed();
}
