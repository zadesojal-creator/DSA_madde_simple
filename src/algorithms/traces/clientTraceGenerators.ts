import type { 
  TraceStep, 
  LinkedNodeSnapshot, 
  TreeNodeSnapshot, 
  PointerInfo,
  GraphVertexSnapshot,
  GraphEdgeSnapshot
} from '../../types/trace';

// ============================================================================
// 1. LINKED LIST TRACE GENERATOR
// ============================================================================

export interface LinkedListTraceParams {
  structure: 'singly' | 'doubly' | 'circular';
  operation: string;
  values: number[];
  value?: number;
  index?: number;
  target?: number;
  capacity?: number;
}

export function generateLinkedListTrace(params: LinkedListTraceParams): TraceStep[] {
  const { structure, operation, values } = params;
  const isDoubly = structure === 'doubly';
  const isCircular = structure === 'circular';
  const steps: TraceStep[] = [];
  let stepId = 0;

  // Helper to build linked nodes snapshot from a flat array of numbers
  const buildNodes = (arr: number[]): LinkedNodeSnapshot[] => {
    return arr.map((val, i) => {
      const id = i + 1;
      let nextId = i < arr.length - 1 ? i + 2 : -1;
      let prevId = isDoubly ? (i > 0 ? i : -1) : -1;
      if (isCircular && arr.length > 0) {
        if (i === arr.length - 1) nextId = 1;
        if (isDoubly && i === 0) prevId = arr.length;
      }
      return { id, value: val, nextId, prevId };
    });
  };

  const initialNodes = buildNodes(values);
  const initialHeadId = initialNodes.length ? 1 : -1;
  const initialTailId = initialNodes.length ? initialNodes.length : -1;

  // Step 0: Initial State
  steps.push({
    id: stepId++,
    stepIndex: 0,
    eventType: 'initialize',
    title: `Initialize ${structure.toUpperCase()} Linked List`,
    description: `Current list contains ${values.length} node(s): [${values.join(' → ') || 'empty'}].`,
    activeLine: 1,
    sourceLine: 1,
    arrayState: [...values],
    linkedNodes: initialNodes,
    elementCount: values.length,
    pointers: initialNodes.length
      ? [
          { name: 'head', index: initialHeadId },
          { name: 'tail', index: initialTailId }
        ]
      : [],
    variables: {
      head: initialHeadId > 0 ? `N${initialHeadId}` : 'nullptr',
      tail: initialTailId > 0 ? `N${initialTailId}` : 'nullptr',
      size: values.length
    },
    statusType: 'normal',
    isCompleted: false
  });

  // Operation Dispatch
  switch (operation) {
    case 'list-create': {
      // Step through creating each node
      const currentArr: number[] = [];
      values.forEach((val, idx) => {
        currentArr.push(val);
        const currentNodes = buildNodes(currentArr);
        const newId = idx + 1;
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'node_create',
          title: `Allocate Node N${newId} (${val})`,
          description: `Allocated new node in heap with value ${val}. Updated pointer linkages.`,
          activeLine: 4,
          sourceLine: 4,
          arrayState: [...currentArr],
          linkedNodes: currentNodes,
          elementCount: currentArr.length,
          activeNodeId: newId,
          pointers: [
            { name: 'head', index: 1 },
            { name: 'tail', index: newId }
          ],
          variables: {
            head: 'N1',
            tail: `N${newId}`,
            size: currentArr.length
          },
          statusType: 'normal',
          isCompleted: false
        });
      });
      break;
    }

    case 'list-traverse': {
      if (values.length === 0) {
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'complete',
          title: 'Empty List',
          description: 'Head pointer is nullptr. Traversal terminated immediately.',
          activeLine: 2,
          sourceLine: 2,
          arrayState: [],
          linkedNodes: [],
          elementCount: 0,
          variables: { result: 0 },
          statusType: 'normal',
          isCompleted: true
        });
        return steps;
      }

      initialNodes.forEach((node, idx) => {
        const ptrs: PointerInfo[] = [
          { name: 'head', index: 1 },
          { name: 'current', index: node.id }
        ];
        if (node.id === initialTailId) ptrs.push({ name: 'tail', index: initialTailId });

        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'traverse',
          title: `Visit Node N${node.id} (${node.value})`,
          description: `Current pointer at index [${idx}], node value: ${node.value}. Advancing to next pointer.`,
          activeLine: 5,
          sourceLine: 5,
          arrayState: [...values],
          linkedNodes: initialNodes,
          elementCount: values.length,
          activeNodeId: node.id,
          pointers: ptrs,
          variables: {
            current: `N${node.id}`,
            value: node.value,
            index: idx
          },
          statusType: 'normal',
          isCompleted: false
        });
      });
      break;
    }

    case 'list-traverse-backward': {
      if (!isDoubly || values.length === 0) break;
      for (let idx = initialNodes.length - 1; idx >= 0; idx--) {
        const node = initialNodes[idx];
        const ptrs: PointerInfo[] = [
          { name: 'tail', index: initialTailId },
          { name: 'current', index: node.id }
        ];
        if (node.id === 1) ptrs.push({ name: 'head', index: 1 });

        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'traverse_backward',
          title: `Visit Node N${node.id} (${node.value}) via prev`,
          description: `Backward traversal at index [${idx}]. Node value: ${node.value}. Following prev pointer.`,
          activeLine: 6,
          sourceLine: 6,
          arrayState: [...values],
          linkedNodes: initialNodes,
          elementCount: values.length,
          activeNodeId: node.id,
          pointers: ptrs,
          variables: {
            current: `N${node.id}`,
            value: node.value,
            index: idx
          },
          statusType: 'normal',
          isCompleted: false
        });
      }
      break;
    }

    case 'list-insert-head': {
      const insertVal = params.value ?? 99;
      const newValues = [insertVal, ...values];
      const newNodes = buildNodes(newValues);

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'node_create',
        title: `Allocate New Head Node (${insertVal})`,
        description: `Allocated new node with value ${insertVal}. Preparing to link new_node->next to old head.`,
        activeLine: 3,
        sourceLine: 3,
        arrayState: [...values],
        linkedNodes: initialNodes,
        elementCount: values.length,
        pointers: initialNodes.length ? [{ name: 'head', index: 1 }] : [],
        variables: { new_value: insertVal },
        statusType: 'normal',
        isCompleted: false
      });

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'pointer_update',
        title: `Link New Node to Old Head`,
        description: `Set new_node->next = head. Head pointer updated to point to new node N1.`,
        activeLine: 6,
        sourceLine: 6,
        arrayState: newValues,
        linkedNodes: newNodes,
        elementCount: newValues.length,
        activeNodeId: 1,
        pointers: [
          { name: 'head', index: 1 },
          { name: 'tail', index: newNodes.length }
        ],
        variables: {
          head: 'N1',
          tail: `N${newNodes.length}`,
          size: newValues.length
        },
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    case 'list-insert-tail': {
      const insertVal = params.value ?? 99;
      const newValues = [...values, insertVal];
      const newNodes = buildNodes(newValues);
      const newTailId = newNodes.length;

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'node_create',
        title: `Allocate New Tail Node (${insertVal})`,
        description: `Allocated new node with value ${insertVal}. Traversed to tail node.`,
        activeLine: 4,
        sourceLine: 4,
        arrayState: [...values],
        linkedNodes: initialNodes,
        elementCount: values.length,
        activeNodeId: initialTailId,
        pointers: initialNodes.length ? [{ name: 'tail', index: initialTailId }] : [],
        variables: { new_value: insertVal },
        statusType: 'normal',
        isCompleted: false
      });

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'pointer_update',
        title: `Attach New Tail N${newTailId}`,
        description: `Linked tail->next = new_node. Updated tail pointer to N${newTailId}.`,
        activeLine: 8,
        sourceLine: 8,
        arrayState: newValues,
        linkedNodes: newNodes,
        elementCount: newValues.length,
        activeNodeId: newTailId,
        pointers: [
          { name: 'head', index: 1 },
          { name: 'tail', index: newTailId }
        ],
        variables: {
          head: 'N1',
          tail: `N${newTailId}`,
          size: newValues.length
        },
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    case 'list-insert-index': {
      const insertVal = params.value ?? 99;
      const targetIdx = Math.max(0, Math.min(params.index ?? 0, values.length));
      const newValues = [...values];
      newValues.splice(targetIdx, 0, insertVal);
      const newNodes = buildNodes(newValues);
      const insertedNodeId = targetIdx + 1;

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'traverse',
        title: `Traverse to Insertion Index [${targetIdx}]`,
        description: `Target index is ${targetIdx}. Navigated predecessor pointer to insert node.`,
        activeLine: 5,
        sourceLine: 5,
        arrayState: [...values],
        linkedNodes: initialNodes,
        elementCount: values.length,
        activeNodeId: targetIdx > 0 ? targetIdx : 1,
        pointers: [{ name: 'current', index: targetIdx > 0 ? targetIdx : 1 }],
        variables: { target_index: targetIdx, value: insertVal },
        statusType: 'normal',
        isCompleted: false
      });

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'pointer_update',
        title: `Splice Node N${insertedNodeId} into Chain`,
        description: `Rewired predecessor->next and successor->prev pointers to incorporate new node.`,
        activeLine: 9,
        sourceLine: 9,
        arrayState: newValues,
        linkedNodes: newNodes,
        elementCount: newValues.length,
        activeNodeId: insertedNodeId,
        pointers: [
          { name: 'head', index: 1 },
          { name: 'current', index: insertedNodeId },
          { name: 'tail', index: newNodes.length }
        ],
        variables: {
          inserted_at: targetIdx,
          size: newValues.length
        },
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    case 'list-delete-head': {
      if (values.length === 0) {
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'error',
          title: 'Underflow: List Is Empty',
          description: 'Cannot delete from an empty linked list.',
          activeLine: 2,
          sourceLine: 2,
          arrayState: [],
          linkedNodes: [],
          elementCount: 0,
          statusType: 'error',
          isCompleted: true
        });
        return steps;
      }

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'detach',
        title: 'Identify Head Node for Deletion',
        description: `Node N1 (value: ${values[0]}) marked for deletion. Storing temp = head.`,
        activeLine: 3,
        sourceLine: 3,
        arrayState: [...values],
        linkedNodes: initialNodes,
        elementCount: values.length,
        activeNodeId: 1,
        pointers: [{ name: 'head', index: 1 }],
        variables: { temp: `N1 (${values[0]})` },
        statusType: 'normal',
        isCompleted: false
      });

      const remainingValues = values.slice(1);
      const remainingNodes = buildNodes(remainingValues);

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'pointer_update',
        title: 'Advance Head & Free Old Node',
        description: `Head updated to old_head->next. Memory for old head deallocated via free/delete.`,
        activeLine: 6,
        sourceLine: 6,
        arrayState: remainingValues,
        linkedNodes: remainingNodes,
        elementCount: remainingValues.length,
        activeNodeId: remainingNodes.length ? 1 : -1,
        pointers: remainingNodes.length
          ? [
              { name: 'head', index: 1 },
              { name: 'tail', index: remainingNodes.length }
            ]
          : [],
        variables: {
          head: remainingNodes.length ? 'N1' : 'nullptr',
          size: remainingValues.length
        },
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    case 'list-delete-tail': {
      if (values.length === 0) {
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'error',
          title: 'Underflow: List Is Empty',
          description: 'Cannot delete tail from an empty linked list.',
          activeLine: 2,
          sourceLine: 2,
          arrayState: [],
          linkedNodes: [],
          elementCount: 0,
          statusType: 'error',
          isCompleted: true
        });
        return steps;
      }

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'traverse',
        title: `Traverse to Tail N${initialTailId}`,
        description: `Located tail node N${initialTailId} (value: ${values[values.length - 1]}).`,
        activeLine: 4,
        sourceLine: 4,
        arrayState: [...values],
        linkedNodes: initialNodes,
        elementCount: values.length,
        activeNodeId: initialTailId,
        pointers: [{ name: 'tail', index: initialTailId }],
        variables: { tail_val: values[values.length - 1] },
        statusType: 'normal',
        isCompleted: false
      });

      const remainingValues = values.slice(0, -1);
      const remainingNodes = buildNodes(remainingValues);

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'pointer_update',
        title: 'Detach Tail Node & Update Links',
        description: `Predecessor->next set to nullptr (or head for circular). Tail node deallocated.`,
        activeLine: 7,
        sourceLine: 7,
        arrayState: remainingValues,
        linkedNodes: remainingNodes,
        elementCount: remainingValues.length,
        pointers: remainingNodes.length
          ? [
              { name: 'head', index: 1 },
              { name: 'tail', index: remainingNodes.length }
            ]
          : [],
        variables: {
          tail: remainingNodes.length ? `N${remainingNodes.length}` : 'nullptr',
          size: remainingValues.length
        },
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    case 'list-delete-index': {
      const targetIdx = Math.max(0, Math.min(params.index ?? 0, values.length - 1));
      if (values.length === 0 || targetIdx >= values.length) {
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'error',
          title: 'Invalid Deletion Index',
          description: `Index [${targetIdx}] is out of bounds for list of size ${values.length}.`,
          activeLine: 2,
          sourceLine: 2,
          arrayState: [...values],
          linkedNodes: initialNodes,
          elementCount: values.length,
          statusType: 'error',
          isCompleted: true
        });
        return steps;
      }

      const nodeToDeleteId = targetIdx + 1;
      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'traverse',
        title: `Traverse to Index [${targetIdx}] (Node N${nodeToDeleteId})`,
        description: `Located node N${nodeToDeleteId} with value ${values[targetIdx]} to be deleted.`,
        activeLine: 5,
        sourceLine: 5,
        arrayState: [...values],
        linkedNodes: initialNodes,
        elementCount: values.length,
        activeNodeId: nodeToDeleteId,
        pointers: [{ name: 'current', index: nodeToDeleteId }],
        variables: { target_index: targetIdx, value: values[targetIdx] },
        statusType: 'normal',
        isCompleted: false
      });

      const remainingValues = [...values];
      remainingValues.splice(targetIdx, 1);
      const remainingNodes = buildNodes(remainingValues);

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'pointer_update',
        title: `Bypass & Deallocate Node N${nodeToDeleteId}`,
        description: `Connected predecessor directly to successor. Node N${nodeToDeleteId} deallocated.`,
        activeLine: 9,
        sourceLine: 9,
        arrayState: remainingValues,
        linkedNodes: remainingNodes,
        elementCount: remainingValues.length,
        pointers: remainingNodes.length
          ? [
              { name: 'head', index: 1 },
              { name: 'tail', index: remainingNodes.length }
            ]
          : [],
        variables: {
          deleted_index: targetIdx,
          size: remainingValues.length
        },
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    case 'list-search': {
      const searchTarget = params.target ?? 20;
      let foundIdx = -1;

      for (let i = 0; i < initialNodes.length; i++) {
        const node = initialNodes[i];
        const isMatch = node.value === searchTarget;
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'compare',
          title: `Compare Node N${node.id} (${node.value}) == Target (${searchTarget})`,
          description: isMatch
            ? `Match found at index [${i}]! Target ${searchTarget} located.`
            : `Value ${node.value} != ${searchTarget}. Advancing to next pointer.`,
          activeLine: 6,
          sourceLine: 6,
          arrayState: [...values],
          linkedNodes: initialNodes,
          elementCount: values.length,
          activeNodeId: node.id,
          pointers: [
            { name: 'head', index: 1 },
            { name: 'current', index: node.id }
          ],
          variables: {
            current: `N${node.id}`,
            target: searchTarget,
            match: isMatch
          },
          statusType: isMatch ? 'success' : 'normal',
          isCompleted: false
        });

        if (isMatch) {
          foundIdx = i;
          break;
        }
      }

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'complete',
        title: foundIdx >= 0 ? `Target ${searchTarget} Found` : `Target ${searchTarget} Not Found`,
        description: foundIdx >= 0
          ? `Search successfully concluded at index [${foundIdx}].`
          : `Reached end of list (nullptr). Target ${searchTarget} is not present.`,
        activeLine: 9,
        sourceLine: 9,
        arrayState: [...values],
        linkedNodes: initialNodes,
        elementCount: values.length,
        activeNodeId: foundIdx >= 0 ? foundIdx + 1 : -1,
        variables: {
          result: foundIdx,
          found: foundIdx >= 0
        },
        statusType: foundIdx >= 0 ? 'success' : 'normal',
        isCompleted: true
      });
      return steps;
    }

    case 'list-update': {
      const updateIdx = Math.max(0, Math.min(params.index ?? 0, values.length - 1));
      const updateVal = params.value ?? 99;
      if (values.length === 0 || updateIdx >= values.length) {
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'error',
          title: 'Update Index Out of Bounds',
          description: `Index [${updateIdx}] is invalid for list of size ${values.length}.`,
          activeLine: 2,
          sourceLine: 2,
          arrayState: [...values],
          linkedNodes: initialNodes,
          elementCount: values.length,
          statusType: 'error',
          isCompleted: true
        });
        return steps;
      }

      const updatedValues = [...values];
      updatedValues[updateIdx] = updateVal;
      const updatedNodes = buildNodes(updatedValues);

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'update',
        title: `Traverse to Index [${updateIdx}] (Node N${updateIdx + 1})`,
        description: `Located node N${updateIdx + 1}. Current value: ${values[updateIdx]}.`,
        activeLine: 5,
        sourceLine: 5,
        arrayState: [...values],
        linkedNodes: initialNodes,
        elementCount: values.length,
        activeNodeId: updateIdx + 1,
        pointers: [{ name: 'current', index: updateIdx + 1 }],
        variables: { old_value: values[updateIdx], new_value: updateVal },
        statusType: 'normal',
        isCompleted: false
      });

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'complete',
        title: `Updated Node N${updateIdx + 1} to ${updateVal}`,
        description: `Value replaced with ${updateVal} in-place.`,
        activeLine: 7,
        sourceLine: 7,
        arrayState: updatedValues,
        linkedNodes: updatedNodes,
        elementCount: updatedValues.length,
        activeNodeId: updateIdx + 1,
        pointers: [
          { name: 'head', index: 1 },
          { name: 'current', index: updateIdx + 1 },
          { name: 'tail', index: updatedNodes.length }
        ],
        variables: {
          updated_index: updateIdx,
          value: updateVal
        },
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    case 'list-reverse': {
      if (values.length <= 1) {
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'complete',
          title: 'Reverse Completed',
          description: 'List has 0 or 1 node; already reversed.',
          activeLine: 2,
          sourceLine: 2,
          arrayState: [...values],
          linkedNodes: initialNodes,
          elementCount: values.length,
          statusType: 'success',
          isCompleted: true
        });
        return steps;
      }

      const reversedValues = [...values].reverse();
      const reversedNodes = buildNodes(reversedValues);

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'pointer_update',
        title: 'Invert Pointers Node-by-Node',
        description: 'Iteratively flipping next and prev links for each node in the chain.',
        activeLine: 6,
        sourceLine: 6,
        arrayState: [...values],
        linkedNodes: initialNodes,
        elementCount: values.length,
        activeNodeId: 1,
        pointers: [
          { name: 'head', index: 1 },
          { name: 'tail', index: initialTailId }
        ],
        statusType: 'normal',
        isCompleted: false
      });

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'complete',
        title: 'List Reversal Finished',
        description: `All pointer directions inverted. Head now points to N1 (${reversedValues[0]}).`,
        activeLine: 10,
        sourceLine: 10,
        arrayState: reversedValues,
        linkedNodes: reversedNodes,
        elementCount: reversedValues.length,
        pointers: [
          { name: 'head', index: 1 },
          { name: 'tail', index: reversedNodes.length }
        ],
        variables: {
          head: 'N1',
          tail: `N${reversedNodes.length}`,
          size: reversedValues.length
        },
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    case 'list-length': {
      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'complete',
        title: `Calculated Length: ${values.length}`,
        description: `Traversed list and counted ${values.length} total nodes.`,
        activeLine: 6,
        sourceLine: 6,
        arrayState: [...values],
        linkedNodes: initialNodes,
        elementCount: values.length,
        variables: {
          result: values.length,
          length: values.length
        },
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    default:
      break;
  }

  // Fallback complete step
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    eventType: 'complete',
    title: 'Operation Finished',
    description: `Completed ${operation} on ${structure} linked list.`,
    activeLine: 10,
    sourceLine: 10,
    arrayState: [...values],
    linkedNodes: initialNodes,
    elementCount: values.length,
    pointers: initialNodes.length
      ? [
          { name: 'head', index: 1 },
          { name: 'tail', index: initialTailId }
        ]
      : [],
    variables: {
      head: initialHeadId > 0 ? `N${initialHeadId}` : 'nullptr',
      tail: initialTailId > 0 ? `N${initialTailId}` : 'nullptr',
      size: values.length
    },
    statusType: 'normal',
    isCompleted: true
  });

  return steps;
}

