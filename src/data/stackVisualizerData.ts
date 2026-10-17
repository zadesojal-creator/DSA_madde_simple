import type { ComplexityInfo, TraceStep } from '../types/trace';

export const STACK_OPERATION_IDS = [
  'stack-intro',
  'push',
  'pop',
  'peek',
  'is-empty',
  'is-full',
  'stack-size',
  'search',
  'reverse',
  'balanced-parentheses'
] as const;

export type StackOperationId = (typeof STACK_OPERATION_IDS)[number];

export interface StackVisualizerParams {
  stack?: number[];
  value?: number;
  target?: number;
  capacity?: number;
  expression?: string;
}

export interface StackOperationConfig {
  id: StackOperationId;
  title: string;
  shortTitle: string;
  description: string;
  defaultStack: number[];
  defaultCapacity: number;
  defaultValue: number;
  defaultTarget: number;
  defaultExpression: string;
  complexity: ComplexityInfo;
  cppCode: string[];
}

const stackComplexity = (timeBest: string, timeAverage: string, timeWorst: string, spaceWorst: string, description: string): ComplexityInfo => ({
  timeComplexity: {
    best: timeBest,
    average: timeAverage,
    worst: timeWorst,
    description
  },
  spaceComplexity: {
    worst: spaceWorst,
    description: 'Auxiliary space beyond the live stack representation itself and the trace record used for visualization.'
  }
});

const STACK_CPP_CODE: Record<StackOperationId, string[]> = {
  'stack-intro': [
    'Stack s(5);',
    's.push(10);',
    's.push(20);',
    's.push(30);',
    'int topVal = 0;',
    's.peek(topVal);',
    's.pop();'
  ],
  push: [
    'bool push(int value) {',
    '    if (isFull()) {',
    '        return false;',
    '    }',
    '    data.push_back(value);',
    '    return true;',
    '}'
  ],
  pop: [
    'bool pop() {',
    '    if (isEmpty()) {',
    '        return false;',
    '    }',
    '    int poppedValue = data.back();',
    '    data.pop_back();',
    '    return true;',
    '}'
  ],
  peek: [
    'bool peek(int& result) const {',
    '    if (isEmpty()) {',
    '        return false;',
    '    }',
    '    result = data.back();',
    '    return true;',
    '}'
  ],
  'is-empty': [
    'bool isEmpty() const {',
    '    return data.empty();',
    '}'
  ],
  'is-full': [
    'bool isFull() const {',
    '    return static_cast<int>(data.size()) >= capacity;',
    '}'
  ],
  'stack-size': [
    'int size() const {',
    '    return static_cast<int>(data.size());',
    '}'
  ],
  search: [
    'int searchStack(const vector<int>& data, int target) {',
    '    for (int i = data.size() - 1; i >= 0; --i) {',
    '        if (data[i] == target) return i;',
    '    }',
    '    return -1;',
    '}'
  ],
  reverse: [
    'void reverseStack(Stack& original, Stack& aux) {',
    '    while (!original.isEmpty()) {',
    '        int val = 0;',
    '        original.peek(val);',
    '        original.pop();',
    '        aux.push(val);',
    '    }',
    '}'
  ],
  'balanced-parentheses': [
    'bool isBalanced(const string& expr) {',
    '    vector<char> stack;',
    '    for (size_t i = 0; i < expr.size(); ++i) {',
    '        char ch = expr[i];',
    '        if (ch == "(" || ch == "{" || ch == "[") {',
    '            stack.push_back(ch);',
    '        } else if (ch == ")" || ch == "}" || ch == "]") {',
    '            if (stack.empty()) return false;',
    '            char top = stack.back();',
    '            stack.pop_back();',
    '            if ((ch == ")" && top != "(") || (ch == "}" && top != "{") || (ch == "]" && top != "[")) {',
    '                return false;',
    '            }',
    '        }',
    '    }',
    '    return stack.empty();',
    '}'
  ]
};

