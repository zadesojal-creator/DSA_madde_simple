# DSA-Visualizer

An interactive Data Structures and Algorithms visualizer backed by a C++ trace engine.

The visualizer pairs a React and TypeScript frontend with a native C++ execution runner that emits exact step-by-step memory and state transitions as JSON.

## Features

- **Arrays & Searching/Sorting**: Visualized bubble sort, merge sort, quick sort, insertion sort, selection sort, linear search, and binary search.
- **Stacks & Queues**: Visual representations for stacks, standard FIFO queues, circular queues, deques, and singly/doubly/circular linked lists.
- **Trees & Heaps**: Binary trees, tree traversals (pre-order, in-order, post-order, level-order), binary heap insertions and extractions.
- **Graphs**: Breadth-First Search (BFS), Depth-First Search (DFS), Dijkstra's shortest path, and Floyd-Warshall.
- **Recursion**: Factorial, Fibonacci, Towers of Hanoi, subset generation, and N-Queens.
- **Live C++ Execution**: Native C++ runner executes user algorithms and custom input dynamically with step-by-step instruction tracing and source code display.
- **Offline Fallback**: Bundled precompiled traces allow key presets to run even when the C++ backend is offline.

## Requirements

- Node.js 20+ and npm.
- For local live C++ execution, the native runner at `cpp/bin/array_tracer.exe` (Windows) or `cpp/bin/array_tracer` (Linux/macOS) must be available.
- A C++17 compiler (`g++`) is required to rebuild the native runner or compile standalone C++ tests.

## Local Development

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Vite serves the web application and registers `/api/cpp-trace` and `/api/cpp-code` middleware endpoints for native algorithm execution and source retrieval.

## Render Deployment

You can deploy on Render using either of two approaches:

### Approach A: Single Full-Stack Web Service (Recommended)

Deploy everything as a single Render Web Service. Express serves both the production React SPA and the C++ trace API under the same domain, eliminating CORS configuration and cold-start coordination:

1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Environment**: `Node`
   - **Build Command**: `npm run render-build`
   - **Start Command**: `npm start`
4. Deploy. The build compiles the frontend (`dist/`), compiles the C++ runner (`cpp/bin/array_tracer`), and launches `server/index.js` on Render's assigned port.

### Approach B: Render Blueprint (`render.yaml`)

Deploy using Render's Blueprint specification (separate API Web Service + Static Site):

1. In Render Dashboard, click **Blueprints** -> **New Blueprint Instance**.
2. Select your repository. Render automatically reads `render.yaml`:
   - `dsa-visualizer-api`: Web Service compiling the C++ runner and hosting Express API endpoints.
   - `dsa-visualizer-web`: Static Site building Vite assets with automatic SPA client-side route rewrites.
3. If Render assigns a custom hostname to your API service (e.g. `dsa-visualizer-api-xxxx.onrender.com`), set `VITE_API_BASE_URL` in `render.yaml` or on the static site environment variables to match that hostname, then redeploy.

## Common Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Run TypeScript checks and compile the production bundle in `dist/`. |
| `npm run build:cpp` | Compile the native C++ trace runner with g++. |
| `npm run render-build` | Full build sequence for Render (Vite build + C++ compile + server dependencies). |
| `npm start` | Launch the Express production server (`node server/index.js`). |
| `npm run preview` | Preview the production bundle locally using Vite. |
| `npm test` | Run the Vitest test suite. |
| `npm run lint` | Run Oxlint. |

## Native C++ Tests

Native tests are standalone programs in `cpp/tests/`, grouped by arrays, graphs, linear structures, recursion, searching/sorting, stacks, and trees/heaps. For example, compile and run the linear-structure tests:

```powershell
g++ -std=c++17 -Wall -Wextra -pedantic cpp\tests\test_linear_structures.cpp -o cpp\tests\test_linear_structures.exe
.\cpp\tests\test_linear_structures.exe
```
