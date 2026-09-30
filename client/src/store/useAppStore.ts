import { create } from 'zustand';
import { City, Hotspot, Station, Report } from '@shared/types';

export interface AppState {
  selectedCityId: string;
  cities: City[];
  viewMode: 'stations' | 'fused'; // HERO MOMENT: "What stations see" vs "Vayu fused view"
  
  // Layer Toggles
  layers: {
    stations: boolean;
    hotspots: boolean;
    reports: boolean;
    fires: boolean;
    wind: boolean;
    grid: boolean;
  };

  // Hotspot Inspection Drawer
  selectedHotspot: Hotspot | null;
  isDrawerOpen: boolean;

  // 48h Time Slider State (-24h history to +24h forecast, 0 = current live)
  timeOffsetHours: number;
  isPlaying: boolean;

  // Guided Walkthrough Demo Modal State
  isDemoActive: boolean;
  demoStep: number;

  // Actions
  setSelectedCityId: (cityId: string) => void;
  setCities: (cities: City[]) => void;
  setViewMode: (mode: 'stations' | 'fused') => void;
  toggleLayer: (layerName: keyof AppState['layers']) => void;
  setSelectedHotspot: (hotspot: Hotspot | null) => void;
  setIsDrawerOpen: (open: boolean) => void;
  setTimeOffsetHours: (hours: number) => void;
  setIsPlaying: (playing: boolean) => void;
  startDemo: () => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  stopDemo: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedCityId: 'delhi-ncr',
  cities: [],
  viewMode: 'fused',

  layers: {
    stations: true,
    hotspots: true,
    reports: true,
    fires: true,
    wind: true,
    grid: true
  },

  selectedHotspot: null,
  isDrawerOpen: false,

  timeOffsetHours: 0,
  isPlaying: false,

  isDemoActive: false,
  demoStep: 1,

  setSelectedCityId: (cityId) => set({ selectedCityId: cityId }),
  setCities: (cities) => set({ cities }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleLayer: (layerName) =>
    set((state) => ({
      layers: { ...state.layers, [layerName]: !state.layers[layerName] }
    })),
  setSelectedHotspot: (hotspot) =>
    set({ selectedHotspot: hotspot, isDrawerOpen: !!hotspot }),
  setIsDrawerOpen: (open) => set({ isDrawerOpen: open }),
  setTimeOffsetHours: (hours) => set({ timeOffsetHours: hours }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),

  startDemo: () => set({ isDemoActive: true, demoStep: 1 }),
  nextDemoStep: () => set((state) => ({ demoStep: Math.min(5, state.demoStep + 1) })),
  prevDemoStep: () => set((state) => ({ demoStep: Math.max(1, state.demoStep - 1) })),
  stopDemo: () => set({ isDemoActive: false, demoStep: 1 })
}));
