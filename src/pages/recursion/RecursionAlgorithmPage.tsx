import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { VisualizerLayout } from '../../components/workspace/VisualizerLayout';
import { TopicBreadcrumbs } from '../../components/workspace/TopicBreadcrumbs';
import { PlaybackControls } from '../../components/workspace/PlaybackControls';
import { StepExplanation } from '../../components/workspace/StepExplanation';
import { PseudocodePanel } from '../../components/workspace/PseudocodePanel';
import { ComplexityPanel } from '../../components/workspace/ComplexityPanel';
import { CallStackPanel } from '../../components/recursion/CallStackPanel';
import { HanoiCanvas } from '../../components/recursion/HanoiCanvas';
import { MazeCanvas } from '../../components/recursion/MazeCanvas';
import { NQueensBoard } from '../../components/recursion/NQueensBoard';
import { RecursionStatePanel } from '../../components/recursion/RecursionStatePanel';
import { usePlayback } from '../../hooks/usePlayback';
import { ALGORITHMS_METADATA } from '../../data/algorithmsMetadata';
import { executeCppRecursionAlgorithm, type CppEngineStatus } from '../../services/cppExecutionAdapter';
import type { TraceStep } from '../../types/trace';
import {
  Play, RotateCcw, AlertCircle, Cpu, Info, ChevronUp, ChevronDown,
  GitBranch
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Algorithm metadata
// ─────────────────────────────────────────────────────────────────────────────
interface RecursionAlgConfig {
  id: string;
  title: string;
  category: 'recursion' | 'backtracking';
  defaultN: number;
  minN: number;
  maxN: number;
  inputLabel: string;
  inputHelp: string;
  defaultFindAll?: boolean;
  showFindAll?: boolean;
  // Maze-specific
  defaultMazeGrid?: number[][];
  defaultMazeRows?: number;
  defaultMazeCols?: number;
}

const ALGO_CONFIGS: Record<string, RecursionAlgConfig> = {
  factorial: {
    id: 'factorial', title: 'Factorial', category: 'recursion',
    defaultN: 5, minN: 0, maxN: 20,
    inputLabel: 'n (compute n!)',
    inputHelp: 'Enter a non-negative integer. Max 20 to stay within long long range.',
  },
  fibonacci: {
    id: 'fibonacci', title: 'Fibonacci (Naive)', category: 'recursion',
    defaultN: 6, minN: 0, maxN: 15,
    inputLabel: 'n (compute fib(n))',
    inputHelp: 'Enter 0–15. Naive recursion grows exponentially — small n is intentional.',
  },
  'tower-of-hanoi': {
    id: 'tower-of-hanoi', title: 'Tower of Hanoi', category: 'recursion',
    defaultN: 3, minN: 1, maxN: 8,
    inputLabel: 'Number of disks',
    inputHelp: 'Enter 1–8 disks. Total moves = 2ⁿ − 1.',
  },
  maze: {
    id: 'maze', title: 'Maze Solver', category: 'backtracking',
    defaultN: 0, minN: 0, maxN: 0,
    inputLabel: 'Maze preset',
    inputHelp: 'Select a preset or use the default 5×5 maze. 0=open, 1=wall.',
    defaultMazeGrid: [
      [0,0,1,0,0],
      [0,1,1,0,1],
      [0,0,0,0,1],
      [1,1,0,1,0],
      [0,0,0,0,0],
    ],
    defaultMazeRows: 5,
    defaultMazeCols: 5,
  },
  'n-queens': {
    id: 'n-queens', title: 'N-Queens', category: 'backtracking',
    defaultN: 6, minN: 1, maxN: 10,
    inputLabel: 'N (board size)',
    inputHelp: 'Enter 1–10. N=2 and N=3 have no solution.',
    showFindAll: true,
    defaultFindAll: false,
  },
};

// Maze presets
const MAZE_PRESETS: Record<string, { grid: number[][], rows: number, cols: number, sr: number, sc: number, gr: number, gc: number, label: string }> = {
  default: {
    grid: [[0,0,1,0,0],[0,1,1,0,1],[0,0,0,0,1],[1,1,0,1,0],[0,0,0,0,0]],
    rows:5, cols:5, sr:0, sc:0, gr:4, gc:4,
    label: 'Default 5×5'
  },
  simple: {
    grid: [[0,0,0,0],[0,1,1,0],[0,0,0,0],[0,1,0,0]],
    rows:4, cols:4, sr:0, sc:0, gr:3, gc:2,
    label: 'Simple 4×4'
  },
  tricky: {
    grid: [[0,0,0,1,0,0],[1,1,0,1,0,1],[0,0,0,0,0,1],[0,1,1,1,0,0],[0,0,0,1,1,0],[1,0,0,0,0,0]],
    rows:6, cols:6, sr:0, sc:0, gr:5, gc:5,
    label: 'Tricky 6×6'
  },
  unreachable: {
    grid: [[0,1,0],[0,1,0],[0,1,0]],
    rows:3, cols:3, sr:0, sc:0, gr:0, gc:2,
    label: 'Unreachable'
  }
};



// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
interface RecursionAlgorithmPageProps {
  algorithm?: string;
}

export const RecursionAlgorithmPage: React.FC<RecursionAlgorithmPageProps> = ({ algorithm: algProp }) => {
  const { algorithmId } = useParams<{ algorithmId: string }>();
  const navigate = useNavigate();

  const algId = algProp || algorithmId || 'factorial';
  const config = ALGO_CONFIGS[algId];

  // Input state
  const [nValue, setNValue] = useState<number>(config?.defaultN ?? 5);
  const [findAll, setFindAll] = useState<boolean>(config?.defaultFindAll ?? false);
  const [mazePreset, setMazePreset] = useState<string>('default');
  const [mazeRows, setMazeRows] = useState<number>(config?.defaultMazeRows ?? 5);
  const [mazeCols, setMazeCols] = useState<number>(config?.defaultMazeCols ?? 5);

  // Execution state
  const [steps, setSteps] = useState<TraceStep[]>([]);
  const [sourceCode, setSourceCode] = useState<string>('// Loading C++ source...');
  const [engineStatus, setEngineStatus] = useState<CppEngineStatus>('unavailable');
  const [engineMessage, setEngineMessage] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [inputError, setInputError] = useState<string>('');
  const [isModified, setIsModified] = useState(true);

  const playback = usePlayback({
    steps,
    initialSpeed: 1
  });
  const {
    currentStepIndex,
    isPlaying,
    speed,
    currentStep,
    isAtStart,
    isAtEnd,
    totalSteps,
    play,
    pause,
    togglePlay,
    nextStep,
    prevStep,
    reset,
    goToStep,
    setSpeed
  } = playback;

  const metadata = ALGORITHMS_METADATA[algId];

  // Reset when algorithm changes
  useEffect(() => {
    if (!config) {
      navigate('/visualizer/recursion/factorial');
      return;
    }
    const c = ALGO_CONFIGS[algId];
    if (c) {
      setNValue(c.defaultN);
      setFindAll(c.defaultFindAll ?? false);
      if (algId === 'maze') {
        setMazePreset('default');
        setMazeRows(5);
        setMazeCols(5);
      }
    }
    setSteps([]);
    setIsModified(true);
    setInputError('');
    reset();
  }, [algId, config, navigate, reset]);

  // ── Validation ──
  const validateInput = useCallback((): boolean => {
    if (!config) return false;
    if (algId === 'maze') return true;
    if (algId === 'factorial') {
      if (nValue < 0 || !Number.isInteger(nValue)) {
        setInputError('n must be a non-negative integer (0–20).');
        return false;
      }
      if (nValue > 20) {
        setInputError('n exceeds long long range. Max is 20.');
        return false;
      }
    } else if (algId === 'fibonacci') {
      if (nValue < 0 || nValue > 15 || !Number.isInteger(nValue)) {
        setInputError('n must be an integer 0–15 for naive recursion visualization.');
        return false;
      }
    } else if (algId === 'tower-of-hanoi') {
      if (nValue < 1 || nValue > 8 || !Number.isInteger(nValue)) {
        setInputError('Number of disks must be 1–8.');
        return false;
      }
    } else if (algId === 'n-queens') {
      if (nValue < 1 || nValue > 10 || !Number.isInteger(nValue)) {
        setInputError('N must be 1–10.');
        return false;
      }
    }
    setInputError('');
    return true;
  }, [algId, config, nValue]);

  // ── Execute C++ algorithm ──
  const handleRun = useCallback(async () => {
    if (!validateInput()) return;
    setIsRunning(true);
    setIsModified(false);
    reset();

    try {
      let arrStr = String(nValue);
      let targetVal = nValue;

      if (algId === 'maze') {
        const preset = MAZE_PRESETS[mazePreset] || MAZE_PRESETS['default'];
        const flat = preset.grid.flat().join(',');
        arrStr = `${preset.rows};${preset.cols};${flat};${preset.sr};${preset.sc};${preset.gr};${preset.gc}`;
        setMazeRows(preset.rows);
        setMazeCols(preset.cols);
        targetVal = 0;
      }

      const result = await executeCppRecursionAlgorithm(
        algId,
        arrStr,
        targetVal,
        { findAll }
      );

      setSteps(result.steps);
      setSourceCode(result.sourceCode);
      setEngineStatus(result.engineStatus);
      setEngineMessage(result.engineMessage);

      if (result.steps.length > 0) goToStep(0);
    } catch (err) {
      console.error('C++ execution error:', err);
      setInputError('C++ execution failed. Check that the dev server is running.');
    } finally {
      setIsRunning(false);
    }
  }, [algId, nValue, findAll, mazePreset, validateInput, reset, goToStep]);

  // Auto-run on first mount with defaults
  useEffect(() => {
    handleRun();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algId]);

  if (!config) return null;

  const isMaze = algId === 'maze';
  const isHanoi = algId === 'tower-of-hanoi';
  const isQueens = algId === 'n-queens';
  const isFib = algId === 'fibonacci';
  const isFact = algId === 'factorial';

  const totalCalls = steps.filter(s => s.eventType === 'function_enter').length;

  return (
    <VisualizerLayout activeTitle={`${config.title} Visualizer`}>
      <div className="flex flex-col gap-5 max-w-7xl mx-auto w-full pb-12">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TopicBreadcrumbs
            categoryName={config.category === 'backtracking' ? 'Backtracking' : 'Recursion'}
            categoryRoute={config.category === 'backtracking' ? '/visualizer/backtracking' : '/visualizer/recursion'}
            subtopicName={config.title}
          />
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold ${
              engineStatus === 'cpp-native'
                ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                : engineStatus === 'cpp-precompiled'
                ? 'bg-cyan-950/60 border-cyan-700 text-cyan-300'
                : 'bg-rose-950/60 border-rose-700 text-rose-300'
            }`}>
              <Cpu className="w-3 h-3" />
              {engineStatus === 'cpp-native' ? 'C++ Live' : engineStatus === 'cpp-precompiled' ? 'C++ Cached' : 'Offline'}
            </div>
          </div>
        </div>

        {/* Input Controls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-indigo-500" />
              {config.title} — Input
            </span>
            {steps.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <span>{steps.length} trace steps</span>
                {totalCalls > 0 && <span>· {totalCalls} function calls</span>}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-end gap-4">
            {/* Numeric input for most algorithms */}
            {!isMaze && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">{config.inputLabel}</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setNValue(v => Math.max(config.minN, v - 1)); setIsModified(true); }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={nValue}
                    min={config.minN}
                    max={config.maxN}
                    onChange={e => { setNValue(Number(e.target.value)); setIsModified(true); setInputError(''); }}
                    className="w-20 px-3 py-2 text-center bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-800 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => { setNValue(v => Math.min(config.maxN, v + 1)); setIsModified(true); }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] text-slate-500">({config.minN}–{config.maxN})</span>
                </div>
              </div>
            )}

            {/* Maze preset selector */}
            {isMaze && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Maze Preset</label>
                <select
                  value={mazePreset}
                  onChange={e => { setMazePreset(e.target.value); setIsModified(true); }}
                  className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {Object.entries(MAZE_PRESETS).map(([key, p]) => (
                    <option key={key} value={key}>{p.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* N-Queens find-all toggle */}
            {isQueens && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Mode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setFindAll(false); setIsModified(true); }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      !findAll ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >First Solution</button>
                  <button
                    onClick={() => { setFindAll(true); setIsModified(true); }}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                      findAll ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >All Solutions</button>
                </div>
              </div>
            )}

            {/* Execute button */}
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 transition-all active:scale-95"
            >
              {isRunning
                ? <><RotateCcw className="w-4 h-4 animate-spin" /><span>Running C++...</span></>
                : <><Play className="w-4 h-4 fill-current" /><span>Execute C++</span></>
              }
            </button>
          </div>

          {/* Help text */}
          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" />
            {config.inputHelp}
          </p>

          {/* Error display */}
          {inputError && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {inputError}
            </div>
          )}

          {/* Modified notice */}
          {isModified && steps.length > 0 && !inputError && (
            <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
              <span>⚠ Input changed — click Execute C++ to regenerate trace.</span>
              <button onClick={handleRun} className="px-2.5 py-1 bg-amber-600 text-white rounded-lg font-bold text-[11px]">Run Now</button>
            </div>
          )}

          {/* Engine notice */}
          {engineMessage && (
            <p className="text-[11px] text-slate-400 font-mono">{engineMessage}</p>
          )}
        </div>

        {/* Main visualization */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Canvas (left 2/3) */}
          <div className="xl:col-span-2 flex flex-col gap-4">
            {/* Algorithm-specific canvas */}
            {isHanoi && <HanoiCanvas currentStep={currentStep} numDisks={nValue} />}
            {isMaze  && <MazeCanvas  currentStep={currentStep} rows={mazeRows} cols={mazeCols} />}
            {isQueens && <NQueensBoard currentStep={currentStep} n={nValue} />}

            {/* Factorial / Fibonacci: show recursion tree diagram note */}
            {(isFact || isFib) && (
              <div className="relative w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 shadow-xl p-6 overflow-hidden" style={{ minHeight: 220 }}>
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                  style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '28px 28px' }}
                />
                <div className="relative z-10 flex flex-col items-center justify-center h-full gap-4 text-center">
                  <GitBranch className="w-10 h-10 text-indigo-400 opacity-60" />
                  <div className="space-y-1">
                    <p className="text-slate-200 font-bold">
                      {isFact ? `factorial(${nValue})` : `fibonacci(${nValue})`} Recursion
                    </p>
                    {currentStep && (
                      <p className="text-indigo-300 font-mono text-sm">
                        Current: {currentStep.callStack?.[currentStep.callStack.length - 1] ?? '—'}
                      </p>
                    )}
                    <p className="text-slate-500 text-xs mt-2">
                      Step-through the call stack panel to follow the recursion tree.
                    </p>
                    {currentStep?.variables?.['return'] && (
                      <div className="mt-3 px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-700 inline-block">
                        <span className="text-slate-400 text-xs font-mono">return → </span>
                        <span className="text-emerald-300 font-mono font-bold text-lg">
                          {currentStep.variables['return']}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Completed result */}
                  {steps.length > 0 && steps[steps.length - 1]?.variables?.['result'] && (
                    <div className="px-5 py-3 rounded-2xl bg-indigo-950/70 border border-indigo-700">
                      <p className="text-slate-400 text-xs">Final Result</p>
                      <p className="text-indigo-200 font-mono font-bold text-2xl">
                        {isFact ? `${nValue}! = ` : `fib(${nValue}) = `}
                        {steps[steps.length - 1].variables?.['result']}
                      </p>
                      {isFib && (
                        <p className="text-purple-400 text-xs font-mono mt-1">
                          Total function calls: {totalCalls}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Playback controls */}
            <PlaybackControls
              currentStepIndex={currentStepIndex}
              totalSteps={totalSteps}
              isPlaying={isPlaying}
              speed={speed}
              isAtStart={isAtStart}
              isAtEnd={isAtEnd}
              onPlay={play}
              onPause={pause}
              onTogglePlay={togglePlay}
              onNext={nextStep}
              onPrev={prevStep}
              onReset={() => { reset(); goToStep(0); }}
              onSpeedChange={setSpeed}
              onGoToStep={goToStep}
            />

            {/* Step explanation */}
            {currentStep && <StepExplanation currentStep={currentStep} totalSteps={totalSteps} />}
          </div>

          {/* Right panel (1/3) */}
          <div className="flex flex-col gap-4">
            {/* Call stack */}
            <CallStackPanel currentStep={currentStep} algorithmId={algId} />

            {/* Execution state */}
            <RecursionStatePanel currentStep={currentStep} algorithmId={algId} />

            {/* Complexity */}
            {metadata && (
              <ComplexityPanel
                complexity={metadata.complexity}
                observedCounters={{
                  recursionDepth: currentStep?.recursionDepth,
                  passNumber: currentStep?.passNumber
                }}
              />
            )}
          </div>
        </div>

        {/* Source code (full width) */}
        <PseudocodePanel
          lines={sourceCode ? sourceCode.split('\n') : []}
          activeLine={currentStep?.activeLine}
          language="C++"
          title={`C++ Source — ${config.title}`}
        />

      </div>
    </VisualizerLayout>
  );
};
