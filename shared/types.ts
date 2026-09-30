export type CaseStatus = 'open' | 'assigned' | 'in_progress' | 'closed';

export type ReportCategory = 
  | 'garbage_burning'
  | 'industrial_plume'
  | 'road_dust'
  | 'construction'
  | 'biomass'
  | 'other';

export type HotspotSource = 
  | 'industrial'
  | 'waste_burning'
  | 'stubble'
  | 'vehicular_corridor'
  | 'construction_dust';

export interface CityConfig {
  zoom: number;
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  gridResolution: number;
  state: string;
}

export interface City {
  id: string;
  name: string;
  lat: number;
  lng: number;
  config_json: string;
  config?: CityConfig;
}

export interface Station {
  id: string;
  city_id: string;
  name: string;
  lat: number;
  lng: number;
  source: 'OpenAQ' | 'CPCB' | 'DPCC' | 'Seed';
  last_pm25?: number;
  last_pm10?: number;
  last_ts?: string;
  is_simulated?: boolean;
}

export interface Reading {
  id: number;
  station_id: string;
  ts: string;
  pm25: number;
  pm10: number;
}

export interface Report {
  id: string;
  lat: number;
  lng: number;
  category: ReportCategory;
  photo_path: string;
  ai_label: string;
  ai_confidence: number;
  trust_score: number;
  created_at: string;
  address?: string;
  is_simulated?: boolean;
}

export interface Hotspot {
  id: string;
  city_id: string;
  lat: number;
  lng: number;
  ts: string;
  fused_pm25: number;
  station_est_pm25: number;
  gap: number;
  confidence: number;
  likely_source: HotspotSource;
  case_id?: string | null;
  case_status?: CaseStatus | null;
  nearest_station_name?: string;
  nearest_station_dist_km?: number;
  is_simulated?: boolean;
}

export interface Case {
  id: string;
  hotspot_id: string;
  owner: string;
  authority: string;
  status: CaseStatus;
  due_at: string;
  closure_photo: string | null;
  created_at: string;
  hotspot?: Hotspot;
  events?: CaseEvent[];
}

export interface CaseEvent {
  id: number;
  case_id: string;
  type: 'created' | 'assigned' | 'status_change' | 'inspection' | 'closed' | 'escalated';
  note: string;
  ts: string;
}

export interface RoutingRule {
  id: number;
  source_type: string;
  authority: string;
  action: string;
}

export interface FedRound {
  id: number;
  round: number;
  city_id: string;
  local_mae: number;
  global_mae: number;
  city_name?: string;
}

export interface GridPoint {
  lat: number;
  lng: number;
  pm25: number;
  aqi: number;
  category: string;
  is_hotspot?: boolean;
}

export interface FieldGridResponse {
  city_id: string;
  mode: 'stations' | 'fused';
  timestamp: string;
  is_simulated_layer: boolean;
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  grid: GridPoint[];
}

export interface ForecastPoint {
  ts: string;
  hour_offset: number;
  pm25_pred: number;
  pm25_lower: number;
  pm25_upper: number;
  wind_speed_kmh: number;
  wind_direction_deg: number;
  diurnal_factor: number;
  grap_stage: 1 | 2 | 3 | 4;
}

export interface ForecastResponse {
  lat: number;
  lng: number;
  current_pm25: number;
  model_mae: number;
  persistence_mae: number;
  formula_description: string;
  hourly: ForecastPoint[];
}

export interface SourceTransparencyItem {
  id: string;
  name: string;
  status: 'Live Real-Time' | 'Simulated / Hybrid' | 'Simulated';
  provider: string;
  frequency: string;
  parameters: string[];
  honesty_notes: string;
  license: string;
}
