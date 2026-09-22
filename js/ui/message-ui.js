export class MessageUI {
  constructor(statusEl, p1ScoreEl, p2ScoreEl, p1PanelEl, p2PanelEl) {
    this.statusEl = statusEl;
    this.p1ScoreEl = p1ScoreEl;
    this.p2ScoreEl = p2ScoreEl;
    this.p1PanelEl = p1PanelEl;
    this.p2PanelEl = p2PanelEl;
  }

  updateTurn(turn) {
    if (this.statusEl) {
      this.statusEl.textContent = `Lượt đi: ${turn === 'P1' ? 'Player 1 (Xanh)' : 'Player 2 (Đỏ)'}`;
    }
    if (turn === 'P1') {
      this.p1PanelEl?.classList.add('active');
      this.p2PanelEl?.classList.remove('active');
    } else {
      this.p2PanelEl?.classList.add('active');
      this.p1PanelEl?.classList.remove('active');
    }
  }

  updatePieceCounts(p1Counts, p2Counts) {
    if (this.p1ScoreEl) {
      this.p1ScoreEl.textContent = `👊 ${p1Counts.ROCK} | ✌️ ${p1Counts.SCISSORS} | ✋ ${p1Counts.PAPER}`;
    }
    if (this.p2ScoreEl) {
      this.p2ScoreEl.textContent = `👊 ${p2Counts.ROCK} | ✌️ ${p2Counts.SCISSORS} | ✋ ${p2Counts.PAPER}`;
    }
  }

  showGameOver(winnerInfo) {
    if (this.statusEl) {
      this.statusEl.textContent = `🏆 CHIẾN THẮNG: ${winnerInfo.message}`;
      this.statusEl.style.color = '#facc15';
    }
  }

  setMessage(msg) {
    if (this.statusEl) {
      this.statusEl.textContent = msg;
    }
  }
}