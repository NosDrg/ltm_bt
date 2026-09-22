import { PieceType } from './piece.js';

export class Rules {
  // So sánh 2 quân: 1 (attacker thắng), -1 (defender thắng), 0 (hòa)
  static combat(attackerType, defenderType) {
    if (attackerType === defenderType) return 0;
    if (
      (attackerType === PieceType.ROCK && defenderType === PieceType.SCISSORS) ||
      (attackerType === PieceType.SCISSORS && defenderType === PieceType.PAPER) ||
      (attackerType === PieceType.PAPER && defenderType === PieceType.ROCK)
    ) {
      return 1;
    }
    return -1;
  }

  // Kiểm tra di chuyển tối đa 1 ô theo 8 hướng (kiểu quân Vua)
  static isKingMove(fromR, fromC, toR, toC) {
    const dr = Math.abs(toR - fromR);
    const dc = Math.abs(toC - fromC);
    return dr <= 1 && dc <= 1 && (dr !== 0 || dc !== 0);
  }

  // Đánh giá nước đi tới ô đích
  static evaluateMove(board, fromR, fromC, toR, toC, currentTurn) {
    const attacker = board.getPiece(fromR, fromC);
    if (!attacker || attacker.owner !== currentTurn) {
      return { valid: false, reason: 'Quân chọn không hợp lệ' };
    }

    if (!board.isInBounds(toR, toC)) {
      return { valid: false, reason: 'Vị trí ngoài bàn cờ' };
    }

    if (!this.isKingMove(fromR, fromC, toR, toC)) {
      return { valid: false, reason: 'Chỉ được đi 1 ô theo 8 hướng' };
    }

    const defender = board.getPiece(toR, toC);

    // Đi vào ô trống
    if (!defender) {
      return { valid: true, action: 'MOVE' };
    }

    // Đi vào ô quân mình
    if (defender.owner === attacker.owner) {
      return { valid: false, reason: 'Ô đã có quân của bạn' };
    }

    // Đi vào quân đối phương
    const result = this.combat(attacker.type, defender.type);
    if (result === 0) {
      return { valid: false, reason: 'Hai quân cùng loại không thể ăn nhau (bị chặn)' };
    } else if (result > 0) {
      return { valid: true, action: 'ATTACK_WIN' };
    } else {
      // Luật: "Quân thua -> bị quân đối phương ăn"
      return { valid: true, action: 'ATTACK_LOSE' };
    }
  }

  // Kiểm tra điều kiện thắng
  static checkWin(board, currentPlayer, opponentPlayer) {
    // ĐK 2: Đưa quân tới ô đích quy định
    const goal = currentPlayer.targetGoal;
    const pieceAtGoal = board.getPiece(goal.r, goal.c);
    if (pieceAtGoal && pieceAtGoal.owner === currentPlayer.id) {
      return {
        isWon: true,
        winner: currentPlayer.id,
        reason: 'REACHED_GOAL',
        message: `${currentPlayer.name} đã đưa quân về ô đích!`
      };
    }

    // ĐK 1: Ăn hết 1 loại quân của đối phương
    if (opponentPlayer.hasExtinctType()) {
      return {
        isWon: true,
        winner: currentPlayer.id,
        reason: 'EXTINCTION',
        message: `${currentPlayer.name} đã tiêu diệt toàn bộ một loại quân của đối phương!`
      };
    }

    return { isWon: false };
  }
}