// ============================================================================
// 2. BINARY TREE TRACE GENERATOR
// ============================================================================

export interface InternalTreeNode {
  id: number;
  value: number;
  left: InternalTreeNode | null;
  right: InternalTreeNode | null;
  parent: InternalTreeNode | null;
  depth: number;
}

export function parseTokensToTree(tokens: string[]): { root: InternalTreeNode | null; nodes: InternalTreeNode[] } {
  if (!tokens.length || tokens[0] === 'null' || tokens[0] === '-') {
    return { root: null, nodes: [] };
  }

  let nextId = 1;
  const root: InternalTreeNode = {
    id: nextId++,
    value: Number(tokens[0]),
    left: null,
    right: null,
    parent: null,
    depth: 0
  };

  const allNodes: InternalTreeNode[] = [root];
  const queue: InternalTreeNode[] = [root];
  let i = 1;

  while (queue.length > 0 && i < tokens.length) {
    const curr = queue.shift()!;

    // Left child
    if (i < tokens.length) {
      if (tokens[i] !== 'null' && tokens[i] !== '-') {
        const leftNode: InternalTreeNode = {
          id: nextId++,
          value: Number(tokens[i]),
          left: null,
          right: null,
          parent: curr,
          depth: curr.depth + 1
        };
        curr.left = leftNode;
        allNodes.push(leftNode);
        queue.push(leftNode);
      }
      i++;
    }

    // Right child
    if (i < tokens.length) {
      if (tokens[i] !== 'null' && tokens[i] !== '-') {
        const rightNode: InternalTreeNode = {
          id: nextId++,
          value: Number(tokens[i]),
          left: null,
          right: null,
          parent: curr,
          depth: curr.depth + 1
        };
        curr.right = rightNode;
        allNodes.push(rightNode);
        queue.push(rightNode);
      }
      i++;
    }
  }

  return { root, nodes: allNodes };
}

