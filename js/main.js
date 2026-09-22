import { Game } from './game/game.js';
import { BoardUI } from './ui/board-ui.js';
import { MessageUI } from './ui/message-ui.js';
import { ComputerPlayer } from './game/computer-player.js';

document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  const computerPlayer = new ComputerPlayer('P2');

  const sounds = {
    ROCK: new Audio('assets/pieces/stone.mp3'),
    SCISSORS: new Audio('assets/pieces/scissors.mp3'),
    PAPER: new Audio('assets/pieces/paper.mp3'),
    WIN: new Audio('assets/pieces/winners.mp3')
  };

  function playSound(sound) {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  const boardEl = document.getElementById('board');
  const statusEl = document.getElementById('status-text');
  const p1ScoreEl = document.getElementById('p1-score');
  const p2ScoreEl = document.getElementById('p2-score');
  const p1PanelEl = document.getElementById('p1-panel');
  const p2PanelEl = document.getElementById('p2-panel');
  const btnRestart = document.getElementById('btn-restart');
  const btnMenu = document.getElementById('btn-menu');
  const btnVsComputer = document.getElementById('btn-vs-computer');
  const btnVsPlayer = document.getElementById('btn-vs-player');
  const startMenu = document.getElementById('start-menu');
  const gameScreen = document.getElementById('game-screen');

  const messageUI = new MessageUI(statusEl, p1ScoreEl, p2ScoreEl, p1PanelEl, p2PanelEl);

  let selectedPos = null;
  let validMoves = [];
  let gameMode = 'computer';
  let computerTimer = null;

  function updateDisplay() {
    boardUI.render(game.board);
    messageUI.updateTurn(game.currentTurn);
    messageUI.updatePieceCounts(
      game.players.P1.pieceCounts,
      game.players.P2.pieceCounts
    );
  }

  function startGame(mode) {
    gameMode = mode;
    game.init();
    selectedPos = null;
    validMoves = [];
    boardUI.clearHighlights();
    startMenu.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    updateDisplay();
  }

  function makeComputerMove() {
    if (gameMode !== 'computer' || game.currentTurn !== 'P2' || game.isGameOver) return;

    clearTimeout(computerTimer);
    computerTimer = setTimeout(() => {
      const move = computerPlayer.findMove(game);
      if (!move) return;

      const moveResult = game.move(move.fromR, move.fromC, move.toR, move.toC);
      updateDisplay();
      if (moveResult.isGameOver) {
        playSound(sounds.WIN);
        messageUI.showGameOver(moveResult.winnerInfo);
      } else {
        playSound(sounds[move.piece.type]);
      }
    }, 450);
  }

  function handleCellClick(r, c) {
    if (game.isGameOver || (gameMode === 'computer' && game.currentTurn === 'P2')) return;

    const clickedPiece = game.board.getPiece(r, c);

    // Di chuyển tới ô hợp lệ
    if (selectedPos) {
      const isTargetMove = validMoves.some(m => m.r === r && m.c === c);

      if (isTargetMove) {
        const movedPiece = game.board.getPiece(selectedPos.r, selectedPos.c);
        const moveRes = game.move(selectedPos.r, selectedPos.c, r, c);
        selectedPos = null;
        validMoves = [];
        boardUI.clearHighlights();

        updateDisplay();

        if (moveRes.isGameOver) {
          playSound(sounds.WIN);
          messageUI.showGameOver(moveRes.winnerInfo);
        } else if (movedPiece) {
          playSound(sounds[movedPiece.type]);
        }
        makeComputerMove();
        return;
      }
    }

    // Chọn quân cờ
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

  const boardUI = new BoardUI(boardEl, handleCellClick);

  btnRestart?.addEventListener('click', () => {
    startGame(gameMode);
    if (statusEl) statusEl.style.color = '';
  });

  btnVsComputer?.addEventListener('click', () => startGame('computer'));
  btnVsPlayer?.addEventListener('click', () => startGame('local'));
  btnMenu?.addEventListener('click', () => {
    clearTimeout(computerTimer);
    gameScreen.classList.add('hidden');
    startMenu.classList.remove('hidden');
  });
});