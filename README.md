# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

# DSA Visualizer

DSA Visualizer is an interactive learning application for data structures and algorithms. It presents algorithms as ordered execution traces, so learners can inspect each state change alongside the relevant explanation, source line, and data structure.

The application combines a React and TypeScript frontend with a native C++ trace runner. TypeScript generates traces for selected areas, while the C++ engine executes supported algorithms and emits JSON snapshots for the frontend to render.

## Features

- Interactive array operations and traversal.
- Linear and binary search, plus bubble, selection, insertion, merge, and quick sort.
- Stack operations and balanced-parentheses checking.
- Queue, circular queue, deque, and singly, doubly, and circular linked-list workspaces.
- Binary trees, traversals, binary search trees, and min/max heaps.
- Graph traversal and shortest-path algorithms: BFS, DFS, Dijkstra, Bellman-Ford, and Floyd-Warshall.
- Recursion and backtracking visualizations: factorial, Fibonacci, Tower of Hanoi, maze solving, and N-Queens.
- Step playback with play/pause, previous/next, reset, seek, and speed controls.
- Complexity information and source-code views on supported visualizers.

## Technology

- React 19, TypeScript 6, and React Router 7
- Vite 8 and Tailwind CSS 4
- C++17-compatible trace-generation source
- Vitest and Oxlint

## Requirements

- Node.js and npm compatible with the versions required by the installed Vite toolchain.
- For live C++ execution, the native runner at `cpp/bin/array_tracer.exe` must be available. The Vite development and preview middleware launches this executable.
- A C++17 compiler is needed to rebuild the native runner or compile the standalone C++ tests.

The native runner is a Windows executable. Without a runnable native binary, cached traces may still be available for supported preset inputs, but custom C++ inputs cannot be executed live.

## Getting Started

Install dependencies from the repository root:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Vite serves the web application and registers `/api/cpp-trace` and `/api/cpp-code` endpoints for native algorithm execution and source retrieval.

## Common Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Run TypeScript project builds and create the production bundle in `dist/`. |
| `npm run preview` | Preview the production bundle using Vite. |
| `npm test` | Run the frontend Vitest suite. |
| `npm run lint` | Run Oxlint. |

## Native C++ Tests

Native tests are standalone programs in `cpp/tests/`, grouped by arrays, graphs, linear structures, recursion, searching/sorting, stacks, and trees/heaps. For example, compile and run the linear-structure tests from PowerShell with MinGW g++:

```powershell
g++ -std=c++17 -Wall -Wextra -pedantic cpp\tests\test_linear_structures.cpp -o cpp\tests\test_linear_structures.exe
.\cpp\tests\test_linear_structures.exe
```

There is no unified CMake project or package script for compiling every C++ test. Compile each test with the C++ implementation files it depends on.

## Project Structure

```text
src/
  components/       Shared UI and visualizations
  data/             Navigation, metadata, and generated trace catalog
  hooks/            Shared playback behavior
  pages/            Landing page and visualizer routes
  services/         C++ execution adapter
  types/            Trace and complexity contracts
cpp/
  include/          Trace structures and algorithm interfaces
  src/              CLI runner and algorithm implementations
  tests/            Native test programs
  bin/              Native runner and compiled test binaries
scripts/
  generate_cpp_traces.cjs
```

For the route catalog, trace protocol, module responsibilities, input limits, and implementation details, see [Technical Documentation](TECHNICAL_DOCUMENTATION.md).

## Trace Generation

The native runner returns JSON trace events that conform to the frontend `TraceStep` contract. The frontend uses these snapshots for visualization and playback rather than maintaining a second simulation of the same C++ operation.

To regenerate the preset C++ traces and source catalog, ensure the native runner is built and run:

```powershell
node scripts/generate_cpp_traces.cjs
```

This updates `src/data/cppGeneratedTraces.json`. Review the generated changes before committing them. Cached trace playback is limited to inputs included in that catalog; custom inputs require the live runner.

## Input Limits

- The native runner accepts up to 30 values/tokens for most non-graph, non-recursion operations.
- Queue/deque capacity must be between 1 and 30, and initial contents must fit the selected capacity.
- The frontend array and tree token parsers default to a maximum of 25 tokens.
- Graph input validation accepts up to 40 edges; Dijkstra does not accept negative weights in weighted mode.