export function flattenTreeToSnapshots(root: InternalTreeNode | null): TreeNodeSnapshot[] {
  if (!root) return [];
  const snapshots: TreeNodeSnapshot[] = [];

  const traverse = (node: InternalTreeNode) => {
    snapshots.push({
      id: node.id,
      value: node.value,
      leftId: node.left ? node.left.id : -1,
      rightId: node.right ? node.right.id : -1,
      parentId: node.parent ? node.parent.id : -1,
      depth: node.depth
    });
    if (node.left) traverse(node.left);
    if (node.right) traverse(node.right);
  };

  traverse(root);
  return snapshots;
}

export function generateBinaryTreeTrace(
  operation: string,
  tokens: string[],
  target = 0,
  value = 0
): TraceStep[] {
  const steps: TraceStep[] = [];
  let stepId = 0;

  // Step 0: Initialize
  steps.push({
    id: stepId++,
    stepIndex: 0,
    eventType: 'initialize',
    title: 'Initialize Binary Tree',
    description: `Input level-order array tokens: [${tokens.join(', ') || 'empty'}].`,
    activeLine: 2,
    sourceLine: 2,
    treeNodes: [],
    rootId: -1,
    activeNodeId: -1,
    statusType: 'normal',
    isCompleted: false
  });

  const { root, nodes } = parseTokensToTree(tokens);
  const snapshots = flattenTreeToSnapshots(root);

  if (!root) {
    steps.push({
      id: stepId++,
      stepIndex: 1,
      eventType: 'complete',
      title: 'Empty Tree',
      description: 'The binary tree is empty (root is null).',
      activeLine: 3,
      sourceLine: 3,
      treeNodes: [],
      rootId: -1,
      activeNodeId: -1,
      variables: { totalNodes: 0 },
      statusType: 'normal',
      isCompleted: true
    });
    return steps;
  }

  switch (operation) {
    case 'tree-build':
    case 'binary-tree': {
      // Step-by-step construction
      let runningSnapshots: TreeNodeSnapshot[] = [];
      nodes.forEach((node, idx) => {
        runningSnapshots = snapshots.filter(s => s.id <= node.id);
        const isRoot = idx === 0;
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: isRoot ? 'node_create' : 'node_insert',
          title: isRoot ? `Create Root Node: ${node.value}` : `Attach Node N${node.id} (${node.value})`,
          description: isRoot
            ? `Allocated root node (id=1) with value ${node.value}.`
            : `Attached child node with value ${node.value} to parent N${node.parent?.id}.`,
          activeLine: isRoot ? 5 : 9,
          sourceLine: isRoot ? 5 : 9,
          treeNodes: [...runningSnapshots],
          rootId: 1,
          activeNodeId: node.id,
          highlightedNodes: { [node.id]: 'active' },
          variables: { currentNode: node.value, depth: node.depth },
          statusType: 'normal',
          isCompleted: false
        });
      });

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'complete',
        title: 'Binary Tree Ready',
        description: `Constructed binary tree with ${nodes.length} nodes from level-order tokens.`,
        activeLine: 15,
        sourceLine: 15,
        treeNodes: snapshots,
        rootId: 1,
        activeNodeId: -1,
        variables: { totalNodes: nodes.length, nodeCount: nodes.length },
        statusType: 'normal',
        isCompleted: true
      });
      return steps;
    }

    case 'tree-insert': {
      // Level-order insertion of value
      const insertVal = value || target || 99;
      const newTokens = [...tokens, String(insertVal)];
      const updatedTree = parseTokensToTree(newTokens);
      const updatedSnapshots = flattenTreeToSnapshots(updatedTree.root);
      const insertedNode = updatedTree.nodes[updatedTree.nodes.length - 1];

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'traverse',
        title: 'Traverse BFS Queue to First Vacant Child Slot',
        description: `Searching level-order for the first node with an open left or right child pointer.`,
        activeLine: 6,
        sourceLine: 6,
        treeNodes: snapshots,
        rootId: 1,
        activeNodeId: insertedNode?.parent ? insertedNode.parent.id : 1,
        highlightedNodes: insertedNode?.parent ? { [insertedNode.parent.id]: 'active' } : {},
        variables: { parentNode: insertedNode?.parent?.value ?? 0, insertVal },
        statusType: 'normal',
        isCompleted: false
      });

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'complete',
        title: `Attached New Child Node: ${insertVal}`,
        description: `Inserted node N${insertedNode?.id} (${insertVal}) as child of N${insertedNode?.parent?.id}.`,
        activeLine: 10,
        sourceLine: 10,
        treeNodes: updatedSnapshots,
        rootId: 1,
        activeNodeId: insertedNode?.id ?? -1,
        highlightedNodes: insertedNode ? { [insertedNode.id]: 'found' } : {},
        variables: { totalNodes: updatedTree.nodes.length, inserted: insertVal },
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    case 'tree-delete': {
      const deleteTarget = target || value;
      const targetNode = nodes.find(n => n.value === deleteTarget);

      if (!targetNode) {
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'error',
          title: `Node ${deleteTarget} Not Found`,
          description: `No node with value ${deleteTarget} exists in the tree to delete.`,
          activeLine: 4,
          sourceLine: 4,
          treeNodes: snapshots,
          rootId: 1,
          statusType: 'error',
          isCompleted: true
        });
        return steps;
      }

      // In binary tree deletion: replace target node's value with the deepest rightmost node's value, then delete deepest node
      const deepestNode = nodes[nodes.length - 1];
      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'traverse',
        title: `Located Target Node ${deleteTarget}`,
        description: `Found node N${targetNode.id} (${deleteTarget}). Finding deepest node N${deepestNode.id} (${deepestNode.value}) for replacement.`,
        activeLine: 8,
        sourceLine: 8,
        treeNodes: snapshots,
        rootId: 1,
        activeNodeId: targetNode.id,
        highlightedNodes: { [targetNode.id]: 'active', [deepestNode.id]: 'compare' },
        variables: { target: deleteTarget, replacement: deepestNode.value },
        statusType: 'normal',
        isCompleted: false
      });

      // Remove deepest token or replace in tokens
      const remainingTokens = tokens.filter(t => t !== String(deleteTarget));
      const updatedTree = parseTokensToTree(remainingTokens.length ? remainingTokens : []);
      const updatedSnapshots = flattenTreeToSnapshots(updatedTree.root);

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'complete',
        title: `Deleted Node ${deleteTarget}`,
        description: `Replaced target value with deepest node value and deallocated node. Tree updated.`,
        activeLine: 14,
        sourceLine: 14,
        treeNodes: updatedSnapshots,
        rootId: updatedTree.root ? 1 : -1,
        activeNodeId: -1,
        variables: { totalNodes: updatedTree.nodes.length, deleted: deleteTarget },
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    case 'tree-search': {
      const searchTarget = target || value;
      let found = false;

      for (const node of nodes) {
        const isMatch = node.value === searchTarget;
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'compare',
          title: `Compare: Node ${node.value} == Target ${searchTarget}`,
          description: isMatch
            ? `Match found! Node with value ${searchTarget} located.`
            : `Value ${node.value} != ${searchTarget}. Checking next node in queue.`,
          activeLine: 9,
          sourceLine: 9,
          treeNodes: snapshots,
          rootId: 1,
          activeNodeId: node.id,
          highlightedNodes: { [node.id]: isMatch ? 'found' : 'visited' },
          variables: { target: searchTarget, found: isMatch ? 'true' : 'false' },
          statusType: isMatch ? 'success' : 'normal',
          isCompleted: isMatch
        });

        if (isMatch) {
          found = true;
          break;
        }
      }

      if (!found) {
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'complete',
          title: `Search Complete: ${searchTarget} Not Found`,
          description: `All nodes inspected. Value ${searchTarget} is not present in this tree.`,
          activeLine: 14,
          sourceLine: 14,
          treeNodes: snapshots,
          rootId: 1,
          activeNodeId: -1,
          variables: { target: searchTarget, found: 'false' },
          statusType: 'normal',
          isCompleted: true
        });
      }
      return steps;
    }

    case 'tree-min': {
      let minVal = nodes[0].value;
      let minId = nodes[0].id;

      for (const node of nodes) {
        if (node.value < minVal) {
          minVal = node.value;
          minId = node.id;
        }
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'compare',
          title: `Inspect Node N${node.id} (${node.value})`,
          description: `Current minimum so far: ${minVal}.`,
          activeLine: 7,
          sourceLine: 7,
          treeNodes: snapshots,
          rootId: 1,
          activeNodeId: node.id,
          highlightedNodes: { [node.id]: 'visited', [minId]: 'found' },
          variables: { currentMin: minVal },
          statusType: 'normal',
          isCompleted: false
        });
      }

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'complete',
        title: `Minimum Value Found: ${minVal}`,
        description: `Tree traversal complete. Minimum value in binary tree is ${minVal} at Node N${minId}.`,
        activeLine: 12,
        sourceLine: 12,
        treeNodes: snapshots,
        rootId: 1,
        activeNodeId: minId,
        highlightedNodes: { [minId]: 'found' },
        variables: { min: minVal, result: minVal },
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    case 'tree-max': {
      let maxVal = nodes[0].value;
      let maxId = nodes[0].id;

      for (const node of nodes) {
        if (node.value > maxVal) {
          maxVal = node.value;
          maxId = node.id;
        }
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'compare',
          title: `Inspect Node N${node.id} (${node.value})`,
          description: `Current maximum so far: ${maxVal}.`,
          activeLine: 7,
          sourceLine: 7,
          treeNodes: snapshots,
          rootId: 1,
          activeNodeId: node.id,
          highlightedNodes: { [node.id]: 'visited', [maxId]: 'found' },
          variables: { currentMax: maxVal },
          statusType: 'normal',
          isCompleted: false
        });
      }

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'complete',
        title: `Maximum Value Found: ${maxVal}`,
        description: `Tree traversal complete. Maximum value in binary tree is ${maxVal} at Node N${maxId}.`,
        activeLine: 12,
        sourceLine: 12,
        treeNodes: snapshots,
        rootId: 1,
        activeNodeId: maxId,
        highlightedNodes: { [maxId]: 'found' },
        variables: { max: maxVal, result: maxVal },
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    case 'tree-size': {
      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'complete',
        title: `Total Nodes Counted: ${nodes.length}`,
        description: `Recursive size count returned ${nodes.length} nodes.`,
        activeLine: 8,
        sourceLine: 8,
        treeNodes: snapshots,
        rootId: 1,
        variables: { totalNodes: String(nodes.length), size: nodes.length },
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    case 'tree-height': {
      let maxDepth = 0;
      for (const n of nodes) {
        if (n.depth > maxDepth) maxDepth = n.depth;
      }
      const height = maxDepth + 1;
      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'complete',
        title: `Tree Height: ${height}`,
        description: `Calculated tree height: ${height} level(s) (max depth = ${maxDepth}).`,
        activeLine: 10,
        sourceLine: 10,
        treeNodes: snapshots,
        rootId: 1,
        variables: { height: String(height), maxDepth },
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    case 'tree-leaves': {
      const leaves = nodes.filter(n => !n.left && !n.right);
      const leafHighlights: Record<number, string> = {};
      leaves.forEach(l => { leafHighlights[l.id] = 'found'; });

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'complete',
        title: `Leaf Nodes Counted: ${leaves.length}`,
        description: `Found ${leaves.length} leaf node(s) with no children: [${leaves.map(l => l.value).join(', ')}].`,
        activeLine: 9,
        sourceLine: 9,
        treeNodes: snapshots,
        rootId: 1,
        highlightedNodes: leafHighlights,
        variables: { leafCount: String(leaves.length) },
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    // Tree Traversals
    case 'traversal-preorder':
    case 'traversals-preorder': {
      const output: number[] = [];
      const traversePre = (node: InternalTreeNode | null) => {
        if (!node) return;
        output.push(node.value);
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'traverse',
          title: `Visit Node ${node.value} (Root)`,
          description: `Preorder visit: append ${node.value} to output, then recurse left and right.`,
          activeLine: 5,
          sourceLine: 5,
          treeNodes: snapshots,
          rootId: 1,
          activeNodeId: node.id,
          traversalOutput: [...output],
          highlightedNodes: { [node.id]: 'active' },
          callStack: [`preorder(node=${node.value})`],
          isCompleted: false
        });
        traversePre(node.left);
        traversePre(node.right);
      };
      traversePre(root);

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'complete',
        title: 'Preorder Traversal Complete',
        description: `Sequence (Root → Left → Right): [${output.join(', ')}].`,
        activeLine: 10,
        sourceLine: 10,
        treeNodes: snapshots,
        rootId: 1,
        traversalOutput: output,
        callStack: [],
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    case 'traversal-inorder':
    case 'traversals-inorder': {
      const output: number[] = [];
      const traverseIn = (node: InternalTreeNode | null) => {
        if (!node) return;
        traverseIn(node.left);
        output.push(node.value);
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'traverse',
          title: `Visit Node ${node.value} (Inorder)`,
          description: `Inorder visit: Left subtree finished; processing root ${node.value}.`,
          activeLine: 6,
          sourceLine: 6,
          treeNodes: snapshots,
          rootId: 1,
          activeNodeId: node.id,
          traversalOutput: [...output],
          highlightedNodes: { [node.id]: 'active' },
          callStack: [`inorder(node=${node.value})`],
          isCompleted: false
        });
        traverseIn(node.right);
      };
      traverseIn(root);

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'complete',
        title: 'Inorder Traversal Complete',
        description: `Sequence (Left → Root → Right): [${output.join(', ')}].`,
        activeLine: 10,
        sourceLine: 10,
        treeNodes: snapshots,
        rootId: 1,
        traversalOutput: output,
        callStack: [],
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    case 'traversal-postorder':
    case 'traversals-postorder': {
      const output: number[] = [];
      const traversePost = (node: InternalTreeNode | null) => {
        if (!node) return;
        traversePost(node.left);
        traversePost(node.right);
        output.push(node.value);
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'traverse',
          title: `Visit Node ${node.value} (Postorder)`,
          description: `Postorder visit: Children processed; appending ${node.value}.`,
          activeLine: 7,
          sourceLine: 7,
          treeNodes: snapshots,
          rootId: 1,
          activeNodeId: node.id,
          traversalOutput: [...output],
          highlightedNodes: { [node.id]: 'active' },
          callStack: [`postorder(node=${node.value})`],
          isCompleted: false
        });
      };
      traversePost(root);

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'complete',
        title: 'Postorder Traversal Complete',
        description: `Sequence (Left → Right → Root): [${output.join(', ')}].`,
        activeLine: 10,
        sourceLine: 10,
        treeNodes: snapshots,
        rootId: 1,
        traversalOutput: output,
        callStack: [],
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    case 'traversal-level-order':
    case 'traversals-levelorder': {
      const output: number[] = [];
      nodes.forEach(node => {
        output.push(node.value);
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'traverse',
          title: `Queue Dequeue: Node ${node.value}`,
          description: `BFS level-order processing node ${node.value} at depth ${node.depth}.`,
          activeLine: 8,
          sourceLine: 8,
          treeNodes: snapshots,
          rootId: 1,
          activeNodeId: node.id,
          traversalOutput: [...output],
          highlightedNodes: { [node.id]: 'active' },
          isCompleted: false
        });
      });

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'complete',
        title: 'Level-Order Traversal Complete',
        description: `BFS sequence: [${output.join(', ')}].`,
        activeLine: 12,
        sourceLine: 12,
        treeNodes: snapshots,
        rootId: 1,
        traversalOutput: output,
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    default:
      break;
  }

  // Fallback
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    eventType: 'complete',
    title: 'Operation Complete',
    description: `Binary tree operation ${operation} finished.`,
    activeLine: 15,
    sourceLine: 15,
    treeNodes: snapshots,
    rootId: 1,
    activeNodeId: -1,
    isCompleted: true
  });
  return steps;
}

