import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Play, RotateCcw, AlertCircle, Cpu, Info, ChevronUp, ChevronDown
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
  noway: {
    grid: [[0,1,0],[1,1,0],[0,0,0]],
    rows:3, cols:3, sr:0, sc:0, gr:2, gc:2,
    label: 'Unsolvable 3×3'
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
interface RecursionAlgorithmPageProps {
  algorithm?: string;
}

export const RecursionAlgorithmPage: React.FC<RecursionAlgorithmPageProps> = ({
  algorithm: propAlgorithm
}) => {
  const { algorithm: paramAlgorithm } = useParams<{ algorithm: string }>();
  const navigate = useNavigate();

  const algId = propAlgorithm || paramAlgorithm || 'factorial';
  const config = ALGO_CONFIGS[algId];

  // State
  const [nValue, setNValue] = useState<number>(config?.defaultN ?? 5);
  const [findAll, setFindAll] = useState<boolean>(config?.defaultFindAll ?? false);
  const [mazePreset, setMazePreset] = useState<string>('default');
  const [mazeRows, setMazeRows] = useState<number>(5);
  const [mazeCols, setMazeCols] = useState<number>(5);

  const [steps, setSteps] = useState<TraceStep[]>([]);
  const [sourceCode, setSourceCode] = useState<string>('');
  const [engineStatus, setEngineStatus] = useState<CppEngineStatus>('cpp-precompiled');
  const [engineMessage, setEngineMessage] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [inputError, setInputError] = useState<string>('');
  const [isModified, setIsModified] = useState(false);

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

  const playRef = useRef(play);
  const resetRef = useRef(reset);

  useEffect(() => {
    playRef.current = play;
    resetRef.current = reset;
  }, [play, reset]);

  const metadata = ALGORITHMS_METADATA[algId];

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

  // ── Execute algorithm with specific parameters ──
  const runAlgorithmWith = useCallback(async (
    targetAlgId: string,
    targetN: number,
    targetFindAll: boolean,
    targetMazePreset: string,
    autoPlay = true
  ) => {
    setIsRunning(true);
    setIsModified(false);
    setInputError('');

    try {
      let arrStr = String(targetN);
      let targetVal = targetN;

      if (targetAlgId === 'maze') {
        const preset = MAZE_PRESETS[targetMazePreset] || MAZE_PRESETS['default'];
        const flat = preset.grid.flat().join(',');
        arrStr = `${preset.rows};${preset.cols};${flat};${preset.sr};${preset.sc};${preset.gr};${preset.gc}`;
        setMazeRows(preset.rows);
        setMazeCols(preset.cols);
        targetVal = 0;
      }

      const result = await executeCppRecursionAlgorithm(
        targetAlgId,
        arrStr,
        targetVal,
        { findAll: targetFindAll }
      );

      setSteps(result.steps);
      setSourceCode(result.sourceCode);
      setEngineStatus(result.engineStatus);
      setEngineMessage(result.engineMessage);

      if (result.steps.length > 1 && autoPlay) {
        resetRef.current();
        setTimeout(() => {
          playRef.current();
        }, 60);
      } else {
        resetRef.current();
      }
    } catch (err) {
      console.error('C++ execution error:', err);
      setInputError('C++ execution failed. Check that the trace service is available.');
    } finally {
      setIsRunning(false);
    }
  }, []);

  // When algId changes, initialize defaults and immediately run with those defaults
  useEffect(() => {
    if (!config) {
      navigate('/visualizer/recursion/factorial');
      return;
    }
    const c = ALGO_CONFIGS[algId];
    if (c) {
      const initialN = c.defaultN;
      const initialFindAll = c.defaultFindAll ?? false;
      const initialPreset = 'default';
      setNValue(initialN);
      setFindAll(initialFindAll);
      if (algId === 'maze') {
        setMazePreset(initialPreset);
        setMazeRows(5);
        setMazeCols(5);
      }
      void runAlgorithmWith(algId, initialN, initialFindAll, initialPreset, true);
    }
  }, [algId, config, navigate, runAlgorithmWith]);

  const handleRun = () => {
    if (!validateInput()) return;
    void runAlgorithmWith(algId, nValue, findAll, mazePreset, true);
  };

  if (!config) return null;

  const isMaze = algId === 'maze';
  const isHanoi = algId === 'tower-of-hanoi';
  const isQueens = algId === 'n-queens';
  const isFib = algId === 'fibonacci';
  const isFact = algId === 'factorial';

  const totalCalls = steps.filter(s => s.eventType === 'function_enter').length;

  return (
    <VisualizerLayout activeTitle={`${config.title} Visualizer`}>
      <div className="space-y-6">

        {/* Breadcrumb Header */}
        <div className="space-y-1.5 border-b border-slate-200 pb-4">
          <TopicBreadcrumbs
            categoryName={config.category === 'recursion' ? 'Recursion' : 'Backtracking'}
            categoryRoute={config.category === 'recursion' ? '/visualizer/recursion' : '/visualizer/backtracking'}
            subtopicName={config.title}
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                <span>{config.title} Visualizer</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                  <span>C++ Trace Engine</span>
                </span>
              </h1>
              {metadata && (
                <p className="text-xs sm:text-sm text-slate-600 pt-1 max-w-3xl">
                  {metadata.detailedDescription}
                </p>
              )}
            </div>

            {/* Engine Status Badge */}
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
              <span className={`w-2 h-2 rounded-full ${
                engineStatus === 'cpp-native'
                  ? 'bg-emerald-500 animate-pulse'
                  : engineStatus === 'cpp-precompiled'
                  ? 'bg-indigo-500'
                  : 'bg-amber-500'
              }`} />
              <span className="text-[11px] font-sans font-medium">{engineMessage || 'C++ Ready'}</span>
            </div>
          </div>
        </div>

        {/* Algorithm Quick Switcher Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider shrink-0 mr-2">Algorithms:</span>
          {Object.values(ALGO_CONFIGS).map(alg => (
            <button
              key={alg.id}
              onClick={() => {
                const route = alg.category === 'recursion'
                  ? `/visualizer/recursion/${alg.id}`
                  : `/visualizer/backtracking/${alg.id}`;
                navigate(route);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                alg.id === algId
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {alg.title}
            </button>
          ))}
        </div>

        {/* Input & Control Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Execution Parameters</h2>
              <p className="text-xs text-slate-500">Configure parameters and run the C++ execution tracer.</p>
            </div>
            {/* Quick Presets (where applicable) */}
            {isQueens && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium">Presets:</span>
                {[4, 6, 8].map(n => (
                  <button
                    key={n}
                    onClick={() => {
                      setNValue(n);
                      setIsModified(true);
                      void runAlgorithmWith(algId, n, findAll, mazePreset, true);
                    }}
                    className={`px-2 py-0.5 rounded-lg border font-mono font-bold text-xs transition-colors ${
                      nValue === n
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    N={n}
                  </button>
                ))}
              </div>
            )}
            {isHanoi && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium">Presets:</span>
                {[2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => {
                      setNValue(n);
                      setIsModified(true);
                      void runAlgorithmWith(algId, n, findAll, mazePreset, true);
                    }}
                    className={`px-2 py-0.5 rounded-lg border font-mono font-bold text-xs transition-colors ${
                      nValue === n
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {n} Disks
                  </button>
                ))}
              </div>
            )}
            {isMaze && (
              <div className="flex items-center gap-1.5 text-xs flex-wrap">
                <span className="text-slate-400 font-medium">Presets:</span>
                {Object.entries(MAZE_PRESETS).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setMazePreset(key);
                      setMazeRows(p.rows);
                      setMazeCols(p.cols);
                      setIsModified(true);
                      void runAlgorithmWith(algId, nValue, findAll, key, true);
                    }}
                    className={`px-2 py-0.5 rounded-lg border font-mono text-xs transition-colors ${
                      mazePreset === key
                        ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input Controls Row */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            {/* Number Input (Fact, Fib, Hanoi, Queens) */}
            {!isMaze && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                  {config.inputLabel}:
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min={config.minN}
                    max={config.maxN}
                    value={nValue}
                    onChange={(e) => {
                      setNValue(Number(e.target.value));
                      setIsModified(true);
                      setInputError('');
                    }}
                    className="w-20 px-3 py-1.5 text-sm font-mono font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  <div className="flex flex-col ml-1">
                    <button
                      onClick={() => {
                        if (nValue < config.maxN) {
                          const nextVal = nValue + 1;
                          setNValue(nextVal);
                          setIsModified(true);
                          void runAlgorithmWith(algId, nextVal, findAll, mazePreset, true);
                        }
                      }}
                      disabled={nValue >= config.maxN}
                      className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (nValue > config.minN) {
                          const nextVal = nValue - 1;
                          setNValue(nextVal);
                          setIsModified(true);
                          void runAlgorithmWith(algId, nextVal, findAll, mazePreset, true);
                        }
                      }}
                      disabled={nValue <= config.minN}
                      className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Find All Solutions Toggle for N-Queens */}
            {config.showFindAll && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Mode:</span>
                <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
                  <button
                    onClick={() => {
                      setFindAll(false);
                      setIsModified(true);
                      void runAlgorithmWith(algId, nValue, false, mazePreset, true);
                    }}
                    className={`px-3 py-1 font-semibold transition-colors ${
                      !findAll ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >First Solution</button>
                  <button
                    onClick={() => {
                      setFindAll(true);
                      setIsModified(true);
                      void runAlgorithmWith(algId, nValue, true, mazePreset, true);
                    }}
                    className={`px-3 py-1 font-semibold transition-colors ${
                      findAll ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
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
            {isFact && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center min-h-[300px]">
                <div className="text-center space-y-3">
                  <div className="text-slate-400 text-xs font-mono uppercase tracking-wider">Factorial Computation (n!)</div>
                  <div className="text-4xl font-extrabold text-white font-mono">
                    {nValue}! = {currentStep?.variables?.['result'] || currentStep?.variables?.['return'] || '...'}
                  </div>
                  <div className="text-slate-400 text-sm max-w-md">
                    {currentStep?.description || `Computing ${nValue}! recursively...`}
                  </div>
                  {currentStep?.variables?.['sub'] !== undefined && currentStep?.variables?.['n'] !== undefined && (
                    <div className="inline-block px-4 py-2 bg-indigo-950/80 border border-indigo-700/60 rounded-xl text-indigo-300 font-mono text-sm">
                      Returning {currentStep.variables['n']} × {currentStep.variables['sub']} = {currentStep.variables['return']}
                    </div>
                  )}
                </div>
              </div>
            )}

            {isFib && (
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center min-h-[300px]">
                <div className="text-center space-y-3">
                  <div className="text-slate-400 text-xs font-mono uppercase tracking-wider">Fibonacci Sequence Value</div>
                  <div className="text-4xl font-extrabold text-white font-mono">
                    fib({nValue}) = {currentStep?.variables?.['result'] || currentStep?.variables?.['return'] || '...'}
                  </div>
                  <div className="text-slate-400 text-sm max-w-md">
                    {currentStep?.description || `Computing fib(${nValue}) via branch recursion...`}
                  </div>
                  <div className="flex gap-3 justify-center text-xs font-mono text-slate-400 pt-2">
                    <span className="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                      Depth: <strong className="text-indigo-400">{currentStep?.recursionDepth ?? 0}</strong>
                    </span>
                    <span className="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                      Total calls: <strong className="text-amber-400">{totalCalls}</strong>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {isHanoi && (
              <HanoiCanvas
                currentStep={currentStep}
                numDisks={nValue}
              />
            )}

            {isMaze && (
              <MazeCanvas
                currentStep={currentStep}
                rows={mazeRows}
                cols={mazeCols}
              />
            )}

            {isQueens && (
              <NQueensBoard
                currentStep={currentStep}
                n={nValue}
              />
            )}

            {/* Recursion State Summary Panel */}
            <RecursionStatePanel
              currentStep={currentStep}
              algorithmId={algId}
            />
          </div>

          {/* Call Stack Sidebar (right 1/3) */}
          <div className="flex flex-col gap-4">
            <CallStackPanel
              currentStep={currentStep}
              algorithmId={algId}
            />
          </div>
        </div>

        {/* Playback Controls Strip */}
        <PlaybackControls
          isPlaying={isPlaying}
          currentStepIndex={currentStepIndex}
          totalSteps={totalSteps}
          speed={speed}
          isAtStart={isAtStart}
          isAtEnd={isAtEnd}
          onPlay={play}
          onPause={pause}
          onTogglePlay={togglePlay}
          onNext={nextStep}
          onPrev={prevStep}
          onReset={reset}
          onGoToStep={goToStep}
          onSpeedChange={setSpeed}
        />

        {/* Step Explanation Card */}
        <StepExplanation
          currentStep={currentStep}
          totalSteps={totalSteps}
        />

        {/* Code & Complexity Analysis Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-2">
            <PseudocodePanel
              lines={sourceCode ? sourceCode.split('\n') : ['// C++ source code loading...']}
              activeLine={currentStep?.sourceLine ?? currentStep?.activeLine}
              title={`${config.title} — Canonical C++ Implementation`}
              language="C++ (ISO C++17 Single Source of Truth)"
            />
          </div>

          <div className="lg:col-span-5 space-y-2">
            {metadata && (
              <ComplexityPanel
                complexity={metadata.complexity}
                observedCounters={{
                  comparisons: currentStep?.comparisons,
                  swaps: currentStep?.swaps,
                  writes: currentStep?.writes,
                  passNumber: currentStep?.passNumber,
                  recursionDepth: currentStep?.recursionDepth
                }}
              />
            )}
          </div>
        </div>

      </div>
    </VisualizerLayout>
  );
};
