import { PieceType } from './piece.js';

export const PlayerId = Object.freeze({
  P1: 'P1',
  P2: 'P2'
});

export class Player {
  constructor(id, name, targetGoal) {
    this.id = id;
    this.name = name || id;
    // targetGoal là tọa độ ô đích: P1 -> { r: 8, c: 8 } (i9), P2 -> { r: 0, c: 0 } (a1)
    this.targetGoal = targetGoal;
    this.pieceCounts = {
      [PieceType.ROCK]: 3,
      [PieceType.SCISSORS]: 3,
      [PieceType.PAPER]: 3
    };
  }

  decrementPiece(type) {
    if (this.pieceCounts[type] > 0) {
      this.pieceCounts[type]--;
    }
  }

  // Điều kiện 1: Kiểm tra xem có loại quân nào đã bị ăn sạch không
  hasExtinctType() {
    return (
      this.pieceCounts[PieceType.ROCK] === 0 ||
      this.pieceCounts[PieceType.SCISSORS] === 0 ||
      this.pieceCounts[PieceType.PAPER] === 0
    );
  }

  // Tổng số quân còn lại trên bàn
  getTotalPieces() {
    return (
      this.pieceCounts[PieceType.ROCK] +
      this.pieceCounts[PieceType.SCISSORS] +
      this.pieceCounts[PieceType.PAPER]
    );
  }
}