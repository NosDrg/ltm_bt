const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const GameManager = require('./game-manager');

const app = express();
const server = http.createServer(app);

// Cấu hình Socket.IO hỗ trợ WebSocket trực tiếp qua Tunnel
const io = new Server(server, {
  cors: { origin: '*' },
  transports: ['websocket', 'polling']
});

const gameManager = new GameManager();

// BẮT BUỘC: Thêm header bỏ qua màn hình chặn của Localtunnel
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  res.setHeader('bypass-tunnel-reminder', 'true');
  next();
});
// KẾT THÚC ĐOẠN CẦN THÊM

const rootDir = path.join(__dirname, '..');
app.use(express.static(rootDir));

io.on('connection', (socket) => {
  let currentRoomId = null;
  let playerRole = null;

  socket.on('join_room', (roomId) => {
    currentRoomId = roomId;
    const room = gameManager.getOrCreateRoom(roomId);
    playerRole = room.addPlayer(socket.id);

    socket.join(roomId);
    socket.emit('player_assigned', { role: playerRole, roomId });

    if (room.gameState) {
      socket.emit('sync_state', room.gameState);
    }

    io.to(roomId).emit('room_status', { isReady: room.isFull() });
  });

  socket.on('send_move', (stateData) => {
    if (!currentRoomId) return;
    const room = gameManager.getRoom(currentRoomId);
    if (room) {
      room.gameState = stateData;
      socket.to(currentRoomId).emit('sync_state', stateData);
    }
  });

  socket.on('restart_game', (stateData) => {
    if (!currentRoomId) return;
    const room = gameManager.getRoom(currentRoomId);
    if (room) {
      room.gameState = stateData;
      io.to(currentRoomId).emit('sync_state', stateData);
    }
  });

  socket.on('disconnect', () => {
    if (currentRoomId) {
      const room = gameManager.getRoom(currentRoomId);
      if (room) {
        room.removePlayer(socket.id);
        io.to(currentRoomId).emit('player_left', { role: playerRole });
        gameManager.removeRoomIfEmpty(currentRoomId);
      }
    }
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server đang chạy tại cổng: ${PORT}`);
});