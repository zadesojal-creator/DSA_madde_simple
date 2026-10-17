import type { TraceStep } from '../types/trace';
import cppTracesData from '../data/cppGeneratedTraces.json';

export type CppEngineStatus = 'cpp-native' | 'cpp-precompiled' | 'unavailable';

export interface CppExecutionResult {
  steps: TraceStep[];
  engineStatus: CppEngineStatus;
  engineMessage: string;
  sourceCode: string;
  isError?: boolean;
}

export interface LinearStructureExecutionParams {
  operation: string;
  values: number[];
  capacity?: number;
  value?: number;
  index?: number;
  target?: number;
  structure?: 'singly' | 'doubly' | 'circular';
}

export async function executeCppLinearStructure(
  params: LinearStructureExecutionParams
): Promise<CppExecutionResult> {
  const capacity = params.capacity ?? 5;
  const query = new URLSearchParams({
    op: params.operation,
    arr: params.values.join(','),
    capacity: String(capacity),
    structure: params.structure ?? 'singly',
    value: String(params.value ?? 0),
    index: String(params.index ?? 0),
    target: String(params.target ?? 0)
  });
  let response: Response;
  try {
    response = await fetch(`/api/cpp-trace?${query.toString()}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      steps: [{
        id: 0,
        stepIndex: 0,
        title: 'C++ execution unavailable',
        description: `The native C++ trace service could not be reached: ${message}`,
        sourceLine: 1,
        activeLine: 1,
        arrayState: params.values,
        statusType: 'error',
        statusText: 'C++ server unavailable',
        isCompleted: true
      }],
      engineStatus: 'unavailable',
      engineMessage: 'Run the Vite development server to use native C++ execution.',
      sourceCode: '// Native C++ source is available when the local trace server is running.',
      isError: true
    };
  }

  if (!response.ok) {
    const detail = await response.text();
    return {
      steps: [{
        id: 0,
        stepIndex: 0,
        title: 'C++ execution failed',
        description: detail || `Native C++ process returned HTTP ${response.status}.`,
        sourceLine: 1,
        activeLine: 1,
        arrayState: params.values,
        statusType: 'error',
        statusText: 'C++ execution error',
        isCompleted: true
      }],
      engineStatus: 'unavailable',
      engineMessage: `Native C++ process returned HTTP ${response.status}.`,
      sourceCode: '// Native C++ source is available when the local trace server is running.',
      isError: true
    };
  }

  const steps = await response.json() as TraceStep[];
  const codeResponse = await fetch(`/api/cpp-code?op=${encodeURIComponent(params.operation)}&structure=${encodeURIComponent(params.structure ?? 'singly')}`);
  const sourceCode = codeResponse.ok ? await codeResponse.text() : '// Failed to retrieve C++ source code';
  return {
    steps,
    engineStatus: 'cpp-native',
    engineMessage: 'Executed live by the native C++ trace runner.',
    sourceCode
  };
}

const typedCatalog = (cppTracesData as unknown) as {
  traces: Record<string, TraceStep[]>;
  codes: Record<string, string>;
};

/**
 * Validates comma/space separated numeric string
 */
export function parseArrayInput(input: string, maxLen = 25): { array: number[]; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { array: [] };
  }

  const tokens = trimmed.split(/[\s,]+/).filter(Boolean);
  if (tokens.length > maxLen) {
    return { 
      array: [], 
      error: `Input size (${tokens.length}) exceeds maximum allowed of ${maxLen} elements for visualization.` 
    };
  }

  const result: number[] = [];
  for (const token of tokens) {
    const num = Number(token);
    if (!Number.isInteger(num)) {
      return { 
        array: [], 
        error: `Invalid integer "${token}". Please enter valid integers separated by commas or spaces.` 
      };
    }
    result.push(num);
  }

  return { array: result };
}

/**
 * Validates comma/space separated numeric or null token string for binary trees
 */
export function parseTreeTokensInput(input: string, maxLen = 25): { tokens: string[]; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { tokens: [] };
  }

  const rawTokens = trimmed.split(/[\s,]+/).filter(Boolean);
  if (rawTokens.length > maxLen) {
    return { 
      tokens: [], 
      error: `Input size (${rawTokens.length}) exceeds maximum allowed of ${maxLen} elements for visualization.` 
    };
  }

  const tokens: string[] = [];
  for (const token of rawTokens) {
    const lower = token.toLowerCase();
    if (lower === 'null' || lower === '-' || lower === 'nil') {
      tokens.push('null');
    } else {
      const num = Number(token);
      if (!Number.isInteger(num)) {
        return { 
          tokens: [], 
          error: `Invalid node token "${token}". Please enter valid integers or "null" separated by commas or spaces.` 
        };
      }
      tokens.push(String(num));
    }
  }

  return { tokens };
}

/**
 * Checks if array is non-decreasing
 */
export function isSorted(arr: number[]): boolean {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < arr[i - 1]) return false;
  }
  return true;
}

/**
 * Executes a DSA algorithm through the C++ execution engine
 */
export async function executeCppAlgorithm(
  op: string,
  arr: (number | string)[] | string,
  target = 0,
  value?: number
): Promise<CppExecutionResult> {
  const arrStr = Array.isArray(arr) ? arr.join(',') : arr;
  const cacheKey = `${op}__${arrStr}__${target}`;
  const defaultCode = typedCatalog.codes[op] || '// C++ source code not available';

  // 1. Attempt live execution via Vite native C++ server endpoint
  try {
    const queryParams: Record<string, string> = {
      op,
      arr: arrStr,
      target: String(target)
    };
    if (value !== undefined) {
      queryParams.value = String(value);
    }
    const query = new URLSearchParams(queryParams);

    const res = await fetch(`/api/cpp-trace?${query.toString()}`);
    if (res.ok) {
      const steps = (await res.json()) as TraceStep[];
      
      // Fetch fresh source code if possible
      let sourceCode = defaultCode;
      try {
        const codeRes = await fetch(`/api/cpp-code?op=${encodeURIComponent(op)}`);
        if (codeRes.ok) {
          sourceCode = await codeRes.text();
        }
      } catch {
        // Fall back to catalog code
      }

      return {
        steps,
        engineStatus: 'cpp-native',
        engineMessage: 'Executed live via native C++ binary (array_tracer.exe)',
        sourceCode
      };
    }
  } catch {
    // API endpoint unreachable (e.g., static build, vitest, or offline client)
  }

  // 2. Check authentic precompiled C++ trace cache
  if (typedCatalog.traces[cacheKey]) {
    return {
      steps: typedCatalog.traces[cacheKey],
      engineStatus: 'cpp-precompiled',
      engineMessage: 'Replaying authentic C++ binary execution snapshot',
      sourceCode: defaultCode
    };
  }

  // 3. Fallback when custom input is entered while native server is unreachable
  return {
    steps: [
      {
        id: 0,
        stepIndex: 0,
        title: 'C++ Execution Engine Notice',
        description: `Custom data [${arrStr}] requires the local C++ runner. Please ensure the dev server is running ('npm run dev') to execute native C++ for custom inputs.`,
        activeLine: 1,
        sourceLine: 1,
        arrayState: [],
        activeIndices: [],
        highlightedItems: {},
        pointers: [],
        variables: { op },
        statusText: 'C++ Server Offline',
        isCompleted: true
      }
    ],
    engineStatus: 'unavailable',
    engineMessage: 'C++ local server is offline. Run "npm run dev" to execute native C++ for custom inputs.',
    sourceCode: defaultCode,
    isError: true
  };
}

export interface GraphExecutionParams {
  source?: number;
  target?: number;
  vertices?: number;
  directed?: boolean;
  weighted?: boolean;
}

/**
 * Validates edge string like "0-1:5, 1-2:3"
 */
export function validateGraphInput(
  edgeInput: string,
  vertexCount: number,
  isWeighted: boolean,
  algorithm: string
): { valid: boolean; error?: string } {
  if (!edgeInput.trim() || edgeInput.trim() === 'sample') {
    return { valid: true };
  }

  const tokens = edgeInput.split(/[\s,]+/).filter(Boolean);
  if (tokens.length > 40) {
    return { valid: false, error: 'Maximum 40 edges allowed for visualizer performance.' };
  }

  for (const token of tokens) {
    const dashIdx = token.indexOf('-');
    if (dashIdx === -1) {
      return { valid: false, error: `Invalid edge format "${token}". Expected "u-v" or "u-v:weight".` };
    }
    const uStr = token.substring(0, dashIdx);
    const rest = token.substring(dashIdx + 1);
    let vStr = rest;
    let weight = 1;

    if (rest.includes(':')) {
      const colIdx = rest.indexOf(':');
      vStr = rest.substring(0, colIdx);
      weight = Number(rest.substring(colIdx + 1));
      if (!Number.isFinite(weight)) {
        return { valid: false, error: `Invalid weight in edge "${token}". Weight must be a finite number.` };
      }
    }

    const u = Number(uStr);
    const v = Number(vStr);

    if (!Number.isInteger(u) || u < 0 || u >= vertexCount) {
      return { valid: false, error: `Edge "${token}" references nonexistent or invalid vertex ID ${uStr}. Valid range is 0 to ${vertexCount - 1}.` };
    }
    if (!Number.isInteger(v) || v < 0 || v >= vertexCount) {
      return { valid: false, error: `Edge "${token}" references nonexistent or invalid vertex ID ${v}. Valid range is 0 to ${vertexCount - 1}.` };
    }

    if (algorithm === 'dijkstra' && isWeighted && weight < 0) {
      return { valid: false, error: `Dijkstra rejects negative edge weights! Found negative weight ${weight} on edge "${token}".` };
    }
  }

  return { valid: true };
}

/**
 * Executes a Graph algorithm through the native C++ binary or authentic precompiled snapshot
 */
export async function executeCppGraphAlgorithm(
  op: string,
  edgeTokens: string,
  params: GraphExecutionParams = {}
): Promise<CppExecutionResult> {
  const target = params.target !== undefined ? params.target : (op === 'bfs' ? 5 : 4);
  const source = params.source !== undefined ? params.source : 0;
  const arrStr = edgeTokens.trim() || 'sample';
  const cacheKey = `${op}__${arrStr}__${target}`;
  const defaultCode = typedCatalog.codes[op] || '// C++ source code not available';

  // 1. Attempt live execution via Vite native C++ server endpoint
  try {
    const queryParams: Record<string, string> = {
      op,
      arr: arrStr,
      target: String(target),
      source: String(source)
    };
    if (params.vertices !== undefined) {
      queryParams.vertices = String(params.vertices);
    }
    if (params.directed !== undefined) {
      queryParams.directed = params.directed ? '1' : '0';
    }
    if (params.weighted !== undefined) {
      queryParams.weighted = params.weighted ? '1' : '0';
    }

    const query = new URLSearchParams(queryParams);
    const res = await fetch(`/api/cpp-trace?${query.toString()}`);
    if (res.ok) {
      const steps = (await res.json()) as TraceStep[];
      let sourceCode = defaultCode;
      try {
        const codeRes = await fetch(`/api/cpp-code?op=${encodeURIComponent(op)}`);
        if (codeRes.ok) {
          sourceCode = await codeRes.text();
        }
      } catch {
        // Fall back to catalog code
      }

      return {
        steps,
        engineStatus: 'cpp-native',
        engineMessage: 'Executed live via native C++ binary (array_tracer.exe)',
        sourceCode
      };
    }
  } catch {
    // Dev server offline or static build
  }

  // 2. Authentic precompiled C++ trace cache
  if (typedCatalog.traces[cacheKey]) {
    return {
      steps: typedCatalog.traces[cacheKey],
      engineStatus: 'cpp-precompiled',
      engineMessage: 'Replaying authentic C++ binary execution snapshot',
      sourceCode: defaultCode
    };
  }

  // Fallback for custom graphs when runner is offline
  return {
    steps: [
      {
        id: 0,
        stepIndex: 0,
        title: 'C++ Execution Engine Notice',
        description: `Custom graph input [${arrStr}] requires the local C++ runner. Please ensure the dev server is running ('npm run dev') to execute native C++ for custom graphs.`,
        activeLine: 1,
        sourceLine: 1,
        arrayState: [],
        activeIndices: [],
        highlightedItems: {},
        pointers: [],
        variables: { op },
        statusText: 'C++ Server Offline',
        isCompleted: true
      }
    ],
    engineStatus: 'unavailable',
    engineMessage: 'C++ local server is offline. Run "npm run dev" to execute native C++ for custom graphs.',
    sourceCode: defaultCode,
    isError: true
  };
}

/**
 * Returns canonical C++ code for an algorithm
 */
export function getAlgorithmCppCode(op: string): string {
  return typedCatalog.codes[op] || '// C++ source code not available';
}

/**
 * Executes a Recursion/Backtracking algorithm through the C++ engine.
 * op: 'factorial' | 'fibonacci' | 'tower-of-hanoi' | 'maze' | 'n-queens'
 * arrStr: for numeric ops = the n value as string; for maze = encoded grid string
 * target: used as `n` for numeric algos; findAll encoded as query param for n-queens
 */
export async function executeCppRecursionAlgorithm(
  op: string,
  arrStr: string,
  target = 0,
  options: { findAll?: boolean } = {}
): Promise<CppExecutionResult> {
  const cacheKey = `${op}__${arrStr}__${target}`;
  const defaultCode = typedCatalog.codes[op] || '// C++ source code not available';

  // 1. Attempt live execution
  try {
    const queryParams: Record<string, string> = {
      op,
      arr: arrStr,
      target: String(target),
      value: String(target),
    };
    if (options.findAll !== undefined) {
      queryParams.findall = options.findAll ? '1' : '0';
    }

    const query = new URLSearchParams(queryParams);
    const res = await fetch(`/api/cpp-trace?${query.toString()}`);
    if (res.ok) {
      const steps = (await res.json()) as TraceStep[];
      let sourceCode = defaultCode;
      try {
        const codeRes = await fetch(`/api/cpp-code?op=${encodeURIComponent(op)}`);
        if (codeRes.ok) sourceCode = await codeRes.text();
      } catch { /* fall back */ }
      return {
        steps,
        engineStatus: 'cpp-native',
        engineMessage: 'Executed live via native C++ binary (array_tracer.exe)',
        sourceCode,
      };
    }
  } catch { /* server offline */ }

  // 2. Precompiled cache
  if (typedCatalog.traces[cacheKey]) {
    return {
      steps: typedCatalog.traces[cacheKey],
      engineStatus: 'cpp-precompiled',
      engineMessage: 'Replaying authentic C++ binary execution snapshot',
      sourceCode: defaultCode,
    };
  }

  // 3. Offline fallback
  return {
    steps: [{
      id: 0, stepIndex: 0,
      title: 'C++ Execution Engine Offline',
      description: `Run "npm run dev" to execute native C++ for ${op}. The local C++ runner is required for recursion traces.`,
      activeLine: 1, sourceLine: 1,
      arrayState: [], activeIndices: [], highlightedItems: {}, pointers: [],
      variables: { op }, statusText: 'C++ Server Offline', isCompleted: true,
    }],
    engineStatus: 'unavailable',
    engineMessage: 'C++ local server is offline. Run "npm run dev" to execute native C++.',
    sourceCode: defaultCode,
    isError: true,
  };
}
