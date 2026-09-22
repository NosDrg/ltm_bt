import { Game } from '../game/game.js';
import { BoardUI } from '../ui/board-ui.js';
import { MessageUI } from '../ui/message-ui.js';

const game = new Game();

// -- DOM LOBBY --
const lobbyContainer = document.getElementById('lobby-container');
const gameContainer = document.getElementById('game-container');
const btnCreateRoom = document.getElementById('btn-create-room');
const btnJoinRoom = document.getElementById('btn-join-room');
const inputRoomCode = document.getElementById('input-room-code');

// -- DOM GAME --
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status-text');
const p1ScoreEl = document.getElementById('p1-score');
const p2ScoreEl = document.getElementById('p2-score');
const p1PanelEl = document.getElementById('p1-panel');
const p2PanelEl = document.getElementById('p2-panel');
const btnRestartGame = document.getElementById('btn-restart');
const displayRoomCode = document.getElementById('display-room-code');
const btnCopy = document.getElementById('btn-copy');

const messageUI = new MessageUI(statusEl, p1ScoreEl, p2ScoreEl, p1PanelEl, p2PanelEl);

let myRole = null;
let selectedPos = null;
let validMoves = [];
let currentRoomId = null;

// Khởi tạo bàn cờ mặc định
const boardUI = new BoardUI(boardEl, handleCellClick);

// KẾT NỐI SOCKET
let socket = null;
if (typeof io !== 'undefined') {
  socket = io({
    transports: ['polling', 'websocket'],
    extraHeaders: {
      'ngrok-skip-browser-warning': 'true',
      'bypass-tunnel-reminder': 'true'
    }
  });

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
}

// -- XỬ LÝ LOBBY (Tạo & Vào phòng) --
function enterGame(roomId) {
  currentRoomId = roomId;
  displayRoomCode.value = roomId;
  
  // Ẩn sảnh, hiện game
  lobbyContainer.style.display = 'none';
  gameContainer.style.display = 'flex';
  
  // Báo cho server biết mình vào phòng
  if (socket) socket.emit('join_room', roomId);
  updateUI();
}

btnCreateRoom.addEventListener('click', () => {
  const newId = 'ott_' + Math.random().toString(36).substring(2, 8);
  enterGame(newId);
});

btnJoinRoom.addEventListener('click', () => {
  const roomCode = inputRoomCode.value.trim();
  if (roomCode.length < 3) {
    alert("Vui lòng nhập đúng mã phòng!");
    return;
  }
  enterGame(roomCode);
});

// -- LOGIC GAME --
function updateUI() {
  boardUI.render(game.board);
  messageUI.updateTurn(game.currentTurn);
  messageUI.updatePieceCounts(game.players.P1.pieceCounts, game.players.P2.pieceCounts);
  if (game.isGameOver && game.winnerInfo) {
    messageUI.showGameOver(game.winnerInfo);
  }
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

      if (socket) socket.emit('send_move', game.serializeState());
      if (moveRes.isGameOver) messageUI.showGameOver(moveRes.winnerInfo);
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

btnRestartGame.addEventListener('click', () => {
  game.init();
  selectedPos = null;
  validMoves = [];
  boardUI.clearHighlights();
  updateUI();
  if (socket) socket.emit('restart_game', game.serializeState());
});

btnCopy.addEventListener('click', () => {
  displayRoomCode.select();
  document.execCommand('copy');
  const oldText = btnCopy.textContent;
  btnCopy.textContent = 'Đã chép!';
  setTimeout(() => { btnCopy.textContent = oldText; }, 2000);
});