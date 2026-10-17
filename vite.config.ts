import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { execFile } from 'node:child_process';
import path from 'node:path';

function cppExecutionPlugin(): Plugin {
  const binaryPath = path.resolve(process.cwd(), 'cpp/bin/array_tracer.exe');

  const handleApiRequest = (req: any, res: any) => {
    const parsedUrl = new URL(req.url, 'http://localhost');
    if (parsedUrl.pathname === '/api/cpp-trace') {
      const op = parsedUrl.searchParams.get('op') || 'bubble-sort';
      const providedArr = parsedUrl.searchParams.get('arr');
      const isLinearStructureOp = op.startsWith('queue-') || op.startsWith('deque-') || op.startsWith('list-');
      const arr = providedArr === null || (!isLinearStructureOp && !providedArr) ? '5,2,8,1,9' : providedArr;
      const target = parsedUrl.searchParams.get('target') || '0';
      const value = parsedUrl.searchParams.get('value');
      const index = parsedUrl.searchParams.get('index');
      const source = parsedUrl.searchParams.get('source');
      const vertices = parsedUrl.searchParams.get('vertices');
      const directed = parsedUrl.searchParams.get('directed');
      const weighted = parsedUrl.searchParams.get('weighted');
      const findall = parsedUrl.searchParams.get('findall');
      const capacity = parsedUrl.searchParams.get('capacity');
      const structure = parsedUrl.searchParams.get('structure');
      const args = ['--op', op, '--arr', arr, '--target', target];
      if (value !== null) {
        args.push('--value', value);
      }
      if (index !== null) {
        args.push('--index', index);
      }
      if (source !== null) {
        args.push('--source', source);
      }
      if (vertices !== null) {
        args.push('--vertices', vertices);
      }
      if (directed !== null) {
        args.push('--directed', directed);
      }
      if (weighted !== null) {
        args.push('--weighted', weighted);
      }
      if (findall !== null) {
        args.push('--findall', findall);
      }
      if (capacity !== null) {
        args.push('--capacity', capacity);
      }
      if (structure !== null) {
        args.push('--structure', structure);
      }

      execFile(binaryPath, args, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message, stderr }));
          return;
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(stdout);
      });
      return true;
    }

    if (parsedUrl.pathname === '/api/cpp-code') {
      const op = parsedUrl.searchParams.get('op') || 'bubble-sort';
      const structure = parsedUrl.searchParams.get('structure') || 'singly';
      execFile(binaryPath, ['--structure', structure, '--code', op], (err, stdout) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'text/plain');
          res.end('// Failed to retrieve C++ code');
          return;
        }
        res.setHeader('Content-Type', 'text/plain');
        res.end(stdout);
      });
      return true;
    }

    return false;
  };

  return {
    name: 'cpp-execution-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!handleApiRequest(req, res)) {
          next();
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!handleApiRequest(req, res)) {
          next();
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cppExecutionPlugin()],
});
