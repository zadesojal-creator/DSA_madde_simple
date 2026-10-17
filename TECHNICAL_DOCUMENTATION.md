# Technical Documentation

## 1. Project Overview

This repository contains an interactive data-structures-and-algorithms learning application. The React frontend presents algorithm workspaces and replays step snapshots. Algorithm execution is split between TypeScript trace generators and a native C++ trace runner, depending on the feature.

The C++ runner returns structured JSON events rather than rendering UI. The frontend converts those events into visual state, source-line highlighting, counters, and playback controls.

## 2. Technology Stack

- React 19 and TypeScript 6 for the client application.
- Vite 8 for local development and production bundling.
- React Router 7 for page and visualizer routes.
- Tailwind CSS 4, integrated with Vite, for styling.
- Lucide React for interface icons.
- C++17-compatible source for algorithm tracing and native tests.
- Vitest for frontend tests and Oxlint for linting.

## 3. Repository Layout

| Path | Responsibility |
| --- | --- |
| `src/App.tsx` | Application route table and route-specific page selection. |
| `src/pages/` | Landing page and algorithm workspaces. Graph and recursion pages are grouped in subdirectories. |
| `src/components/` | Shared landing-page sections, workspace layout, topic navigation, and algorithm visualizations. |
| `src/components/workspace/` | Shared visualizer layout, topic sidebar, breadcrumbs, and workspace controls. |
| `src/data/` | Navigation metadata, algorithm complexity metadata, stack operation configuration, and generated C++ traces. |
| `src/algorithms/arrays/` | TypeScript array trace generators and operation configuration. |
| `src/services/cppExecutionAdapter.ts` | Frontend validation helpers and adapters for native/precompiled C++ execution. |
| `src/hooks/usePlayback.ts` | Shared step playback state, speed control, and keyboard handling. |
| `src/types/trace.ts` | Shared trace, graph, tree, linked-list, and complexity types. |
| `cpp/include/` | Trace/event structures and C++ algorithm declarations/implementations. |
| `cpp/src/` | Native command-line runner and algorithm implementation units. |
| `cpp/tests/` | Native C++ test programs by algorithm family. |
| `cpp/bin/` | Windows native runner and compiled test executables used in this workspace. |
| `scripts/generate_cpp_traces.cjs` | Generates the checked-in trace/source catalog using the native runner. |
| `public/` | Static assets. |

## 4. Application Routes

The route table is maintained in `src/App.tsx`.

| Route | Page or behavior |
| --- | --- |
| `/` | Landing page. |
| `/visualizer/arrays` and `/visualizer/arrays/:subtopicId` | Array operations and traversal. |
| `/visualizer/arrays/traversal-standalone` | Standalone array traversal demo. |
| `/visualizer/searching` | Redirects to linear search. |
| `/visualizer/searching/:algorithmId` | Linear or binary search workspace. |
| `/visualizer/sorting` | Redirects to bubble sort. |
| `/visualizer/sorting/:algorithmId` | Bubble, selection, insertion, merge, or quick sort workspace. |
| `/visualizer/trees` | Redirects to the binary tree workspace. |
| `/visualizer/trees/binary-tree`, `/traversals`, `/binary-search-tree` | Binary tree operations, traversals, and BST operations. These paths are prefixed by `/visualizer/trees`. |
| `/visualizer/heaps` | Redirects to the min-heap workspace. |
| `/visualizer/heaps/min-heap` and `/visualizer/heaps/max-heap` | Min-heap and max-heap workspaces. |
| `/visualizer/graphs` | Graph overview. |
| `/visualizer/graphs/:algorithmId` | BFS, DFS, Dijkstra, Bellman-Ford, or Floyd-Warshall. |
| `/visualizer/recursion` | Recursion overview. |
| `/visualizer/recursion/factorial`, `/fibonacci`, `/tower-of-hanoi` | Recursion algorithm workspaces; paths are prefixed by `/visualizer/recursion`. |
| `/visualizer/backtracking` | Backtracking overview. |
| `/visualizer/backtracking/maze` and `/n-queens` | Maze and N-Queens workspaces. |
| `/visualizer/stacks-queues` | Redirects to stack introduction. |
| `/visualizer/stacks-queues/:subtopicId` | Stack operations and stack expression checks. Queue and deque routes are matched by dedicated pages first. |
| `/visualizer/stacks-queues/queue`, `/circular-queue`, `/deque` | Queue, circular queue, and deque workspaces. |
| `/visualizer/linked-lists/singly`, `/doubly`, `/circular` | Singly, doubly, and circular linked-list workspaces. |
| `/visualizer/searching-sorting/*` | Legacy aliases that redirect to the current searching or sorting routes. |
| `/visualizer/:categoryId` and `/visualizer/:categoryId/:subtopicId` | Generic topic workspace for categories without a dedicated page implementation. |
| `*` | Not-found page. |

