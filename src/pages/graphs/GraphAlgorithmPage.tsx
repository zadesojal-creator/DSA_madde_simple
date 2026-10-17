import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { VisualizerLayout } from '../../components/workspace/VisualizerLayout';
import { TopicBreadcrumbs } from '../../components/workspace/TopicBreadcrumbs';
import { GraphCanvas } from '../../components/graphs/GraphCanvas';
import { GraphControls, type GraphEdgeData } from '../../components/graphs/GraphControls';
import { AdjacencyListView } from '../../components/graphs/AdjacencyListView';
import { AdjacencyMatrixView } from '../../components/graphs/AdjacencyMatrixView';
import { GraphAlgorithmStatePanel } from '../../components/graphs/GraphAlgorithmStatePanel';
import { GraphLegend } from '../../components/graphs/GraphLegend';
import { PlaybackControls } from '../../components/workspace/PlaybackControls';
import { StepExplanation } from '../../components/workspace/StepExplanation';
import { PseudocodePanel } from '../../components/workspace/PseudocodePanel';
import { ComplexityPanel } from '../../components/workspace/ComplexityPanel';
import { usePlayback } from '../../hooks/usePlayback';
import { ALGORITHMS_METADATA } from '../../data/algorithmsMetadata';
import { 
  executeCppGraphAlgorithm, 
  validateGraphInput, 
  type CppEngineStatus 
} from '../../services/cppExecutionAdapter';
import type { TraceStep, GraphVertexSnapshot, GraphEdgeSnapshot } from '../../types/trace';
import { Cpu, Lightbulb, Share2 } from 'lucide-react';

interface DefaultGraphConfig {
  vertexCount: number;
  directed: boolean;
  weighted: boolean;
  edges: GraphEdgeData[];
  source: number;
  target: number;
}

const DEFAULT_CONFIGS: Record<string, DefaultGraphConfig> = {
  bfs: {
    vertexCount: 6,
    directed: false,
    weighted: false,
    edges: [
      { u: 0, v: 1, weight: 1 },
      { u: 0, v: 2, weight: 1 },
      { u: 1, v: 3, weight: 1 },
      { u: 1, v: 4, weight: 1 },
      { u: 2, v: 4, weight: 1 },
      { u: 3, v: 5, weight: 1 },
      { u: 4, v: 5, weight: 1 }
    ],
    source: 0,
    target: 5
  },
  dfs: {
    vertexCount: 6,
    directed: true,
    weighted: false,
    edges: [
      { u: 0, v: 1, weight: 1 },
      { u: 0, v: 2, weight: 1 },
      { u: 1, v: 3, weight: 1 },
      { u: 2, v: 3, weight: 1 },
      { u: 3, v: 4, weight: 1 },
      { u: 4, v: 5, weight: 1 },
      { u: 5, v: 2, weight: 1 }
    ],
    source: 0,
    target: -1
  },
  dijkstra: {
    vertexCount: 5,
    directed: true,
    weighted: true,
    edges: [
      { u: 0, v: 1, weight: 4 },
      { u: 0, v: 2, weight: 2 },
      { u: 1, v: 2, weight: 1 },
      { u: 1, v: 3, weight: 5 },
      { u: 2, v: 3, weight: 8 },
      { u: 2, v: 4, weight: 10 },
      { u: 3, v: 4, weight: 2 }
    ],
    source: 0,
    target: 4
  },
  'bellman-ford': {
    vertexCount: 5,
    directed: true,
    weighted: true,
    edges: [
      { u: 0, v: 1, weight: 4 },
      { u: 0, v: 2, weight: 2 },
      { u: 1, v: 2, weight: -1 },
      { u: 1, v: 3, weight: 2 },
      { u: 2, v: 3, weight: 3 },
      { u: 3, v: 4, weight: 2 }
    ],
    source: 0,
    target: 4
  },
  'floyd-warshall': {
    vertexCount: 4,
    directed: true,
    weighted: true,
    edges: [
      { u: 0, v: 1, weight: 3 },
      { u: 0, v: 2, weight: 8 },
      { u: 1, v: 2, weight: 2 },
      { u: 1, v: 3, weight: 5 },
      { u: 2, v: 3, weight: 1 },
      { u: 3, v: 0, weight: 2 }
    ],
    source: 0,
    target: 3
  }
};