export const STACK_OPERATIONS: Record<StackOperationId, StackOperationConfig> = {
  'stack-intro': {
    id: 'stack-intro',
    title: 'Stack Introduction',
    shortTitle: 'Intro',
    description: 'Understand the LIFO rule and why the newest element is removed first.',
    defaultStack: [10, 20, 30],
    defaultCapacity: 5,
    defaultValue: 40,
    defaultTarget: 20,
    defaultExpression: '([{}])',
    complexity: stackComplexity('O(1)', 'O(1)', 'O(1)', 'O(1)', 'Push/pop/peek each touch the top of the stack in constant time.'),
    cppCode: STACK_CPP_CODE['stack-intro']
  },
  push: {
    id: 'push',
    title: 'Push',
    shortTitle: 'Push',
    description: 'Insert a value onto the top of the stack when capacity permits.',
    defaultStack: [10, 20],
    defaultCapacity: 5,
    defaultValue: 30,
    defaultTarget: 20,
    defaultExpression: '([{}])',
    complexity: stackComplexity('O(1)', 'O(1)', 'O(1) amortized', 'O(1)', 'A regular push is constant time; a vector reallocation may temporarily cost O(n).'),
    cppCode: STACK_CPP_CODE.push
  },
  pop: {
    id: 'pop',
    title: 'Pop',
    shortTitle: 'Pop',
    description: 'Remove the current top element and expose the new top immediately.',
    defaultStack: [10, 20, 30],
    defaultCapacity: 5,
    defaultValue: 40,
    defaultTarget: 20,
    defaultExpression: '([{}])',
    complexity: stackComplexity('O(1)', 'O(1)', 'O(1)', 'O(1)', 'The top element is discarded with a single back() / pop_back() operation.'),
    cppCode: STACK_CPP_CODE.pop
  },
  peek: {
    id: 'peek',
    title: 'Peek / Top',
    shortTitle: 'Peek',
    description: 'Read the current top element without mutating the underlying stack.',
    defaultStack: [10, 20, 30],
    defaultCapacity: 5,
    defaultValue: 40,
    defaultTarget: 20,
    defaultExpression: '([{}])',
    complexity: stackComplexity('O(1)', 'O(1)', 'O(1)', 'O(1)', 'The top value is returned directly from the last vector slot.'),
    cppCode: STACK_CPP_CODE.peek
  },
  'is-empty': {
    id: 'is-empty',
    title: 'Is Empty',
    shortTitle: 'Empty?',
    description: 'Check whether the stack contains zero elements.',
    defaultStack: [],
    defaultCapacity: 5,
    defaultValue: 40,
    defaultTarget: 20,
    defaultExpression: '([{}])',
    complexity: stackComplexity('O(1)', 'O(1)', 'O(1)', 'O(1)', 'The vector emptiness check is constant time.'),
    cppCode: STACK_CPP_CODE['is-empty']
  },
  'is-full': {
    id: 'is-full',
    title: 'Is Full',
    shortTitle: 'Full?',
    description: 'Compare the current stack size against its fixed capacity.',
    defaultStack: [10, 20, 30, 40, 50],
    defaultCapacity: 5,
    defaultValue: 40,
    defaultTarget: 20,
    defaultExpression: '([{}])',
    complexity: stackComplexity('O(1)', 'O(1)', 'O(1)', 'O(1)', 'Capacity checking needs only the current size and the configured bound.'),
    cppCode: STACK_CPP_CODE['is-full']
  },
  'stack-size': {
    id: 'stack-size',
    title: 'Stack Size',
    shortTitle: 'Size',
    description: 'Report how many elements are currently held in the vector-backed stack.',
    defaultStack: [10, 20, 30],
    defaultCapacity: 5,
    defaultValue: 40,
    defaultTarget: 20,
    defaultExpression: '([{}])',
    complexity: stackComplexity('O(1)', 'O(1)', 'O(1)', 'O(1)', 'The size is read directly from the vector length.'),
    cppCode: STACK_CPP_CODE['stack-size']
  },
  search: {
    id: 'search',
    title: 'Search in Stack',
    shortTitle: 'Search',
    description: 'Inspect values from the top toward the bottom and return the matching index.',
    defaultStack: [10, 20, 30, 40],
    defaultCapacity: 5,
    defaultValue: 40,
    defaultTarget: 30,
    defaultExpression: '([{}])',
    complexity: stackComplexity('O(n)', 'O(n)', 'O(n)', 'O(1)', 'The search inspects the stack linearly from the top until it finds the match or exhausts the vector.'),
    cppCode: STACK_CPP_CODE.search
  },
  reverse: {
    id: 'reverse',
    title: 'Reverse a Stack',
    shortTitle: 'Reverse',
    description: 'Move values through an auxiliary stack to invert the original order.',
    defaultStack: [10, 20, 30],
    defaultCapacity: 5,
    defaultValue: 40,
    defaultTarget: 20,
    defaultExpression: '([{}])',
    complexity: stackComplexity('O(n)', 'O(n)', 'O(n)', 'O(n)', 'Each element is popped and pushed once, so the total reversal time is linear.'),
    cppCode: STACK_CPP_CODE.reverse
  },
  'balanced-parentheses': {
    id: 'balanced-parentheses',
    title: 'Balanced Parentheses',
    shortTitle: 'Parentheses',
    description: 'Use a stack to ensure each opening bracket has a matching closing bracket.',
    defaultStack: [],
    defaultCapacity: 8,
    defaultValue: 40,
    defaultTarget: 20,
    defaultExpression: '([{}])',
    complexity: stackComplexity('O(n)', 'O(n)', 'O(n)', 'O(n)', 'Each character is processed once and may push or pop from the bracket stack.'),
    cppCode: STACK_CPP_CODE['balanced-parentheses']
  }
};