The navigation catalogue is defined in `src/data/navigationData.ts`; landing-page topic cards are defined in `src/data/topicsData.ts`. These metadata catalogs are distinct from the router: hiding an entry from a view does not by itself remove its direct route.

## 5. Frontend Architecture

### Application startup

`src/main.tsx` mounts `App` inside React `StrictMode` and `BrowserRouter`, and imports global styles from `src/index.css`.

### Visualizer pages and shared UI

Dedicated page components own input state and select the active operation. Shared components render the workspace shell, controls, pseudocode/source, trace timeline, and structure-specific visuals. The `src/components/` tree contains domain components for arrays, graphs, heaps, recursion, sorting, trees, and workspace navigation.

### Trace and playback model

`TraceStep` in `src/types/trace.ts` is the common event snapshot contract. Its optional fields support the different visual domains: arrays and stacks, pointers and highlights, sorting counters, tree nodes, graph vertices and edges, recursion frames, queues, deques, and linked nodes.

`usePlayback` in `src/hooks/usePlayback.ts` consumes an ordered `TraceStep[]` and provides current-step state, play/pause, previous/next, reset, jump-to-step, and speed controls. Keyboard shortcuts are Space to toggle playback, left/right arrows to move between steps, and R to reset. Shortcuts are ignored while typing in input, textarea, or select controls.

### Trace generation by feature

- Arrays use TypeScript trace generators under `src/algorithms/arrays/` and operation metadata under the same directory.
- Stack operations use the TypeScript catalog and trace builder in `src/data/stackVisualizerData.ts`.
- Searching, sorting, trees, BSTs, heaps, graphs, recursion, backtracking, queues, deques, and linked lists call the C++ execution adapter from their page components.

## 6. C++ Execution and Data Flow

### Development/preview request flow

1. A page validates its input and calls an adapter function in `cppExecutionAdapter.ts`.
2. The adapter requests `/api/cpp-trace` with operation-specific query parameters.
3. The `cppExecutionPlugin` in `vite.config.ts` translates those parameters into command-line arguments and launches `cpp/bin/array_tracer.exe` with Node's `execFile`.
4. `cpp/src/main.cpp` parses the arguments, dispatches to the relevant tracer, and serializes emitted events as JSON.
5. The adapter returns the trace steps and, where available, retrieves canonical source through `/api/cpp-code`.
6. The visualizer renders the active snapshot and shared playback controls advance through the trace.

The Vite plugin installs these middleware endpoints for both the development server and preview server. Live native execution therefore requires the expected Windows executable at `cpp/bin/array_tracer.exe`.

### Offline behavior

`src/data/cppGeneratedTraces.json` stores trace snapshots and canonical C++ source generated by `scripts/generate_cpp_traces.cjs`. The general algorithm, graph, and recursion adapters try live execution first and then look up an exact cached-input key. Custom inputs without a cached entry require the live runner. Linear-structure execution uses the native endpoint and returns an unavailable result if it cannot reach it.

The adapter reports one of three engine statuses: `cpp-native`, `cpp-precompiled`, or `unavailable`.

### C++ organization

| File | Responsibility |
| --- | --- |
| `cpp/src/main.cpp` | CLI parsing, validation, operation dispatch, and JSON output. |
| `cpp/src/algorithms.cpp` | Array fundamentals and core array/search operations. |
| `cpp/src/searching_sorting.cpp` | Search and sorting trace generators. |
| `cpp/src/stack_algorithms.cpp` | Stack algorithms and source-code snippets. |
| `cpp/src/tree_heap_algorithms.cpp` | Binary tree, traversal, BST, and heap traces. |
| `cpp/src/graph_algorithms.cpp` | Graph representation, parsing, and graph algorithm traces. |
| `cpp/src/recursion_algorithms.cpp` | Recursion and backtracking traces. |
| `cpp/include/linear_structure_algorithms.hpp` | Circular queue/deque and linked-list trace support. |
| `cpp/include/trace_event.hpp` | C++ event snapshots and JSON serialization. |

