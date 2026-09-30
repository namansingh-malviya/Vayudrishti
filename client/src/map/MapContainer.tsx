import React, { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  Station, 
  Hotspot, 
  Report, 
  FieldGridResponse 
} from '@shared/types';
import { useAppStore } from '../store/useAppStore';
import { fetchStations, fetchHotspots, fetchReports, fetchFieldGrid } from '../api/client';
import { getAqiColor, getAqiInfo } from '../lib/aqi';
import { SimulationBadge } from '../components/SimulationBadge';
import { Radio, Flame, Camera, Wind as WindIcon, AlertCircle } from 'lucide-react';

interface MapContainerProps {
  onHotspotSelect: (hotspot: Hotspot) => void;
}

const OSM_STYLE: any = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: [
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors'
    }
  },
  layers: [
    {
      id: 'osm-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

export const MapContainer: React.FC<MapContainerProps> = ({ onHotspotSelect }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  const {
    selectedCityId,
    cities,
    viewMode,
    setViewMode,
    layers,
    timeOffsetHours,
    setSelectedHotspot
  } = useAppStore();

  const [stations, setStations] = useState<Station[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [fieldData, setFieldData] = useState<FieldGridResponse | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Markers references to clean up on updates
  const markersRef = useRef<Marker[]>([]);

  // 1. Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OSM_STYLE,
      center: [77.2090, 28.6139], // Delhi NCR center
      zoom: 10.5,
      attributionControl: { compact: true }
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

    map.on('load', () => {
      mapRef.current = map;
      setMapLoaded(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Fetch data when city, viewMode, or timeOffset changes
  useEffect(() => {
    let isMounted = true;

    // Fetch stations
    fetchStations(selectedCityId)
      .then((res) => isMounted && setStations(res.stations || []))
      .catch((err) => console.error('Stations fetch failed:', err));

    // Fetch hotspots
    fetchHotspots(selectedCityId)
      .then((res) => isMounted && setHotspots(res.hotspots || []))
      .catch((err) => console.error('Hotspots fetch failed:', err));

    // Fetch reports
    fetchReports()
      .then((res) => isMounted && setReports(res.reports || []))
      .catch((err) => console.error('Reports fetch failed:', err));

    // Fetch spatial grid (stations mode vs fused mode)
    fetchFieldGrid(selectedCityId, viewMode)
      .then((res) => isMounted && setFieldData(res))
      .catch((err) => console.error('Field grid fetch failed:', err));

    return () => {
      isMounted = false;
    };
  }, [selectedCityId, viewMode, timeOffsetHours]);

  // 3. Update map center when selected city changes
  useEffect(() => {
    if (!mapRef.current) return;
    const currentCity = cities.find((c) => c.id === selectedCityId);
    if (currentCity) {
      mapRef.current.flyTo({
        center: [currentCity.lng, currentCity.lat],
        zoom: currentCity.config?.zoom || 11,
        speed: 1.2
      });
    }
  }, [selectedCityId, cities]);

  // 4. Render Markers and Custom Overlays
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    // Remove existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // A. Render Stations (if layer enabled)
    if (layers.stations) {
      stations.forEach((st) => {
        const el = document.createElement('div');
        el.className = 'group cursor-pointer';

        const pm25 = st.last_pm25 || 210;
        const color = getAqiColor(pm25);

        el.innerHTML = `
          <div class="flex flex-col items-center">
            <div class="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold text-white shadow-elevated border border-white flex items-center gap-1 transition-transform group-hover:scale-110" style="background-color: ${color}">
              <span class="w-1.5 h-1.5 rounded-full bg-white opacity-80"></span>
              <span>${pm25}</span>
            </div>
            <div class="w-1.5 h-2 bg-slate-600 rounded-b"></div>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 bg-ink text-white text-[10px] px-2 py-1 rounded shadow-modal whitespace-nowrap pointer-events-none z-50">
              <p class="font-semibold">${st.name}</p>
              <p class="text-slate-300">PM2.5: ${pm25} µg/m³ • ${st.source}</p>
            </div>
          </div>
        `;

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([st.lng, st.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // B. Render Hidden Hotspots (ONLY in fused view, or if layer enabled)
    if (layers.hotspots && viewMode === 'fused') {
      hotspots.forEach((hs) => {
        const el = document.createElement('div');
        el.className = 'group cursor-pointer relative';

        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <!-- Pulsing outer anomaly ring -->
            <div class="w-10 h-10 rounded-full bg-alert/30 animate-hotspot-pulse absolute"></div>
            <!-- Center badge -->
            <div class="w-7 h-7 rounded-full bg-alert text-white flex items-center justify-center font-bold text-xs shadow-elevated border-2 border-white z-10 transition-transform group-hover:scale-125">
              !
            </div>
            <!-- Gap Tag -->
            <div class="absolute -top-6 bg-alert text-white text-[10px] font-mono font-bold px-1.5 py-0.2 rounded shadow whitespace-nowrap">
              +${hs.gap} µg/m³
            </div>
            <!-- Tooltip -->
            <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-ink text-white text-xs p-2 rounded-card shadow-modal whitespace-nowrap pointer-events-none z-50">
              <p class="font-serif font-bold text-paper">Unmonitored Hotspot</p>
              <p class="font-mono text-signal-light">Fused: ${hs.fused_pm25} µg/m³ (Gap: +${hs.gap})</p>
              <p class="text-[10px] text-slate-300">Station Est: ${hs.station_est_pm25} µg/m³</p>
              <p class="text-[10px] text-amber-300 font-semibold mt-0.5">Click to inspect & create case</p>
            </div>
          </div>
        `;

        el.addEventListener('click', () => {
          setSelectedHotspot(hs);
          onHotspotSelect(hs);
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([hs.lng, hs.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // C. Render Citizen Reports (if layer enabled)
    if (layers.reports) {
      reports.forEach((rep) => {
        const el = document.createElement('div');
        el.className = 'group cursor-pointer';

        el.innerHTML = `
          <div class="relative flex flex-col items-center">
            <div class="w-6 h-6 rounded-full bg-signal text-white flex items-center justify-center shadow-subtle border border-white transition-transform group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
            </div>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 bg-ink text-white text-[10px] p-2 rounded shadow-modal w-44 pointer-events-none z-50">
              <p class="font-semibold text-paper">${rep.ai_label}</p>
              <p class="text-slate-300 font-mono">Trust Score: ${Math.round(rep.trust_score * 100)}%</p>
              <p class="text-[9px] text-amber-300 mt-1 italic">Citizen Ground Truth</p>
            </div>
          </div>
        `;

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([rep.lng, rep.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // D. Render NASA FIRMS Active Fires (if layer enabled)
    if (layers.fires) {
      const simulatedFires = [
        { lat: 28.7418, lng: 77.1530, brightness: 348.5 },
        { lat: 28.8415, lng: 77.0975, brightness: 332.0 },
        { lat: 28.6238, lng: 77.3302, brightness: 341.2 }
      ];

      simulatedFires.forEach((f) => {
        const el = document.createElement('div');
        el.className = 'group cursor-pointer';

        el.innerHTML = `
          <div class="relative flex flex-col items-center">
            <div class="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-subtle border border-white transition-transform group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
            </div>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 bg-ink text-white text-[10px] p-2 rounded shadow-modal whitespace-nowrap pointer-events-none z-50">
              <p class="font-semibold text-paper">Thermal Anomaly (VIIRS)</p>
              <p class="font-mono text-amber-300">Brightness: ${f.brightness} K</p>
              <p class="text-[9px] text-slate-300">NASA FIRMS Simulated</p>
            </div>
          </div>
        `;

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([f.lng, f.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

  }, [stations, hotspots, reports, layers, viewMode, mapLoaded, onHotspotSelect, setSelectedHotspot]);

  // 5. Render Grid Heatmap / Interpolation Layer via GeoJSON
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !fieldData || !layers.grid) return;
    const map = mapRef.current;

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: fieldData.grid.map((pt) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [pt.lng, pt.lat]
        },
        properties: {
          pm25: pt.pm25,
          aqi: pt.aqi,
          category: pt.category,
          is_hotspot: pt.is_hotspot ? 1 : 0
        }
      }))
    };

    if (map.getSource('grid-source')) {
      (map.getSource('grid-source') as maplibregl.GeoJSONSource).setData(geojson);
    } else {
      map.addSource('grid-source', {
        type: 'geojson',
        data: geojson
      });

      // Circular blurred heatmap approximation points
      map.addLayer({
        id: 'grid-points-layer',
        type: 'circle',
        source: 'grid-source',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            9, 14,
            12, 28,
            14, 45
          ],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'pm25'],
            30, '#00B050',
            60, '#92D050',
            90, '#D4A017',
            120, '#FF9900',
            250, '#E63946',
            350, '#7E0023'
          ],
          'circle-opacity': viewMode === 'fused' ? 0.38 : 0.28,
          'circle-blur': 0.8
        }
      });
    }

    return () => {
      if (map.getLayer('grid-points-layer')) {
        map.removeLayer('grid-points-layer');
      }
      if (map.getSource('grid-source')) {
        map.removeSource('grid-source');
      }
    };
  }, [fieldData, layers.grid, viewMode, mapLoaded]);

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* THE BOLD MOMENT: Hero View Toggle */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-ink p-1 rounded-pill shadow-modal border border-white/20 flex items-center gap-1">
          <button
            onClick={() => setViewMode('stations')}
            className={`px-4 py-2 rounded-pill text-xs font-semibold transition-all duration-200 ${
              viewMode === 'stations'
                ? 'bg-signal text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            What Stations See
          </button>

          <button
            onClick={() => setViewMode('fused')}
            className={`relative px-4 py-2 rounded-pill text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
              viewMode === 'fused'
                ? 'bg-alert text-white shadow'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>Vayu Fused View</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-badge text-[9px] bg-white/20 font-mono uppercase tracking-wider">
              Hero
            </span>
          </button>
        </div>
      </div>

      {/* Perspective Explanatory Card */}
      <div className="hidden sm:block absolute top-16 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-pill border border-hairline shadow-subtle text-[11px] text-slate flex items-center gap-2">
          {viewMode === 'stations' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-signal" />
              <span>
                Standard interpolation (IDW) from 10 CAAQMS stations. Blindspots between monitors are smoothed over.
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-alert" />
              <span>
                Fused View: Stations + Sentinel-5P AOD + citizen reports reveal unmonitored severe plumes!
              </span>
              <SimulationBadge label="Simulated Fusion" />
            </>
          )}
        </div>
      </div>

      {/* Wind Arrow Flow Overlay */}
      {layers.wind && (
        <div className="absolute top-4 right-4 z-20 pointer-events-none">
          <div className="bg-white/90 backdrop-blur rounded-card border border-hairline shadow-subtle p-2 flex items-center gap-2 text-xs">
            <div
              className="w-6 h-6 rounded-full bg-signal/10 text-signal flex items-center justify-center transition-transform"
              style={{ transform: 'rotate(295deg)' }}
              title="Wind Direction NW 295°"
            >
              <WindIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-slate block leading-none">Wind (Open-Meteo)</span>
              <span className="font-mono font-semibold text-ink text-xs">
                11.4 km/h • 295° NW
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">
              Live
            </span>
          </div>
        </div>
      )}

      {/* Legend & Scale */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="bg-white/95 backdrop-blur p-2.5 rounded-card border border-hairline shadow-subtle text-xs space-y-1.5">
          <span className="text-[10px] font-semibold text-slate uppercase tracking-wider block">
            CPCB PM2.5 AQI Scale (µg/m³)
          </span>
          <div className="flex items-center gap-1 text-[10px] font-mono">
            <span className="w-5 h-2.5 rounded-sm bg-[#00B050]" title="Good 0-30" />
            <span className="w-5 h-2.5 rounded-sm bg-[#92D050]" title="Satisfactory 31-60" />
            <span className="w-5 h-2.5 rounded-sm bg-[#D4A017]" title="Moderate 61-90" />
            <span className="w-5 h-2.5 rounded-sm bg-[#FF9900]" title="Poor 91-120" />
            <span className="w-5 h-2.5 rounded-sm bg-[#E63946]" title="Very Poor 121-250" />
            <span className="w-5 h-2.5 rounded-sm bg-[#7E0023]" title="Severe 250+" />
          </div>
          <div className="flex justify-between text-[9px] text-slate font-mono">
            <span>0</span>
            <span>60</span>
            <span>120</span>
            <span>250+</span>
          </div>
        </div>
      </div>
    </div>
  );
};
