const express = require('express');
const app = express();
app.use(express.static('public')); 
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const clients = new Map();

const server = http.createServer((req, res) => {
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'login.html' : req.url);
    const ext = path.extname(filePath);
    let contentType = 'text/html';

    if (ext === '.css') contentType = 'text/css';
    if (ext === '.js') contentType = 'text/javascript';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('File Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    let userInfo = {};

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.type === 'join') {
            userInfo = { username: data.username, room: data.room };
            clients.set(ws, userInfo);

            const joinMsg = {
                user: 'System',
                text: `${data.username} joined ${data.room}`,
                time: new Date().toLocaleTimeString()
            };
            broadcast(joinMsg, data.room);
        }

        if (data.type === 'message') {
            const user = clients.get(ws);
            if (!user) return;

            const msg = {
                user: user.username,
                text: data.text,
                time: new Date().toLocaleTimeString()
            };
            broadcast(msg, user.room);
        }
    });

    ws.on('close', () => {
        const user = clients.get(ws);
        if (user) {
            const leaveMsg = {
                user: 'System',
                text: `${user.username} left the chat`,
                time: new Date().toLocaleTimeString()
            };
            broadcast(leaveMsg, user.room);
            clients.delete(ws);
        }
    });
});

function broadcast(message, room) {
    const msg = JSON.stringify(message);
    clients.forEach((info, client) => {
        if (info.room === room && client.readyState === WebSocket.OPEN) {
            client.send(msg);
        }
    });
}

const PORT = 3000;
server.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}/login.html`));