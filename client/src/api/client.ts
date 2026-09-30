import { 
  City, 
  Station, 
  Hotspot, 
  Case, 
  Report, 
  FieldGridResponse, 
  ForecastResponse, 
  SourceTransparencyItem 
} from '@shared/types';

const API_BASE = '/api';

export async function fetchCities(): Promise<City[]> {
  const res = await fetch(`${API_BASE}/cities`);
  if (!res.ok) throw new Error('Failed to fetch cities');
  return res.json();
}

export async function addCity(cityData: {
  id: string;
  name: string;
  lat: number;
  lng: number;
  config?: any;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/cities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cityData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to add city');
  }
  return res.json();
}

export async function fetchStations(cityId = 'delhi-ncr'): Promise<{ stations: Station[]; is_live_source: boolean }> {
  const res = await fetch(`${API_BASE}/stations?city=${cityId}`);
  if (!res.ok) throw new Error('Failed to fetch stations');
  return res.json();
}

export async function fetchFieldGrid(cityId = 'delhi-ncr', mode: 'stations' | 'fused' = 'fused', timestamp?: string): Promise<FieldGridResponse> {
  const url = `${API_BASE}/field?city=${cityId}&mode=${mode}${timestamp ? `&t=${encodeURIComponent(timestamp)}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch field grid');
  return res.json();
}

export async function fetchHotspots(cityId = 'delhi-ncr'): Promise<{ hotspots: Hotspot[] }> {
  const res = await fetch(`${API_BASE}/hotspots?city=${cityId}`);
  if (!res.ok) throw new Error('Failed to fetch hotspots');
  return res.json();
}

export async function fetchForecast(lat: number, lng: number, currentPm25?: number): Promise<ForecastResponse> {
  let url = `${API_BASE}/forecast?lat=${lat}&lng=${lng}`;
  if (currentPm25 !== undefined) {
    url += `&current_pm25=${currentPm25}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch forecast');
  return res.json();
}

export async function fetchReports(): Promise<{ reports: Report[] }> {
  const res = await fetch(`${API_BASE}/reports`);
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function submitReport(formData: FormData): Promise<any> {
  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to submit citizen report');
  }
  return res.json();
}

export async function fetchCases(): Promise<{ cases: Case[] }> {
  const res = await fetch(`${API_BASE}/cases`);
  if (!res.ok) throw new Error('Failed to fetch cases');
  return res.json();
}

export async function createCase(data: { hotspot_id: string; owner?: string; authority?: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create case');
  }
  return res.json();
}

export async function updateCase(id: string, data: { status?: string; owner?: string; authority?: string; note?: string }): Promise<any> {
  const res = await fetch(`${API_BASE}/cases/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update case');
  }
  return res.json();
}

export async function closeCaseWithPhoto(id: string, formData: FormData): Promise<any> {
  const res = await fetch(`${API_BASE}/cases/${id}/close`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to close case with photo evidence');
  }
  return res.json();
}

export async function fetchFederationHistory(): Promise<any> {
  const res = await fetch(`${API_BASE}/federation/history`);
  if (!res.ok) throw new Error('Failed to fetch federation history');
  return res.json();
}

export async function runFederationRound(): Promise<any> {
  const res = await fetch(`${API_BASE}/federation/round`, {
    method: 'POST'
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to run federated training round');
  }
  return res.json();
}

export async function fetchSources(): Promise<{ sources: SourceTransparencyItem[]; scientific_limits: string[] }> {
  const res = await fetch(`${API_BASE}/sources`);
  if (!res.ok) throw new Error('Failed to fetch sources');
  return res.json();
}
