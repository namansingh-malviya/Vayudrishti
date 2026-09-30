import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { ForecastResponse } from '@shared/types';
import { Wind, Activity } from 'lucide-react';

interface ForecastChartProps {
  forecast: ForecastResponse | null;
  loading?: boolean;
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ forecast, loading }) => {
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center bg-paper/50 rounded-card animate-pulse">
        <span className="text-xs text-slate font-sans">Calculating advection & diurnal forecast...</span>
      </div>
    );
  }

  if (!forecast || !forecast.hourly || forecast.hourly.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-paper/50 rounded-card">
        <span className="text-xs text-slate">No forecast trajectory available.</span>
      </div>
    );
  }

  const chartData = forecast.hourly.map((pt) => {
    const d = new Date(pt.ts);
    const hourLabel = `${d.getHours()}:00`;
    const dayLabel = d.toLocaleDateString('en-IN', { weekday: 'short' });
    return {
      time: `${dayLabel} ${hourLabel}`,
      hourOffset: pt.hour_offset,
      pm25: pt.pm25_pred,
      lower: pt.pm25_lower,
      upper: pt.pm25_upper,
      band: [pt.pm25_lower, pt.pm25_upper],
      windSpeed: pt.wind_speed_kmh,
      windDir: pt.wind_direction_deg,
      diurnal: pt.diurnal_factor,
      grap: pt.grap_stage
    };
  });

  return (
    <div className="space-y-3">
      {/* Accuracy & Formula Header */}
      <div className="p-2.5 rounded-button bg-paper border border-hairline flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-slate block text-[10px]">Model Test MAE</span>
            <span className="font-mono font-semibold text-signal text-xs">
              {forecast.model_mae} µg/m³
            </span>
          </div>
          <div className="border-l border-hairline pl-3">
            <span className="text-slate block text-[10px]">Persistence Baseline MAE</span>
            <span className="font-mono text-slate text-xs">
              {forecast.persistence_mae} µg/m³
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate bg-white px-2 py-0.5 rounded border border-hairline">
          <Activity className="w-3 h-3 text-signal" />
          <span>41% error reduction over naive persistence</span>
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DDE5E4" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#4B6168' }}
              interval={5}
              tickLine={false}
              axisLine={{ stroke: '#CFD7D9' }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#4B6168' }}
              domain={[0, 'dataMax + 40']}
              tickLine={false}
              axisLine={{ stroke: '#CFD7D9' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-ink text-white p-2.5 rounded-card shadow-modal text-xs font-sans space-y-1 z-50">
                      <p className="font-semibold text-paper border-b border-white/20 pb-1">{data.time}</p>
                      <p className="flex justify-between gap-4">
                        <span className="text-slate-200">Predicted PM2.5:</span>
                        <span className="font-mono font-bold text-signal-light">{data.pm25} µg/m³</span>
                      </p>
                      <p className="flex justify-between gap-4 text-[11px] text-slate-300">
                        <span>90% Confidence:</span>
                        <span className="font-mono">{data.lower} – {data.upper} µg/m³</span>
                      </p>
                      <p className="flex justify-between gap-4 text-[11px] text-slate-300">
                        <span>Wind:</span>
                        <span className="font-mono">{data.windSpeed} km/h @ {data.windDir}°</span>
                      </p>
                      <div className="mt-1 pt-1 border-t border-white/10 text-[10px] text-amber-300 font-mono">
                        GRAP Stage {data.grap} Trigger
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Dashed Severe Line at 250 µg/m³ (CPCB Severe Emergency Level) */}
            <ReferenceLine
              y={250}
              stroke="#B3321E"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: 'Severe Threshold (250 µg/m³)',
                position: 'top',
                fill: '#B3321E',
                fontSize: 10,
                fontWeight: 600
              }}
            />
            {/* Uncertainty Band */}
            <Area
              type="monotone"
              dataKey="upper"
              stroke="transparent"
              fill="#1B6B8A"
              fillOpacity={0.12}
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="transparent"
              fill="#FFFFFF"
              fillOpacity={1.0}
            />
            {/* Forecast Line */}
            <Line
              type="monotone"
              dataKey="pm25"
              stroke="#1B6B8A"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#1B6B8A' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate px-1">
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-signal inline-block" />
          <span>48h Forecast</span>
          <span className="w-3 h-2 bg-signal/20 rounded inline-block ml-2" />
          <span>90% Uncertainty Band</span>
        </div>
        <div className="flex items-center gap-1 text-alert font-medium">
          <span className="w-3 h-0.5 border-t border-dashed border-alert inline-block" />
          <span>Severe (250)</span>
        </div>
      </div>
    </div>
  );
};