`TraceEmitter` assigns monotonically increasing IDs and step indexes. Each event includes a title, explanation, source line, and the state fields relevant to its algorithm. The frontend TypeScript `TraceStep` type mirrors this wire format.

### Native input constraints

- The C++ runner rejects more than 30 input tokens/elements for non-graph and non-recursion operations.
- Queue and deque capacity must be between 1 and 30; initial contents cannot exceed capacity.
- Frontend array/tree parsing defaults to a 25-token maximum.
- Graph edge validation in the frontend allows at most 40 edges and checks endpoint ranges. Dijkstra rejects negative weights when weighted mode is enabled.

## 7. Algorithm Coverage

The implementation includes:

- Arrays: basics, traversal, index access, update, insertion, deletion, linear search, binary search.
- Searching: linear and binary search.
- Sorting: bubble, selection, insertion, merge, and quick sort.
- Stacks: introduction, push, pop, peek, empty/full checks, size, search, reverse, and balanced-parentheses checking.
- Queues and deques: bounded circular queue operations, deque operations, and demonstrations.
- Linked lists: singly, doubly, and circular lists with creation, traversal, insertion, deletion, search, update, reverse, and length operations in the C++ tracer.
- Trees: binary tree construction and operations, preorder/inorder/postorder/level-order traversals, BST operations, and min/max heaps.
- Graphs: BFS, DFS, Dijkstra, Bellman-Ford, and Floyd-Warshall.
- Recursion/backtracking: factorial, Fibonacci, Tower of Hanoi, maze solving, and N-Queens.

`src/data/algorithmsMetadata.ts` contains complexity and explanatory metadata used by applicable algorithm pages. A route or navigation entry does not guarantee a dedicated interactive implementation; generic routes use the topic workspace placeholder when no dedicated page is registered.

## 8. Setup and Commands

Install JavaScript dependencies from the repository root:

```powershell
npm install
```

Start the frontend and Vite native trace middleware:

```powershell
npm run dev
```

Other package scripts:

```powershell
npm run build
npm run preview
npm run test
npm run lint
```

`npm run build` runs TypeScript project builds followed by the Vite production build. `npm run preview` serves the production bundle through Vite; the custom C++ middleware is also registered for preview.

To regenerate the checked-in C++ trace catalog, build/ensure the native executable exists, then run:

```powershell
node scripts/generate_cpp_traces.cjs
```

This script writes `src/data/cppGeneratedTraces.json`; review that generated file when intentionally refreshing traces.

## 9. Testing

### Frontend

Run the frontend tests with:

```powershell
npm test
```

Tests are in `src/__tests__/` and `src/algorithms/arrays/__tests__/`. They cover graph algorithms, recursion/backtracking navigation and traces, searching/sorting, stack trace generation, tree/heap behavior, and array trace generation.

Run static checks with:

```powershell
npm run lint
npm run build
```

### Native C++

Standalone native tests are in `cpp/tests/`: arrays, graphs, linear structures, recursion, searching/sorting, stacks, and trees/heaps. There is no package-level C++ test script or CMake project in the repository; compile the relevant test program with a C++17 compiler and its implementation source dependencies.

The README documents this focused MinGW command for the header-implemented linear structures:

```powershell
g++ -std=c++17 -Wall -Wextra -pedantic cpp\tests\test_linear_structures.cpp -o cpp\tests\test_linear_structures.exe
.\cpp\tests\test_linear_structures.exe
```

## 10. Configuration and Maintenance Notes

- `package.json` defines JavaScript dependencies and scripts; `package-lock.json` records the resolved dependency graph.
- `vite.config.ts` configures React, Tailwind CSS, and native C++ API middleware.
- `tsconfig.json`, `tsconfig.app.json`, and `tsconfig.node.json` divide TypeScript compiler settings between app and tooling code.
- `src/index.css` imports Tailwind and defines global base styles and utility effects.
- `index.html` is the Vite HTML entry point; `public/` contains static assets served as-is.
- Keep C++ event field names and frontend `TraceStep` properties synchronized when changing the trace protocol.
- When adding an algorithm, update its C++ dispatch/tracer (or TypeScript trace generator), frontend page/control wiring, metadata and navigation as applicable, tests, and generated trace catalog when cached playback is intended.