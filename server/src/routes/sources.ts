import { Router } from 'express';
import { SourceTransparencyItem } from '../../../shared/types.js';

export const sourcesRouter = Router();

// GET /api/sources
sourcesRouter.get('/', (_req, res) => {
  const sources: SourceTransparencyItem[] = [
    {
      id: 'openaq-cpcb',
      name: 'OpenAQ / CPCB / DPCC Continuous Monitoring',
      status: 'Live Real-Time',
      provider: 'OpenAQ Platform & Central Pollution Control Board (India)',
      frequency: 'Hourly telemetry refresh',
      parameters: ['PM2.5', 'PM10'],
      honesty_notes: 'Real official CAAQMS station telemetry for Delhi NCR. Automatically falls back to calibrated seed data if OpenAQ rate limits are hit or upstream API is unreachable.',
      license: 'Open Data Commons Public Domain (CC0 / ODbL)'
    },
    {
      id: 'open-meteo',
      name: 'Open-Meteo Planetary Boundary Layer Meteorology',
      status: 'Live Real-Time',
      provider: 'Open-Meteo Weather Model (ECMWF IFS / GFS)',
      frequency: 'Hourly updates, 48h lead forecast',
      parameters: ['10m Wind Speed', 'Wind Direction Vector', '2m Temperature'],
      honesty_notes: 'Live open meteorology without API keys used for explainable advection & ventilation modelling.',
      license: 'Open Meteo Non-Commercial / Attribution (CC-BY 4.0)'
    },
    {
      id: 'nasa-firms',
      name: 'NASA FIRMS VIIRS Active Fire Detections',
      status: 'Simulated / Hybrid',
      provider: 'NASA EOSDIS FIRMS (VIIRS 375m / MODIS 1km)',
      frequency: 'Daily satellite passes (12-hour latency)',
      parameters: ['Thermal Brightness (Kelvin)', 'Fire Radiative Power (MW)'],
      honesty_notes: 'When NASA_FIRMS_KEY is configured in .env, live VIIRS passes are fetched. Otherwise, calibrated thermal anomalies are simulated to demonstrate farm fire & landfill flare detection.',
      license: 'NASA Earth Science Open Data'
    },
    {
      id: 'sentinel5p-sim',
      name: 'Sentinel-5P TROPOMI Aerosol Background',
      status: 'Simulated',
      provider: 'Synthetic Aerosol Optical Depth (AOD) Grid Layer',
      frequency: 'Synthetic 15-minute spatial interpolation',
      parameters: ['Columnar AOD', 'Fused PM2.5 Surface Gap'],
      honesty_notes: 'Simulated! In production, Sentinel-5P provides daily overpasses at ~13:30 local solar time, but is cloud-blind during heavy overcast or fog. We badge this layer "Simulated" for transparency.',
      license: 'Copernicus Open Access / Synthetic'
    },
    {
      id: 'citizen-telemetry',
      name: 'Vayu Citizen Mobile Micro-Plume Reports',
      status: 'Simulated',
      provider: 'Decentralized Citizen Ground Reports with Client Blur',
      frequency: 'Event-driven real-time submissions',
      parameters: ['Geotagged Photo', 'Source Category', 'AI Confidence Score', 'Trust Score'],
      honesty_notes: 'Simulated crowdsourced input for demonstration. Camera upload includes client-side face/license plate obfuscation adhering to India Digital Personal Data Protection (DPDP) Act 2023.',
      license: 'Vayu Community Ground Truth'
    }
  ];

  res.json({
    framework: 'Vayu Scientific Transparency Disclosures',
    compliance: 'ISO 14044 & India DPDP Act 2023 Ethics Guidelines',
    total_sources: sources.length,
    sources,
    scientific_limits: [
      'Secondary aerosol precursors (SO2/NOx to ammonium sulfate/nitrate conversion) cannot be attributed to a single point stack solely via optical plumes.',
      'Satellite AOD represents total columnar atmospheric aerosol load and requires planetary boundary layer (PBL) height scaling to approximate ground-level breathing air.',
      'Optical camera AI classifications provide enforcement triage priority, NOT legal gravimetric regulatory compliance.'
    ]
  });
});