const THEORETICAL_EXPLANATIONS: Record<string, { title: string; explanation: string }> = {
  bfs: {
    title: 'Why BFS finds Shortest Paths in Unweighted Graphs',
    explanation:
      'BFS explores vertices in strictly non-decreasing order of their distance from the source. Because all edge weights are equal (weight = 1), the first time an unvisited vertex v is discovered from an active vertex u, the path dist[u] + 1 is guaranteed to be the shortest possible hop count.'
  },
  dfs: {
    title: 'How DFS Explores and Backtracks',
    explanation:
      'DFS uses a Last-In First-Out (LIFO) recursive call stack to traverse deeply along each path until reaching a dead end or previously visited node. It records discovery timestamps dt[u] when entering a vertex and finish timestamps ft[u] when all incident branches have been completely explored.'
  },
  dijkstra: {
    title: 'Why Dijkstra Requires Non-Negative Weights',
    explanation:
      'Dijkstra operates greedily by extracting the unvisited vertex with the minimum tentative distance and immediately declaring its shortest path finalized. If edges could have negative weights, a later edge could produce a cheaper detour to an already finalized vertex, breaking the foundational monotonicity invariant.'
  },
  'bellman-ford': {
    title: 'How Bellman–Ford Detects Reachable Negative Cycles',
    explanation:
      'In any graph with V vertices, a simple path without cycles contains at most V - 1 edges. Therefore, after V - 1 complete relaxation passes, all shortest paths must stabilize. If any edge can still be successfully relaxed on the V-th pass, a negative-weight cycle must exist along the path from the source.'
  },
  'floyd-warshall': {
    title: 'Why Floyd–Warshall Evaluates Every Intermediate Detour',
    explanation:
      'Floyd–Warshall uses dynamic programming to solve all-pairs shortest paths. In iteration k, it considers whether using vertex k as an intermediate detour allows a shorter route between every source i and destination j (i.e. dist[i][k] + dist[k][j] < dist[i][j]). It checks for negative cycles if any diagonal entry dist[i][i] drops below zero.'
  }
};

interface GraphAlgorithmPageProps {
  algorithm?: string;
}

