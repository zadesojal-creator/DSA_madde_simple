import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Play, RotateCcw, Layers3, ArrowRightLeft } from 'lucide-react';
import { VisualizerLayout } from '../components/workspace/VisualizerLayout';
import { TopicBreadcrumbs } from '../components/workspace/TopicBreadcrumbs';
import { PlaybackControls } from '../components/workspace/PlaybackControls';
import { StepExplanation } from '../components/workspace/StepExplanation';
import { PseudocodePanel } from '../components/workspace/PseudocodePanel';
import { ComplexityPanel } from '../components/workspace/ComplexityPanel';
import { StackVisualizationCanvas } from '../components/workspace/StackVisualizationCanvas';
import { usePlayback } from '../hooks/usePlayback';
import { STACK_OPERATIONS, buildStackTrace, type StackOperationId } from '../data/stackVisualizerData';

const DEFAULT_STACK_INPUT = '10, 20, 30';

export const StacksQueuesVisualizerPage: React.FC = () => {
  const { subtopicId } = useParams<{ subtopicId?: string }>();
  const navigate = useNavigate();
  const activeOperation: StackOperationId = useMemo(() => {
    if (!subtopicId) return 'stack-intro';
    if (subtopicId in STACK_OPERATIONS) return subtopicId as StackOperationId;
    if (subtopicId === 'stack-operations') return 'stack-intro';
    if (subtopicId === 'balanced-parentheses') return 'balanced-parentheses';
    return 'stack-intro';
  }, [subtopicId]);

  const currentMeta = STACK_OPERATIONS[activeOperation];
  const [params, setParams] = useState({
    stack: currentMeta.defaultStack,
    capacity: currentMeta.defaultCapacity,
    value: currentMeta.defaultValue,
    target: currentMeta.defaultTarget,
    expression: currentMeta.defaultExpression
  });

  useEffect(() => {
    setParams({
      stack: currentMeta.defaultStack,
      capacity: currentMeta.defaultCapacity,
      value: currentMeta.defaultValue,
      target: currentMeta.defaultTarget,
      expression: currentMeta.defaultExpression
    });
  }, [activeOperation, currentMeta]);

  const traceSteps = useMemo(() => buildStackTrace(activeOperation, params), [activeOperation, params]);
  const playback = usePlayback({ steps: traceSteps, initialSpeed: 1 });

  const handleSelectOperation = useCallback((nextOp: StackOperationId) => {
    const nextPath = `/visualizer/stacks-queues/${nextOp}`;
    navigate(nextPath, { replace: false });
    playback.reset();
  }, [navigate, playback]);

  const updateStackInput = useCallback((rawValue: string) => {
    const parsed = rawValue
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((token) => Number(token));
    const cleaned = parsed.filter((value) => Number.isFinite(value));
    setParams((prev) => ({ ...prev, stack: cleaned }));
    playback.reset();
  }, [playback]);

  const updateScalar = useCallback(<K extends keyof typeof params>(key: K, value: (typeof params)[K]) => {
    setParams((prev) => ({ ...prev, [key]: value }));
    playback.reset();
  }, [playback]);

  const stackInputValue = params.stack.join(', ');

  return (
    <VisualizerLayout activeTitle={`Stacks: ${currentMeta.title}`}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <TopicBreadcrumbs
              categoryName="Stacks & Queues"
              categoryRoute="/visualizer/stacks-queues"
              subtopicName={currentMeta.shortTitle}
            />
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl flex items-center gap-2">
              <span>{currentMeta.title}</span>
              <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-violet-700">
                C++ Engine
              </span>
            </h1>
            <p className="text-sm text-slate-600">{currentMeta.description}</p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => playback.togglePlay()}
              className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-violet-600/20 transition hover:bg-violet-700"
            >
              <span className="flex items-center gap-2">
                <Play className="h-3.5 w-3.5 fill-current" />
                {playback.isPlaying ? 'Pause' : 'Play Trace'}
              </span>
            </button>
            <button
              onClick={() => playback.reset()}
              className="rounded-xl border border-slate-200 bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200"
              aria-label="Reset playback"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-7">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                <Layers3 className="h-3.5 w-3.5 text-violet-600" />
                Operation
              </div>

              <label className="block text-xs font-medium text-slate-600">Select stack operation</label>
              <select
                value={activeOperation}
                onChange={(event) => handleSelectOperation(event.target.value as StackOperationId)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 outline-none ring-0 transition focus:border-violet-400 focus:bg-white"
              >
                {Object.values(STACK_OPERATIONS).map((op) => (
                  <option key={op.id} value={op.id}>{op.title}</option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                <ArrowRightLeft className="h-3.5 w-3.5 text-violet-600" />
                Stack Inputs
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block text-xs font-medium text-slate-600">
                  Stack values
                  <input
                    value={stackInputValue}
                    onChange={(event) => updateStackInput(event.target.value)}
                    placeholder={DEFAULT_STACK_INPUT}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white"
                  />
                </label>

                <label className="block text-xs font-medium text-slate-600">
                  Capacity
                  <input
                    type="number"
                    min={1}
                    value={params.capacity}
                    onChange={(event) => updateScalar('capacity', Number(event.target.value) || 1)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white"
                  />
                </label>

                {activeOperation === 'push' && (
                  <label className="block text-xs font-medium text-slate-600">
                    Value to push
                    <input
                      type="number"
                      value={params.value}
                      onChange={(event) => updateScalar('value', Number(event.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white"
                    />
                  </label>
                )}

                {(activeOperation === 'search' || activeOperation === 'balanced-parentheses') && (
                  <label className="block text-xs font-medium text-slate-600">
                    {activeOperation === 'search' ? 'Target value' : 'Expression'}
                    <input
                      value={activeOperation === 'search' ? String(params.target) : params.expression}
                      onChange={(event) => {
                        if (activeOperation === 'search') {
                          updateScalar('target', Number(event.target.value));
                        } else {
                          updateScalar('expression', event.target.value);
                        }
                      }}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-violet-400 focus:bg-white"
                    />
                  </label>
                )}
              </div>
            </div>

            <StepExplanation currentStep={playback.currentStep} totalSteps={playback.totalSteps} />
          </div>

          <div className="space-y-6 xl:col-span-5">
            <StackVisualizationCanvas
              currentStep={playback.currentStep}
              capacity={params.capacity}
              title={currentMeta.title}
              subtitle={playback.currentStep?.title}
            />

            <PseudocodePanel
              lines={currentMeta.cppCode}
              activeLine={playback.currentStep?.sourceLine}
              title={`${currentMeta.shortTitle} (C++ Source)`}
              language="C++ std::vector"
            />

            <ComplexityPanel complexity={currentMeta.complexity} />
          </div>
        </div>

        <PlaybackControls
          currentStepIndex={playback.currentStepIndex}
          totalSteps={playback.totalSteps}
          isPlaying={playback.isPlaying}
          speed={playback.speed}
          isAtStart={playback.isAtStart}
          isAtEnd={playback.isAtEnd}
          onPlay={playback.play}
          onPause={playback.pause}
          onTogglePlay={playback.togglePlay}
          onNext={playback.nextStep}
          onPrev={playback.prevStep}
          onReset={playback.reset}
          onGoToStep={playback.goToStep}
          onSpeedChange={playback.setSpeed}
        />
      </div>
    </VisualizerLayout>
  );
};
