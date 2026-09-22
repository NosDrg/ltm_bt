import { Game } from './game/game.js';
import { BoardUI } from './ui/board-ui.js';
import { MessageUI } from './ui/message-ui.js';

document.addEventListener('DOMContentLoaded', () => {
  const game = new Game();

  const boardEl = document.getElementById('board');
  const statusEl = document.getElementById('status-text');
  const p1ScoreEl = document.getElementById('p1-score');
  const p2ScoreEl = document.getElementById('p2-score');
  const p1PanelEl = document.getElementById('p1-panel');
  const p2PanelEl = document.getElementById('p2-panel');
  const btnRestart = document.getElementById('btn-restart');

  const messageUI = new MessageUI(statusEl, p1ScoreEl, p2ScoreEl, p1PanelEl, p2PanelEl);

  let selectedPos = null;
  let validMoves = [];

  function updateDisplay() {
    boardUI.render(game.board);
    messageUI.updateTurn(game.currentTurn);
    messageUI.updatePieceCounts(
      game.players.P1.pieceCounts,
      game.players.P2.pieceCounts
    );
  }

  function handleCellClick(r, c) {
    if (game.isGameOver) return;

    const clickedPiece = game.board.getPiece(r, c);

    // Di chuyển tới ô hợp lệ
    if (selectedPos) {
      const isTargetMove = validMoves.some(m => m.r === r && m.c === c);

      if (isTargetMove) {
        const moveRes = game.move(selectedPos.r, selectedPos.c, r, c);
        selectedPos = null;
        validMoves = [];
        boardUI.clearHighlights();

        updateDisplay();

        if (moveRes.isGameOver) {
          messageUI.showGameOver(moveRes.winnerInfo);
        }
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
    game.init();
    selectedPos = null;
    validMoves = [];
    boardUI.clearHighlights();
    if (statusEl) statusEl.style.color = '';
    updateDisplay();
  });

  updateDisplay();
});