const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const binaryPath = path.resolve(__dirname, '../cpp/bin/array_tracer.exe');

const configs = [
  // Searching
  { op: 'linear-search', arr: '15,8,42,4,23,16', target: 42 },
  { op: 'linear-search', arr: '10,20,30,40,50', target: 99 },
  { op: 'binary-search', arr: '3,8,15,24,37,42,59,68,71,85', target: 42 },
  { op: 'binary-search', arr: '3,8,15,24,37,42,59,68,71,85', target: 50 },

  // Sorting
  { op: 'bubble-sort', arr: '29,10,14,37,13', target: 0 },
  { op: 'selection-sort', arr: '29,10,14,37,13', target: 0 },
  { op: 'insertion-sort', arr: '29,10,14,37,13', target: 0 },
  { op: 'merge-sort', arr: '29,10,14,37,13', target: 0 },
  { op: 'quick-sort', arr: '29,10,14,37,13', target: 0 },

  // Additional presets
  { op: 'bubble-sort', arr: '5,4,3,2,1', target: 0 },
  { op: 'selection-sort', arr: '5,4,3,2,1', target: 0 },
  { op: 'insertion-sort', arr: '5,4,3,2,1', target: 0 },
  { op: 'merge-sort', arr: '5,4,3,2,1', target: 0 },
  { op: 'quick-sort', arr: '5,4,3,2,1', target: 0 },

  { op: 'bubble-sort', arr: '1,2,3,4,5', target: 0 },
  { op: 'selection-sort', arr: '1,2,3,4,5', target: 0 },
  { op: 'insertion-sort', arr: '1,2,3,4,5', target: 0 },
  { op: 'merge-sort', arr: '1,2,3,4,5', target: 0 },
  { op: 'quick-sort', arr: '1,2,3,4,5', target: 0 },

  { op: 'bubble-sort', arr: '7,7,7,7', target: 0 },
  { op: 'selection-sort', arr: '7,7,7,7', target: 0 },
  { op: 'insertion-sort', arr: '7,7,7,7', target: 0 },
  { op: 'merge-sort', arr: '7,7,7,7', target: 0 },
  { op: 'quick-sort', arr: '7,7,7,7', target: 0 },

  // Binary Trees
  { op: 'tree-build', arr: '1,2,3,4,5', target: 0 },
  { op: 'tree-build', arr: '1,2,3,null,4', target: 0 },
  { op: 'tree-insert', arr: '1,2,3,4,5', target: 6 },
  { op: 'tree-search', arr: '1,2,3,4,5', target: 4 },
  { op: 'tree-search', arr: '1,2,3,4,5', target: 99 },
  { op: 'tree-size', arr: '1,2,3,4,5', target: 0 },
  { op: 'tree-height', arr: '1,2,3,4,5', target: 0 },
  { op: 'tree-leaves', arr: '1,2,3,4,5', target: 0 },

  // Traversals
  { op: 'traversal-preorder', arr: '1,2,3,4,5', target: 0 },
  { op: 'traversal-inorder', arr: '1,2,3,4,5', target: 0 },
  { op: 'traversal-postorder', arr: '1,2,3,4,5', target: 0 },
  { op: 'traversal-level-order', arr: '1,2,3,4,5', target: 0 },

  // BST
  { op: 'bst-insert', arr: '50,30,70,20,40,60,80', target: 25 },
  { op: 'bst-insert', arr: '50,30,70,20,40,60,80', target: 30 },
  { op: 'bst-search', arr: '50,30,70,20,40,60,80', target: 40 },
  { op: 'bst-search', arr: '50,30,70,20,40,60,80', target: 99 },
  { op: 'bst-delete', arr: '50,30,70,20,40,60,80', target: 20 },
  { op: 'bst-delete', arr: '50,30,70,20,40,60,80', target: 30 },
  { op: 'bst-delete', arr: '50,30,70,20,40,60,80', target: 50 },
  { op: 'bst-min', arr: '50,30,70,20,40,60,80', target: 0 },
  { op: 'bst-max', arr: '50,30,70,20,40,60,80', target: 0 },
  { op: 'bst-inorder', arr: '50,30,70,20,40,60,80', target: 0 },
  { op: 'bst-pred-succ', arr: '50,30,70,20,40,60,80', target: 50 },

  // Heaps
  { op: 'min-heap-build', arr: '9,5,2,7,1,8', target: 0 },
  { op: 'min-heap-insert', arr: '2,5,8,9,7', target: 1 },
  { op: 'min-heap-extract', arr: '1,5,2,7,9,8', target: 0 },
  { op: 'min-heap-peek', arr: '1,5,2,7,9,8', target: 0 },
  { op: 'max-heap-build', arr: '3,10,1,14,8,20,7', target: 0 },
  { op: 'max-heap-insert', arr: '20,14,10,8,7,3,1', target: 25 },
  { op: 'max-heap-extract', arr: '20,14,10,8,7,3,1', target: 0 },
  { op: 'max-heap-peek', arr: '20,14,10,8,7,3,1', target: 0 },

  // Graph algorithms
  { op: 'bfs', arr: 'sample', target: 5, source: 0 },
  { op: 'bfs', arr: 'sample', target: -1, source: 0 },
  { op: 'dfs', arr: 'sample', target: 0, source: 0 },
  { op: 'dijkstra', arr: 'sample', target: 4, source: 0 },
  { op: 'bellman-ford', arr: 'sample', target: 4, source: 0 },
  { op: 'floyd-warshall', arr: 'sample', target: 3, source: 0 },

  // Recursion algorithms
  { op: 'factorial', arr: '5', target: 5, value: 5 },
  { op: 'factorial', arr: '3', target: 3, value: 3 },
  { op: 'factorial', arr: '0', target: 0, value: 0 },
  { op: 'factorial', arr: '1', target: 1, value: 1 },
  { op: 'fibonacci', arr: '6', target: 6, value: 6 },
  { op: 'fibonacci', arr: '4', target: 4, value: 4 },
  { op: 'fibonacci', arr: '1', target: 1, value: 1 },
  { op: 'fibonacci', arr: '0', target: 0, value: 0 },
  { op: 'tower-of-hanoi', arr: '3', target: 3, value: 3 },
  { op: 'tower-of-hanoi', arr: '2', target: 2, value: 2 },
  { op: 'tower-of-hanoi', arr: '4', target: 4, value: 4 },

  // Backtracking algorithms
  { op: 'maze', arr: '5;5;0,0,1,0,0,0,1,1,0,1,0,0,0,0,1,1,1,0,1,0,0,0,0,0,0;0;0;4;4', target: 0 },
  { op: 'maze', arr: '4;4;0,0,0,0,0,1,1,0,0,0,0,0,0,1,0,0;0;0;3;2', target: 0 },
  { op: 'n-queens', arr: '6', target: 6, value: 6 },
  { op: 'n-queens', arr: '4', target: 4, value: 4 },
  { op: 'n-queens', arr: '8', target: 8, value: 8 }
];