export const GraphAlgorithmPage: React.FC<GraphAlgorithmPageProps> = ({ algorithm }) => {
  const params = useParams<{ algorithmId?: string }>();
  const activeAlgorithmId = useMemo(() => {
    const raw = algorithm || params.algorithmId || 'bfs';
    if (['bfs', 'dfs', 'dijkstra', 'bellman-ford', 'floyd-warshall'].includes(raw)) {
      return raw;
    }
    return 'bfs';
  }, [algorithm, params.algorithmId]);

  const meta = ALGORITHMS_METADATA[activeAlgorithmId] || ALGORITHMS_METADATA['bfs'];
  const defaultConfig = DEFAULT_CONFIGS[activeAlgorithmId] || DEFAULT_CONFIGS['bfs'];

  // Graph state
  const [vertexCount, setVertexCount] = useState<number>(defaultConfig.vertexCount);
  const [edges, setEdges] = useState<GraphEdgeData[]>(defaultConfig.edges);
  const [directed, setDirected] = useState<boolean>(defaultConfig.directed);
  const [weighted, setWeighted] = useState<boolean>(defaultConfig.weighted);
  const [sourceVertex, setSourceVertex] = useState<number>(defaultConfig.source);
  const [targetVertex, setTargetVertex] = useState<number>(defaultConfig.target);
  const [viewMode, setViewMode] = useState<'canvas' | 'adj-list' | 'adj-matrix'>('canvas');
  const [isModified, setIsModified] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | undefined>();

  // Trace execution state
  const [traceSteps, setTraceSteps] = useState<TraceStep[]>([]);
  const [cppSourceCode, setCppSourceCode] = useState<string>('');
  const [engineStatus, setEngineStatus] = useState<CppEngineStatus>('cpp-precompiled');
  const [engineMessage, setEngineMessage] = useState<string>('');

  // Reset graph when switching algorithms
  useEffect(() => {
    const cfg = DEFAULT_CONFIGS[activeAlgorithmId] || DEFAULT_CONFIGS['bfs'];
    setVertexCount(cfg.vertexCount);
    setEdges(cfg.edges);
    setDirected(cfg.directed);
    setWeighted(cfg.weighted);
    setSourceVertex(cfg.source);
    setTargetVertex(cfg.target);
    setIsModified(false);
    setValidationError(undefined);
  }, [activeAlgorithmId]);

  // Playback controller
  const playback = usePlayback({
    steps: traceSteps,
    initialSpeed: 1
  });

  const { reset: resetPlayback } = playback;

  // Execute C++ algorithm
  const runAlgorithmExecution = useCallback(async () => {
    // Validate edge tokens
    const edgeTokens = edges.map((e) => `${e.u}-${e.v}${weighted ? `:${e.weight}` : ''}`).join(',');
    const check = validateGraphInput(edgeTokens, vertexCount, weighted, activeAlgorithmId);
    if (!check.valid) {
      setValidationError(check.error);
      return;
    }
    setValidationError(undefined);

    const result = await executeCppGraphAlgorithm(activeAlgorithmId, edgeTokens, {
      source: sourceVertex,
      target: targetVertex,
      vertices: vertexCount,
      directed,
      weighted
    });

    setTraceSteps(result.steps);
    setCppSourceCode(result.sourceCode);
    setEngineStatus(result.engineStatus);
    setEngineMessage(result.engineMessage);
    setIsModified(false);
    resetPlayback();
  }, [edges, weighted, vertexCount, activeAlgorithmId, sourceVertex, targetVertex, directed, resetPlayback]);

  // Run initial trace on mount or algorithm change
  useEffect(() => {
    runAlgorithmExecution();
  }, [runAlgorithmExecution]);

  // Handle graph modification
  const handleUpdateGraph = (newV: number, newEdges: GraphEdgeData[], newDir: boolean, newWeight: boolean) => {
    setVertexCount(newV);
    setEdges(newEdges);
    setDirected(newDir);
    setWeighted(newWeight);
    setIsModified(true);
    setValidationError(undefined);
  };

  const handleUpdateSourceTarget = (src: number, tgt: number) => {
    setSourceVertex(src);
    setTargetVertex(tgt);
    setIsModified(true);
  };

  const handleResetGraph = () => {
    const cfg = DEFAULT_CONFIGS[activeAlgorithmId] || DEFAULT_CONFIGS['bfs'];
    setVertexCount(cfg.vertexCount);
    setEdges(cfg.edges);
    setDirected(cfg.directed);
    setWeighted(cfg.weighted);
    setSourceVertex(cfg.source);
    setTargetVertex(cfg.target);
    setIsModified(false);
    setValidationError(undefined);
    runAlgorithmExecution();
  };

  const handleLoadSample = (sampleType: string) => {
    if (sampleType === 'disconnected') {
      const newEdges: GraphEdgeData[] = [
        { u: 0, v: 1, weight: 1 },
        { u: 1, v: 2, weight: 2 },
        { u: 3, v: 4, weight: 3 }
      ];
      setVertexCount(5);
      setEdges(newEdges);
      setSourceVertex(0);
      setTargetVertex(4);
    } else if (sampleType === 'cycle') {
      const newEdges: GraphEdgeData[] = [
        { u: 0, v: 1, weight: 1 },
        { u: 1, v: 2, weight: 2 },
        { u: 2, v: 3, weight: 1 },
        { u: 3, v: 0, weight: 3 }
      ];
      setVertexCount(4);
      setEdges(newEdges);
      setSourceVertex(0);
      setTargetVertex(2);
    } else if (sampleType === 'negative-weights') {
      const newEdges: GraphEdgeData[] = [
        { u: 0, v: 1, weight: 1 },
        { u: 1, v: 2, weight: 2 },
        { u: 2, v: 3, weight: -10 },
        { u: 3, v: 1, weight: 1 }
      ];
      setVertexCount(4);
      setDirected(true);
      setWeighted(true);
      setEdges(newEdges);
      setSourceVertex(0);
      setTargetVertex(3);
    } else {
      handleResetGraph();
      return;
    }
    setIsModified(true);
  };



  const currentStep = playback.currentStep;

  // Active step graph snapshot vertices and edges
  const displayVertices: GraphVertexSnapshot[] = useMemo(() => {
    if (currentStep?.graphVertices && currentStep.graphVertices.length > 0) {
      return currentStep.graphVertices;
    }
    return Array.from({ length: vertexCount }, (_, i) => ({
      id: i,
      label: String(i),
      state: 'unvisited',
      distance: 0,
      hasDistance: false,
      predecessor: -1,
      discoveryTime: -1,
      finishTime: -1
    }));
  }, [currentStep, vertexCount]);

  const displayEdges: GraphEdgeSnapshot[] = useMemo(() => {
    if (currentStep?.graphEdges && currentStep.graphEdges.length > 0) {
      return currentStep.graphEdges;
    }
    return edges.map((e) => ({
      u: e.u,
      v: e.v,
      weight: e.weight,
      directed,
      state: 'normal'
    }));
  }, [currentStep, edges, directed]);

  const activeLine = currentStep?.sourceLine || currentStep?.activeLine;
  const theory = THEORETICAL_EXPLANATIONS[activeAlgorithmId];

  return (
    <VisualizerLayout activeTitle={meta.title}>
      <div className="space-y-6 text-slate-900 pb-12">
        {/* Breadcrumbs & Header */}
        <div className="space-y-1.5 border-b border-slate-200 pb-4">
          <TopicBreadcrumbs
            categoryName="Graph Algorithms"
            categoryRoute="/visualizer/graphs"
            subtopicName={meta.title}
          />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                <Share2 className="w-7 h-7 text-indigo-600" />
                <span>{meta.title}</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                  <span>C++ Powered</span>
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 pt-1 max-w-3xl">
                {meta.detailedDescription}
              </p>
            </div>

            {/* Engine Status Badge */}
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700">
              <span
                className={`w-2 h-2 rounded-full ${
                  engineStatus === 'cpp-native'
                    ? 'bg-emerald-500 animate-pulse'
                    : engineStatus === 'cpp-precompiled'
                    ? 'bg-indigo-500'
                    : 'bg-amber-500'
                }`}
              />
              <span className="text-[11px] font-sans font-medium">
                {engineMessage || 'C++ Execution Ready'}
              </span>
            </div>
          </div>
        </div>

        {/* Input & Graph Controls */}
        <GraphControls
          vertexCount={vertexCount}
          edges={edges}
          directed={directed}
          weighted={weighted}
          sourceVertex={sourceVertex}
          targetVertex={targetVertex}
          viewMode={viewMode}
          algorithmId={activeAlgorithmId}
          isModified={isModified}
          error={validationError}
          onUpdateGraph={handleUpdateGraph}
          onUpdateSourceTarget={handleUpdateSourceTarget}
          onChangeViewMode={setViewMode}
          onRunAlgorithm={runAlgorithmExecution}
          onResetGraph={handleResetGraph}
          onLoadSample={handleLoadSample}
        />

        {/* Main Graph Visualization Area */}
        <div className="space-y-4">
          {viewMode === 'canvas' && (
            <GraphCanvas
              vertices={displayVertices}
              edges={displayEdges}
              activeVertexId={currentStep?.activeVertexId}
              activeEdgeU={currentStep?.activeEdgeU}
              activeEdgeV={currentStep?.activeEdgeV}
              reconstructedPath={currentStep?.reconstructedPath}
              algorithmId={activeAlgorithmId}
            />
          )}

          {viewMode === 'adj-list' && (
            <AdjacencyListView
              vertices={displayVertices}
              edges={displayEdges}
              directed={directed}
              weighted={weighted}
            />
          )}

          {viewMode === 'adj-matrix' && (
            <AdjacencyMatrixView
              vertices={displayVertices}
              edges={displayEdges}
              directed={directed}
              weighted={weighted}
            />
          )}

          {/* Visualizer Legend */}
          <GraphLegend />
        </div>

        {/* Playback Controls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <PlaybackControls
            isPlaying={playback.isPlaying}
            currentStepIndex={playback.currentStepIndex}
            totalSteps={playback.totalSteps}
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

        {/* Step Explanation & Algorithm State Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StepExplanation
            currentStep={currentStep}
            totalSteps={playback.totalSteps}
          />
          <GraphAlgorithmStatePanel
            currentStep={currentStep}
            algorithmId={activeAlgorithmId}
          />
        </div>

        {/* C++ Source Code Panel with Active Line Highlighting */}
        <div className="space-y-2">
          <PseudocodePanel
            lines={cppSourceCode ? cppSourceCode.split('\n') : ['// Loading C++ implementation...']}
            activeLine={activeLine}
            title={`${meta.title} — C++ Source Code`}
          />
        </div>

        {/* Conceptual Explanation Box */}
        {theory && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/60 border border-indigo-100 shadow-xs space-y-2">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-indigo-600" />
              <span>{theory.title}</span>
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              {theory.explanation}
            </p>
          </div>
        )}

        {/* Complexity Analysis Panel */}
        <ComplexityPanel complexity={meta.complexity} />
      </div>
    </VisualizerLayout>
  );
};
