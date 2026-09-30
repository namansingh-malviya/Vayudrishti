-- Vayu Database Schema (SQLite compatible, modular SQL for easy PostgreSQL/PostGIS migration)

CREATE TABLE IF NOT EXISTS cities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  config_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS stations (
  id TEXT PRIMARY KEY,
  city_id TEXT NOT NULL,
  name TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  source TEXT NOT NULL,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  station_id TEXT NOT NULL,
  ts TEXT NOT NULL,
  pm25 REAL NOT NULL,
  pm10 REAL NOT NULL,
  FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  category TEXT NOT NULL,
  photo_path TEXT NOT NULL,
  ai_label TEXT NOT NULL,
  ai_confidence REAL NOT NULL,
  trust_score REAL NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hotspots (
  id TEXT PRIMARY KEY,
  city_id TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  ts TEXT NOT NULL,
  fused_pm25 REAL NOT NULL,
  station_est_pm25 REAL NOT NULL,
  gap REAL NOT NULL,
  confidence REAL NOT NULL,
  likely_source TEXT NOT NULL,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  hotspot_id TEXT NOT NULL,
  owner TEXT NOT NULL,
  authority TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('open', 'assigned', 'in_progress', 'closed')),
  due_at TEXT NOT NULL,
  closure_photo TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (hotspot_id) REFERENCES hotspots(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS case_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id TEXT NOT NULL,
  type TEXT NOT NULL,
  note TEXT NOT NULL,
  ts TEXT NOT NULL,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS routing_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_type TEXT NOT NULL UNIQUE,
  authority TEXT NOT NULL,
  action TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS fed_rounds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  round INTEGER NOT NULL,
  city_id TEXT NOT NULL,
  local_mae REAL NOT NULL,
  global_mae REAL NOT NULL,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_stations_city ON stations(city_id);
CREATE INDEX IF NOT EXISTS idx_readings_station ON readings(station_id, ts);
CREATE INDEX IF NOT EXISTS idx_hotspots_city ON hotspots(city_id, ts);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_case_events_case ON case_events(case_id);
CREATE INDEX IF NOT EXISTS idx_fed_rounds_round ON fed_rounds(round);
