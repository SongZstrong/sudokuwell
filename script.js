class MultiSudokuGame {
    constructor() {
        this.board = [];
        this.solution = [];
        this.selectedCell = null;
        this.isPaused = false;
        this.gameStarted = false;
        this.startTime = null;
        this.timerInterval = null;
        this.difficulty = 'easy';
        this.sudokuType = 'standard';
        this.boardSize = 9;
        this.boxSize = 3;
        this.maxNumber = 9;
        this.numberSet = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        
        this.initializeGame();
        this.bindEvents();
        this.initializeNavigation();
    }

    initializeNavigation() {
        // Navigation toggle for mobile
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Page navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetPage = link.getAttribute('data-page');
                this.switchPage(targetPage);
                
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Close mobile menu
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Contact form handling
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactForm();
            });
        }
    }

    switchPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show target page
        const targetPage = document.getElementById(pageName);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }

    handleContactForm() {
        const formData = new FormData(document.getElementById('contactForm'));
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Simple validation
        if (!name || !email || !message) {
            this.showMessage('Please fill in all required fields.', 'error');
            return;
        }
        
        // Simulate form submission
        this.showMessage('Thank you for your message! We will get back to you soon.', 'success');
        
        // Reset form
        document.getElementById('contactForm').reset();
    }

    initializeGame() {
        this.updateSudokuType();
        this.createBoard();
        this.createNumberPad();
        this.generateNewGame();
        this.updateTimer();
    }

    updateSudokuType() {
        this.sudokuType = document.getElementById('sudokuType').value;
        
        switch(this.sudokuType) {
            case 'standard':
                this.boardSize = 9;
                this.boxSize = 3;
                this.maxNumber = 9;
                this.numberSet = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
                break;
            case 'mini4':
                this.boardSize = 4;
                this.boxSize = 2;
                this.maxNumber = 4;
                this.numberSet = ['1', '2', '3', '4'];
                break;
            case 'mini6':
                this.boardSize = 6;
                this.boxSize = 2;
                this.maxNumber = 6;
                this.numberSet = ['1', '2', '3', '4', '5', '6'];
                break;
            case 'giant':
                this.boardSize = 16;
                this.boxSize = 4;
                this.maxNumber = 16;
                this.numberSet = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
                break;
        }
    }

    createBoard() {
        const board = document.getElementById('sudokuBoard');
        board.innerHTML = '';
        board.className = `sudoku-board ${this.sudokuType}`;
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', () => this.selectCell(cell, i, j));
                board.appendChild(cell);
            }
        }
    }

    createNumberPad() {
        const numberPad = document.getElementById('numberPad');
        numberPad.innerHTML = '';
        
        // Create number buttons
        const numberButtons = document.createElement('div');
        numberButtons.className = `number-buttons ${this.sudokuType}`;
        
        this.numberSet.forEach(number => {
            const btn = document.createElement('button');
            btn.className = 'num-btn';
            btn.dataset.number = number;
            btn.textContent = number;
            btn.addEventListener('click', () => this.inputNumber(number));
            numberButtons.appendChild(btn);
        });
        
        // Create action buttons
        const actionButtons = document.createElement('div');
        actionButtons.className = 'action-buttons';
        
        const eraserBtn = document.createElement('button');
        eraserBtn.id = 'eraserBtn';
        eraserBtn.className = 'btn';
        eraserBtn.textContent = 'Eraser';
        eraserBtn.addEventListener('click', () => this.clearCell());
        
        const submitBtn = document.createElement('button');
        submitBtn.id = 'submitBtn';
        submitBtn.className = 'btn';
        submitBtn.textContent = 'Submit Answer';
        submitBtn.addEventListener('click', () => this.submitAnswer());
        
        actionButtons.appendChild(eraserBtn);
        actionButtons.appendChild(submitBtn);
        
        numberPad.appendChild(numberButtons);
        numberPad.appendChild(actionButtons);
    }

    selectCell(cell, row, col) {
        // Clear previous selection
        document.querySelectorAll('.cell').forEach(c => c.classList.remove('selected'));
        
        // Select new cell
        cell.classList.add('selected');
        this.selectedCell = { element: cell, row, col };
        
        // Highlight related cells
        this.highlightRelatedCells(row, col);
    }

    highlightRelatedCells(row, col) {
        // Clear previous highlights
        document.querySelectorAll('.cell').forEach(c => {
            c.classList.remove('highlight');
        });

        // Highlight same row, column, and box
        for (let i = 0; i < this.boardSize; i++) {
            // Same row
            const sameRow = document.querySelector(`[data-row="${row}"][data-col="${i}"]`);
            if (sameRow && !sameRow.classList.contains('selected')) {
                sameRow.classList.add('highlight');
            }
            
            // Same column
            const sameCol = document.querySelector(`[data-row="${i}"][data-col="${col}"]`);
            if (sameCol && !sameCol.classList.contains('selected')) {
                sameCol.classList.add('highlight');
            }
        }

        // Same box
        const boxRow = Math.floor(row / this.boxSize) * this.boxSize;
        const boxCol = Math.floor(col / this.boxSize) * this.boxSize;
        for (let i = boxRow; i < boxRow + this.boxSize; i++) {
            for (let j = boxCol; j < boxCol + this.boxSize; j++) {
                const boxCell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                if (boxCell && !boxCell.classList.contains('selected')) {
                    boxCell.classList.add('highlight');
                }
            }
        }
    }

    generateNewGame() {
        this.board = this.generateSudoku();
        this.solution = this.solveSudoku([...this.board]);
        this.removeNumbersForDifficulty();
        this.displayBoard();
        this.startTimer();
    }

    generateSudoku() {
        // Generate complete sudoku solution
        const board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
        
        // Fill first row
        for (let i = 0; i < this.boardSize; i++) {
            board[0][i] = this.numberSet[i];
        }
        
        // Randomly shuffle first row
        for (let i = this.boardSize - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [board[0][i], board[0][j]] = [board[0][j], board[0][i]];
        }
        
        // Use backtracking algorithm to fill remaining parts
        this.solveSudoku(board);
        return board;
    }

    solveSudoku(board) {
        const findEmpty = () => {
            for (let row = 0; row < this.boardSize; row++) {
                for (let col = 0; col < this.boardSize; col++) {
                    if (board[row][col] === 0) {
                        return [row, col];
                    }
                }
            }
            return null;
        };

        const isValid = (row, col, num) => {
            // Check row
            for (let x = 0; x < this.boardSize; x++) {
                if (board[row][x] === num) return false;
            }
            
            // Check column
            for (let x = 0; x < this.boardSize; x++) {
                if (board[x][col] === num) return false;
            }
            
            // Check box
            const startRow = Math.floor(row / this.boxSize) * this.boxSize;
            const startCol = Math.floor(col / this.boxSize) * this.boxSize;
            for (let i = 0; i < this.boxSize; i++) {
                for (let j = 0; j < this.boxSize; j++) {
                    if (board[i + startRow][j + startCol] === num) return false;
                }
            }
            
            return true;
        };

        const solve = () => {
            const empty = findEmpty();
            if (!empty) return true;
            
            const [row, col] = empty;
            
            for (const num of this.numberSet) {
                if (isValid(row, col, num)) {
                    board[row][col] = num;
                    
                    if (solve()) return true;
                    
                    board[row][col] = 0;
                }
            }
            
            return false;
        };

        solve();
        return board;
    }

    removeNumbersForDifficulty() {
        const difficultySettings = {
            easy: Math.floor(this.boardSize * this.boardSize * 0.5),    // Keep 50% of numbers
            medium: Math.floor(this.boardSize * this.boardSize * 0.35),  // Keep 35% of numbers
            hard: Math.floor(this.boardSize * this.boardSize * 0.25)     // Keep 25% of numbers
        };
        
        const cellsToRemove = this.boardSize * this.boardSize - difficultySettings[this.difficulty];
        const positions = [];
        
        // Generate all positions
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                positions.push([i, j]);
            }
        }
        
        // Randomly remove numbers
        for (let i = 0; i < cellsToRemove; i++) {
            const randomIndex = Math.floor(Math.random() * positions.length);
            const [row, col] = positions.splice(randomIndex, 1)[0];
            this.board[row][col] = 0;
        }
    }

    displayBoard() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                const value = this.board[i][j];
                
                cell.textContent = value || '';
                cell.classList.remove('initial', 'conflict');
                
                if (value !== 0) {
                    cell.classList.add('initial');
                }
            }
        }
    }

    startTimer() {
        this.startTime = Date.now();
        this.gameStarted = true;
        this.timerInterval = setInterval(() => {
            if (!this.isPaused) {
                this.updateTimer();
            }
        }, 1000);
    }

    updateTimer() {
        if (!this.startTime) return;
        
        const elapsed = this.isPaused ? this.pausedTime : Date.now() - this.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        document.getElementById('time').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    pauseGame() {
        if (this.isPaused) {
            // Resume game
            this.isPaused = false;
            this.startTime = Date.now() - this.pausedTime;
            document.getElementById('pauseBtn').textContent = 'Pause';
        } else {
            // Pause game
            this.isPaused = true;
            this.pausedTime = Date.now() - this.startTime;
            document.getElementById('pauseBtn').textContent = 'Resume';
        }
    }

    inputNumber(number) {
        if (!this.selectedCell) return;
        
        const { row, col } = this.selectedCell;
        
        // Check if it's an initial number
        if (this.board[row][col] !== 0) return;
        
        // Check conflicts
        const conflicts = this.checkConflicts(row, col, number);
        
        // Update board
        this.board[row][col] = number;
        this.selectedCell.element.textContent = number;
        this.selectedCell.element.classList.remove('conflict');
        
        // Highlight conflicts if any
        if (conflicts.length > 0) {
            this.selectedCell.element.classList.add('conflict');
            conflicts.forEach(([r, c]) => {
                const cell = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                if (cell) cell.classList.add('conflict');
            });
        }
    }

    checkConflicts(row, col, number) {
        const conflicts = [];
        
        // Check row
        for (let i = 0; i < this.boardSize; i++) {
            if (i !== col && this.board[row][i] === number) {
                conflicts.push([row, i]);
            }
        }
        
        // Check column
        for (let i = 0; i < this.boardSize; i++) {
            if (i !== row && this.board[i][col] === number) {
                conflicts.push([i, col]);
            }
        }
        
        // Check box
        const boxRow = Math.floor(row / this.boxSize) * this.boxSize;
        const boxCol = Math.floor(col / this.boxSize) * this.boxSize;
        for (let i = boxRow; i < boxRow + this.boxSize; i++) {
            for (let j = boxCol; j < boxCol + this.boxSize; j++) {
                if ((i !== row || j !== col) && this.board[i][j] === number) {
                    conflicts.push([i, j]);
                }
            }
        }
        
        return conflicts;
    }

    clearCell() {
        if (!this.selectedCell) return;
        
        const { row, col } = this.selectedCell;
        
        // Check if it's an initial number
        if (this.board[row][col] !== 0) return;
        
        this.board[row][col] = 0;
        this.selectedCell.element.textContent = '';
        this.selectedCell.element.classList.remove('conflict');
    }

    submitAnswer() {
        // Check if all cells are filled
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === 0) {
                    this.showMessage('Please complete the sudoku first!', 'error');
                    return;
                }
            }
        }
        
        // Validate answer
        if (this.isValidSolution()) {
            const timeElapsed = this.isPaused ? this.pausedTime : Date.now() - this.startTime;
            const minutes = Math.floor(timeElapsed / 60000);
            const seconds = Math.floor((timeElapsed % 60000) / 1000);
            
            this.showMessage(
                `Congratulations! Challenge completed!\nTime: ${minutes}:${seconds.toString().padStart(2, '0')}`,
                'success'
            );
            this.stopTimer();
        } else {
            this.showMessage('Incorrect answer! Please check again.', 'error');
        }
    }

    isValidSolution() {
        // Check rows
        for (let row = 0; row < this.boardSize; row++) {
            const seen = new Set();
            for (let col = 0; col < this.boardSize; col++) {
                if (seen.has(this.board[row][col])) return false;
                seen.add(this.board[row][col]);
            }
        }
        
        // Check columns
        for (let col = 0; col < this.boardSize; col++) {
            const seen = new Set();
            for (let row = 0; row < this.boardSize; row++) {
                if (seen.has(this.board[row][col])) return false;
                seen.add(this.board[row][col]);
            }
        }
        
        // Check boxes
        for (let boxRow = 0; boxRow < this.boardSize; boxRow += this.boxSize) {
            for (let boxCol = 0; boxCol < this.boardSize; boxCol += this.boxSize) {
                const seen = new Set();
                for (let i = 0; i < this.boxSize; i++) {
                    for (let j = 0; j < this.boxSize; j++) {
                        const num = this.board[boxRow + i][boxCol + j];
                        if (seen.has(num)) return false;
                        seen.add(num);
                    }
                }
            }
        }
        
        return true;
    }

    showMessage(text, type) {
        const message = document.getElementById('message');
        message.innerHTML = `
            <h3>${type === 'success' ? '🎉 Success' : '❌ Error'}</h3>
            <p>${text}</p>
            <button onclick="this.parentElement.classList.add('hidden')">OK</button>
        `;
        message.className = `message ${type}`;
        message.classList.remove('hidden');
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    bindEvents() {
        // Pause button
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pauseGame();
        });

        // New game button
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.stopTimer();
            this.updateSudokuType();
            this.createBoard();
            this.createNumberPad();
            this.generateNewGame();
        });

        // Sudoku type selector
        document.getElementById('sudokuType').addEventListener('change', (e) => {
            this.sudokuType = e.target.value;
            this.updateSudokuType();
            this.createBoard();
            this.createNumberPad();
            this.generateNewGame();
        });

        // Difficulty selector
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
        });

        // Keyboard input
        document.addEventListener('keydown', (e) => {
            if (!this.selectedCell) return;
            
            if (this.numberSet.includes(e.key)) {
                this.inputNumber(e.key);
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                this.clearCell();
            }
        });
    }
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    new MultiSudokuGame();
}); 