// ============================================================================
// 3. HEAP TRACE GENERATOR (MIN-HEAP & MAX-HEAP)
// ============================================================================

export function generateHeapTrace(
  heapType: 'min' | 'max',
  operation: string,
  initialArray: number[],
  operandValue = 0
): TraceStep[] {
  const isMin = heapType === 'min';
  const steps: TraceStep[] = [];
  let stepId = 0;
  const arr = [...initialArray];

  const compareViolation = (parentVal: number, childVal: number): boolean => {
    return isMin ? parentVal > childVal : parentVal < childVal;
  };

  // Step 0: Initialize
  steps.push({
    id: stepId++,
    stepIndex: 0,
    eventType: 'initialize',
    title: `Initialize ${isMin ? 'Min-Heap' : 'Max-Heap'}`,
    description: `Array storage contains [${arr.join(', ')}]. Complete binary tree layout ready.`,
    activeLine: 2,
    sourceLine: 2,
    arrayState: [...arr],
    heapSize: arr.length,
    heapType,
    statusType: 'normal',
    isCompleted: false
  });

  if (operation.includes('-build') || operation === 'min-heap' || operation === 'max-heap') {
    // Bottom-up heapify: start from Math.floor(n/2) - 1 down to 0
    const n = arr.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      let curr = i;
      while (curr * 2 + 1 < n) {
        const left = curr * 2 + 1;
        const right = curr * 2 + 2;
        let best = curr;

        if (left < n && compareViolation(arr[best], arr[left])) {
          best = left;
        }
        if (right < n && compareViolation(arr[best], arr[right])) {
          best = right;
        }

        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'compare',
          title: `Sift-Down Check at Parent [${curr}] (${arr[curr]})`,
          description: `Comparing parent [${curr}] (${arr[curr]}) with left child [${left}] (${arr[left]})${right < n ? ` and right child [${right}] (${arr[right]})` : ''}.`,
          activeLine: 6,
          sourceLine: 6,
          arrayState: [...arr],
          activeIndices: [curr, left, ...(right < n ? [right] : [])],
          activeParentIdx: curr,
          activeLeftIdx: left,
          activeRightIdx: right < n ? right : -1,
          heapSize: n,
          heapType,
          statusType: 'normal',
          isCompleted: false
        });

        if (best !== curr) {
          // Swap
          const temp = arr[curr];
          arr[curr] = arr[best];
          arr[best] = temp;

          steps.push({
            id: stepId++,
            stepIndex: steps.length,
            eventType: 'swap',
            title: `Swap Parent [${curr}] with Child [${best}]`,
            description: `Swapped ${temp} and ${arr[curr]} to restore heap invariant.`,
            activeLine: 9,
            sourceLine: 9,
            arrayState: [...arr],
            activeIndices: [curr, best],
            activeParentIdx: curr,
            heapSize: n,
            heapType,
            statusType: 'normal',
            isCompleted: false
          });

          curr = best;
        } else {
          break;
        }
      }
    }

    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      eventType: 'complete',
      title: `${isMin ? 'Min-Heap' : 'Max-Heap'} Built Successfully`,
      description: `Bottom-up heap construction complete in O(n) time. Root holds ${isMin ? 'minimum' : 'maximum'} value: ${arr[0]}.`,
      activeLine: 14,
      sourceLine: 14,
      arrayState: [...arr],
      heapSize: arr.length,
      heapType,
      statusType: 'success',
      isCompleted: true
    });
    return steps;
  }

  if (operation.includes('-insert')) {
    const val = operandValue || 99;
    arr.push(val);
    let curr = arr.length - 1;

    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      eventType: 'insert',
      title: `Append Value ${val} at Array Slot [${curr}]`,
      description: `Inserted ${val} at next available leaf position in complete binary tree.`,
      activeLine: 4,
      sourceLine: 4,
      arrayState: [...arr],
      activeIndices: [curr],
      heapSize: arr.length,
      heapType,
      statusType: 'normal',
      isCompleted: false
    });

    // Sift-up
    while (curr > 0) {
      const parent = Math.floor((curr - 1) / 2);
      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'compare',
        title: `Sift-Up: Compare Child [${curr}] (${arr[curr]}) with Parent [${parent}] (${arr[parent]})`,
        description: `Checking heap invariant between child and parent.`,
        activeLine: 7,
        sourceLine: 7,
        arrayState: [...arr],
        activeIndices: [curr, parent],
        activeParentIdx: parent,
        heapSize: arr.length,
        heapType,
        statusType: 'normal',
        isCompleted: false
      });

      if (compareViolation(arr[parent], arr[curr])) {
        const temp = arr[curr];
        arr[curr] = arr[parent];
        arr[parent] = temp;

        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'swap',
          title: `Swap Child [${curr}] with Parent [${parent}]`,
          description: `Swapped ${temp} and ${arr[curr]} upwards.`,
          activeLine: 10,
          sourceLine: 10,
          arrayState: [...arr],
          activeIndices: [curr, parent],
          heapSize: arr.length,
          heapType,
          statusType: 'normal',
          isCompleted: false
        });
        curr = parent;
      } else {
        break;
      }
    }

    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      eventType: 'complete',
      title: `Insertion of ${val} Complete`,
      description: `Heap property restored after sift-up. New heap size: ${arr.length}.`,
      activeLine: 14,
      sourceLine: 14,
      arrayState: [...arr],
      heapSize: arr.length,
      heapType,
      statusType: 'success',
      isCompleted: true
    });
    return steps;
  }

  if (operation.includes('-extract')) {
    if (arr.length === 0) {
      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'error',
        title: 'Heap Underflow',
        description: 'Cannot extract from an empty heap.',
        activeLine: 2,
        sourceLine: 2,
        arrayState: [],
        heapSize: 0,
        heapType,
        statusType: 'error',
        isCompleted: true
      });
      return steps;
    }

    const extractedVal = arr[0];
    const lastVal = arr[arr.length - 1];

    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      eventType: 'extract',
      title: `Extract Root: ${extractedVal}`,
      description: `Removed root element ${extractedVal}. Replacing root with last leaf element ${lastVal}.`,
      activeLine: 5,
      sourceLine: 5,
      arrayState: [...arr],
      activeIndices: [0, arr.length - 1],
      heapSize: arr.length,
      heapType,
      variables: { extracted: extractedVal },
      statusType: 'normal',
      isCompleted: false
    });

    arr[0] = lastVal;
    arr.pop();

    if (arr.length > 0) {
      // Sift-down root
      let curr = 0;
      const n = arr.length;
      while (curr * 2 + 1 < n) {
        const left = curr * 2 + 1;
        const right = curr * 2 + 2;
        let best = curr;

        if (left < n && compareViolation(arr[best], arr[left])) {
          best = left;
        }
        if (right < n && compareViolation(arr[best], arr[right])) {
          best = right;
        }

        if (best !== curr) {
          const temp = arr[curr];
          arr[curr] = arr[best];
          arr[best] = temp;

          steps.push({
            id: stepId++,
            stepIndex: steps.length,
            eventType: 'swap',
            title: `Sift-Down Swap: [${curr}] ↔ [${best}]`,
            description: `Swapped ${temp} with ${arr[curr]} to restore heap invariant.`,
            activeLine: 9,
            sourceLine: 9,
            arrayState: [...arr],
            activeIndices: [curr, best],
            activeParentIdx: curr,
            heapSize: n,
            heapType,
            statusType: 'normal',
            isCompleted: false
          });

          curr = best;
        } else {
          break;
        }
      }
    }

    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      eventType: 'complete',
      title: `Extraction Complete (Extracted ${extractedVal})`,
      description: `Root ${extractedVal} extracted. Heap property maintained. New size: ${arr.length}.`,
      activeLine: 13,
      sourceLine: 13,
      arrayState: [...arr],
      heapSize: arr.length,
      heapType,
      variables: { extracted: extractedVal, newRoot: arr[0] ?? 'none' },
      statusType: 'success',
      isCompleted: true
    });
    return steps;
  }

  if (operation.includes('-peek')) {
    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      eventType: 'complete',
      title: `Peek Root: ${arr[0] ?? 'empty'}`,
      description: `The root of the ${isMin ? 'Min-Heap' : 'Max-Heap'} is ${arr[0] ?? 'empty'}. Access time is O(1).`,
      activeLine: 3,
      sourceLine: 3,
      arrayState: [...arr],
      activeIndices: arr.length ? [0] : [],
      heapSize: arr.length,
      heapType,
      variables: { root: arr[0] ?? 'none' },
      statusType: 'success',
      isCompleted: true
    });
    return steps;
  }

  if (operation.includes('-delete')) {
    const delTarget = operandValue;
    const delIdx = arr.indexOf(delTarget);
    if (delIdx === -1) {
      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'error',
        title: `Element ${delTarget} Not Found`,
        description: `Cannot delete ${delTarget}: not present in heap.`,
        activeLine: 3,
        sourceLine: 3,
        arrayState: [...arr],
        heapSize: arr.length,
        heapType,
        statusType: 'error',
        isCompleted: true
      });
      return steps;
    }

    const lastVal = arr[arr.length - 1];
    arr[delIdx] = lastVal;
    arr.pop();

    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      eventType: 'complete',
      title: `Deleted Element ${delTarget}`,
      description: `Replaced element at index [${delIdx}] with last element and restored heap property.`,
      activeLine: 10,
      sourceLine: 10,
      arrayState: [...arr],
      heapSize: arr.length,
      heapType,
      variables: { deleted: delTarget, remaining: arr.length },
      statusType: 'success',
      isCompleted: true
    });
    return steps;
  }

  // Fallback
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    eventType: 'complete',
    title: 'Heap Operation Complete',
    description: `Finished ${operation} on ${heapType} heap.`,
    activeLine: 12,
    sourceLine: 12,
    arrayState: [...arr],
    heapSize: arr.length,
    heapType,
    statusType: 'normal',
    isCompleted: true
  });
  return steps;
}


