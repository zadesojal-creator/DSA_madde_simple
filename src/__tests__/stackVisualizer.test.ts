import { describe, it, expect } from 'vitest';
import { buildStackTrace, STACK_OPERATIONS, STACK_OPERATION_IDS } from '../data/stackVisualizerData';

describe('stack visualizer trace generation', () => {
  it('creates a push trace with a successful final stack state', () => {
    const trace = buildStackTrace('push', { stack: [10, 20], value: 30, capacity: 5 });

    expect(trace.length).toBeGreaterThan(2);
    expect(trace[0].stackState).toEqual([10, 20]);
    expect(trace.at(-1)?.stackState).toEqual([10, 20, 30]);
    expect(trace.at(-1)?.isCompleted).toBe(true);
  });

  it('detects balanced parentheses and emits a completed final result', () => {
    const trace = buildStackTrace('balanced-parentheses', { expression: '([{}])' });

    expect(trace.at(-1)?.variables?.result).toBe('true (Balanced)');
    expect(trace.at(-1)?.isCompleted).toBe(true);
  });

  it('exposes the stack operation catalog and routes', () => {
    expect(STACK_OPERATION_IDS).toContain('push');
    expect(STACK_OPERATIONS.push.title).toBe('Push');
  });
});
