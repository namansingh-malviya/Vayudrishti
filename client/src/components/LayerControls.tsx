import React from 'react';
import { 
  Radio, 
  Flame, 
  Camera, 
  Wind, 
  Layers, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { SimulationBadge } from './SimulationBadge';

export const LayerControls: React.FC = () => {
  const { layers, toggleLayer } = useAppStore();

  const layerItems = [
    { key: 'stations' as const, label: 'Official CAAQMS', icon: Radio, simulated: false, count: '10' },
    { key: 'hotspots' as const, label: 'Hidden Hotspots', icon: AlertCircle, simulated: true, count: '5' },
    { key: 'reports' as const, label: 'Citizen Reports', icon: Camera, simulated: true, count: '3' },
    { key: 'fires' as const, label: 'NASA FIRMS Fires', icon: Flame, simulated: true, count: '3' },
    { key: 'wind' as const, label: 'Wind Vector Field', icon: Wind, simulated: false, count: 'Live' },
    { key: 'grid' as const, label: 'Pollution Surface', icon: Layers, simulated: true, count: '' },
  ];

  return (
    <div className="bg-white/95 backdrop-blur rounded-card border border-hairline shadow-subtle p-3 w-64 space-y-2 text-xs">
      <div className="flex items-center justify-between pb-1.5 border-b border-hairline">
        <span className="font-semibold text-ink flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-signal" />
          <span>Active Map Layers</span>
        </span>
      </div>

      <div className="space-y-1">
        {layerItems.map((item) => {
          const Icon = item.icon;
          const isEnabled = layers[item.key];
          return (
            <button
              key={item.key}
              onClick={() => toggleLayer(item.key)}
              className={`w-full flex items-center justify-between p-1.5 rounded-button transition-colors text-left ${
                isEnabled ? 'bg-paper/80 text-ink font-medium' : 'text-slate/60 hover:bg-paper/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 ${isEnabled ? 'text-signal' : 'text-slate/40'}`} />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.simulated ? (
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1 rounded border border-amber-200">
                    Sim
                  </span>
                ) : (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200">
                    Live
                  </span>
                )}
                {isEnabled ? (
                  <Eye className="w-3.5 h-3.5 text-signal" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 text-slate/40" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
