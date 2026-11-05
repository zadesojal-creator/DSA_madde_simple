import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const app = express();
const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const serverDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(serverDirectory, '..');
const binaryName = process.platform === 'win32' ? 'array_tracer.exe' : 'array_tracer';
const binaryPath = path.join(repositoryRoot, 'cpp', 'bin', binaryName);
const maxBuffer = 10 * 1024 * 1024;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN ?? '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

function missingBinary(res) {
  return res.status(503).json({
    error: 'The C++ trace runner is unavailable because its native binary is missing.',
    code: 'CPP_BINARY_MISSING',
  });
}

function queryParam(req, name) {
  return new URL(req.originalUrl, 'http://localhost').searchParams.get(name);
}

function runCpp(args, res, responseType) {
  if (!existsSync(binaryPath)) {
    missingBinary(res);
    return;
  }

  execFile(binaryPath, args, { maxBuffer }, (error, stdout, stderr) => {
    if (error) {
      if (error.code === 'ENOENT') {
        missingBinary(res);
        return;
      }

      if (responseType === 'text') {
        res.status(500).type('text/plain').send('// Failed to retrieve C++ code');
        return;
      }

      res.status(500).json({ error: error.message, stderr });
      return;
    }

    if (responseType === 'text') {
      res.type('text/plain').send(stdout);
      return;
    }

    try {
      res.json(JSON.parse(stdout));
    } catch (parseError) {
      const message = parseError instanceof Error ? parseError.message : String(parseError);
      res.status(500).json({ error: `C++ trace runner returned invalid JSON: ${message}` });
    }
  });
}

app.get('/api/cpp-trace', (req, res) => {
  const op = queryParam(req, 'op') || 'bubble-sort';
  const providedArr = queryParam(req, 'arr');
  const isLinearStructureOp = op.startsWith('queue-') || op.startsWith('deque-') || op.startsWith('list-');
  const arr = providedArr === null || (!isLinearStructureOp && !providedArr) ? '5,2,8,1,9' : providedArr;
  const target = queryParam(req, 'target') || '0';
  const args = ['--op', op, '--arr', arr, '--target', target];

  for (const name of ['value', 'index', 'source', 'vertices', 'directed', 'weighted', 'findall', 'capacity', 'structure']) {
    const value = queryParam(req, name);
    if (value !== null) {
      args.push(`--${name}`, value);
    }
  }

  runCpp(args, res, 'json');
});

app.get('/api/cpp-code', (req, res) => {
  const op = queryParam(req, 'op') || 'bubble-sort';
  const structure = queryParam(req, 'structure') || 'singly';
  runCpp(['--structure', structure, '--code', op], res, 'text');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`C++ trace API listening on port ${port}`);
});
