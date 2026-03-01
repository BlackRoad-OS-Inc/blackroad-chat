#!/usr/bin/env node
/**
 * Minimal static file server for E2E tests.
 * Serves files from the project root on the given port (default 8080).
 * No external dependencies — uses Node.js built-ins only.
 */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { extname, resolve } from 'node:path';

const PORT = parseInt(process.env.PORT ?? '8080', 10);
const ROOT = resolve(import.meta.dirname, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.ts':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico':  'image/x-icon',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
};

const server = createServer((req, res) => {
  // URL parsing normalises percent-encoding and removes `.` / `..` segments.
  // `resolve()` further normalises the result. The `startsWith` guard is the
  // authoritative check preventing traversal outside ROOT.
  const rawPath = new URL(req.url ?? '/', `http://localhost:${PORT}`).pathname;
  const relative = rawPath === '/' ? 'index.html' : rawPath.slice(1) || 'index.html';
  const filePath = resolve(ROOT, relative);

  // Block any path that escapes the project root
  if (!filePath.startsWith(ROOT + '/') && filePath !== ROOT) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const mime = MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': mime });
  const stream = createReadStream(filePath);
  stream.on('error', (err) => {
    if (!res.headersSent) {
      res.writeHead('code' in err && err.code === 'ENOENT' ? 404 : 500);
    }
    res.end('Not found');
  });
  stream.pipe(res);
});

server.listen(PORT, () => {
  console.log(`Static server listening on http://localhost:${PORT}`);
});
