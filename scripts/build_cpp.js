import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const binDir = path.join(rootDir, 'cpp', 'bin');
if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

const binaryName = process.platform === 'win32' ? 'array_tracer.exe' : 'array_tracer';
const outputPath = path.join(binDir, binaryName);

const sourceFiles = [
  'cpp/src/main.cpp',
  'cpp/src/algorithms.cpp',
  'cpp/src/searching_sorting.cpp',
  'cpp/src/stack_algorithms.cpp',
  'cpp/src/tree_heap_algorithms.cpp',
  'cpp/src/graph_algorithms.cpp',
  'cpp/src/recursion_algorithms.cpp'
];

const args = [
  '-std=c++17',
  '-O2',
  '-Icpp/include',
  ...sourceFiles,
  '-o',
  outputPath
];

console.log(`Compiling C++ trace runner with g++ to ${outputPath}...`);
const result = spawnSync('g++', args, {
  cwd: rootDir,
  stdio: 'inherit'
});

if (result.error) {
  console.error('Failed to run g++:', result.error.message);
  process.exit(1);
}

if (result.status !== 0) {
  console.error(`g++ compilation failed with code ${result.status}`);
  process.exit(result.status ?? 1);
}

if (process.platform !== 'win32') {
  try {
    fs.chmodSync(outputPath, 0o755);
  } catch (err) {
    console.warn('Warning: Could not set executable permissions on C++ binary:', err);
  }
}

console.log(`C++ trace runner successfully compiled to ${outputPath}`);