// ============================================================================
// 4. BINARY SEARCH TREE (BST) TRACE GENERATOR
// ============================================================================

export function buildBstFromKeys(keys: number[]): { root: InternalTreeNode | null; nodes: InternalTreeNode[] } {
  if (!keys.length) return { root: null, nodes: [] };
  let nextId = 1;

  const root: InternalTreeNode = {
    id: nextId++,
    value: keys[0],
    left: null,
    right: null,
    parent: null,
    depth: 0
  };

  const allNodes: InternalTreeNode[] = [root];

  const insertKey = (val: number) => {
    let curr = root;
    while (true) {
      if (val === curr.value) return; // ignore duplicates in strict BST
      if (val < curr.value) {
        if (!curr.left) {
          const newNode: InternalTreeNode = {
            id: nextId++,
            value: val,
            left: null,
            right: null,
            parent: curr,
            depth: curr.depth + 1
          };
          curr.left = newNode;
          allNodes.push(newNode);
          break;
        }
        curr = curr.left;
      } else {
        if (!curr.right) {
          const newNode: InternalTreeNode = {
            id: nextId++,
            value: val,
            left: null,
            right: null,
            parent: curr,
            depth: curr.depth + 1
          };
          curr.right = newNode;
          allNodes.push(newNode);
          break;
        }
        curr = curr.right;
      }
    }
  };

  for (let i = 1; i < keys.length; i++) {
    insertKey(keys[i]);
  }

  return { root, nodes: allNodes };
}

export function generateBstTrace(
  operation: string,
  keys: number[],
  target = 0,
  value = 0
): TraceStep[] {
  const steps: TraceStep[] = [];
  let stepId = 0;

  // Step 0: Initialize
  steps.push({
    id: stepId++,
    stepIndex: 0,
    eventType: 'initialize',
    title: 'Initialize Binary Search Tree',
    description: `BST keys: [${keys.join(', ')}]. Invariant: Left < Root < Right.`,
    activeLine: 2,
    sourceLine: 2,
    treeNodes: [],
    rootId: -1,
    statusType: 'normal',
    isCompleted: false
  });

  const { root, nodes } = buildBstFromKeys(keys);
  const snapshots = flattenTreeToSnapshots(root);

  if (!root) {
    steps.push({
      id: stepId++,
      stepIndex: 1,
      eventType: 'complete',
      title: 'Empty BST',
      description: 'BST is empty.',
      activeLine: 3,
      sourceLine: 3,
      treeNodes: [],
      rootId: -1,
      statusType: 'normal',
      isCompleted: true
    });
    return steps;
  }

  switch (operation) {
    case 'bst-insert': {
      const insertKey = value || target || 42;
      let curr: InternalTreeNode | null = root;
      let duplicate = false;

      while (curr) {
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'compare',
          title: `Compare Key ${insertKey} with Node ${curr.value}`,
          description: insertKey === curr.value
            ? `Key ${insertKey} is duplicate! Strict BST rejects duplicate values.`
            : insertKey < curr.value
            ? `${insertKey} < ${curr.value}: Branching left.`
            : `${insertKey} > ${curr.value}: Branching right.`,
          activeLine: 6,
          sourceLine: 6,
          treeNodes: snapshots,
          rootId: 1,
          activeNodeId: curr.id,
          highlightedNodes: { [curr.id]: 'active' },
          statusType: insertKey === curr.value ? 'error' : 'normal',
          isCompleted: false
        });

        if (insertKey === curr.value) {
          duplicate = true;
          break;
        }

        if (insertKey < curr.value) {
          if (!curr.left) break;
          curr = curr.left;
        } else {
          if (!curr.right) break;
          curr = curr.right;
        }
      }

      if (duplicate) {
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'complete',
          title: 'Duplicate Rejected',
          description: `Key ${insertKey} already exists in BST. No node inserted.`,
          activeLine: 8,
          sourceLine: 8,
          treeNodes: snapshots,
          rootId: 1,
          statusType: 'error',
          isCompleted: true
        });
        return steps;
      }

      const updatedKeys = [...keys, insertKey];
      const updatedBst = buildBstFromKeys(updatedKeys);
      const updatedSnapshots = flattenTreeToSnapshots(updatedBst.root);
      const insertedNode = updatedBst.nodes[updatedBst.nodes.length - 1];

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'complete',
        title: `Inserted Key ${insertKey} into BST`,
        description: `Attached node N${insertedNode?.id} (${insertKey}) as child of N${curr?.id}. BST invariant preserved.`,
        activeLine: 12,
        sourceLine: 12,
        treeNodes: updatedSnapshots,
        rootId: 1,
        activeNodeId: insertedNode?.id ?? -1,
        highlightedNodes: insertedNode ? { [insertedNode.id]: 'found' } : {},
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    case 'bst-search': {
      const searchKey = target || value;
      let curr: InternalTreeNode | null = root;
      let found = false;

      while (curr) {
        const isMatch = curr.value === searchKey;
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'compare',
          title: `Compare Target ${searchKey} with Node ${curr.value}`,
          description: isMatch
            ? `Match found! Key ${searchKey} located at Node N${curr.id}.`
            : searchKey < curr.value
            ? `${searchKey} < ${curr.value}: Branching left.`
            : `${searchKey} > ${curr.value}: Branching right.`,
          activeLine: 6,
          sourceLine: 6,
          treeNodes: snapshots,
          rootId: 1,
          activeNodeId: curr.id,
          highlightedNodes: { [curr.id]: isMatch ? 'found' : 'visited' },
          variables: { target: searchKey, found: isMatch ? 'true' : 'false' },
          statusType: isMatch ? 'success' : 'normal',
          isCompleted: isMatch
        });

        if (isMatch) {
          found = true;
          break;
        }

        curr = searchKey < curr.value ? curr.left : curr.right;
      }

      if (!found) {
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'complete',
          title: `Key ${searchKey} Not Found in BST`,
          description: `Reached nullptr. Key ${searchKey} does not exist in this BST.`,
          activeLine: 12,
          sourceLine: 12,
          treeNodes: snapshots,
          rootId: 1,
          activeNodeId: -1,
          variables: { target: searchKey, found: 'false' },
          statusType: 'normal',
          isCompleted: true
        });
      }
      return steps;
    }

    case 'bst-delete': {
      const delKey = target || value;
      const targetNode = nodes.find(n => n.value === delKey);

      if (!targetNode) {
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'error',
          title: `Key ${delKey} Not in BST`,
          description: `Cannot delete ${delKey}: node does not exist in BST.`,
          activeLine: 3,
          sourceLine: 3,
          treeNodes: snapshots,
          rootId: 1,
          statusType: 'error',
          isCompleted: true
        });
        return steps;
      }

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'traverse',
        title: `Located Node to Delete (${delKey})`,
        description: `Target node N${targetNode.id} located. Analyzing child cases (leaf, 1 child, or 2 children).`,
        activeLine: 7,
        sourceLine: 7,
        treeNodes: snapshots,
        rootId: 1,
        activeNodeId: targetNode.id,
        highlightedNodes: { [targetNode.id]: 'active' },
        variables: { deleteKey: delKey },
        statusType: 'normal',
        isCompleted: false
      });

      const remainingKeys = keys.filter(k => k !== delKey);
      const updatedBst = buildBstFromKeys(remainingKeys);
      const updatedSnapshots = flattenTreeToSnapshots(updatedBst.root);

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'complete',
        title: `Deleted Key ${delKey} from BST`,
        description: `Node ${delKey} removed. Pointers adjusted and BST invariant maintained. Remaining nodes: ${remainingKeys.length}.`,
        activeLine: 14,
        sourceLine: 14,
        treeNodes: updatedSnapshots,
        rootId: updatedBst.root ? 1 : -1,
        activeNodeId: -1,
        variables: { deleted: delKey, totalNodes: remainingKeys.length },
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    case 'bst-min': {
      let curr = root;
      while (curr.left) {
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'traverse',
          title: `Branch Left from Node ${curr.value}`,
          description: `Minimum element must reside in leftmost descendant.`,
          activeLine: 5,
          sourceLine: 5,
          treeNodes: snapshots,
          rootId: 1,
          activeNodeId: curr.id,
          highlightedNodes: { [curr.id]: 'visited' },
          statusType: 'normal',
          isCompleted: false
        });
        curr = curr.left;
      }

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'complete',
        title: `Minimum Key: ${curr.value}`,
        description: `Leftmost leaf reached. The minimum key in this BST is ${curr.value}.`,
        activeLine: 9,
        sourceLine: 9,
        treeNodes: snapshots,
        rootId: 1,
        activeNodeId: curr.id,
        highlightedNodes: { [curr.id]: 'found' },
        variables: { min: curr.value },
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    case 'bst-max': {
      let curr = root;
      while (curr.right) {
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'traverse',
          title: `Branch Right from Node ${curr.value}`,
          description: `Maximum element must reside in rightmost descendant.`,
          activeLine: 5,
          sourceLine: 5,
          treeNodes: snapshots,
          rootId: 1,
          activeNodeId: curr.id,
          highlightedNodes: { [curr.id]: 'visited' },
          statusType: 'normal',
          isCompleted: false
        });
        curr = curr.right;
      }

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'complete',
        title: `Maximum Key: ${curr.value}`,
        description: `Rightmost leaf reached. The maximum key in this BST is ${curr.value}.`,
        activeLine: 9,
        sourceLine: 9,
        treeNodes: snapshots,
        rootId: 1,
        activeNodeId: curr.id,
        highlightedNodes: { [curr.id]: 'found' },
        variables: { max: curr.value },
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    case 'bst-inorder': {
      const output: number[] = [];
      const traverseIn = (node: InternalTreeNode | null) => {
        if (!node) return;
        traverseIn(node.left);
        output.push(node.value);
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'traverse',
          title: `Inorder Visit: ${node.value}`,
          description: `Inorder traversal of BST yields strictly sorted sequence.`,
          activeLine: 6,
          sourceLine: 6,
          treeNodes: snapshots,
          rootId: 1,
          activeNodeId: node.id,
          traversalOutput: [...output],
          highlightedNodes: { [node.id]: 'active' },
          isCompleted: false
        });
        traverseIn(node.right);
      };
      traverseIn(root);

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'complete',
        title: 'Sorted Inorder Sequence Complete',
        description: `Sorted order: [${output.join(', ')}].`,
        activeLine: 11,
        sourceLine: 11,
        treeNodes: snapshots,
        rootId: 1,
        traversalOutput: output,
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    case 'bst-pred-succ': {
      const queryKey = target || value;
      const sorted = [...keys].sort((a, b) => a - b);
      const idx = sorted.indexOf(queryKey);
      const pred = idx > 0 ? sorted[idx - 1] : null;
      const succ = idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null;

      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'complete',
        title: `Predecessor & Successor of ${queryKey}`,
        description: `Inorder Predecessor: ${pred !== null ? pred : 'None (min)'}. Inorder Successor: ${succ !== null ? succ : 'None (max)'}.`,
        activeLine: 10,
        sourceLine: 10,
        treeNodes: snapshots,
        rootId: 1,
        variables: {
          key: queryKey,
          predecessor: pred ?? 'None',
          successor: succ ?? 'None'
        },
        statusType: 'success',
        isCompleted: true
      });
      return steps;
    }

    default:
      break;
  }

  // Fallback
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    eventType: 'complete',
    title: 'BST Operation Finished',
    description: `Completed ${operation} on BST.`,
    activeLine: 12,
    sourceLine: 12,
    treeNodes: snapshots,
    rootId: 1,
    isCompleted: true
  });
  return steps;
}

