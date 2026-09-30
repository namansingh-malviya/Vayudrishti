import React, { useState } from 'react';
import { MapContainer } from '../map/MapContainer';
import { LayerControls } from '../components/LayerControls';
import { TimeSlider } from '../components/TimeSlider';
import { HotspotDrawer } from '../components/HotspotDrawer';
import { useAppStore } from '../store/useAppStore';
import { Hotspot } from '@shared/types';
import { SlidersHorizontal, AlertTriangle, ShieldCheck, ChevronUp, ChevronDown } from 'lucide-react';

export const LiveMapPage: React.FC = () => {
  const { selectedHotspot, setSelectedHotspot, isDrawerOpen, setIsDrawerOpen } = useAppStore();
  const [showLayerPanel, setShowLayerPanel] = useState(true);

  const handleHotspotSelect = (hs: Hotspot) => {
    setSelectedHotspot(hs);
    setIsDrawerOpen(true);
  };

  return (
    <div className="relative w-full h-[calc(100vh-61px)] overflow-hidden flex flex-col">
      {/* Top Banner KPI strip */}
      <div className="bg-white/90 backdrop-blur border-b border-hairline px-4 py-1.5 flex items-center justify-between text-xs z-20">
        <div className="flex items-center gap-4 overflow-x-auto py-0.5">
          <div className="flex items-center gap-1.5 font-medium text-ink">
            <AlertTriangle className="w-3.5 h-3.5 text-alert" />
            <span>5 Blindspot Hotspots Detected</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 text-slate">
            <span>Peak Gap:</span>
            <span className="font-mono font-bold text-alert">+186 µg/m³</span>
            <span className="text-[10px] text-slate-500">(Bhalaswa Core)</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 text-slate">
            <ShieldCheck className="w-3.5 h-3.5 text-signal" />
            <span>Statutory Routing Active</span>
          </div>
        </div>

        <button
          onClick={() => setShowLayerPanel(!showLayerPanel)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-button bg-paper hover:bg-slate-200 text-slate-700 text-xs transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-signal" />
          <span className="hidden sm:inline">Layers</span>
          {showLayerPanel ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Main Map View */}
      <div className="relative flex-1 w-full h-full">
        <MapContainer onHotspotSelect={handleHotspotSelect} />

        {/* Floating Layer Controls (Top Left) */}
        {showLayerPanel && (
          <div className="absolute top-4 left-4 z-20 animate-in fade-in duration-200">
            <LayerControls />
          </div>
        )}

        {/* Floating 48h Time Slider (Bottom Center) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-xl">
          <TimeSlider />
        </div>

        {/* Slide-out Hotspot Drawer */}
        {isDrawerOpen && selectedHotspot && (
          <HotspotDrawer
            hotspot={selectedHotspot}
            onClose={() => {
              setIsDrawerOpen(false);
              setSelectedHotspot(null);
            }}
          />
        )}
      </div>
    </div>
  );
};