const makeStep = (data: Partial<TraceStep> & Pick<TraceStep, 'title' | 'description'>): TraceStep => ({
  id: data.id ?? 0,
  stepIndex: data.stepIndex ?? 0,
  eventType: data.eventType ?? 'step',
  title: data.title,
  description: data.description,
  activeLine: data.activeLine,
  sourceLine: data.sourceLine ?? 1,
  stackState: data.stackState ?? [],
  auxStackState: data.auxStackState ?? [],
  charStackState: data.charStackState ?? [],
  capacity: data.capacity ?? 0,
  topIndex: data.topIndex ?? -1,
  activeIndices: data.activeIndices ?? [],
  highlightedItems: data.highlightedItems ?? {},
  pointers: data.pointers ?? [],
  variables: data.variables ?? {},
  statusText: data.statusText ?? 'Ready',
  statusType: data.statusType ?? 'normal',
  expression: data.expression,
  charIndex: data.charIndex,
  currentChar: data.currentChar,
  isCompleted: data.isCompleted ?? false
});

const normalizeStack = (stack: number[] = []): number[] => stack.filter((value) => Number.isFinite(value));

const getTopIndex = (stack: number[]) => (stack.length > 0 ? stack.length - 1 : -1);

export function buildStackTrace(operationId: StackOperationId, params: StackVisualizerParams = {}): TraceStep[] {
  const config = STACK_OPERATIONS[operationId];
  const stack = normalizeStack(params.stack ?? config.defaultStack);
  const capacity = Number.isFinite(params.capacity) ? Math.max(1, Number(params.capacity)) : config.defaultCapacity;
  const value = Number.isFinite(params.value) ? Number(params.value) : config.defaultValue;
  const target = Number.isFinite(params.target) ? Number(params.target) : config.defaultTarget;
  const expression = params.expression ?? config.defaultExpression;

  switch (operationId) {
    case 'stack-intro': {
      const introStack = [10, 20, 30];
      return [
        makeStep({
          id: 0,
          stepIndex: 0,
          eventType: 'init',
          title: 'Stack s(5) Initialized',
          description: 'A bounded stack backed by std::vector<int> is created with capacity 5 and starts empty.',
          sourceLine: 1,
          stackState: [],
          capacity: 5,
          topIndex: -1,
          variables: { size: '0', capacity: '5', topValue: 'None' },
          statusText: 'Initialized',
          statusType: 'normal'
        }),
        makeStep({
          id: 1,
          stepIndex: 1,
          eventType: 'push',
          title: 's.push(10)',
          description: 'The first element is inserted at the bottom of the stack.',
          sourceLine: 2,
          stackState: [10],
          capacity: 5,
          topIndex: 0,
          activeIndices: [0],
          highlightedItems: { 0: 'push' },
          pointers: [{ name: 'TOP', index: 0, color: 'violet' }],
          variables: { value: '10', size: '1', capacity: '5', topValue: '10' },
          statusText: 'Pushed 10',
          statusType: 'success'
        }),
        makeStep({
          id: 2,
          stepIndex: 2,
          eventType: 'push',
          title: 's.push(20)',
          description: '20 is added above 10, so the top shifts to index 1.',
          sourceLine: 3,
          stackState: [10, 20],
          capacity: 5,
          topIndex: 1,
          activeIndices: [1],
          highlightedItems: { 1: 'push' },
          pointers: [{ name: 'TOP', index: 1, color: 'violet' }],
          variables: { value: '20', size: '2', capacity: '5', topValue: '20' },
          statusText: 'Pushed 20',
          statusType: 'success'
        }),
        makeStep({
          id: 3,
          stepIndex: 3,
          eventType: 'push',
          title: 's.push(30)',
          description: '30 becomes the current top element and is the most recently inserted value.',
          sourceLine: 4,
          stackState: introStack,
          capacity: 5,
          topIndex: 2,
          activeIndices: [2],
          highlightedItems: { 2: 'push' },
          pointers: [{ name: 'TOP', index: 2, color: 'violet' }],
          variables: { value: '30', size: '3', capacity: '5', topValue: '30' },
          statusText: 'Pushed 30',
          statusType: 'success'
        }),
        makeStep({
          id: 4,
          stepIndex: 4,
          eventType: 'peek',
          title: 's.peek(topVal)',
          description: 'Peek reads 30 without removing it, so the stack remains unchanged.',
          sourceLine: 5,
          stackState: introStack,
          capacity: 5,
          topIndex: 2,
          activeIndices: [2],
          highlightedItems: { 2: 'peek' },
          pointers: [{ name: 'TOP', index: 2, color: 'violet' }],
          variables: { topValue: '30', size: '3', capacity: '5' },
          statusText: 'Peeked 30',
          statusType: 'success'
        }),
        makeStep({
          id: 5,
          stepIndex: 5,
          eventType: 'pop',
          title: 's.pop()',
          description: 'Pop removes the most recent value, which is why 30 leaves before 20.',
          sourceLine: 6,
          stackState: [10, 20],
          capacity: 5,
          topIndex: 1,
          activeIndices: [2],
          highlightedItems: { 2: 'pop' },
          pointers: [{ name: 'TOP', index: 1, color: 'violet' }],
          variables: { removedValue: '30', size: '2', capacity: '5', topValue: '20' },
          statusText: 'Popped 30',
          statusType: 'success'
        }),
        makeStep({
          id: 6,
          stepIndex: 6,
          eventType: 'complete',
          title: 'LIFO Demonstration Complete',
          description: 'The last element inserted is the first removed, matching the LIFO principle.',
          sourceLine: 7,
          stackState: [10, 20],
          capacity: 5,
          topIndex: 1,
          activeIndices: [1],
          highlightedItems: { 1: 'found' },
          pointers: [{ name: 'TOP', index: 1, color: 'violet' }],
          variables: { result: 'LIFO', size: '2', capacity: '5' },
          statusText: 'LIFO complete',
          statusType: 'success',
          isCompleted: true
        })
      ];
    }
    case 'push': {
      const working = [...stack];
      const start = working.slice();
      const step1 = makeStep({
        id: 0,
        stepIndex: 0,
        eventType: 'start',
        title: 'Call push(30)',
        description: 'We begin by ensuring the stack has space before inserting the new value.',
        sourceLine: 1,
        stackState: start,
        capacity,
        topIndex: getTopIndex(start),
        variables: { value: String(value), size: String(start.length), capacity: String(capacity) },
        statusText: 'Checking capacity',
        statusType: 'normal'
      });

      const full = start.length >= capacity;
      const step2 = makeStep({
        id: 1,
        stepIndex: 1,
        eventType: 'condition',
        title: full ? 'Stack is full' : 'Capacity is available',
        description: full
          ? `The stack has ${start.length} elements and cannot accept another value because capacity is ${capacity}.`
          : `The stack has ${start.length} elements and still has room before reaching capacity ${capacity}.`,
        sourceLine: 2,
        stackState: start,
        capacity,
        topIndex: getTopIndex(start),
        variables: { value: String(value), isFull: String(full), size: String(start.length), capacity: String(capacity) },
        statusText: full ? 'Overflow risk' : 'Safe to push',
        statusType: full ? 'overflow' : 'success'
      });

      if (full) {
        return [
          step1,
          step2,
          makeStep({
            id: 2,
            stepIndex: 2,
            eventType: 'overflow',
            title: 'Stack overflow',
            description: 'The new value is rejected because the capacity bound has been reached.',
            sourceLine: 3,
            stackState: start,
            capacity,
            topIndex: getTopIndex(start),
            variables: { value: String(value), result: 'false (Overflow)', size: String(start.length), capacity: String(capacity) },
            statusText: 'Rejecting push',
            statusType: 'overflow',
            isCompleted: true
          })
        ];
      }

      working.push(value);
      const finalTop = working.length - 1;
      return [
        step1,
        step2,
        makeStep({
          id: 2,
          stepIndex: 2,
          eventType: 'push',
          title: 'data.push_back(value)',
          description: `The value ${value} is inserted at the top, so the new top is index ${finalTop}.`,
          sourceLine: 3,
          stackState: working,
          capacity,
          topIndex: finalTop,
          activeIndices: [finalTop],
          highlightedItems: { [finalTop]: 'push' },
          pointers: [{ name: 'TOP', index: finalTop, color: 'violet' }],
          variables: { value: String(value), size: String(working.length), capacity: String(capacity), topValue: String(value) },
          statusText: 'Pushed successfully',
          statusType: 'success'
        }),
        makeStep({
          id: 3,
          stepIndex: 3,
          eventType: 'complete',
          title: 'return true',
          description: 'The push completed successfully in amortized O(1) time.',
          sourceLine: 4,
          stackState: working,
          capacity,
          topIndex: finalTop,
          activeIndices: [finalTop],
          highlightedItems: { [finalTop]: 'found' },
          pointers: [{ name: 'TOP', index: finalTop, color: 'violet' }],
          variables: { value: String(value), result: 'true', size: String(working.length), capacity: String(capacity) },
          statusText: 'Push complete',
          statusType: 'success',
          isCompleted: true
        })
      ];
    }
    case 'pop': {
      const working = [...stack];
      if (working.length === 0) {
        return [
          makeStep({
            id: 0,
            stepIndex: 0,
            title: 'Call pop()',
            description: 'The stack is empty, so the pop operation must be rejected to avoid underflow.',
            sourceLine: 1,
            stackState: [],
            capacity,
            topIndex: -1,
            variables: { size: '0', capacity: String(capacity), result: 'false (Underflow)' },
            statusText: 'Stack underflow',
            statusType: 'underflow',
            isCompleted: true
          })
        ];
      }
      const removedValue = working[working.length - 1];
      const nextStack = working.slice(0, -1);
      return [
        makeStep({
          id: 0,
          stepIndex: 0,
          title: 'Call pop()',
          description: 'Preparing to remove the current top element from the stack.',
          sourceLine: 1,
          stackState: working,
          capacity,
          topIndex: working.length - 1,
          activeIndices: [working.length - 1],
          highlightedItems: { [working.length - 1]: 'pop' },
          pointers: [{ name: 'TOP', index: working.length - 1, color: 'violet' }],
          variables: { removedValue: String(removedValue), size: String(working.length), capacity: String(capacity) },
          statusText: 'Identifying top',
          statusType: 'normal'
        }),
        makeStep({
          id: 1,
          stepIndex: 1,
          title: 'data.pop_back()',
          description: `The top value ${removedValue} is removed, leaving ${nextStack.length} elements on the stack.`,
          sourceLine: 2,
          stackState: nextStack,
          capacity,
          topIndex: getTopIndex(nextStack),
          activeIndices: nextStack.length ? [nextStack.length - 1] : [],
          highlightedItems: nextStack.length ? { [nextStack.length - 1]: 'pop' } : {},
          pointers: nextStack.length ? [{ name: 'TOP', index: nextStack.length - 1, color: 'violet' }] : [],
          variables: { removedValue: String(removedValue), result: 'true', size: String(nextStack.length), capacity: String(capacity) },
          statusText: 'Pop complete',
          statusType: 'success',
          isCompleted: true
        })
      ];
    }
    case 'peek': {
      const working = [...stack];
      if (working.length === 0) {
        return [
          makeStep({
            id: 0,
            stepIndex: 0,
            title: 'Call peek(result)',
            description: 'The stack is empty, so there is no top value to inspect.',
            sourceLine: 1,
            stackState: [],
            capacity,
            topIndex: -1,
            variables: { result: 'false (Empty)', size: '0', capacity: String(capacity) },
            statusText: 'Empty stack',
            statusType: 'underflow',
            isCompleted: true
          })
        ];
      }
      const topValue = working[working.length - 1];
      return [
        makeStep({
          id: 0,
          stepIndex: 0,
          title: 'result = data.back()',
          description: `The current top value is ${topValue}. The stack remains unchanged because peek does not mutate it.`,
          sourceLine: 2,
          stackState: working,
          capacity,
          topIndex: working.length - 1,
          activeIndices: [working.length - 1],
          highlightedItems: { [working.length - 1]: 'peek' },
          pointers: [{ name: 'TOP', index: working.length - 1, color: 'violet' }],
          variables: { result: String(topValue), size: String(working.length), capacity: String(capacity) },
          statusText: 'Peek complete',
          statusType: 'success',
          isCompleted: true
        })
      ];
    }
    case 'is-empty': {
      const working = [...stack];
      const empty = working.length === 0;
      return [
        makeStep({
          id: 0,
          stepIndex: 0,
          title: empty ? 'isEmpty() -> true' : 'isEmpty() -> false',
          description: empty
            ? 'The vector is empty, so the stack contains zero elements.'
            : `The vector currently contains ${working.length} element(s), so the stack is not empty.`,
          sourceLine: 1,
          stackState: working,
          capacity,
          topIndex: getTopIndex(working),
          variables: { result: String(empty), size: String(working.length), capacity: String(capacity) },
          statusText: empty ? 'Stack empty' : 'Stack not empty',
          statusType: empty ? 'normal' : 'success',
          isCompleted: true
        })
      ];
    }
    case 'is-full': {
      const working = [...stack];
      const full = working.length >= capacity;
      return [
        makeStep({
          id: 0,
          stepIndex: 0,
          title: full ? 'isFull() -> true' : 'isFull() -> false',
          description: full
            ? `The stack has ${working.length} elements and has reached the bound of ${capacity}.`
            : `The stack has ${working.length} elements and still has at least one slot available before capacity ${capacity}.`,
          sourceLine: 1,
          stackState: working,
          capacity,
          topIndex: getTopIndex(working),
          variables: { result: String(full), size: String(working.length), capacity: String(capacity) },
          statusText: full ? 'Stack full' : 'Capacity available',
          statusType: full ? 'overflow' : 'success',
          isCompleted: true
        })
      ];
    }
    case 'stack-size': {
      const working = [...stack];
      return [
        makeStep({
          id: 0,
          stepIndex: 0,
          title: 'size() returns current count',
          description: `The stack currently stores ${working.length} element(s).`,
          sourceLine: 1,
          stackState: working,
          capacity,
          topIndex: getTopIndex(working),
          variables: { result: String(working.length), size: String(working.length), capacity: String(capacity) },
          statusText: `Size ${working.length}`,
          statusType: 'success',
          isCompleted: true
        })
      ];
    }
    case 'search': {
      const working = [...stack];
      let foundIndex = -1;
      const steps: TraceStep[] = [
        makeStep({
          id: 0,
          stepIndex: 0,
          title: `searchStack(data, ${target})`,
          description: `Inspecting the stack from the top toward the bottom to find ${target}.`,
          sourceLine: 1,
          stackState: working,
          capacity,
          topIndex: getTopIndex(working),
          variables: { target: String(target), size: String(working.length) },
          statusText: 'Searching',
          statusType: 'normal'
        })
      ];

      for (let i = working.length - 1; i >= 0; i -= 1) {
        const currentValue = working[i];
        const matched = currentValue === target;
        if (matched) {
          foundIndex = i;
          steps.push(
            makeStep({
              id: steps.length,
              stepIndex: steps.length,
              title: `Match found at index ${i}`,
              description: `The search hits the target at index ${i}, scanning from the top downward.`,
              sourceLine: 2,
              stackState: working,
              capacity,
              topIndex: getTopIndex(working),
              activeIndices: [i],
              highlightedItems: { [i]: 'found' },
              pointers: [{ name: 'search_i', index: i, color: 'indigo' }],
              variables: { target: String(target), i: String(i), result: String(i) },
              statusText: 'Match found',
              statusType: 'success',
              isCompleted: true
            })
          );
          break;
        }

        steps.push(
          makeStep({
            id: steps.length,
            stepIndex: steps.length,
            title: `Compare index ${i}`,
            description: `Value ${currentValue} at index ${i} does not match the target ${target}.`,
            sourceLine: 2,
            stackState: working,
            capacity,
            topIndex: getTopIndex(working),
            activeIndices: [i],
            highlightedItems: { [i]: 'compare' },
            pointers: [{ name: 'search_i', index: i, color: 'indigo' }],
            variables: { target: String(target), i: String(i), currentValue: String(currentValue) },
            statusText: `Checking ${currentValue}`,
            statusType: 'normal'
          })
        );
      }

      if (foundIndex === -1) {
        steps.push(
          makeStep({
            id: steps.length,
            stepIndex: steps.length,
            title: 'Target not found',
            description: 'The algorithm inspected every value from the top to the bottom without a match.',
            sourceLine: 3,
            stackState: working,
            capacity,
            topIndex: getTopIndex(working),
            variables: { target: String(target), result: '-1 (Not found)' },
            statusText: 'Not found',
            statusType: 'normal',
            isCompleted: true
          })
        );
      }

      return steps;
    }
    case 'reverse': {
      const original = [...stack];
      const aux: number[] = [];
      const steps: TraceStep[] = [
        makeStep({
          id: 0,
          stepIndex: 0,
          title: 'reverseStack(original, aux)',
          description: 'The algorithm transfers each value from the original stack into an auxiliary stack.',
          sourceLine: 1,
          stackState: original,
          auxStackState: aux,
          capacity,
          topIndex: getTopIndex(original),
          variables: { originalSize: String(original.length), auxSize: String(aux.length) },
          statusText: 'Reversing stack',
          statusType: 'normal'
        })
      ];

      for (let i = original.length - 1; i >= 0; i -= 1) {
        const nextValue = original[i];
        aux.push(nextValue);
        steps.push(
          makeStep({
            id: steps.length,
            stepIndex: steps.length,
            title: `Transfer ${nextValue}`,
            description: `Popping ${nextValue} from the original stack and pushing it onto the auxiliary stack reverses the order.`,
            sourceLine: 2,
            stackState: original.slice(0, i),
            auxStackState: [...aux],
            capacity,
            topIndex: getTopIndex(original.slice(0, i)),
            variables: { transferredValue: String(nextValue), originalSize: String(original.length - i - 1), auxSize: String(aux.length) },
            statusText: `Transferred ${nextValue}`,
            statusType: 'success'
          })
        );
      }

      steps.push(
        makeStep({
          id: steps.length,
          stepIndex: steps.length,
          title: 'Final reversed stack',
          description: 'The auxiliary stack now holds the values in reverse order, which is the reversal of the original stack.',
          sourceLine: 3,
          stackState: [],
          auxStackState: [...aux].reverse(),
          capacity,
          topIndex: -1,
          variables: { result: 'reversed', originalSize: '0', auxSize: String(aux.length) },
          statusText: 'Reversal complete',
          statusType: 'success',
          isCompleted: true
        })
      );

      return steps;
    }
    case 'balanced-parentheses': {
      const chars = expression.split('');
      const workingStack: string[] = [];
      const steps: TraceStep[] = [
        makeStep({
          id: 0,
          stepIndex: 0,
          title: `isBalanced("${expression}")`,
          description: 'Read characters left to right, pushing opening brackets and matching each closing bracket to the most recent opener.',
          sourceLine: 1,
          expression,
          charStackState: workingStack,
          variables: { expression, result: 'pending' },
          statusText: 'Evaluating brackets',
          statusType: 'normal'
        })
      ];

      for (let i = 0; i < chars.length; i += 1) {
        const ch = chars[i];
        const isOpening = ['(', '{', '['].includes(ch);
        const isClosing = [')', '}', ']'].includes(ch);

        if (isOpening) {
          workingStack.push(ch);
          steps.push(
            makeStep({
              id: steps.length,
              stepIndex: steps.length,
              title: `Push opening bracket '${ch}'`,
              description: `The opening ${ch} is pushed so it can be matched later with a closing bracket.`,
              sourceLine: 2,
              expression,
              charIndex: i,
              currentChar: ch,
              charStackState: [...workingStack],
              variables: { currentChar: ch, stackSize: String(workingStack.length), result: 'pending' },
              statusText: `Pushed ${ch}`,
              statusType: 'success'
            })
          );
          continue;
        }

        if (isClosing) {
          const top = workingStack[workingStack.length - 1] ?? null;
          const match = (ch === ')' && top === '(') || (ch === '}' && top === '{') || (ch === ']' && top === '[');

          if (!top || !match) {
            steps.push(
              makeStep({
                id: steps.length,
                stepIndex: steps.length,
                title: `Mismatch found: '${top ?? 'empty'}' vs '${ch}'`,
                description: `The closing bracket ${ch} does not match the top of the stack, so the expression is unbalanced.`,
                sourceLine: 3,
                expression,
                charIndex: i,
                currentChar: ch,
                charStackState: [...workingStack],
                variables: { currentChar: ch, result: 'false (Mismatch)', stackSize: String(workingStack.length) },
                statusText: 'Mismatch',
                statusType: 'mismatch',
                isCompleted: true
              })
            );
            return steps;
          }

          workingStack.pop();
          steps.push(
            makeStep({
              id: steps.length,
              stepIndex: steps.length,
              title: `Matched '${top}' with '${ch}'`,
              description: `The pair ${top}${ch} matches, so the stack can continue processing the remaining expression.`,
              sourceLine: 4,
              expression,
              charIndex: i,
              currentChar: ch,
              charStackState: [...workingStack],
              variables: { currentChar: ch, matchedPair: `${top}${ch}`, result: 'pending', stackSize: String(workingStack.length) },
              statusText: 'Pair matched',
              statusType: 'success'
            })
          );
          continue;
        }

        steps.push(
          makeStep({
            id: steps.length,
            stepIndex: steps.length,
            title: `Ignore non-bracket character '${ch}'`,
            description: 'Non-bracket characters are ignored by the balancing routine.',
            sourceLine: 5,
            expression,
            charIndex: i,
            currentChar: ch,
            charStackState: [...workingStack],
            variables: { currentChar: ch, result: 'ignored' },
            statusText: 'Ignored',
            statusType: 'normal'
          })
        );
      }

      const balanced = workingStack.length === 0;
      steps.push(
        makeStep({
          id: steps.length,
          stepIndex: steps.length,
          title: balanced ? 'Expression is balanced' : 'Unmatched opening bracket remains',
          description: balanced
            ? 'All opening brackets were closed in the correct order, so the expression is balanced.'
            : 'The expression ends with leftover opening brackets still waiting for a closing match.',
          sourceLine: 6,
          expression,
          charIndex: chars.length,
          charStackState: [...workingStack],
          variables: { result: balanced ? 'true (Balanced)' : 'false (Unmatched open)', stackSize: String(workingStack.length) },
          statusText: balanced ? 'Balanced' : 'Unbalanced',
          statusType: balanced ? 'success' : 'mismatch',
          isCompleted: true
        })
      );

      return steps;
    }
    default:
      return [
        makeStep({
          id: 0,
          stepIndex: 0,
          title: 'Stack operation',
          description: 'No stack trace is available for this operation yet.',
          sourceLine: 1,
          stackState: stack,
          capacity,
          topIndex: getTopIndex(stack),
          variables: { result: 'not implemented' },
          statusText: 'Unavailable',
          statusType: 'error',
          isCompleted: true
        })
      ];
  }
}
