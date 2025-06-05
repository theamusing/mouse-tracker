const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  } else {
    res.writeHead(404);
    res.end();
  }
});

const wss = new WebSocket.Server({ server }); // 不限制路径

const clients = new Map();

wss.on('connection', (ws) => {
  const id = uuidv4();
  clients.set(ws, id);

  ws.on('message', (message) => {
    try {
      const { x, y } = JSON.parse(message);
      const data = JSON.stringify({ id, x, y });
      for (const client of clients.keys()) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      }
    } catch (e) {
      console.error('Invalid message:', message);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
