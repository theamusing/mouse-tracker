const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const server = http.createServer();

const wss = new WebSocket.Server({ server, path: '/mouse' });

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
  console.log(`WebSocket server is listening on ws://localhost:${PORT}/mouse`);
});
