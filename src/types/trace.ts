// Trace and Playback Type Definitions

export type ItemHighlightType = 
  | 'active' 
  | 'compare' 
  | 'swap' 
  | 'found' 
  | 'target' 
  | 'sorted' 
  | 'visited' 
  | 'insert' 
  | 'delete' 
  | 'shifting' 
  | 'updated' 
  | 'discarded'
  | 'push'
  | 'pop'
  | 'peek'
  | 'overflow'
  | 'underflow';

export interface PointerInfo {
  name: string;
  index: number;
  color?: string; // e.g., 'indigo', 'cyan', 'amber', 'emerald', 'purple'
}

export interface TraceStep {
  id: number;
  stepIndex: number;
  eventType?: string;
  title: string;
  description: string;
  activeLine?: number; // 1-based line number in C++ code
  sourceLine?: number;
  activeIndices?: number[];
  arrayState?: number[];
  highlightedItems?: Record<number, ItemHighlightType>;
  pointers?: PointerInfo[];
  variables?: Record<string, string | number | boolean>;
  statusText?: string;
  isCompleted?: boolean;

  // Sorting & algorithm live instrumentation
  comparisons?: number;
  swaps?: number;
  writes?: number;
  recursionDepth?: number;
  rangeLow?: number;
  rangeHigh?: number;
  pivotIndex?: number;
  passNumber?: number;

  // Stack & Multi-Structure extensions
  stackState?: number[];
  auxStackState?: number[];
  charStackState?: string[];
  capacity?: number;
  topIndex?: number;
  statusType?: 'normal' | 'success' | 'overflow' | 'underflow' | 'error' | 'mismatch';
  expression?: string;
  charIndex?: number;
  currentChar?: string;

  // Tree & Heap extensions
  treeNodes?: TreeNodeSnapshot[];
  rootId?: number;
  activeNodeId?: number;
  traversalOutput?: number[];
  callStack?: string[];
  queueState?: string[];
  highlightedNodes?: Record<number, string>;
  highlightedEdges?: string[];
  heapSize?: number;
  heapType?: 'min' | 'max';
  activeParentIdx?: number;
  activeLeftIdx?: number;
  activeRightIdx?: number;

  // Recursion & Backtracking extensions
  frameId?: number;
  parentFrameId?: number;
  callDepth?: number;
  returnValue?: string;
  localVariables?: Record<string, string>;
  // Recursion tree nodes (for Fibonacci / factorial visualizer)
  recursionNodes?: RecursionNodeSnapshot[];
  // Tower of Hanoi peg states: {A: number[], B: number[], C: number[]}
  pegA?: number[];
  pegB?: number[];
  pegC?: number[];
  diskMoved?: number;
  diskFrom?: string;
  diskTo?: string;
  totalMoves?: number;
  // Maze state (flat grid + path)
  mazeGrid?: number[];
  mazeRows?: number;
  mazeCols?: number;
  mazePath?: string;   // serialised "(r,c),(r,c),..."
  mazeSolved?: boolean;
  // N-Queens board state
  queensBoard?: number[];   // per-row column placement (-1=empty)
  queensN?: number;
  boardFlat?: number[];     // n×n flat board for rendering
  activeRow?: number;
  activeCol?: number;
  solutionCount?: number;

  // Graph extensions
  graphVertices?: GraphVertexSnapshot[];
  graphEdges?: GraphEdgeSnapshot[];
  activeVertexId?: number;
  activeEdgeU?: number;
  activeEdgeV?: number;
  reconstructedPath?: number[];
  priorityQueueState?: string[];
  distanceMatrix?: number[][];
  predecessorMatrix?: number[][];
  matrixK?: number;
  matrixI?: number;
  matrixJ?: number;
  hasNegativeCycle?: boolean;

  // Queue, deque, and linked-list snapshots
  structureType?: string;
  structureStorage?: number[];
  occupiedSlots?: boolean[];
  logicalOrder?: number[];
  frontIndex?: number;
  rearIndex?: number;
  elementCount?: number;
  dequeFrontIndex?: number;
  dequeBackIndex?: number;
  linkedNodes?: LinkedNodeSnapshot[];
}

export interface GraphVertexSnapshot {
  id: number;
  label: string;
  state: 'unvisited' | 'in_queue' | 'active' | 'discovered' | 'visited' | 'unreachable' | 'negative_cycle' | string;
  distance: number;
  hasDistance: boolean;
  predecessor: number;
  discoveryTime: number;
  finishTime: number;
}

export interface GraphEdgeSnapshot {
  u: number;
  v: number;
  weight: number;
  directed: boolean;
  state: 'normal' | 'active' | 'relax_success' | 'relax_fail' | 'path' | string;
}

export interface TreeNodeSnapshot {
  id: number;
  value: number;
  leftId: number;
  rightId: number;
  parentId: number;
  depth: number;
}

export type PlaybackSpeed = 0.5 | 1 | 1.5 | 2;

export interface PlaybackState {
  currentStepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  speed: PlaybackSpeed;
}

export interface ComplexityInfo {
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
    description: string;
  };
  spaceComplexity: {
    worst: string;
    description: string;
  };
  stability?: {
    isStable: boolean;
    description: string;
  };
  inPlace?: {
    isInPlace: boolean;
    description: string;
  };
  whenUseful?: string;
}

export interface RecursionNodeSnapshot {
  id: number;
  parentId: number;
  label: string;       // e.g. "factorial(4)" or "fib(3)"
  args: string;        // e.g. "n=4"
  returnValue?: string;
  state: 'active' | 'pending' | 'returned' | 'base_case';
  depth: number;
}

export interface LinkedNodeSnapshot {
  id: number;
  value: number;
  nextId: number;
  prevId: number;
}