const result = {};

for (const cfg of configs) {
  const key = `${cfg.op}__${cfg.arr}__${cfg.target}`;
  try {
    const args = ['--op', cfg.op, '--arr', cfg.arr, '--target', String(cfg.target)];
    if (cfg.source !== undefined) {
      args.push('--source', String(cfg.source));
    }
    if (cfg.value !== undefined) {
      args.push('--value', String(cfg.value));
    }
    if (cfg.findAll) {
      args.push('--findall', '1');
    }
    const stdout = execFileSync(binaryPath, args, { encoding: 'utf-8', maxBuffer: 25 * 1024 * 1024 });
    result[key] = JSON.parse(stdout);
    console.log(`Generated trace for ${key}: ${result[key].length} events`);
  } catch (err) {
    console.error(`Error running C++ binary for ${key}:`, err.message);
  }
}

// Also get canonical C++ source codes
const codes = {};
const ops = [
  'linear-search', 'binary-search', 'bubble-sort', 'selection-sort', 'insertion-sort', 'merge-sort', 'quick-sort',
  'binary-tree', 'tree-insert', 'tree-search', 'tree-size', 'tree-height', 'tree-leaves',
  'traversal-preorder', 'traversal-inorder', 'traversal-postorder', 'traversal-level-order',
  'binary-search-tree', 'bst-insert', 'bst-search', 'bst-delete', 'bst-min', 'bst-max',
  'min-heap', 'min-heap-build', 'min-heap-insert',
  'max-heap', 'max-heap-build', 'max-heap-insert',
  'bfs', 'dfs', 'dijkstra', 'bellman-ford', 'floyd-warshall',
  'factorial', 'fibonacci', 'tower-of-hanoi', 'maze', 'n-queens'
];
for (const op of ops) {
  try {
    const stdout = execFileSync(binaryPath, ['--code', op], { encoding: 'utf-8' });
    codes[op] = stdout;
  } catch (err) {
    console.error(`Error fetching C++ code for ${op}:`, err.message);
  }
}

const outputPath = path.resolve(__dirname, '../src/data/cppGeneratedTraces.json');
fs.writeFileSync(outputPath, JSON.stringify({ traces: result, codes }, null, 2), 'utf-8');
console.log(`Wrote C++ trace catalog to ${outputPath}`);