// ============================================================================
// 5. GRAPH ALGORITHMS TRACE GENERATOR (PRIM'S & KRUSKAL'S)
// ============================================================================

export interface GraphTraceGeneratorParams {
  algorithm: string;
  vertexCount: number;
  edges: { u: number; v: number; weight: number }[];
  directed?: boolean;
  weighted?: boolean;
  source?: number;
  target?: number;
}

export function generateGraphTrace(params: GraphTraceGeneratorParams): TraceStep[] {
  const { algorithm, vertexCount, edges, source = 0 } = params;
  const isKruskal = algorithm === 'kruskals' || algorithm === 'kruskal';
  const steps: TraceStep[] = [];
  let stepId = 0;

  // Build unique undirected edges
  interface UniqueEdge {
    u: number;
    v: number;
    w: number;
    id: number;
  }
  const uniqueEdges: UniqueEdge[] = [];
  const seenMap = new Map<string, number>();
  edges.forEach((e) => {
    const small = Math.min(e.u, e.v);
    const big = Math.max(e.u, e.v);
    const key = `${small}-${big}`;
    if (!seenMap.has(key)) {
      const id = uniqueEdges.length;
      seenMap.set(key, id);
      uniqueEdges.push({ u: small, v: big, w: e.weight ?? 1, id });
    }
  });

  const edgeStates = new Array<string>(uniqueEdges.length).fill('normal');
  const vStates = new Array<string>(vertexCount).fill('unvisited');
  const keyArr = new Array<number>(vertexCount).fill(1000000000);
  const parentArr = new Array<number>(vertexCount).fill(-1);

  const captureSnapshot = (): { vertices: GraphVertexSnapshot[]; edges: GraphEdgeSnapshot[] } => {
    const snapVertices: GraphVertexSnapshot[] = [];
    for (let i = 0; i < vertexCount; i++) {
      const dist = keyArr[i];
      const hasDist = dist !== 1000000000 && dist >= 0;
      snapVertices.push({
        id: i,
        label: String(i),
        state: vStates[i],
        distance: dist,
        hasDistance: hasDist,
        predecessor: parentArr[i],
        discoveryTime: -1,
        finishTime: -1
      });
    }

    const snapEdges: GraphEdgeSnapshot[] = uniqueEdges.map((e, idx) => ({
      u: e.u,
      v: e.v,
      weight: e.w,
      directed: false,
      state: edgeStates[idx]
    }));

    return { vertices: snapVertices, edges: snapEdges };
  };

  if (isKruskal) {
    // ---------------- Kruskal's MST ----------------
    // Sort edges ascending by weight
    const sortedEdges = [...uniqueEdges].sort((a, b) => a.w - b.w || a.u - b.u || a.v - b.v);
    const dsuParent = Array.from({ length: vertexCount }, (_, i) => i);
    const dsuRank = new Array(vertexCount).fill(0);

    const findRoot = (i: number): number => {
      if (dsuParent[i] === i) return i;
      dsuParent[i] = findRoot(dsuParent[i]);
      return dsuParent[i];
    };

    const unionSets = (rootA: number, rootB: number) => {
      if (rootA !== rootB) {
        if (dsuRank[rootA] < dsuRank[rootB]) {
          dsuParent[rootA] = rootB;
        } else if (dsuRank[rootA] > dsuRank[rootB]) {
          dsuParent[rootB] = rootA;
        } else {
          dsuParent[rootB] = rootA;
          dsuRank[rootA]++;
        }
      }
    };

    let totalWeight = 0;
    let mstEdgesCount = 0;
    let edgesEvaluated = 0;

    const edgeStatusTokens = sortedEdges.map((e) => `${e.u}—${e.v} (w=${e.w})`);

    // Init step
    const initSnap = captureSnapshot();
    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      eventType: 'initialize',
      title: `Kruskal's MST Initialized — Sorted ${sortedEdges.length} Edges`,
      description: `All edges sorted in non-decreasing order of weight. Each of the ${vertexCount} vertices begins in its own independent Disjoint Set.`,
      activeLine: 4,
      sourceLine: 4,
      graphVertices: initSnap.vertices,
      graphEdges: initSnap.edges,
      priorityQueueState: [...edgeStatusTokens],
      variables: {
        totalWeight: '0',
        mstEdgesCount: '0',
        edgesEvaluated: '0',
        cycleStatus: `Initialized DSU forest: ${vertexCount} single-vertex components`
      },
      isCompleted: false
    });

    for (let i = 0; i < sortedEdges.length; i++) {
      const edge = sortedEdges[i];
      const { u, v, w, id: eIdx } = edge;
      edgesEvaluated++;

      edgeStates[eIdx] = 'active';
      edgeStatusTokens[i] = `${u}—${v} [active w=${w}]`;

      const rootU = findRoot(u);
      const rootV = findRoot(v);

      const examineSnap = captureSnapshot();
      steps.push({
        id: stepId++,
        stepIndex: steps.length,
        eventType: 'edge_examine',
        title: `Examine Edge (${u} — ${v}, w=${w})`,
        description: `Checking DSU sets: find(${u}) = ${rootU}, find(${v}) = ${rootV}.`,
        activeLine: 8,
        sourceLine: 8,
        activeEdgeU: u,
        activeEdgeV: v,
        graphVertices: examineSnap.vertices,
        graphEdges: examineSnap.edges,
        priorityQueueState: [...edgeStatusTokens],
        variables: {
          totalWeight: String(totalWeight),
          mstEdgesCount: String(mstEdgesCount),
          edgesEvaluated: String(edgesEvaluated),
          rootU: String(rootU),
          rootV: String(rootV),
          cycleStatus: `find(${u})=${rootU}, find(${v})=${rootV}`
        },
        isCompleted: false
      });

      if (rootU === rootV) {
        // Cycle!
        edgeStates[eIdx] = 'discarded';
        edgeStatusTokens[i] = `${u}—${v} (w=${w}) ✗ cycle`;

        const cycleSnap = captureSnapshot();
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'cycle_detected',
          title: `Cycle Detected! Discard Edge (${u} — ${v})`,
          description: `Both vertices ${u} and ${v} already share root ${rootU} in the same component. Adding this edge would form a cycle! Discarding.`,
          activeLine: 12,
          sourceLine: 12,
          activeEdgeU: u,
          activeEdgeV: v,
          graphVertices: cycleSnap.vertices,
          graphEdges: cycleSnap.edges,
          priorityQueueState: [...edgeStatusTokens],
          variables: {
            totalWeight: String(totalWeight),
            mstEdgesCount: String(mstEdgesCount),
            edgesEvaluated: String(edgesEvaluated),
            cycleStatus: `CYCLE DETECTED: Vertices ${u} and ${v} already connected (Root ${rootU}) -> Discarded`
          },
          isCompleted: false
        });
      } else {
        // Safe!
        unionSets(rootU, rootV);
        totalWeight += w;
        mstEdgesCount++;
        edgeStates[eIdx] = 'mst';
        vStates[u] = 'visited';
        vStates[v] = 'visited';
        parentArr[u] = rootV;
        parentArr[v] = rootV;
        edgeStatusTokens[i] = `${u}—${v} (w=${w}) ✓ mst`;

        const acceptSnap = captureSnapshot();
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'edge_accepted',
          title: `Edge Accepted! (${u} — ${v}, w=${w}) Added to MST`,
          description: `Components with roots ${rootU} and ${rootV} unified. Spanning tree now contains ${mstEdgesCount} edges. Total weight = ${totalWeight}.`,
          activeLine: 15,
          sourceLine: 15,
          activeEdgeU: u,
          activeEdgeV: v,
          graphVertices: acceptSnap.vertices,
          graphEdges: acceptSnap.edges,
          priorityQueueState: [...edgeStatusTokens],
          variables: {
            totalWeight: String(totalWeight),
            mstEdgesCount: String(mstEdgesCount),
            edgesEvaluated: String(edgesEvaluated),
            cycleStatus: `EDGE ACCEPTED: Unified Component(${rootU}) with Component(${rootV})`
          },
          isCompleted: false
        });

        if (mstEdgesCount === vertexCount - 1) {
          break;
        }
      }
    }

    const finalSnap = captureSnapshot();
    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      eventType: 'complete',
      title: `Kruskal's Algorithm Complete — MST Weight: ${totalWeight}`,
      description: `Minimum Spanning Tree construction complete with exactly ${mstEdgesCount} edges. All ${vertexCount} vertices connected with total minimal weight of ${totalWeight}.`,
      activeLine: 18,
      sourceLine: 18,
      graphVertices: finalSnap.vertices,
      graphEdges: finalSnap.edges,
      priorityQueueState: [...edgeStatusTokens],
      variables: {
        totalWeight: String(totalWeight),
        mstEdgesCount: String(mstEdgesCount),
        edgesEvaluated: String(edgesEvaluated),
        cycleStatus: `MST Completed: Total Weight = ${totalWeight}`
      },
      isCompleted: true
    });

    return steps;
  }

  // ---------------- Prim's MST ----------------
  const validSource = source >= 0 && source < vertexCount ? source : 0;
  keyArr[validSource] = 0;
  vStates[validSource] = 'active';

  interface CutQueueItem {
    w: number;
    u: number;
    v: number;
  }
  const pq: CutQueueItem[] = [{ w: 0, u: -1, v: validSource }];
  const inMST = new Array<boolean>(vertexCount).fill(false);

  let totalWeight = 0;
  let mstEdgesCount = 0;

  const getPqStrings = (): string[] => {
    return [...pq]
      .filter((item) => item.u !== -1)
      .sort((a, b) => a.w - b.w)
      .map((item) => `(${item.u}—${item.v}, w=${item.w})`);
  };

  const initSnap = captureSnapshot();
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    eventType: 'initialize',
    title: `Prim's MST Initialized at Root ${validSource}`,
    description: `Growing tree from root vertex ${validSource}. Key initialized to 0; all other keys = ∞.`,
    activeLine: 4,
    sourceLine: 4,
    activeVertexId: validSource,
    graphVertices: initSnap.vertices,
    graphEdges: initSnap.edges,
    priorityQueueState: getPqStrings(),
    variables: {
      totalWeight: '0',
      mstEdgesCount: '0'
    },
    isCompleted: false
  });

  while (pq.length > 0 && mstEdgesCount < vertexCount) {
    pq.sort((a, b) => a.w - b.w);
    const current = pq.shift()!;
    const { w, u, v } = current;

    if (inMST[v]) continue;

    inMST[v] = true;
    vStates[v] = 'visited';
    if (u !== -1) {
      totalWeight += w;
      mstEdgesCount++;
      const small = Math.min(u, v);
      const big = Math.max(u, v);
      const key = `${small}-${big}`;
      const eIdx = seenMap.get(key);
      if (eIdx !== undefined) {
        edgeStates[eIdx] = 'mst';
      }
    }

    const treeSnap = captureSnapshot();
    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      eventType: u === -1 ? 'vertex_start' : 'edge_add_mst',
      title: u === -1
        ? `Root Vertex ${v} Included in MST`
        : `Add Minimum Cut Edge (${u} — ${v}, w=${w}) to MST`,
      description: u === -1
        ? `Root vertex ${v} enters the spanning tree. Now discovering incident cut edges.`
        : `Lightest boundary cut edge selected! Vertex ${v} united into MST. Total MST weight is now ${totalWeight}.`,
      activeLine: 8,
      sourceLine: 8,
      activeVertexId: v,
      activeEdgeU: u !== -1 ? u : undefined,
      activeEdgeV: u !== -1 ? v : undefined,
      graphVertices: treeSnap.vertices,
      graphEdges: treeSnap.edges,
      priorityQueueState: getPqStrings(),
      variables: {
        totalWeight: String(totalWeight),
        mstEdgesCount: String(mstEdgesCount)
      },
      isCompleted: false
    });

    // Check neighbors
    for (const e of uniqueEdges) {
      if (e.u !== v && e.v !== v) continue;
      const to = e.u === v ? e.v : e.u;
      const edgeWeight = e.w;

      if (!inMST[to]) {
        let keyUpdated = false;
        if (edgeWeight < keyArr[to]) {
          keyArr[to] = edgeWeight;
          parentArr[to] = v;
          keyUpdated = true;
        }

        pq.push({ w: edgeWeight, u: v, v: to });

        const cutSnap = captureSnapshot();
        steps.push({
          id: stepId++,
          stepIndex: steps.length,
          eventType: 'cut_edge_discover',
          title: `Inspect Boundary Edge (${v} — ${to}, w=${edgeWeight})`,
          description: keyUpdated
            ? `Vertex ${to} key decreased to ${edgeWeight} via parent ${v}. Pushed cut edge to min-heap.`
            : `Pushed alternative cut edge (${v} — ${to}, w=${edgeWeight}) to min-heap.`,
          activeLine: 12,
          sourceLine: 12,
          activeVertexId: v,
          activeEdgeU: v,
          activeEdgeV: to,
          graphVertices: cutSnap.vertices,
          graphEdges: cutSnap.edges,
          priorityQueueState: getPqStrings(),
          variables: {
            totalWeight: String(totalWeight),
            mstEdgesCount: String(mstEdgesCount)
          },
          isCompleted: false
        });
      }
    }
  }

  const finalSnap = captureSnapshot();
  steps.push({
    id: stepId++,
    stepIndex: steps.length,
    eventType: 'complete',
    title: `Prim's Algorithm Complete — MST Weight: ${totalWeight}`,
    description: `Minimum Spanning Tree successfully constructed with ${mstEdgesCount} edges and total minimal weight of ${totalWeight}.`,
    activeLine: 16,
    sourceLine: 16,
    activeVertexId: -1,
    graphVertices: finalSnap.vertices,
    graphEdges: finalSnap.edges,
    priorityQueueState: [],
    variables: {
      totalWeight: String(totalWeight),
      mstEdgesCount: String(mstEdgesCount)
    },
    isCompleted: true
  });

  return steps;
}

