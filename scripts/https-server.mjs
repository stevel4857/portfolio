import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
import selfsigned from 'selfsigned';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  '.glb': 'model/gltf-binary',
  '.wasm': 'application/wasm',
  '.swf': 'application/x-shockwave-flash',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
};

function parseArgs() {
  const args = process.argv.slice(2);
  let port = 3000;
  let open = false;

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--port' || args[i] === '-p') {
      port = Number.parseInt(args[i + 1], 10);
      i += 1;
    } else if (args[i] === '--open' || args[i] === '-o') {
      open = true;
    }
  }

  return { port, open };
}

function ensureCerts(certDir) {
  const keyPath = path.join(certDir, 'localhost-key.pem');
  const certPath = path.join(certDir, 'localhost-cert.pem');

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  }

  fs.mkdirSync(certDir, { recursive: true });

  // Fallback only when mkcert certs are unavailable (see start-server.ps1).
  const pems = selfsigned.generate([{ name: 'commonName', value: 'localhost' }], {
    days: 825,
    keySize: 2048,
    algorithm: 'sha256',
    extensions: [
      {
        name: 'subjectAltName',
        altNames: [
          { type: 2, value: 'localhost' },
          { type: 7, ip: '127.0.0.1' },
          { type: 7, ip: '::1' },
        ],
      },
    ],
  });

  fs.writeFileSync(keyPath, pems.private);
  fs.writeFileSync(certPath, pems.cert);

  return { key: pems.private, cert: pems.cert };
}

function sendFile(filePath, stat, res) {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Content-Length': stat.size,
  });
  fs.createReadStream(filePath).pipe(res);
}

function resolveFile(urlPath, callback) {
  let requestPath = decodeURIComponent(new URL(urlPath, 'https://localhost').pathname);
  if (requestPath.endsWith('/')) {
    requestPath += 'index.html';
  }

  const filePath = path.normalize(path.join(root, requestPath));
  if (!filePath.startsWith(root)) {
    callback(new Error('forbidden'));
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      fs.stat(indexPath, (indexErr, indexStat) => {
        if (indexErr) {
          callback(indexErr);
          return;
        }
        callback(null, indexPath, indexStat);
      });
      return;
    }

    if (!err) {
      callback(null, filePath, stat);
      return;
    }

    const htmlPath = `${filePath}.html`;
    fs.stat(htmlPath, (htmlErr, htmlStat) => {
      if (htmlErr) {
        callback(err);
        return;
      }
      callback(null, htmlPath, htmlStat);
    });
  });
}

function serve(req, res) {
  resolveFile(req.url, (err, filePath, stat) => {
    if (err) {
      res.writeHead(err.message === 'forbidden' ? 403 : 404);
      res.end(err.message === 'forbidden' ? 'Forbidden' : 'Not found');
      return;
    }

    sendFile(filePath, stat, res);
  });
}

function openBrowser(url) {
  if (process.platform === 'win32') {
    exec(`start "" "${url}"`);
    return;
  }

  if (process.platform === 'darwin') {
    exec(`open "${url}"`);
    return;
  }

  exec(`xdg-open "${url}"`);
}

const { port, open } = parseArgs();
const certDir = path.join(root, '.local-certs');
const { key, cert } = ensureCerts(certDir);
const server = https.createServer({ key, cert }, serve);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Error: port ${port} is already in use.`);
    console.error('Close the other server window first, or run: .\\start-server.ps1 -Port 3001');
    process.exit(1);
  }

  throw err;
});

server.listen(port, () => {
  const url = `https://localhost:${port}`;
  console.log(`HTTPS server running at ${url}`);

  if (open) {
    openBrowser(url);
  }
});