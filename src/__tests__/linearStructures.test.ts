import { describe, it, expect } from 'vitest';
import { generateQueueTrace, generateDequeTrace } from '../algorithms/traces/clientTraceGenerators';
import { executeCppLinearStructure } from '../services/cppExecutionAdapter';

describe('Linear Structures: Queue, Circular Queue, and Deque', () => {
  describe('generateQueueTrace', () => {
    it('generates multi-step demo for circular queue with wraparound', () => {
      const steps = generateQueueTrace({
        operation: 'queue-demo',
        values: [],
        capacity: 5
      });

      expect(steps.length).toBeGreaterThan(5);
      const wraparoundStep = steps.find((s) => s.title.includes('Wraparound'));
      expect(wraparoundStep).toBeDefined();
      expect(wraparoundStep?.structureStorage).toBeDefined();
      expect(wraparoundStep?.capacity).toBe(5);
    });

    it('generates valid steps for queue-enqueue', () => {
      const steps = generateQueueTrace({
        operation: 'queue-enqueue',
        values: [10, 20],
        capacity: 5,
        value: 30
      });

      expect(steps.length).toBeGreaterThan(1);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.statusType).toBe('success');
      expect(lastStep.elementCount).toBe(3);
      expect(lastStep.structureStorage?.[2]).toBe(30);
    });

    it('handles queue-enqueue overflow when full', () => {
      const steps = generateQueueTrace({
        operation: 'queue-enqueue',
        values: [10, 20, 30],
        capacity: 3,
        value: 40
      });

      const overflowStep = steps.find((s) => s.statusType === 'overflow');
      expect(overflowStep).toBeDefined();
      expect(overflowStep?.title).toContain('rejected');
    });

    it('generates valid steps for queue-dequeue', () => {
      const steps = generateQueueTrace({
        operation: 'queue-dequeue',
        values: [10, 20, 30],
        capacity: 5
      });

      expect(steps.length).toBeGreaterThan(1);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.statusType).toBe('success');
      expect(lastStep.elementCount).toBe(2);
      expect(lastStep.variables?.result).toBe('10');
    });

    it('handles queue-dequeue underflow when empty', () => {
      const steps = generateQueueTrace({
        operation: 'queue-dequeue',
        values: [],
        capacity: 5
      });

      const underflowStep = steps.find((s) => s.statusType === 'underflow');
      expect(underflowStep).toBeDefined();
    });

    it('generates valid steps for queue-peek and queue-rear', () => {
      const peekSteps = generateQueueTrace({
        operation: 'queue-peek',
        values: [10, 20, 30],
        capacity: 5
      });
      expect(peekSteps[peekSteps.length - 1].variables?.result).toBe('10');

      const rearSteps = generateQueueTrace({
        operation: 'queue-rear',
        values: [10, 20, 30],
        capacity: 5
      });
      expect(rearSteps[rearSteps.length - 1].variables?.result).toBe('30');
    });

    it('generates valid steps for queue-clear', () => {
      const steps = generateQueueTrace({
        operation: 'queue-clear',
        values: [10, 20, 30],
        capacity: 5
      });
      const lastStep = steps[steps.length - 1];
      expect(lastStep.elementCount).toBe(0);
      expect(lastStep.occupiedSlots?.every((s) => !s)).toBe(true);
    });
  });

  describe('generateDequeTrace', () => {
    it('generates valid steps for deque-push-front', () => {
      const steps = generateDequeTrace({
        operation: 'deque-push-front',
        values: [10, 20],
        capacity: 5,
        value: 99
      });

      expect(steps.length).toBeGreaterThan(1);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.statusType).toBe('success');
      expect(lastStep.elementCount).toBe(3);
      expect(lastStep.logicalOrder?.[0]).toBe(99);
    });

    it('generates valid steps for deque-push-back', () => {
      const steps = generateDequeTrace({
        operation: 'deque-push-back',
        values: [10, 20],
        capacity: 5,
        value: 99
      });

      expect(steps.length).toBeGreaterThan(1);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.statusType).toBe('success');
      expect(lastStep.elementCount).toBe(3);
      expect(lastStep.logicalOrder?.[2]).toBe(99);
    });

    it('generates valid steps for deque-pop-front and deque-pop-back', () => {
      const popFrontSteps = generateDequeTrace({
        operation: 'deque-pop-front',
        values: [10, 20, 30],
        capacity: 5
      });
      expect(popFrontSteps[popFrontSteps.length - 1].variables?.result).toBe('10');
      expect(popFrontSteps[popFrontSteps.length - 1].elementCount).toBe(2);

      const popBackSteps = generateDequeTrace({
        operation: 'deque-pop-back',
        values: [10, 20, 30],
        capacity: 5
      });
      expect(popBackSteps[popBackSteps.length - 1].variables?.result).toBe('30');
      expect(popBackSteps[popBackSteps.length - 1].elementCount).toBe(2);
    });

    it('handles deque underflow and overflow', () => {
      const underflow = generateDequeTrace({
        operation: 'deque-pop-front',
        values: [],
        capacity: 5
      });
      expect(underflow.find((s) => s.statusType === 'underflow')).toBeDefined();

      const overflow = generateDequeTrace({
        operation: 'deque-push-front',
        values: [1, 2, 3],
        capacity: 3,
        value: 4
      });
      expect(overflow.find((s) => s.statusType === 'overflow')).toBeDefined();
    });
  });

  describe('executeCppLinearStructure adapter', () => {
    it('executes circular-queue operations without stalling', async () => {
      const result = await executeCppLinearStructure({
        operation: 'queue-demo',
        values: [],
        capacity: 5,
        structure: 'circular'
      });

      expect(result.steps.length).toBeGreaterThan(1);
      expect(result.sourceCode).toBeDefined();
    });

    it('executes deque operations without stalling', async () => {
      const result = await executeCppLinearStructure({
        operation: 'deque-push-front',
        values: [10, 20],
        capacity: 5,
        value: 50,
        structure: 'singly'
      });

      expect(result.steps.length).toBeGreaterThan(1);
      expect(result.steps[result.steps.length - 1].elementCount).toBe(3);
    });
  });
});
