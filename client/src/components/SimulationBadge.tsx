import React from 'react';
import { Info } from 'lucide-react';

interface SimulationBadgeProps {
  label?: string;
  tooltip?: string;
  size?: 'sm' | 'md';
  variant?: 'simulated' | 'hybrid' | 'live';
}

export const SimulationBadge: React.FC<SimulationBadgeProps> = ({
  label,
  tooltip,
  size = 'sm',
  variant = 'simulated'
}) => {
  const isSimulated = variant === 'simulated';
  const isHybrid = variant === 'hybrid';

  const defaultLabel = isSimulated ? 'Simulated' : isHybrid ? 'Hybrid' : 'Live Real-Time';
  const text = label || defaultLabel;

  const defaultTooltip = isSimulated
    ? 'This data layer is synthetic / simulated for demonstration and research.'
    : isHybrid
    ? 'Combines real baseline telemetry with synthetic localized dispersion.'
    : 'Direct telemetry fetched from continuous public monitoring stations.';

  const displayTooltip = tooltip || defaultTooltip;

  return (
    <span
      className={`inline-flex items-center gap-1 font-sans font-medium rounded-badge border transition-colors cursor-help ${
        size === 'sm' ? 'text-[11px] px-1.5 py-0.5' : 'text-xs px-2 py-1'
      } ${
        isSimulated
          ? 'bg-amber-50 text-amber-900 border-amber-300'
          : isHybrid
          ? 'bg-signal-light text-signal border-signal/30'
          : 'bg-emerald-50 text-emerald-800 border-emerald-300'
      }`}
      title={displayTooltip}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isSimulated ? 'bg-amber-500' : isHybrid ? 'bg-signal' : 'bg-emerald-500'
        }`}
      />
      <span>{text}</span>
      <Info className="w-2.5 h-2.5 opacity-60 ml-0.5" />
    </span>
  );
};
