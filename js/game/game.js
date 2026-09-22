import { Board } from './board.js';
import { Player, PlayerId } from './player.js';
import { Rules } from './rules.js';

export class Game {
  constructor() {
    this.board = new Board(9);
    this.players = {
      [PlayerId.P1]: new Player(PlayerId.P1, 'Player 1', { r: 8, c: 8 }),
      [PlayerId.P2]: new Player(PlayerId.P2, 'Player 2', { r: 0, c: 0 })
    };
    this.currentTurn = PlayerId.P1;
    this.isGameOver = false;
    this.winnerInfo = null;

    this.init();
  }

  init() {
    this.board.setupInitialPieces();
    this.currentTurn = PlayerId.P1;
    this.isGameOver = false;
    this.winnerInfo = null;
    this.players[PlayerId.P1].pieceCounts = { ROCK: 3, SCISSORS: 3, PAPER: 3 };
    this.players[PlayerId.P2].pieceCounts = { ROCK: 3, SCISSORS: 3, PAPER: 3 };
  }

  getCurrentPlayer() {
    return this.players[this.currentTurn];
  }

  getOpponentPlayer() {
    const oppId = this.currentTurn === PlayerId.P1 ? PlayerId.P2 : PlayerId.P1;
    return this.players[oppId];
  }

  getValidMovesFor(r, c) {
    if (this.isGameOver) return [];
    const moves = [];
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];

    for (const [dr, dc] of directions) {
      const tr = r + dr;
      const tc = c + dc;
      const check = Rules.evaluateMove(this.board, r, c, tr, tc, this.currentTurn);
      if (check.valid) {
        moves.push({ r: tr, c: tc, action: check.action });
      }
    }
    return moves;
  }

  move(fromR, fromC, toR, toC) {
    if (this.isGameOver) {
      return { success: false, reason: 'Trận đấu đã kết thúc' };
    }

    const evalResult = Rules.evaluateMove(this.board, fromR, fromC, toR, toC, this.currentTurn);
    if (!evalResult.valid) {
      return { success: false, reason: evalResult.reason };
    }

    const attacker = this.board.getPiece(fromR, fromC);
    const defender = this.board.getPiece(toR, toC);
    const currentPlayer = this.getCurrentPlayer();
    const opponentPlayer = this.getOpponentPlayer();
    let captured = null;

    switch (evalResult.action) {
      case 'MOVE':
        this.board.setPiece(toR, toC, attacker);
        this.board.removePiece(fromR, fromC);
        break;

      case 'ATTACK_WIN':
        captured = defender;
        opponentPlayer.decrementPiece(defender.type);
        this.board.setPiece(toR, toC, attacker);
        this.board.removePiece(fromR, fromC);
        break;

      case 'ATTACK_LOSE':
        captured = attacker;
        currentPlayer.decrementPiece(attacker.type);
        this.board.removePiece(fromR, fromC);
        break;
    }

    const winCheck = Rules.checkWin(this.board, currentPlayer, opponentPlayer);
    if (winCheck.isWon) {
      this.isGameOver = true;
      this.winnerInfo = winCheck;
      return {
        success: true,
        action: evalResult.action,
        captured,
        isGameOver: true,
        winnerInfo: this.winnerInfo
      };
    }

    this.currentTurn = this.getOpponentPlayer().id;

    return {
      success: true,
      action: evalResult.action,
      captured,
      isGameOver: false,
      nextTurn: this.currentTurn
    };
  }

  // Chuyển đổi dữ liệu bàn cờ sang mảng JSON thuần để playhtml đồng bộ
  serializeState() {
    const rawGrid = this.board.grid.map(row => 
      row.map(cell => cell ? { owner: cell.owner, type: cell.type } : null)
    );
    return {
      grid: rawGrid,
      currentTurn: this.currentTurn,
      p1Counts: { ...this.players[PlayerId.P1].pieceCounts },
      p2Counts: { ...this.players[PlayerId.P2].pieceCounts },
      isGameOver: this.isGameOver,
      winnerInfo: this.winnerInfo
    };
  }

  // Khôi phục trạng thái nhận được từ playhtml sync
  deserializeState(state) {
    if (!state || !state.grid) return;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const item = state.grid[r][c];
        if (item) {
          this.board.setPiece(r, c, {
            owner: item.owner,
            type: item.type,
            getSymbol: () => item.type === 'ROCK' ? '👊' : (item.type === 'SCISSORS' ? '✌️' : '✋')
          });
        } else {
          this.board.removePiece(r, c);
        }
      }
    }
    this.currentTurn = state.currentTurn;
    this.players[PlayerId.P1].pieceCounts = state.p1Counts;
    this.players[PlayerId.P2].pieceCounts = state.p2Counts;
    this.isGameOver = state.isGameOver;
    this.winnerInfo = state.winnerInfo;
  }
}