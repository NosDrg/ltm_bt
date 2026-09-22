export const PieceType = Object.freeze({
  ROCK: 'ROCK',         // 👊 Đấm
  SCISSORS: 'SCISSORS', // ✌️ Kéo
  PAPER: 'PAPER'        // ✋ Bao
});

export const PIECE_SYMBOLS = Object.freeze({
  [PieceType.ROCK]: '👊',
  [PieceType.SCISSORS]: '✌️',
  [PieceType.PAPER]: '✋'
});

export class Piece {
  constructor(ownerId, type) {
    if (!Object.values(PieceType).includes(type)) {
      throw new Error(`Loại quân không hợp lệ: ${type}`);
    }
    this.owner = ownerId; // 'P1' | 'P2'
    this.type = type;
  }

  getSymbol() {
    return PIECE_SYMBOLS[this.type];
  }

  clone() {
    return new Piece(this.owner, this.type);
  }
}