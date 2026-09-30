import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const TimeSlider: React.FC = () => {
  const { timeOffsetHours, setTimeOffsetHours, isPlaying, setIsPlaying } = useAppStore();

  // Play animation timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeOffsetHours(timeOffsetHours >= 24 ? -24 : timeOffsetHours + 2);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, timeOffsetHours, setTimeOffsetHours]);

  const now = new Date();
  const simulatedTime = new Date(now.getTime() + timeOffsetHours * 3600 * 1000);

  const formatOffsetLabel = (hours: number) => {
    if (hours === 0) return 'Now (Live Real-Time)';
    if (hours > 0) return `+${hours}h (Forecast Lead)`;
    return `${hours}h (Historical Retrospective)`;
  };

  return (
    <div className="bg-white/95 backdrop-blur rounded-card border border-hairline shadow-subtle p-3 w-full max-w-xl text-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-signal" />
          <span className="font-semibold text-ink">
            {formatOffsetLabel(timeOffsetHours)}
          </span>
        </div>
        <span className="font-mono text-slate text-[11px]">
          {simulatedTime.toLocaleDateString('en-IN', {
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-8 h-8 rounded-button bg-signal hover:bg-signal-hover text-white flex items-center justify-center transition-colors shadow-subtle focus:ring-2 focus:ring-signal/40"
          aria-label={isPlaying ? 'Pause timeline' : 'Play timeline'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        {/* Range Slider */}
        <div className="flex-1 relative">
          <input
            type="range"
            min={-24}
            max={24}
            step={2}
            value={timeOffsetHours}
            onChange={(e) => {
              setIsPlaying(false);
              setTimeOffsetHours(parseInt(e.target.value, 10));
            }}
            className="w-full accent-signal cursor-pointer"
            aria-label="48-hour timeline scrubber"
          />
          <div className="flex justify-between text-[10px] text-slate font-mono -mt-1">
            <span>-24h</span>
            <span className="text-signal font-semibold">Live (0h)</span>
            <span>+24h</span>
          </div>
        </div>

        {/* Reset to Live button */}
        <button
          onClick={() => {
            setIsPlaying(false);
            setTimeOffsetHours(0);
          }}
          className="p-1.5 rounded-button text-slate hover:text-ink hover:bg-paper transition-colors"
          title="Reset to current live time"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
