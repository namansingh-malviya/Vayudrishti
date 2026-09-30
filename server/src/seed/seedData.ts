import { City, Station, Reading, Report, Hotspot, Case, CaseEvent, RoutingRule, FedRound } from '../../../shared/types.js';

export const CITIES_SEED: City[] = [
  {
    id: 'delhi-ncr',
    name: 'Delhi NCR',
    lat: 28.6139,
    lng: 77.2090,
    config_json: JSON.stringify({
      zoom: 11,
      bounds: { minLat: 28.40, maxLat: 28.88, minLng: 76.85, maxLng: 77.45 },
      gridResolution: 0.02,
      state: 'National Capital Region',
      grap_stage: 3,
      airshed: 'Indo-Gangetic Plain'
    })
  },
  {
    id: 'kanpur',
    name: 'Kanpur',
    lat: 26.4499,
    lng: 80.3319,
    config_json: JSON.stringify({
      zoom: 12,
      bounds: { minLat: 26.35, maxLat: 26.55, minLng: 80.20, maxLng: 80.45 },
      gridResolution: 0.025,
      state: 'Uttar Pradesh',
      grap_stage: 2,
      airshed: 'Central Gangetic'
    })
  },
  {
    id: 'patna',
    name: 'Patna',
    lat: 25.5941,
    lng: 85.1376,
    config_json: JSON.stringify({
      zoom: 12,
      bounds: { minLat: 25.50, maxLat: 25.68, minLng: 85.00, maxLng: 85.25 },
      gridResolution: 0.025,
      state: 'Bihar',
      grap_stage: 2,
      airshed: 'Lower Gangetic'
    })
  }
];

export const ROUTING_RULES_SEED: { source_type: string; authority: string; action: string }[] = [
  {
    source_type: 'industrial',
    authority: 'Delhi Pollution Control Committee (DPCC) / CPCB Inspection Squad',
    action: 'Immediate physical stack inspection, thermal camera verification & issue closure notice under Air Act 1981 Section 31A'
  },
  {
    source_type: 'waste_burning',
    authority: 'Municipal Corporation of Delhi (MCD) / Sub-Divisional Magistrate (SDM)',
    action: 'Dispatch emergency rapid flying squad, douse fire with water-mist cannon, file FIR & levy ₹25,000 NGT environmental penalty'
  },
  {
    source_type: 'stubble',
    authority: 'District Agricultural Enforcement Directorate & Revenue Dept',
    action: 'Targeted field patrol deployment, farm nodal officer alert, satellite thermal track log'
  },
  {
    source_type: 'vehicular_corridor',
    authority: 'Delhi Traffic Police & State Transport Department',
    action: 'Divert non-destined commercial diesel freight to Western Peripheral Expressway and check PUC automated ANPR logs'
  },
  {
    source_type: 'construction_dust',
    authority: 'MCD Building Assessment Wing & PWD Engineering Team',
    action: 'Issue 24-hr remediation order, verify continuous perimeter misting sprayers & seal site if wind barriers are absent'
  }
];

export const STATIONS_SEED: Station[] = [
  {
    id: 'del-anand-vihar',
    city_id: 'delhi-ncr',
    name: 'Anand Vihar, Delhi - DPCC',
    lat: 28.6473,
    lng: 77.3160,
    source: 'DPCC'
  },
  {
    id: 'del-punjabi-bagh',
    city_id: 'delhi-ncr',
    name: 'Punjabi Bagh, Delhi - DPCC',
    lat: 28.6740,
    lng: 77.1311,
    source: 'DPCC'
  },
  {
    id: 'del-rk-puram',
    city_id: 'delhi-ncr',
    name: 'R K Puram, Delhi - DPCC',
    lat: 28.5632,
    lng: 77.1869,
    source: 'DPCC'
  },
  {
    id: 'del-jahangirpuri',
    city_id: 'delhi-ncr',
    name: 'Jahangirpuri, Delhi - DPCC',
    lat: 28.7328,
    lng: 77.1706,
    source: 'DPCC'
  },
  {
    id: 'del-mandir-marg',
    city_id: 'delhi-ncr',
    name: 'Mandir Marg, Delhi - DPCC',
    lat: 28.6365,
    lng: 77.2011,
    source: 'DPCC'
  },
  {
    id: 'del-igi-airport',
    city_id: 'delhi-ncr',
    name: 'IGI Airport (T3), Delhi - IMD/CPCB',
    lat: 28.5626,
    lng: 77.1180,
    source: 'CPCB'
  },
  {
    id: 'del-okhla',
    city_id: 'delhi-ncr',
    name: 'Okhla Phase-2, Delhi - DPCC',
    lat: 28.5308,
    lng: 77.2713,
    source: 'DPCC'
  },
  {
    id: 'del-bawana',
    city_id: 'delhi-ncr',
    name: 'Bawana, Delhi - DPCC',
    lat: 28.7762,
    lng: 77.0511,
    source: 'DPCC'
  },
  {
    id: 'del-wazirpur',
    city_id: 'delhi-ncr',
    name: 'Wazirpur, Delhi - DPCC',
    lat: 28.6998,
    lng: 77.1654,
    source: 'DPCC'
  },
  {
    id: 'del-noida-sec62',
    city_id: 'delhi-ncr',
    name: 'Sector 62, Noida - UPPCB',
    lat: 28.6245,
    lng: 77.3648,
    source: 'OpenAQ'
  }
];

