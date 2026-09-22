import { Piece, PieceType } from './piece.js';
import { PlayerId } from './player.js';

export class Board {
  constructor(size = 9) {
    this.size = size;
    this.grid = Array(size).fill(null).map(() => Array(size).fill(null));
  }

  isInBounds(r, c) {
    return r >= 0 && r < this.size && c >= 0 && c < this.size;
  }

  getPiece(r, c) {
    if (!this.isInBounds(r, c)) return null;
    return this.grid[r][c];
  }

  setPiece(r, c, piece) {
    if (this.isInBounds(r, c)) {
      this.grid[r][c] = piece;
    }
  }

  removePiece(r, c) {
    if (this.isInBounds(r, c)) {
      const piece = this.grid[r][c];
      this.grid[r][c] = null;
      return piece;
    }
    return null;
  }

  // Xáo trộn mảng dùng Fisher-Yates
  static shuffle(arr) {
    const res = [...arr];
    for (let i = res.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [res[i], res[j]] = [res[j], res[i]];
    }
    return res;
  }

  // Khởi tạo vị trí 9 quân ban đầu cho cả 2 bên
  setupInitialPieces() {
    const pool = [
      PieceType.ROCK, PieceType.ROCK, PieceType.ROCK,
      PieceType.SCISSORS, PieceType.SCISSORS, PieceType.SCISSORS,
      PieceType.PAPER, PieceType.PAPER, PieceType.PAPER
    ];

    const p1Pieces = Board.shuffle(pool);
    const p2Pieces = Board.shuffle(pool);

    // P1 xếp ở Hàng 0 (a1 -> i1)
    for (let c = 0; c < this.size; c++) {
      this.setPiece(0, c, new Piece(PlayerId.P1, p1Pieces[c]));
    }

    // P2 xếp ở Hàng 8 (a9 -> i9)
    for (let c = 0; c < this.size; c++) {
      this.setPiece(8, c, new Piece(PlayerId.P2, p2Pieces[c]));
    }
  }
}