class Player {
    constructor(name, color) {
        this.name = name;
        this.color = color;
        this.opponent = null;
    }

    setOpponent(opponent) {
        this.opponent = opponent;
    }
}

class AIPlayer extends Player {
    constructor(name, color) {
        super(name, color);
    }

    evaluateLine(line) {
        let score = 0;

        // Count the number of pieces in the line
        let numPieces = line.filter(cell => cell === this.color).length;
        let numOpponentPieces = line.filter(cell => cell === this.opponent.color).length;

        // Score the line
        if (numPieces === 4) {
            score += 100;  // Winning line
        } else if (numPieces === 3 && numOpponentPieces === 0) {
            score += 5;  // Almost winning line
        } else if (numPieces === 2 && numOpponentPieces === 0) {
            score += 2;  // Potential for a winning line
        } else if (numOpponentPieces === 3 && numPieces === 0) {
            score -= 4;  // Opponent almost wins
        }

        return score;
    }

    pickColumn(board) {
        let bestScore = -Infinity;
        let move = null;
        for (let col = 0; col < board.columns; col++) {
            if (board.isEmpty(col)) {
                // Try this move
                board.placePiece(col, this);
                // Evaluate using Minimax
                let score = this.minimax(board, 3, -Infinity, Infinity, false); // Depth 3
                // Undo move
                board.removePiece(col);
                if (score > bestScore) {
                    bestScore = score;
                    move = col;
                }
            }
        }
        return move;
    }

    minimax(board, depth, alpha, beta, maximizingPlayer) {
        if (depth === 0 || board.checkWin()) {
            return this.evaluate(board);
        }
        if (maximizingPlayer) {
            let maxEval = -Infinity;
            for (let col = 0; col < board.columns; col++) {
                if (board.isEmpty(col)) {
                    board.placePiece(col, this);
                    let evaluation = this.minimax(board, depth - 1, alpha, beta, false);
                    board.removePiece(col);
                    maxEval = Math.max(maxEval, eval);
                    alpha = Math.max(alpha, eval);
                    if (beta <= alpha) break;
                }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let col = 0; col < board.columns; col++) {
                if (board.isEmpty(col)) {
                    board.placePiece(col, this.opponent);
                    let evaluation = this.minimax(board, depth - 1, alpha, beta, true);
                    board.removePiece(col);
                    minEval = Math.min(minEval, eval);
                    beta = Math.min(beta, eval);
                    if (beta <= alpha) break;
                }
            }
            return minEval;
        }
    }

    evaluate(board) {
        // TODO: Implement a board evaluation function
        // For simplicity, we'll just count the number of possible winning lines
        // for the AI player and subtract the number of possible winning lines for
        // the opponent. Winning lines can be rows, columns or diagonals.
        let score = 0;
        // Check rows
        for (let row = 0; row < board.rows; row++) {
            for (let col = 0; col < board.columns - 3; col++) {
                let line = board.board[row].slice(col, col + 4);
                score += this.evaluateLine(line);
            }
        }
        // Check columns
        for (let col = 0; col < board.columns; col++) {
            for (let row = 0; row < board.rows - 3; row++) {
                let line = [];
                for (let i = 0; i < 4; i++) {
                    line.push(board.board[row + i][col]);
                }
                score += this.evaluateLine(line);
            }
        }
        // Check diagonals
        for (let row = 0; row < board.rows - 3; row++) {
            for (let col = 0; col < board.columns - 3; col++) {
                let line = [];
                for (let i = 0; i < 4; i++) {
                    line.push(board.board[row + i][col + i]);
                }
                score += this.evaluateLine(line);
            }
        }
        for (let row = 0; row < board.rows - 3; row++) {
            for (let col = 3; col < board.columns; col++) {
                let line = [];
                for (let i = 0; i < 4; i++) {
                    line.push(board.board[row + i][col - i]);
                }
                score += this.evaluateLine(line);
            }
        }
        return score;
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

    placePiece(column, player) {
        // Go from the bottom of the column up
        for (let row = this.rows - 1; row >= 0; row--) {
            // If the spot is empty, place the piece
            if (this.board[row][column] === null) {
                this.board[row][column] = player.color;
                // Optionally, you may want to visually update the board after placing a piece.
                // This depends on how you implement the game interface.
                this.updateRenderedBoard(row, column, player);
                return true;
            }
        }
        // The column was full
        return false;
    }

    removePiece(column) {
        // Go from the top of the column down
        for (let row = 0; row < this.rows; row++) {
            // If the spot is not empty, remove the piece
            if (this.board[row][column] !== null) {
                this.board[row][column] = null;
                // Optionally, you may want to visually update the board after removing a piece.
                // This depends on how you implement the game interface.
                this.updateRenderedBoard(row, column, { color: null });
                return true;
            }
        }
        // The column was empty
        return false;
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

        if(this.checkWin(4)) {
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

    checkWin(n) {
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
    
        for(let row = 0; row < this.rows; row++) {
            for(let col = 0; col < this.columns; col++) {
                if(!this.board[row][col]) continue;
    
                for(let [dx, dy] of directions) {
                    if(this.isConsecutive(row, col, dx, dy, n)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    isConsecutive(row, col, dx, dy, n) {
        const player = this.board[row][col];
    
        for(let i = 0; i < n; i++) {
            const x = row + i * dx;
            const y = col + i * dy;
    
            if(x < 0 || x >= this.rows || y < 0 || y >= this.columns || this.board[x][y] !== player) {
                return false;
            }
        }
        return true;
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

    // Set each player's opponent to the other player
    players[0].setOpponent(players[1]);
    players[1].setOpponent(players[0]);

    const board = new Board(6, 7, players);
    board.createBoard();

    const resetButton = document.getElementById('reset');
    resetButton.addEventListener('click', () => {
        board.reset();
    });
});

