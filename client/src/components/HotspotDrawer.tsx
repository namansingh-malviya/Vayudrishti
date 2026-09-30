import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, AlertTriangle, ShieldCheck, Flame, Factory, MapPin, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Hotspot, ForecastResponse } from '@shared/types';
import { useAppStore } from '../store/useAppStore';
import { fetchForecast, createCase } from '../api/client';
import { ForecastChart } from './ForecastChart';
import { SimulationBadge } from './SimulationBadge';
import { getAqiInfo } from '../lib/aqi';
import { formatSourceLabel } from '../lib/formatters';

interface HotspotDrawerProps {
  hotspot: Hotspot | null;
  onClose: () => void;
  onCaseCreated?: (newCase: any) => void;
}

export const HotspotDrawer: React.FC<HotspotDrawerProps> = ({ hotspot, onClose, onCaseCreated }) => {
  const navigate = useNavigate();
  const { demoStep, nextDemoStep, isDemoActive } = useAppStore();
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [creatingCase, setCreatingCase] = useState(false);
  const [caseCreatedSuccess, setCaseCreatedSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!hotspot) return;

    let isMounted = true;
    setLoadingForecast(true);
    setCaseCreatedSuccess(null);

    fetchForecast(hotspot.lat, hotspot.lng, hotspot.fused_pm25)
      .then((data) => {
        if (isMounted) {
          setForecast(data);
          setLoadingForecast(false);
        }
      })
      .catch((err) => {
        console.error('Forecast fetch failed:', err);
        if (isMounted) setLoadingForecast(false);
      });

    return () => {
      isMounted = false;
    };
  }, [hotspot]);

  if (!hotspot) return null;

  const aqiInfo = getAqiInfo(hotspot.fused_pm25);

  const handleCreateCase = async () => {
    try {
      setCreatingCase(true);
      const res = await createCase({
        hotspot_id: hotspot.id
      });
      setCaseCreatedSuccess(res.case?.id || 'Created');
      if (onCaseCreated) onCaseCreated(res.case);

      // If demo mode is active and on step 3, progress step
      if (isDemoActive && demoStep === 3) {
        nextDemoStep();
      }

      setTimeout(() => {
        navigate('/cases');
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Failed to create case');
    } finally {
      setCreatingCase(false);
    }
  };

  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white border-l border-hairline shadow-modal flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="p-4 border-b border-hairline flex items-center justify-between bg-paper/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-alert/10 text-alert flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-semibold text-ink leading-tight">
              Hotspot Anomaly
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate">
              <span>{hotspot.lat.toFixed(4)}° N, {hotspot.lng.toFixed(4)}° E</span>
              <span>•</span>
              <SimulationBadge label="Simulated Fusion" />
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-button text-slate hover:text-ink hover:bg-slate-100 transition-colors"
          aria-label="Close drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* PM2.5 & Gap Hero Box */}
        <div className="card-frame p-4 bg-paper/40">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-slate font-sans block">Fused Local PM2.5</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-mono text-3xl font-bold text-ink">
                  {hotspot.fused_pm25}
                </span>
                <span className="text-xs text-slate">µg/m³</span>
              </div>
            </div>
            <span
              className="px-2.5 py-1 rounded-badge text-xs font-semibold"
              style={{ backgroundColor: aqiInfo.bgLight, color: aqiInfo.textDark }}
            >
              {aqiInfo.name}
            </span>
          </div>

          {/* The Hotspot Gap Statement */}
          <div className="mt-3 pt-3 border-t border-hairline flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate block">Sensor Blindspot Gap</span>
              <span className="font-mono text-sm font-semibold text-alert">
                +{hotspot.gap} µg/m³ over stations
              </span>
            </div>
            <div className="text-right text-[11px] text-slate font-mono">
              <div>Est: {hotspot.station_est_pm25} µg/m³</div>
              <div className="text-[10px] text-slate/70">via Nearest CAAQMS</div>
            </div>
          </div>

          {/* Nearest station */}
          {hotspot.nearest_station_name && (
            <div className="mt-2 text-[11px] text-slate flex items-center gap-1">
              <MapPin className="w-3 h-3 text-signal" />
              <span>
                {hotspot.nearest_station_dist_km} km from {hotspot.nearest_station_name}
              </span>
            </div>
          )}
        </div>

        {/* Likely Source & Confidence */}
        <div className="card-frame p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate font-medium">Likely Primary Source</span>
            <span className="font-mono font-semibold text-ink">
              {Math.round(hotspot.confidence * 100)}% Confidence
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            {hotspot.likely_source === 'industrial' ? (
              <Factory className="w-4 h-4 text-signal" />
            ) : (
              <Flame className="w-4 h-4 text-alert" />
            )}
            <span>{formatSourceLabel(hotspot.likely_source)}</span>
          </div>

          {/* Confidence Progress Bar */}
          <div className="w-full bg-slate-100 rounded-pill h-1.5 overflow-hidden">
            <div
              className="bg-signal h-full rounded-pill transition-all"
              style={{ width: `${Math.round(hotspot.confidence * 100)}%` }}
            />
          </div>
        </div>

        {/* 48h Physical Forecast Chart */}
        <div className="card-frame p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-sm font-semibold text-ink">
              48-Hour Dispersion Forecast
            </h3>
            <span className="text-[10px] text-slate">Advection + Inversion</span>
          </div>
          <ForecastChart forecast={forecast} loading={loadingForecast} />
        </div>

        {/* Routing Rule Info */}
        <div className="p-3 rounded-button bg-signal-light/40 border border-signal/20 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-signal">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Statutory Routing Protocol</span>
          </div>
          <p className="text-[11px] text-slate leading-relaxed">
            Automatic routing under CPCB Graded Response Action Plan (GRAP). Unmonitored severe gap triggers immediate dispatch of municipal flying squads.
          </p>
        </div>
      </div>

      {/* Drawer Action Footer */}
      <div className="p-4 border-t border-hairline bg-paper/60 space-y-2">
        {caseCreatedSuccess ? (
          <div className="p-2.5 rounded-button bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Case <strong>{caseCreatedSuccess}</strong> opened! Navigating to Case Board...</span>
          </div>
        ) : hotspot.case_id ? (
          <button
            onClick={() => navigate('/cases')}
            className="w-full py-2.5 px-4 rounded-button bg-paper border border-hairline text-xs font-semibold text-ink hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View Active Case ({hotspot.case_status?.toUpperCase()})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleCreateCase}
            disabled={creatingCase}
            className="w-full py-2.5 px-4 rounded-button bg-alert hover:bg-alert-hover text-white text-xs font-semibold shadow-subtle hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {creatingCase ? (
              <span>Routing to Authority...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Create Enforcement Case</span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  );
};
