import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  CheckCircle2, 
  Flame, 
  ShieldAlert, 
  Camera, 
  Eye 
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const DemoScenarioModal: React.FC = () => {
  const navigate = useNavigate();
  const { 
    isDemoActive, 
    demoStep, 
    nextDemoStep, 
    prevDemoStep, 
    stopDemo, 
    setViewMode, 
    setSelectedHotspot 
  } = useAppStore();

  if (!isDemoActive) return null;

  const steps = [
    {
      step: 1,
      title: 'Step 1: Detect an Unseen Plume',
      icon: Eye,
      description:
        'Official CAAQMS stations see a moderate background (~242 µg/m³), but Vayu\'s fused satellite & sensor mesh reveals a hidden severe plume at Bhalaswa (428 µg/m³, a gap of +186 µg/m³)!',
      actionLabel: 'Reveal Fused Plume',
      onAction: () => {
        setViewMode('fused');
        navigate('/');
      }
    },
    {
      step: 2,
      title: 'Step 2: Inspect Hotspot & Forecast',
      icon: Flame,
      description:
        'Click on the Bhalaswa hotspot. Notice the +186 µg/m³ blindspot gap, 94% confidence source classification (Open Waste Burning), and the 48h physical forecast with uncertainty band exceeding the severe 250 µg/m³ threshold.',
      actionLabel: 'Open Hotspot Drawer',
      onAction: () => {
        setSelectedHotspot({
          id: 'hs-del-01',
          city_id: 'delhi-ncr',
          lat: 28.7412,
          lng: 77.1528,
          ts: new Date().toISOString(),
          fused_pm25: 428,
          station_est_pm25: 242,
          gap: 186,
          confidence: 0.94,
          likely_source: 'waste_burning',
          nearest_station_name: 'Jahangirpuri DPCC',
          nearest_station_dist_km: 3.2
        });
        navigate('/');
      }
    },
    {
      step: 3,
      title: 'Step 3: Create Enforcement Case',
      icon: ShieldAlert,
      description:
        'Turn the anomaly into a legal action case. Vayu routes this case automatically to the Municipal Corporation of Delhi (MCD) / SDM under statutory routing rules with a 24-hour statutory countdown.',
      actionLabel: 'Go to Case Board',
      onAction: () => {
        navigate('/cases');
      }
    },
    {
      step: 4,
      title: 'Step 4: Dispatch Officer & Mobilize',
      icon: CheckCircle2,
      description:
        'On the Case Board, inspect the active 24-hour deadline countdown. Assign an enforcement officer (e.g. SDM Flying Squad) and advance status to In Progress.',
      actionLabel: 'Inspect Active Cases',
      onAction: () => {
        navigate('/cases');
      }
    },
    {
      step: 5,
      title: 'Step 5: Verify & Close with Ground Photo',
      icon: Camera,
      description:
        'Enforcement compliance completed: the officer uploads an on-ground verification photo showing misting cannons in action. The case is permanently archived in the immutable audit trail!',
      actionLabel: 'Finish Walkthrough',
      onAction: () => {
        stopDemo();
        navigate('/cases');
      }
    }
  ];

  const current = steps[demoStep - 1];
  const Icon = current.icon;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-auto animate-in slide-in-from-bottom duration-300">
      <div className="bg-ink text-white rounded-card shadow-modal border border-white/10 p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-signal text-white flex items-center justify-center text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-semibold text-paper uppercase tracking-wider font-mono">
              Live Walkthrough Demo • Step {demoStep} of 5
            </span>
          </div>
          <button
            onClick={stopDemo}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            aria-label="Exit demo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-paper font-serif text-base font-semibold">
            <Icon className="w-4 h-4 text-signal-light" />
            <h3>{current.title}</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {current.description}
          </p>
        </div>

        {/* Stepper Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <button
            onClick={prevDemoStep}
            disabled={demoStep === 1}
            className="px-2.5 py-1 rounded text-xs text-slate-300 hover:text-white disabled:opacity-30 flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Prev</span>
          </button>

          <button
            onClick={() => {
              current.onAction();
              if (demoStep < 5) nextDemoStep();
              else stopDemo();
            }}
            className="px-4 py-1.5 rounded-button bg-signal hover:bg-signal-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow transition-all"
          >
            <span>{current.actionLabel}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