// ============================================================================
// 6. QUEUE & CIRCULAR QUEUE TRACE GENERATOR
// ============================================================================

export interface QueueTraceParams {
  operation: string;
  values: number[];
  capacity?: number;
  value?: number;
}

export function generateQueueTrace(params: QueueTraceParams): TraceStep[] {
  const capacity = Math.max(1, Math.min(30, params.capacity ?? 5));
  const operation = params.operation;
  const initialValues = params.values.slice(0, capacity);
  const operandValue = params.value ?? 40;

  const storage = new Array<number>(capacity).fill(0);
  const occupied = new Array<boolean>(capacity).fill(false);
  let front = 0;
  let count = 0;

  // Populate initial values
  initialValues.forEach((val, i) => {
    storage[i] = val;
    occupied[i] = true;
    count++;
  });

  if (operation === 'queue-create' || operation === 'queue-demo') {
    occupied.fill(false);
    front = 0;
    count = 0;
  }

  const steps: TraceStep[] = [];
  let stepId = 0;

  const getLogicalOrder = (): number[] => {
    const order: number[] = [];
    for (let i = 0; i < count; i++) {
      order.push(storage[(front + i) % capacity]);
    }
    return order;
  };

  const emitSnapshot = (
    title: string,
    description: string,
    line: number,
    statusType: 'normal' | 'success' | 'overflow' | 'underflow' = 'normal',
    result?: string,
    activeSlot?: number
  ) => {
    const rear = count > 0 ? (front + count - 1) % capacity : -1;
    const nextInsert = count < capacity ? (front + count) % capacity : -1;
    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      eventType: operation,
      title,
      description,
      sourceLine: line,
      activeLine: line,
      structureType: 'queue',
      structureStorage: [...storage],
      occupiedSlots: [...occupied],
      logicalOrder: getLogicalOrder(),
      frontIndex: count > 0 ? front : -1,
      rearIndex: rear,
      elementCount: count,
      capacity,
      activeIndices: activeSlot !== undefined && activeSlot >= 0 ? [activeSlot] : [],
      variables: {
        nextInsertionIndex: nextInsert,
        ...(result !== undefined ? { result } : {})
      },
      statusType,
      isCompleted: statusType === 'success' || statusType === 'overflow' || statusType === 'underflow'
    });
  };

  emitSnapshot('Initial state', 'Bounded circular queue: front points to the first item and rear to the last item.', 1);

  if (operation === 'queue-intro' || operation === 'queue-create') {
    emitSnapshot(
      'Operation complete',
      operation === 'queue-create'
        ? 'The queue is initialized empty.'
        : 'Queue uses a fixed-capacity circular buffer; FIFO removes from the front.',
      1,
      'success'
    );
    return steps;
  }

  if (operation === 'queue-demo') {
    emitSnapshot(
      'Circular queue demonstration',
      'Start empty. Circular indices let enqueues reuse freed slots without shifting existing values.',
      22
    );
    for (let item = 10; item < 10 + capacity * 10; item += 10) {
      const insertionIndex = (front + count) % capacity;
      emitSnapshot('Calculate insertion index', `Insert ${item} at physical slot ${insertionIndex}.`, 3, 'normal', undefined, insertionIndex);
      storage[insertionIndex] = item;
      occupied[insertionIndex] = true;
      count++;
      emitSnapshot('Enqueue value', `Stored ${item}; size is now ${count}.`, 6, 'normal', undefined, insertionIndex);
    }

    const toRemove = Math.min(2, capacity);
    for (let i = 0; i < toRemove; i++) {
      const removed = storage[front];
      occupied[front] = false;
      front = (front + 1) % capacity;
      count--;
      emitSnapshot('Dequeue front', `Removed ${removed} and advanced front circularly.`, 14);
    }

    for (let item = 90; count < capacity; item += 10) {
      const insertionIndex = (front + count) % capacity;
      storage[insertionIndex] = item;
      occupied[insertionIndex] = true;
      count++;
      emitSnapshot('Wraparound enqueue', `Reused physical slot ${insertionIndex} for ${item} via (rear + 1) % capacity.`, 6, 'normal', undefined, insertionIndex);
    }

    emitSnapshot('Full queue', 'All capacity slots are occupied after circular wraparound.', 18, 'normal');

    // Attempt overflow
    emitSnapshot('Enqueue rejected', 'Attempted enqueue while full; rejected without changing state.', 2, 'overflow');

    // Drain
    while (count > 0) {
      const removed = storage[front];
      occupied[front] = false;
      front = (front + 1) % capacity;
      count--;
      emitSnapshot('Drain queue', `Removed ${removed} in FIFO order.`, 14);
    }

    emitSnapshot('Dequeue rejected', 'Attempted dequeue while empty; rejected.', 10, 'underflow');
    emitSnapshot(
      'Operation complete',
      'Demonstration covered initial empty, full, circular wraparound, full rejection, FIFO draining, and empty rejection.',
      23,
      'success'
    );
    return steps;
  }

  if (operation === 'queue-enqueue') {
    emitSnapshot('Begin enqueue', `Attempt to insert ${operandValue} at the next circular position.`, 1);
    emitSnapshot('Check full', 'Compare the element count with the fixed capacity.', 2);
    if (count >= capacity) {
      emitSnapshot('Enqueue rejected', 'Queue is full; storage and pointers remain unchanged.', 2, 'overflow');
      return steps;
    }
    const next = (front + count) % capacity;
    emitSnapshot('Calculate insertion index', `next = (front + size) % capacity = (${front} + ${count}) % ${capacity} = ${next}.`, 3, 'normal', undefined, next);
    storage[next] = operandValue;
    occupied[next] = true;
    emitSnapshot('Write value', `Write value ${operandValue} into physical slot [${next}].`, 4, 'normal', undefined, next);
    count++;
    emitSnapshot('Update size', `Increase element count to ${count}.`, 5, 'normal', undefined, next);
    emitSnapshot('Operation complete', `Enqueue completed: ${operandValue} stored at slot [${next}].`, 6, 'success');
    return steps;
  }

  if (operation === 'queue-dequeue') {
    emitSnapshot('Begin dequeue', 'Attempt to remove the logical front element.', 1);
    emitSnapshot('Check empty', 'Test whether the element count is zero.', 2);
    if (count === 0) {
      emitSnapshot('Dequeue rejected', 'Queue is empty; no slot or pointer changes.', 3, 'underflow');
      return steps;
    }
    const removedIndex = front;
    const removed = storage[front];
    emitSnapshot('Read front value', `Read value ${removed} before removing it.`, 4, 'normal', String(removed), removedIndex);
    occupied[front] = false;
    emitSnapshot('Remove front slot', `Mark physical slot [${removedIndex}] unoccupied.`, 5, 'normal', String(removed), removedIndex);
    front = (front + 1) % capacity;
    count--;
    emitSnapshot('Advance front', `Advance front circularly to [${front}] and decrement size to ${count}.`, 6, 'normal', String(removed));
    emitSnapshot('Operation complete', `Dequeued ${removed}.`, 7, 'success', String(removed));
    return steps;
  }

  if (operation === 'queue-peek' || operation === 'queue-rear') {
    const isRear = operation === 'queue-rear';
    emitSnapshot(isRear ? 'Inspect rear' : 'Inspect front', `Read without removing the logical ${isRear ? 'rear' : 'front'}.`, 1);
    if (count === 0) {
      emitSnapshot('Inspection unavailable', 'Queue is empty; there is no value to inspect.', 2, 'underflow');
    } else {
      const idx = isRear ? (front + count - 1) % capacity : front;
      const resVal = storage[idx];
      emitSnapshot('Operation complete', `The inspected ${isRear ? 'rear' : 'front'} value is ${resVal} at slot [${idx}].`, isRear ? 4 : 3, 'success', String(resVal), idx);
    }
    return steps;
  }

  if (operation === 'queue-is-empty' || operation === 'queue-is-full' || operation === 'queue-size') {
    const empty = count === 0;
    const full = count >= capacity;
    const res = operation === 'queue-is-empty' ? (empty ? 'true' : 'false') : operation === 'queue-is-full' ? (full ? 'true' : 'false') : String(count);
    emitSnapshot('Evaluate query', `The queue method returns ${res}.`, 1, 'normal', res);
    emitSnapshot('Operation complete', `Query result: ${res}.`, 2, 'success', res);
    return steps;
  }

  if (operation === 'queue-clear') {
    emitSnapshot('Begin clear', 'Clear every occupied marker, then reset front and count.', 1);
    occupied.fill(false);
    emitSnapshot('Clear occupancy flags', 'Mark every physical slot unoccupied.', 2);
    front = 0;
    emitSnapshot('Reset front', 'Set front to index 0.', 3);
    count = 0;
    emitSnapshot('Reset size', 'Set current element count to 0.', 4);
    emitSnapshot('Operation complete', 'Queue is empty after clear.', 5, 'success');
    return steps;
  }

  return steps;
}

