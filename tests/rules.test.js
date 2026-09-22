import { Rules } from '../js/game/rules.js';
import { PieceType } from '../js/game/piece.js';

// Test luật kéo - búa - bao
console.assert(Rules.combat(PieceType.ROCK, PieceType.SCISSORS) === 1, 'Đấm phải thắng Kéo');
console.assert(Rules.combat(PieceType.SCISSORS, PieceType.PAPER) === 1, 'Kéo phải thắng Bao');
console.assert(Rules.combat(PieceType.PAPER, PieceType.ROCK) === 1, 'Bao phải thắng Đấm');
console.assert(Rules.combat(PieceType.ROCK, PieceType.ROCK) === 0, 'Đấm gặp Đấm phải Hòa');
console.assert(Rules.combat(PieceType.SCISSORS, PieceType.ROCK) === -1, 'Kéo gặp Đấm phải Thua');

console.log('✓ Tất cả test Rules đã pass thành công!');