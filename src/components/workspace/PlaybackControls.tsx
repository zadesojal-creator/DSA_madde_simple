import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Gauge } from 'lucide-react';
import type { PlaybackSpeed } from '../../types/trace';

interface PlaybackControlsProps {
  currentStepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: PlaybackSpeed;
  isAtStart: boolean;
  isAtEnd: boolean;
  onPlay: () => void;
  onPause: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onGoToStep: (index: number) => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  currentStepIndex,
  totalSteps,
  isPlaying,
  speed,
  isAtStart,
  isAtEnd,
  onTogglePlay,
  onNext,
  onPrev,
  onReset,
  onGoToStep,
  onSpeedChange
}) => {
  const speeds: PlaybackSpeed[] = [0.5, 1, 1.5, 2];

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-md space-y-4 text-slate-900">
      
      {/* Top Bar: Progress Slider & Step Counter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        
        {/* Step Progress Slider */}
        <div className="flex-1 w-full flex items-center gap-3">
          <span className="text-xs font-mono text-slate-600 font-bold w-12 text-right shrink-0">
            {currentStepIndex + 1} / {totalSteps}
          </span>
          <div className="relative flex-1">
            <input
              type="range"
              min={0}
              max={Math.max(0, totalSteps - 1)}
              value={currentStepIndex}
              onChange={(e) => onGoToStep(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              aria-label="Step progress slider"
            />
          </div>
        </div>

        {/* Speed Selector Dropdown/Buttons */}
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <Gauge className="w-3.5 h-3.5 text-slate-500 ml-1.5 hidden sm:inline" />
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-1 rounded-lg text-xs font-mono font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 ${
                speed === s
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title={`Set speed to ${s}x`}
            >
              {s}x
            </button>
          ))}
        </div>

      </div>

      {/* Bottom Control Buttons */}
      <div className="flex items-center justify-between pt-1">
        
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            disabled={isAtStart && !isPlaying}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            title="Reset to beginning (Shortcut: R)"
            aria-label="Reset execution"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Main Playback Action Cluster */}
        <div className="flex items-center gap-2">
          
          <button
            onClick={onPrev}
            disabled={isAtStart}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            title="Step backward (Shortcut: ← Left Arrow)"
            aria-label="Previous step"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            title="Play / Pause execution (Shortcut: Space)"
            aria-label={isPlaying ? "Pause playback" : "Play step-by-step execution"}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{isAtEnd ? 'Replay' : 'Play Trace'}</span>
              </>
            )}
          </button>

          <button
            onClick={onNext}
            disabled={isAtEnd}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 text-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            title="Step forward (Shortcut: → Right Arrow)"
            aria-label="Next step"
          >
            <SkipForward className="w-4 h-4" />
          </button>

        </div>

        <div className="text-xs font-mono text-slate-500 hidden sm:block">
          Space: Play • Arrows: Step
        </div>

      </div>

    </div>
  );
};
