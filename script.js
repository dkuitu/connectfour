class Player {
    constructor(name, color) {
        this.name = name;
        this.color = color;
    }
}

class AIPlayer extends Player {
    constructor(name, color) {
        super(name, color);
    }

    pickColumn(board) {
        let availableColumns = [];
        for(let col = 0; col < board.columns; col++) {
            if(board.isEmpty(col)) {
                availableColumns.push(col);
            }
        }
        return availableColumns[Math.floor(Math.random() * availableColumns.length)];
    }
}

class Board {
    constructor(rows, columns, players) {
        this.rows = rows;
        this.columns = columns;
        this.players = players;
        this.currentPlayerIndex = 0;
        this.board = Array.from({length: rows}, () => Array(columns).fill(null));
    }

    createBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';

        for (let i = 0; i < this.rows; i++) {
            const row = document.createElement('div');
            row.classList.add('row');

            for (let j = 0; j < this.columns; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.id = `cell${i}${j}`;

                cell.addEventListener('click', () => {
                    if(this.currentPlayer() instanceof AIPlayer) return;
                    this.playTurn(j);
                });

                row.appendChild(cell);
            }

            gameBoard.appendChild(row);
        }
    }

    currentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    switchPlayer() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    isEmpty(column) {
        return this.board[0][column] === null;
    }

    playTurn(column) {
        if (!this.isEmpty(column)) return false;

        for(let row = this.rows - 1; row >= 0; row--) {
            if(this.board[row][column] === null) {
                this.board[row][column] = this.currentPlayer().color;
                this.updateRenderedBoard(row, column, this.currentPlayer());
                break;
            }
        }

        if(this.checkWin()) {
            alert(`${this.currentPlayer().name} wins!`);
            this.reset();
        }

        this.switchPlayer();

        if(this.currentPlayer() instanceof AIPlayer) {
            setTimeout(() => {
                this.playTurn(this.currentPlayer().pickColumn(this));
            }, 1000);
        }
    }

    checkWin() {
        for(let row = 0; row < this.rows; row++) {
            for(let col = 0; col < this.columns - 3; col++) {
                if(this.board[row][col] &&
                   this.board[row][col] === this.board[row][col+1] &&
                   this.board[row][col] === this.board[row][col+2] &&
                   this.board[row][col] === this.board[row][col+3]) {
                    return true;
                }
            }
        }
        return false;
    }

    reset() {
        this.board = Array.from({length: this.rows}, () => Array(this.columns).fill(null));
        this.createBoard();
    }

    updateRenderedBoard(row, col, player) {
        const cell = document.getElementById(`cell${row}${col}`);
        cell.style.backgroundColor = player.color;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const players = [
        new Player('Human', 'red'),
        new AIPlayer('Computer', 'yellow')
    ];

    const board = new Board(6, 7, players);
    board.createBoard();

    const resetButton = document.getElementById('reset');
    resetButton.addEventListener('click', () => {
        board.reset();
    });
});


