let board = document.querySelector('.board');
let mask = document.querySelector('.mask');
let gameRestartMask = document.querySelector('.game-restart-mask');
let startBtn = document.querySelector('.start-btn');
let restartBtn = document.querySelector('.restart-btn');

let highScoreElement = document.querySelector('#high-score');
let scoreElement = document.querySelector('#score');
let timerElement = document.querySelector('#time');

let blockWidth = 70;
let blockHeight = 70;

let highScore = localStorage.getItem('highScore') || 0;
highScoreElement.innerText = highScore;
let score = 0;

let time = '00:00';
let timeInterval = 0;

let rows = Math.floor(board.clientHeight / blockHeight);
let cols = Math.floor(board.clientWidth / blockWidth);

let intervalID = null;
let timerIntervalID = null;

let food = {
    x: Math.floor(Math.random() * rows),
    y: Math.floor(Math.random() * cols),
};

let blocks = [];
let snake = [{ x: 1, y: 7 }];

let direction = 'down';

for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        let block = document.createElement('div');
        block.className = 'block';
        board.appendChild(block);
        // block.innerText = `${row}-${col}`;
        blocks[`${row}-${col}`] = block;
        /* we can do the above line but the length of array remain 0 because index can only be number and here we
        are using string a index which is gonna save into array but when we try to find length it only look up
        numeric indices which is not there  */
    }
}

function render() {
    // compute head
    let head = null;
    if (direction == 'left') {
        head = { x: snake[0].x, y: snake[0].y - 1 };
    } else if (direction == 'right') {
        head = { x: snake[0].x, y: snake[0].y + 1 };
    } else if (direction == 'up') {
        head = { x: snake[0].x - 1, y: snake[0].y };
    } else if (direction == 'down') {
        head = { x: snake[0].x + 1, y: snake[0].y };
    }

    // game over logic
    if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
        clearInterval(intervalID);
        mask.style.display = 'none';
        gameRestartMask.style.display = 'flex';

        clearInterval(timerIntervalID);

        return;
    }

    // mark food visually (optional)
    blocks[`${food.x}-${food.y}`].classList.add('food');
    blocks[`${food.x}-${food.y}`].innerHTML = '<img src="frog.gif" alt="">';

    // clear current snake visual
    snake.forEach((segment) => {
        blocks[`${segment.x}-${segment.y}`].classList.remove('fill');
        blocks[`${segment.x}-${segment.y}`].style.backgroundImage = 'none';
    });

    // food getting logic
    if (head.x == food.x && head.y == food.y) {
        score += 10;
        scoreElement.innerText = score;

        if (score > highScore) {
            highScore = score;
            highScoreElement.innerText = highScore;
            localStorage.setItem('highScore', highScore.toString());
        }

        blocks[`${food.x}-${food.y}`].classList.remove('food');
        blocks[`${food.x}-${food.y}`].innerHTML = '';

        // food = generateNewFoodPosition();
        // food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) };
        // snake.forEach((segment) => {
        //     if (segment.x !== food.x && segment.y !== food.y) {
        //         food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) };
        //     } else {
        //         food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) };
        //     }
        // });
        blocks[`${snake[0].x}-${snake[0].y}`].style.backgroundImage = 'none';
        snake.unshift(head);

        food = generateNewFoodPosition();
        blocks[`${food.x}-${food.y}`].classList.add('food');
        blocks[`${food.x}-${food.y}`].innerHTML = '<img src="frog.gif" alt="">';

        // blocks[`${snake[0].x}-${snake[0].y}`].style.backgroundImage = 'none';
        // snake.unshift(head);
    } else {
        blocks[`${snake[0].x}-${snake[0].y}`].style.backgroundImage = 'none';
        snake.unshift(head);
        snake.pop();
    }

    // mark snake visually
    snake.forEach((segment) => {
        blocks[`${segment.x}-${segment.y}`].classList.add('fill');
        blocks[`${segment.x}-${segment.y}`].style.backgroundImage = 'url(snakeBody.png)';
    });
    blocks[`${snake[0].x}-${snake[0].y}`].style.backgroundImage = 'url(snakeHead.png)';

    // check self collision
    let headPosition = snake[0];
    for (let idx = 1; idx < snake.length; idx++) {
        if (headPosition.x == snake[idx].x && headPosition.y == snake[idx].y) {
            clearInterval(intervalID);
            mask.style.display = 'none';
            gameRestartMask.style.display = 'flex';
        }
    }
}

function generateNewFoodPosition() {
    let newFood;
    let overlapsWithSnake; // true if it overlaps, false otherwise

    do {
        // Generate a random coordinate
        newFood = {
            x: Math.floor(Math.random() * rows),
            y: Math.floor(Math.random() * cols),
        };

        // Check if this newFood position overlaps with any snake segment
        overlapsWithSnake = snake.some((segment) => {
            return segment.x === newFood.x && segment.y === newFood.y;
        });
    } while (overlapsWithSnake); // Keep looping if it overlaps

    return newFood;
}

render();

startBtn.addEventListener('click', startGame);

function startGame() {
    mask.style.display = 'none';
    intervalID = setInterval(() => {
        render();
    }, 300);
    timeFormatter();
}

restartBtn.addEventListener('click', restartGame);

function restartGame() {
    blocks[`${snake[0].x}-${snake[0].y}`].style.backgroundImage = 'none';
    blocks[`${food.x}-${food.y}`].innerHTML = '';

    snake.forEach((segment) => {
        blocks[`${segment.x}-${segment.y}`].classList.remove('fill');
        blocks[`${segment.x}-${segment.y}`].style.backgroundImage = 'none';
    });
    blocks[`${food.x}-${food.y}`].classList.remove('food');

    timeInterval = 0;
    timeFormatter();
    timerElement.innerText = time;

    score = 0;
    scoreElement.innerText = score;

    direction = 'right';
    gameRestartMask.style.display = 'none';
    snake = [{ x: 1, y: 7 }];
    food = { x: Math.floor(Math.random() * rows), y: Math.floor(Math.random() * cols) };
    intervalID = setInterval(() => {
        render();
    }, 300);
}

addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        currentDirection = 'left';
    } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        currentDirection = 'right';
    } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        currentDirection = 'up';
    } else if ((e.code = 'ArrowDown' || e.code === 'KeyS')) {
        currentDirection = 'down';
    }

    const oppositeDirections = {
        left: 'right',
        right: 'left',
        up: 'down',
        down: 'up',
    };

    // prevent snake from moving in the opposite direction directly
    if (currentDirection === oppositeDirections[direction]) {
        clearInterval(intervalID);
        mask.style.display = 'none';
        gameRestartMask.style.display = 'flex';

        clearInterval(timerIntervalID);

        return;
    }
    direction = currentDirection;
});

function timeFormatter() {
    timerIntervalID = setInterval(() => {
        timeInterval++;
        const min = Math.floor(timeInterval / 60)
            .toString()
            .padStart(2, '0');
        const sec = Math.floor(timeInterval % 60)
            .toString()
            .padStart(2, '0');
        let time = `${min}:${sec}`;
        timerElement.innerText = time;
    }, 1000);
}
