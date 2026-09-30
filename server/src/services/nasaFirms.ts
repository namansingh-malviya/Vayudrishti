export interface ThermalAnomaly {
  id: string;
  lat: number;
  lng: number;
  brightness: number;
  confidence: 'nominal' | 'high' | 'low';
  acq_time: string;
  source: 'NASA-VIIRS' | 'Simulated-VIIRS';
  is_simulated: boolean;
}

export async function fetchFirmsFires(bounds = { minLat: 28.3, maxLat: 29.0, minLng: 76.7, maxLng: 77.6 }): Promise<{ fires: ThermalAnomaly[]; isLive: boolean }> {
  const mapKey = process.env.NASA_FIRMS_KEY;

  if (mapKey) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      // NASA FIRMS API format: https://firms.modaps.eosdis.nasa.gov/api/area/csv/[MAP_KEY]/VIIRS_SNPP_NRT/[BBOX]/1
      const bbox = `${bounds.minLng},${bounds.minLat},${bounds.maxLng},${bounds.maxLat}`;
      const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/VIIRS_SNPP_NRT/${bbox}/1`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const csvText = await res.text();
        const lines = csvText.trim().split('\n');
        if (lines.length > 1) {
          const headers = lines[0].split(',');
          const latIdx = headers.indexOf('latitude');
          const lngIdx = headers.indexOf('longitude');
          const brightIdx = headers.indexOf('bright_ti4');
          const confIdx = headers.indexOf('confidence');

          const liveFires: ThermalAnomaly[] = [];
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',');
            if (cols.length > latIdx && cols.length > lngIdx) {
              liveFires.push({
                id: `firms-${i}`,
                lat: parseFloat(cols[latIdx]),
                lng: parseFloat(cols[lngIdx]),
                brightness: brightIdx >= 0 ? parseFloat(cols[brightIdx]) : 330,
                confidence: confIdx >= 0 && cols[confIdx] === 'h' ? 'high' : 'nominal',
                acq_time: new Date().toISOString(),
                source: 'NASA-VIIRS',
                is_simulated: false
              });
            }
          }
          if (liveFires.length > 0) {
            return { fires: liveFires, isLive: true };
          }
        }
      }
    } catch (e) {
      // Fallback to simulated detections
    }
  }

  // Realistic thermal anomalies near Delhi-Haryana-UP borders (stubble patches & landfill thermal signatures)
  const simulatedFires: ThermalAnomaly[] = [
    {
      id: 'firms-sim-01',
      lat: 28.7418,
      lng: 77.1530,
      brightness: 348.5,
      confidence: 'high',
      acq_time: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      source: 'Simulated-VIIRS',
      is_simulated: true
    },
    {
      id: 'firms-sim-02',
      lat: 28.8415,
      lng: 77.0975,
      brightness: 332.0,
      confidence: 'nominal',
      acq_time: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      source: 'Simulated-VIIRS',
      is_simulated: true
    },
    {
      id: 'firms-sim-03',
      lat: 28.6238,
      lng: 77.3302,
      brightness: 341.2,
      confidence: 'high',
      acq_time: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
      source: 'Simulated-VIIRS',
      is_simulated: true
    }
  ];

  return { fires: simulatedFires, isLive: false };
}