// ============================================================================
// 7. DEQUE (DOUBLE-ENDED QUEUE) TRACE GENERATOR
// ============================================================================

export interface DequeTraceParams {
  operation: string;
  values: number[];
  capacity?: number;
  value?: number;
}

export function generateDequeTrace(params: DequeTraceParams): TraceStep[] {
  const capacity = Math.max(1, Math.min(30, params.capacity ?? 5));
  const operation = params.operation;
  const initialValues = params.values.slice(0, capacity);
  const operandValue = params.value ?? 40;

  const storage = new Array<number>(capacity).fill(0);
  const occupied = new Array<boolean>(capacity).fill(false);
  let front = 0;
  let count = 0;

  initialValues.forEach((val, i) => {
    storage[i] = val;
    occupied[i] = true;
    count++;
  });

  const steps: TraceStep[] = [];
  let stepId = 0;

  const getLogicalOrder = (): number[] => {
    const order: number[] = [];
    for (let i = 0; i < count; i++) {
      order.push(storage[(front + i) % capacity]);
    }
    return order;
  };

  const emitSnapshot = (
    title: string,
    description: string,
    line: number,
    statusType: 'normal' | 'success' | 'overflow' | 'underflow' = 'normal',
    result?: string,
    activeSlot?: number
  ) => {
    const back = count > 0 ? (front + count - 1) % capacity : -1;
    steps.push({
      id: stepId++,
      stepIndex: steps.length,
      eventType: operation,
      title,
      description,
      sourceLine: line,
      activeLine: line,
      structureType: 'deque',
      structureStorage: [...storage],
      occupiedSlots: [...occupied],
      logicalOrder: getLogicalOrder(),
      dequeFrontIndex: count > 0 ? front : -1,
      dequeBackIndex: back,
      frontIndex: count > 0 ? front : -1,
      rearIndex: back,
      elementCount: count,
      capacity,
      activeIndices: activeSlot !== undefined && activeSlot >= 0 ? [activeSlot] : [],
      variables: {
        ...(result !== undefined ? { result } : {})
      },
      statusType,
      isCompleted: statusType === 'success' || statusType === 'overflow' || statusType === 'underflow'
    });
  };

  emitSnapshot('Initial state', 'Circular deque stores items from front to back.', 1);

  if (operation === 'deque-intro') {
    emitSnapshot('Operation complete', 'A deque supports constant-time insertion and removal at both ends.', 1, 'success');
    return steps;
  }

  emitSnapshot('Check boundary', 'Check whether the requested operation is valid for the current size and capacity.', 2);

  if (operation === 'deque-push-front') {
    if (count >= capacity) {
      emitSnapshot('Insertion rejected', 'Deque is full; no storage changes were made.', 2, 'overflow');
      return steps;
    }
    const newFront = (front - 1 + capacity) % capacity;
    front = newFront;
    emitSnapshot('Move front backward', `front = (front - 1 + capacity) % capacity = ${newFront}.`, 3, 'normal', undefined, newFront);
    storage[front] = operandValue;
    occupied[front] = true;
    emitSnapshot('Write front slot', `Write ${operandValue} into slot [${front}].`, 4, 'normal', undefined, front);
    count++;
    emitSnapshot('Update size', `Increase element count to ${count}.`, 5, 'normal', undefined, front);
    emitSnapshot('Operation complete', `Pushed ${operandValue} to front at slot [${front}].`, 6, 'success');
    return steps;
  }

  if (operation === 'deque-push-back') {
    if (count >= capacity) {
      emitSnapshot('Insertion rejected', 'Deque is full; no storage changes were made.', 2, 'overflow');
      return steps;
    }
    const back = (front + count) % capacity;
    emitSnapshot('Calculate back slot', `back = (front + size) % capacity = ${back}.`, 3, 'normal', undefined, back);
    storage[back] = operandValue;
    occupied[back] = true;
    emitSnapshot('Write back slot', `Write ${operandValue} into slot [${back}].`, 4, 'normal', undefined, back);
    count++;
    emitSnapshot('Update size', `Increase element count to ${count}.`, 5, 'normal', undefined, back);
    emitSnapshot('Operation complete', `Pushed ${operandValue} to back at slot [${back}].`, 6, 'success');
    return steps;
  }

  if (operation === 'deque-pop-front') {
    if (count === 0) {
      emitSnapshot('Removal rejected', 'Deque is empty; no pointers or slots changed.', 2, 'underflow');
      return steps;
    }
    const removed = storage[front];
    const removedIdx = front;
    emitSnapshot('Read front value', `Read ${removed} from front slot [${removedIdx}].`, 3, 'normal', String(removed), removedIdx);
    occupied[front] = false;
    emitSnapshot('Clear occupied slot', `Mark slot [${removedIdx}] unoccupied.`, 4, 'normal', String(removed), removedIdx);
    front = (front + 1) % capacity;
    count--;
    emitSnapshot('Advance front', `Move front to next circular slot [${front}].`, 5, 'normal', String(removed));
    emitSnapshot('Operation complete', `Popped ${removed} from front.`, 7, 'success', String(removed));
    return steps;
  }

  if (operation === 'deque-pop-back') {
    if (count === 0) {
      emitSnapshot('Removal rejected', 'Deque is empty; no pointers or slots changed.', 2, 'underflow');
      return steps;
    }
    const backIdx = (front + count - 1) % capacity;
    const removed = storage[backIdx];
    emitSnapshot('Read back value', `Read ${removed} from back slot [${backIdx}].`, 4, 'normal', String(removed), backIdx);
    occupied[backIdx] = false;
    emitSnapshot('Clear occupied slot', `Mark slot [${backIdx}] unoccupied.`, 5, 'normal', String(removed), backIdx);
    count--;
    emitSnapshot('Update size', `Decreased size to ${count}.`, 6, 'normal', String(removed));
    emitSnapshot('Operation complete', `Popped ${removed} from back.`, 7, 'success', String(removed));
    return steps;
  }

  if (operation === 'deque-peek-front' || operation === 'deque-peek-back') {
    const isBack = operation === 'deque-peek-back';
    emitSnapshot(isBack ? 'Inspect back' : 'Inspect front', `Read value without removing from ${isBack ? 'back' : 'front'}.`, 1);
    if (count === 0) {
      emitSnapshot('Inspection unavailable', 'Deque is empty.', 2, 'underflow');
    } else {
      const idx = isBack ? (front + count - 1) % capacity : front;
      const resVal = storage[idx];
      emitSnapshot('Operation complete', `The inspected ${isBack ? 'back' : 'front'} value is ${resVal} at slot [${idx}].`, 3, 'success', String(resVal), idx);
    }
    return steps;
  }

  if (operation === 'deque-is-empty' || operation === 'deque-is-full' || operation === 'deque-size') {
    const empty = count === 0;
    const full = count >= capacity;
    const res = operation === 'deque-is-empty' ? (empty ? 'true' : 'false') : operation === 'deque-is-full' ? (full ? 'true' : 'false') : String(count);
    emitSnapshot('Evaluate query', `The deque method returns ${res}.`, 1, 'normal', res);
    emitSnapshot('Operation complete', `Query result: ${res}.`, 2, 'success', res);
    return steps;
  }

  return steps;
}