export const INITIAL_READINGS_SEED = [
  { station_id: 'del-anand-vihar', pm25: 342, pm10: 480 },
  { station_id: 'del-punjabi-bagh', pm25: 285, pm10: 390 },
  { station_id: 'del-rk-puram', pm25: 218, pm10: 310 },
  { station_id: 'del-jahangirpuri', pm25: 365, pm10: 495 },
  { station_id: 'del-mandir-marg', pm25: 185, pm10: 255 },
  { station_id: 'del-igi-airport', pm25: 205, pm10: 275 },
  { station_id: 'del-okhla', pm25: 310, pm10: 420 },
  { station_id: 'del-bawana', pm25: 388, pm10: 512 },
  { station_id: 'del-wazirpur', pm25: 355, pm10: 460 },
  { station_id: 'del-noida-sec62', pm25: 260, pm10: 340 }
];

export const HOTSPOTS_SEED: Hotspot[] = [
  {
    id: 'hs-del-01',
    city_id: 'delhi-ncr',
    lat: 28.7412,
    lng: 77.1528,
    ts: new Date().toISOString(),
    fused_pm25: 428,
    station_est_pm25: 242,
    gap: 186,
    confidence: 0.94,
    likely_source: 'waste_burning'
  },
  {
    id: 'hs-del-02',
    city_id: 'delhi-ncr',
    lat: 28.6315,
    lng: 77.1142,
    ts: new Date().toISOString(),
    fused_pm25: 368,
    station_est_pm25: 228,
    gap: 140,
    confidence: 0.89,
    likely_source: 'industrial'
  },
  {
    id: 'hs-del-03',
    city_id: 'delhi-ncr',
    lat: 28.6234,
    lng: 77.3298,
    ts: new Date().toISOString(),
    fused_pm25: 395,
    station_est_pm25: 255,
    gap: 140,
    confidence: 0.92,
    likely_source: 'waste_burning'
  },
  {
    id: 'hs-del-04',
    city_id: 'delhi-ncr',
    lat: 28.5721,
    lng: 77.0345,
    ts: new Date().toISOString(),
    fused_pm25: 310,
    station_est_pm25: 205,
    gap: 105,
    confidence: 0.85,
    likely_source: 'construction_dust'
  },
  {
    id: 'hs-del-05',
    city_id: 'delhi-ncr',
    lat: 28.8410,
    lng: 77.0980,
    ts: new Date().toISOString(),
    fused_pm25: 445,
    station_est_pm25: 275,
    gap: 170,
    confidence: 0.96,
    likely_source: 'industrial'
  }
];

