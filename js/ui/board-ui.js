export class BoardUI {
  constructor(boardContainerEl, onCellClick) {
    this.container = boardContainerEl;
    this.onCellClick = onCellClick;
    this.cells = [];
    this.initGrid();
  }

  initGrid() {
    this.container.innerHTML = '';
    this.cells = [];

    for (let r = 0; r < 9; r++) {
      const rowCells = [];
      for (let c = 0; c < 9; c++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        if ((r + c) % 2 === 1) cell.classList.add('dark');

        // Đánh dấu ô đích
        if (r === 8 && c === 8) cell.classList.add('goal-p1'); // Ô i9 đích của P1
        if (r === 0 && c === 0) cell.classList.add('goal-p2'); // Ô a1 đích của P2

        cell.dataset.row = r;
        cell.dataset.col = c;

        cell.addEventListener('click', () => this.onCellClick(r, c));
        this.container.appendChild(cell);
        rowCells.push(cell);
      }
      this.cells.push(rowCells);
    }
  }

  render(board) {
    const pieceImages = {
      ROCK: 'assets/pieces/rock.png',
      SCISSORS: 'assets/pieces/scissors.png',
      PAPER: 'assets/pieces/paper.png'
    };

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cellEl = this.cells[r][c];
        cellEl.innerHTML = '';

        const piece = board.getPiece(r, c);
        if (piece) {
          const pieceEl = document.createElement('div');
          pieceEl.classList.add('piece', piece.owner.toLowerCase());
          const imageEl = document.createElement('img');
          imageEl.src = pieceImages[piece.type];
          imageEl.alt = `${piece.owner} ${piece.type.toLowerCase()}`;
          imageEl.draggable = false;
          pieceEl.appendChild(imageEl);
          cellEl.appendChild(pieceEl);
        }
      }
    }
  }

  clearHighlights() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cellEl = this.cells[r][c];
        cellEl.classList.remove('selected', 'valid-move', 'valid-attack', 'valid-suicide');
      }
    }
  }

  highlightSelected(r, c) {
    this.cells[r][c].classList.add('selected');
  }

  highlightValidMoves(validMoves) {
    validMoves.forEach(m => {
      const cellEl = this.cells[m.r][m.c];
      if (m.action === 'MOVE') {
        cellEl.classList.add('valid-move');
      } else if (m.action === 'ATTACK_WIN') {
        cellEl.classList.add('valid-attack');
      } else if (m.action === 'ATTACK_LOSE') {
        cellEl.classList.add('valid-suicide');
      }
    });
  }
}