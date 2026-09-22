import { Game } from '../game/game.js';
import { BoardUI } from '../ui/board-ui.js';
import { MessageUI } from '../ui/message-ui.js';
import { RoomManager } from './room.js';

// 1. Tạo Room ID ngay từ đầu
const roomId = RoomManager.getRoomId();
const game = new Game();

// 2. Lấy các phần tử DOM
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status-text');
const p1ScoreEl = document.getElementById('p1-score');
const p2ScoreEl = document.getElementById('p2-score');
const p1PanelEl = document.getElementById('p1-panel');
const p2PanelEl = document.getElementById('p2-panel');
const btnRestart = document.getElementById('btn-restart');
const roomLinkInput = document.getElementById('room-link');
const btnCopy = document.getElementById('btn-copy');

if (roomLinkInput) {
  roomLinkInput.value = window.location.href;
}

const messageUI = new MessageUI(statusEl, p1ScoreEl, p2ScoreEl, p1PanelEl, p2PanelEl);

let myRole = null;
let selectedPos = null;
let validMoves = [];

function updateUI() {
  boardUI.render(game.board);
  messageUI.updateTurn(game.currentTurn);
  messageUI.updatePieceCounts(
    game.players.P1.pieceCounts,
    game.players.P2.pieceCounts
  );
  if (game.isGameOver && game.winnerInfo) {
    messageUI.showGameOver(game.winnerInfo);
  }
}

// 3. Khởi tạo bàn cờ hiển thị ngay lập tức
const boardUI = new BoardUI(boardEl, handleCellClick);
updateUI();

// 4. Kết nối Socket.IO với cấu hình tương thích Localtunnel
let socket = null;
if (typeof io !== 'undefined') {
  socket = io({
    transports: ['websocket'], // Bỏ qua polling để tránh bị lỗi 403/cors từ tunnel
    extraHeaders: {
      'bypass-tunnel-reminder': 'true'
    }
  });

  socket.emit('join_room', roomId);

  socket.on('player_assigned', ({ role }) => {
    myRole = role;
    if (!role) {
      messageUI.setMessage('Phòng đã đủ 2 người! Bạn đang ở chế độ xem.');
    } else {
      messageUI.setMessage(`Bạn là: ${role === 'P1' ? 'Player 1 (Xanh)' : 'Player 2 (Đỏ)'}`);
    }
  });

  socket.on('sync_state', (serializedState) => {
    game.deserializeState(serializedState);
    updateUI();
  });

  socket.on('player_left', ({ role }) => {
    messageUI.setMessage(`Người chơi ${role} đã rời phòng.`);
  });
} else {
  console.error("Không tìm thấy thư viện Socket.IO!");
}

function handleCellClick(r, c) {
  if (game.isGameOver) return;

  if (myRole && game.currentTurn !== myRole) {
    messageUI.setMessage('Chưa tới lượt của bạn!');
    return;
  }

  const clickedPiece = game.board.getPiece(r, c);

  if (selectedPos) {
    const isTargetMove = validMoves.some(m => m.r === r && m.c === c);

    if (isTargetMove) {
      const moveRes = game.move(selectedPos.r, selectedPos.c, r, c);
      selectedPos = null;
      validMoves = [];
      boardUI.clearHighlights();

      updateUI();

      if (socket) {
        socket.emit('send_move', game.serializeState());
      }

      if (moveRes.isGameOver) {
        messageUI.showGameOver(moveRes.winnerInfo);
      }
      return;
    }
  }

  if (clickedPiece && clickedPiece.owner === game.currentTurn) {
    selectedPos = { r, c };
    validMoves = game.getValidMovesFor(r, c);

    boardUI.clearHighlights();
    boardUI.highlightSelected(r, c);
    boardUI.highlightValidMoves(validMoves);
    return;
  }

  selectedPos = null;
  validMoves = [];
  boardUI.clearHighlights();
}

btnRestart?.addEventListener('click', () => {
  game.init();
  selectedPos = null;
  validMoves = [];
  boardUI.clearHighlights();
  updateUI();
  if (socket) {
    socket.emit('restart_game', game.serializeState());
  }
});

// Nút sao chép link tương thích mọi trình duyệt
if (btnCopy && roomLinkInput) {
  btnCopy.addEventListener('click', () => {
    roomLinkInput.value = window.location.href;
    roomLinkInput.select();
    document.execCommand('copy');
    btnCopy.textContent = 'Đã chép!';
    setTimeout(() => { btnCopy.textContent = 'Sao chép link'; }, 2000);
  });
}