export const CASES_SEED: { case: Case; events: { type: any; note: string; offsetHours: number }[] }[] = [
  {
    case: {
      id: 'CASE-2026-DEL-001',
      hotspot_id: 'hs-del-01',
      owner: 'Amit Sharma (SDM Civil Lines / MCD Nodal)',
      authority: 'Municipal Corporation of Delhi (MCD)',
      status: 'open',
      due_at: new Date(Date.now() + 22 * 3600 * 1000).toISOString(),
      closure_photo: null,
      created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    },
    events: [
      {
        type: 'created',
        note: 'Hotspot anomaly detected (+186 µg/m³ gap over IDW station background). Automated case created and routed to MCD Flying Squad.',
        offsetHours: 2
      }
    ]
  },
  {
    case: {
      id: 'CASE-2026-DEL-002',
      hotspot_id: 'hs-del-02',
      owner: 'Dr. K. S. Rathore (DPCC Regional Flying Officer)',
      authority: 'Delhi Pollution Control Committee (DPCC)',
      status: 'assigned',
      due_at: new Date(Date.now() + 16 * 3600 * 1000).toISOString(),
      closure_photo: null,
      created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString()
    },
    events: [
      {
        type: 'created',
        note: 'High aerosol optical density detected over Mayapuri Industrial Phase-2 smelting corridor.',
        offsetHours: 8
      },
      {
        type: 'assigned',
        note: 'Assigned to Dr. K.S. Rathore for stack opacity verification and nocturnal furnace audit.',
        offsetHours: 6
      }
    ]
  },
  {
    case: {
      id: 'CASE-2026-DEL-003',
      hotspot_id: 'hs-del-03',
      owner: 'V. K. Tyagi (Executive Magistrate East)',
      authority: 'District Administration & MCD East',
      status: 'in_progress',
      due_at: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
      closure_photo: null,
      created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString()
    },
    events: [
      {
        type: 'created',
        note: 'Severe plume flagged at border transshipment corridor (+140 µg/m³ gap).',
        offsetHours: 14
      },
      {
        type: 'assigned',
        note: 'Assigned to East District enforcement wing.',
        offsetHours: 12
      },
      {
        type: 'inspection',
        note: 'Water bowsers dispatched on site. Smoldering open biomass patch being doused.',
        offsetHours: 3
      }
    ]
  },
  {
    case: {
      id: 'CASE-2026-DEL-004',
      hotspot_id: 'hs-del-04',
      owner: 'Sunita Roy (PWD Environmental Compliance)',
      authority: 'MCD Building Assessment Wing & PWD',
      status: 'closed',
      due_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
      closure_photo: '/uploads/dwarka-site-mitigation.jpg',
      created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString()
    },
    events: [
      {
        type: 'created',
        note: 'Unregulated excavation dust plume reported in Dwarka Sector 24.',
        offsetHours: 28
      },
      {
        type: 'assigned',
        note: 'Assigned to PWD Environmental Compliance officer Sunita Roy.',
        offsetHours: 24
      },
      {
        type: 'inspection',
        note: 'Site inspection conducted. Anti-smog gun activated and 10-meter wind-breaking green nets installed.',
        offsetHours: 10
      },
      {
        type: 'closed',
        note: 'Verification photo uploaded showing continuous water fogging and dust suppression in place. Hotspot resolved.',
        offsetHours: 4
      }
    ]
  }
];

export const REPORTS_SEED: Report[] = [
  {
    id: 'rep-del-01',
    lat: 28.7420,
    lng: 77.1510,
    category: 'garbage_burning',
    photo_path: '/uploads/bhalaswa-smoke-sample.jpg',
    ai_label: 'Open Garbage & Polymer Combustion Plume',
    ai_confidence: 0.93,
    trust_score: 0.88,
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    address: 'Near Bhalaswa Drain, Mukarba Chowk bypass, Delhi'
  },
  {
    id: 'rep-del-02',
    lat: 28.5710,
    lng: 77.0350,
    category: 'construction',
    photo_path: '/uploads/dwarka-site-mitigation.jpg',
    ai_label: 'Uncovered Aggregate Sand Pile & Fine Particulate Suspension',
    ai_confidence: 0.87,
    trust_score: 0.91,
    created_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    address: 'Sector 24, Dwarka Expressway Link, Delhi'
  },
  {
    id: 'rep-del-03',
    lat: 28.6300,
    lng: 77.1150,
    category: 'industrial_plume',
    photo_path: '/uploads/mayapuri-chimney.jpg',
    ai_label: 'Dense Dark Stack Exhaust (Particulate Matter > Ringelmann 3)',
    ai_confidence: 0.91,
    trust_score: 0.85,
    created_at: new Date(Date.now() - 7 * 3600 * 1000).toISOString(),
    address: 'Mayapuri Industrial Area Phase-2, New Delhi'
  }
];

export const FED_ROUNDS_SEED: FedRound[] = [
  { id: 1, round: 1, city_id: 'delhi-ncr', local_mae: 28.4, global_mae: 26.2 },
  { id: 2, round: 1, city_id: 'kanpur', local_mae: 29.8, global_mae: 26.2 },
  { id: 3, round: 1, city_id: 'patna', local_mae: 31.1, global_mae: 26.2 },
  { id: 4, round: 2, city_id: 'delhi-ncr', local_mae: 22.1, global_mae: 20.8 },
  { id: 5, round: 2, city_id: 'kanpur', local_mae: 23.5, global_mae: 20.8 },
  { id: 6, round: 2, city_id: 'patna', local_mae: 24.2, global_mae: 20.8 },
  { id: 7, round: 3, city_id: 'delhi-ncr', local_mae: 17.6, global_mae: 16.4 },
  { id: 8, round: 3, city_id: 'kanpur', local_mae: 18.2, global_mae: 16.4 },
  { id: 9, round: 3, city_id: 'patna', local_mae: 19.0, global_mae: 16.4 },
  { id: 10, round: 4, city_id: 'delhi-ncr', local_mae: 13.9, global_mae: 12.8 },
  { id: 11, round: 4, city_id: 'kanpur', local_mae: 14.1, global_mae: 12.8 },
  { id: 12, round: 4, city_id: 'patna', local_mae: 14.6, global_mae: 12.8 }
];
