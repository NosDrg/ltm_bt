import { PieceType } from './piece.js';
import { Rules } from './rules.js';

export class ComputerPlayer {
  constructor(playerId = 'P2') {
    this.playerId = playerId;
  }

  findMove(game) {
    const candidates = [];

    for (let r = 0; r < game.board.size; r++) {
      for (let c = 0; c < game.board.size; c++) {
        const piece = game.board.getPiece(r, c);
        if (!piece || piece.owner !== this.playerId) continue;

        for (const move of game.getValidMovesFor(r, c)) {
          candidates.push({ fromR: r, fromC: c, toR: move.r, toC: move.c, action: move.action, piece });
        }
      }
    }

    if (!candidates.length) return null;

    candidates.sort((first, second) => this.scoreMove(game, second) - this.scoreMove(game, first));
    const bestScore = this.scoreMove(game, candidates[0]);
    const bestMoves = candidates.filter(move => this.scoreMove(game, move) === bestScore);
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }

  scoreMove(game, move) {
    const destination = game.board.getPiece(move.toR, move.toC);
    const player = game.players[this.playerId];
    let score = 0;

    if (move.action === 'ATTACK_WIN') score += 100;
    if (move.action === 'ATTACK_LOSE') score -= 35;
    if (destination && destination.owner !== this.playerId) {
      score += Rules.combat(move.piece.type, destination.type) > 0 ? 20 : -20;
    }

    const goalDistanceBefore = this.distanceToGoal(move.fromR, move.fromC, player.targetGoal);
    const goalDistanceAfter = this.distanceToGoal(move.toR, move.toC, player.targetGoal);
    score += (goalDistanceBefore - goalDistanceAfter) * 8;

    if (move.piece.type === PieceType.ROCK) score += 1;
    return score;
  }

  distanceToGoal(row, column, goal) {
    return Math.max(Math.abs(goal.r - row), Math.abs(goal.c - column));
  }
}