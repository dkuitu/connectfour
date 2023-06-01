class Game {
    constructor(rows, columns) {
        this.rows = rows;
        this.columns = columns;
        this.board = Array.from({length: rows}, () => Array(columns).fill(0));
    }

    clickCell(row, column) {
        return new Promise((resolve, reject) => {
            // Implement game logic here
            console.log(`Cell at ${row},${column} clicked`);
            resolve();
        });
    }

    reset() {
        return new Promise((resolve, reject) => {
            this.board = Array.from({length: this.rows}, () => Array(this.columns).fill(0));
            console.log('Game reset');
            resolve();
        });
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    const gameBoard = document.getElementById('game-board');
    const resetButton = document.getElementById('reset');

    const game = new Game(6, 7);  // Adjust size as needed

    // Dynamically create game board
    for (let i = 0; i < game.rows; i++) {
        const row = document.createElement('div');
        row.classList.add('row');

        for (let j = 0; j < game.columns; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.id = `cell${i}${j}`;

            cell.addEventListener('click', (event) => {
                game.clickCell(i, j);
            });

            row.appendChild(cell);
        }

        gameBoard.appendChild(row);
    }

    resetButton.addEventListener('click', (event) => {
        game.reset().then(() => {
            // Possibly update UI here to reflect reset state
        });
    });
});
