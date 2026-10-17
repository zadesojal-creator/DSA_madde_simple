import { describe, it, expect } from 'vitest';
import { executeCppRecursionAlgorithm } from '../services/cppExecutionAdapter';
import { ALGORITHMS_METADATA } from '../data/algorithmsMetadata';
import { NAVIGATION_CATEGORIES } from '../data/navigationData';

describe('Recursion & Backtracking Visualizer (C++ Engine)', () => {

  describe('Algorithm Metadata & Navigation', () => {
    it('provides complete metadata for all recursion and backtracking algorithms', () => {
      const ops = ['factorial', 'fibonacci', 'tower-of-hanoi', 'maze', 'n-queens'];
      for (const op of ops) {
        const meta = ALGORITHMS_METADATA[op];
        expect(meta).toBeDefined();
        expect(meta.title).toBeTruthy();
        expect(meta.complexity).toBeDefined();
        expect(meta.complexity.timeComplexity.worst).toBeTruthy();
        expect(meta.complexity.spaceComplexity.worst).toBeTruthy();
      }
    });

    it('has navigation entries for recursion and backtracking', () => {
      const recursionCat = NAVIGATION_CATEGORIES.find((c) => c.id === 'recursion');
      const backtrackingCat = NAVIGATION_CATEGORIES.find((c) => c.id === 'backtracking');

      expect(recursionCat).toBeDefined();
      expect(recursionCat?.subtopics.length).toBeGreaterThanOrEqual(3);
      expect(recursionCat?.subtopics.every((s) => s.isImplemented)).toBe(true);

      expect(backtrackingCat).toBeDefined();
      expect(backtrackingCat?.subtopics.length).toBeGreaterThanOrEqual(2);
      expect(backtrackingCat?.subtopics.every((s) => s.isImplemented)).toBe(true);
    });
  });

  describe('Factorial Algorithm', () => {
    it('executes factorial(5) and returns 120 with call stack simulation', async () => {
      const res = await executeCppRecursionAlgorithm('factorial', '5', 5);
      expect(res.steps.length).toBeGreaterThan(5);

      const enters = res.steps.filter((s) => s.eventType === 'function_enter');
      const baseCases = res.steps.filter((s) => s.eventType === 'base_case');
      const multiplies = res.steps.filter((s) => s.eventType === 'multiply_return');
      const complete = res.steps[res.steps.length - 1];

      expect(enters.length).toBe(5); // 5, 4, 3, 2, 1
      expect(baseCases.length).toBe(1);
      expect(multiplies.length).toBe(4);
      expect(complete.eventType).toBe('complete');
      expect(complete.variables?.['result']).toBe('120');
      expect(complete.isCompleted).toBe(true);
    });

    it('handles base cases factorial(0) and factorial(1) directly', async () => {
      const res0 = await executeCppRecursionAlgorithm('factorial', '0', 0);
      const last0 = res0.steps[res0.steps.length - 1];
      expect(last0.variables?.['result']).toBe('1');

      const res1 = await executeCppRecursionAlgorithm('factorial', '1', 1);
      const last1 = res1.steps[res1.steps.length - 1];
      expect(last1.variables?.['result']).toBe('1');
    });
  });

  describe('Fibonacci Algorithm (Naive Recursion)', () => {
    it('executes fib(6) = 8 and demonstrates repeated recursive branching', async () => {
      const res = await executeCppRecursionAlgorithm('fibonacci', '6', 6);
      expect(res.steps.length).toBeGreaterThan(20);

      const enters = res.steps.filter((s) => s.eventType === 'function_enter');
      const baseCases = res.steps.filter((s) => s.eventType === 'base_case');
      const addReturns = res.steps.filter((s) => s.eventType === 'add_return');
      const complete = res.steps[res.steps.length - 1];

      // fib(6) produces 25 function calls
      expect(enters.length).toBe(25);
      expect(baseCases.length).toBe(13);
      expect(addReturns.length).toBe(12);
      expect(complete.eventType).toBe('complete');
      expect(complete.variables?.['result']).toBe('8');
      expect(complete.isCompleted).toBe(true);
    });

    it('handles fib(0) and fib(1) directly', async () => {
      const res0 = await executeCppRecursionAlgorithm('fibonacci', '0', 0);
      const last0 = res0.steps[res0.steps.length - 1];
      expect(last0.variables?.['result']).toBe('0');

      const res1 = await executeCppRecursionAlgorithm('fibonacci', '1', 1);
      const last1 = res1.steps[res1.steps.length - 1];
      expect(last1.variables?.['result']).toBe('1');
    });
  });

  describe('Tower of Hanoi', () => {
    it('executes 3 disks with exactly 2^3 - 1 = 7 disk moves', async () => {
      const res = await executeCppRecursionAlgorithm('tower-of-hanoi', '3', 3);
      expect(res.steps.length).toBeGreaterThan(10);

      const last = res.steps[res.steps.length - 1];
      expect(last.eventType).toBe('complete');
      expect(last.variables?.['A']).toBe('[]');
      expect(last.variables?.['B']).toBe('[]');
      expect(last.variables?.['C']).toBe('[3,2,1]');
      expect(last.variables?.['totalMoves']).toBe('7');
    });

    it('executes 2 disks with exactly 3 disk moves', async () => {
      const res = await executeCppRecursionAlgorithm('tower-of-hanoi', '2', 2);
      const last = res.steps[res.steps.length - 1];
      expect(last.variables?.['C']).toBe('[2,1]');
      expect(last.variables?.['totalMoves']).toBe('3');
    });
  });

  describe('Maze Solver (Backtracking DFS)', () => {
    it('solves 5x5 maze preset finding path to destination with wall rejections', async () => {
      const defaultArr = '5;5;0,0,1,0,0,0,1,1,0,1,0,0,0,0,1,1,1,0,1,0,0,0,0,0,0;0;0;4;4';
      const res = await executeCppRecursionAlgorithm('maze', defaultArr, 0);
      expect(res.steps.length).toBeGreaterThan(10);

      const cellVisits = res.steps.filter((s) => s.eventType === 'cell_visit');
      const cellRejects = res.steps.filter((s) => s.eventType === 'cell_reject');
      const goalReached = res.steps.find((s) => s.eventType === 'destination_reached');

      expect(cellVisits.length).toBeGreaterThan(0);
      expect(cellRejects.length).toBeGreaterThan(0);
      expect(goalReached).toBeDefined();

      const last = res.steps[res.steps.length - 1];
      expect(last.eventType).toBe('complete');
      expect(last.isCompleted).toBe(true);
      expect(goalReached?.variables?.['path']).toBeDefined();
    });
  });

  describe('N-Queens (Backtracking)', () => {
    it('solves 4-Queens finding a valid non-conflicting configuration with backtracking', async () => {
      const res = await executeCppRecursionAlgorithm('n-queens', '4', 4);
      expect(res.steps.length).toBeGreaterThan(10);

      const places = res.steps.filter((s) => s.eventType === 'queen_placed');
      const backtracks = res.steps.filter((s) => s.eventType === 'backtrack');
      const solutions = res.steps.filter((s) => s.eventType === 'solution_found');

      expect(places.length).toBeGreaterThan(0);
      expect(backtracks.length).toBeGreaterThan(0);
      expect(solutions.length).toBeGreaterThan(0);

      const last = res.steps[res.steps.length - 1];
      expect(last.eventType).toBe('search_complete');
      expect(last.isCompleted).toBe(true);
    });

    it('solves 6-Queens board', async () => {
      const res = await executeCppRecursionAlgorithm('n-queens', '6', 6);
      const solutions = res.steps.filter((s) => s.eventType === 'solution_found');
      expect(solutions.length).toBeGreaterThan(0);

      const last = res.steps[res.steps.length - 1];
      expect(last.isCompleted).toBe(true);
    });
  });

  describe('C++ Source Code Delivery', () => {
    it('returns valid canonical C++ implementation for recursion operations', async () => {
      const ops = ['factorial', 'fibonacci', 'tower-of-hanoi', 'maze', 'n-queens'];
      for (const op of ops) {
        const res = await executeCppRecursionAlgorithm(op, '3', 3);
        expect(res.sourceCode).toBeTruthy();
        expect(res.sourceCode).not.toBe('// C++ source code not available');
      }
    });
  });
});
