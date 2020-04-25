let grid = document.querySelector("#main-grid");
let scoreElem = document.getElementById('score');
let againPrompt = document.getElementById('play-again-prompt');
const width = 20;
const height= 10;
let prevKey = "d";
let currKey = "d";
let snakeHead = [5, 10];  //row 5, column 10, zero-based
let snakeLen = 6;
let headCell = document.getElementById('cell-5-10');
let rand;
let foodCell;
let gameOver = false;
let ranIntoItself = false;
let outOfBounds = false;
let waitingToRestart = false;

if (localStorage.highscore){
    highscore = parseInt(localStorage.highscore);  //Avoid "12"+1 = "121" kinds of errors
} else {
    highscore = 6;
    localStorage.setItem('highscore', highscore);
}

function drawGrid(){
    let html = "";
    for(i=0; i<height; i++){
        html += `<tr id="row-${i}">`;
        for(j=0; j<width; j++){
            html += `<td id="cell-${i}-${j}"> </td>`;
        }
        html += "</tr>";
    }
    
    grid.innerHTML = html;
}

function init(){
    document.querySelectorAll('td').forEach(cell => {
        cell.className = '';
    });
    snakeHead[0] = 5;
    snakeHead[1] = 10;
    currKey = "d";
    snakeLen = 6;
    headCell = document.getElementById('cell-5-10');
    scoreElem.innerText = `Current Score: ${snakeLen}          High Score: ${highscore}`;
    gameOver = false;
    ranIntoItself = false;
    outOfBounds = false;
    waitingToRestart = false;
    againPrompt.style.display = 'none';


    for(k=0; k<6; k++){
        cell = document.getElementById(`cell-5-${5+k}`);
        cell.classList.add('on', `live-${k+1}`);
    }
}


// a cell with class 'live-i' will stay on for i more steps
// we update the classes every stem to reflect this
function updateTail(){
    for(i=1; i<= snakeLen; i++){
        document.querySelectorAll(`.live-${i}`).forEach(item => {
            item.classList.remove(`live-${i}`);
            if(i>1){
                item.classList.add(`live-${i-1}`);
            } else {
                item.classList.remove('on');
            }
        });
    }
}

//if our snake eats food, all non-head cells have their lifespan extended 
//   (the head was already updated to live for the new snakeLen amount of time)
function elongate(){
    for(i=snakeLen-1; i>0; i--){
        document.querySelectorAll(`.live-${i}`).forEach(item => {
            item.classList.remove(`live-${i}`);
            item.classList.add(`live-${i+1}`);
        });
    }
}

function isGameOver(){
    outOfBounds = snakeHead[0]<0 || snakeHead[0] > height-1 || snakeHead[1]<0 ||  snakeHead[1]> width-1;

    //short-circuiting behaviour avoids errors in case we're out of bounds
    if (outOfBounds== false && document.getElementById(`cell-${snakeHead[0]}-${snakeHead[1]}`).classList.contains('on')){
        ranIntoItself = true;
    }

    return outOfBounds || ranIntoItself;
}

//draws pixelated game over message, unhides prompt to reset game
function gameOverGrid(){
    let textArray = [[1,2,3,4,6,7,8,10,14,16,17,18], 
                    [1,6,8,10,11,13,14,16],
                    [1, 3, 4, 6,7,8,10, 12, 14, 16, 17, 18],
                    [1,4,6,8,10,14,16],
                    [1,2,3,4,16,17,18],
                    [9,10,11,13,14],
                    [1,2,3,5,7,9,13,15],
                    [1,3,5,7,9,10,11,13,14],
                    [1,3,5,7,9,13,15],
                    [1,2,3,6,9,10,11,13,15]]
    
    for(i=0; i<=9; i++){
        for(j=0; j<=19; j++){
            if (textArray[i].includes(j)){
                document.getElementById(`cell-${i}-${j}`).classList.remove('gameOverRed');
            }
        }
    }

    againPrompt.style.display = 'inline';
}


// uses random number to pick random cell outside of snake
function genFood(){
    rand = Math.floor(width*height*Math.random());
    foodCell = document.getElementById(`cell-${Math.floor(rand/width)}-${rand % width}`);
    if (foodCell.classList.contains('on')){  // can't draw food inside the snake, so try again
        genFood();
    } else {
        foodCell.classList.add('food');
    }
}

function drawScreen(){
    updateTail();    // each "on" cell gets lifespan class updated

    if (currKey === "w"){
        snakeHead[0] -= 1;
    } else if (currKey === "a") {
        snakeHead[1] -= 1;
    } else if (currKey === "s"){
        snakeHead[0] += 1;
    } else if (currKey === "d"){
        snakeHead[1] += 1;
    }
    
    if (isGameOver()){
        document.querySelectorAll('td').forEach(cell =>{
            cell.className = '';
            cell.classList.add('gameOverRed');
        });
        gameOverGrid();  // draws game over message on screen, unhides prompt to reset game
        window.clearInterval(intervalID);  // stops calling the drawScreen function every quarter second
        waitingToRestart = true

    } else {
        headCell = document.getElementById(`cell-${snakeHead[0]}-${snakeHead[1]}`);
        headCell.classList.add('on', `live-${snakeLen}`);
        if (headCell.classList.contains('food')){
            headCell.classList.remove('food');
            snakeLen += 1;
            if (snakeLen > highscore){
                highscore += 1;
                localStorage.highscore = highscore;
            }
            scoreElem.innerText = `Current Score: ${snakeLen}          High Score: ${highscore}`;
            elongate();
            genFood();
        }
    }

    prevKey = currKey;
}



// Why are we checking that our current / previous key is not the opposite direction?
//  Because we don't want the snake head to go through the body, that seems silly
//      But if we're going right, and then hit up and then left really quickly (within 1/4 of a second),
//      then if we don't have the prevKey requirement below, we can accidently die from trying to quickly
//      queue valid movements, which isn't desirable behaviour
window.addEventListener('keydown', e => {
    if ((e.key === "w") || (e.key === "ArrowUp")){
        if(currKey !== "s" && prevKey !== "s"){
            currKey = "w";
        }
    } else if ((e.key === "a") || (e.key === "ArrowLeft")){
        if(currKey !== "d" && prevKey !== "d"){
            currKey = "a";
        }
    } else if ((e.key === "s") || (e.key === "ArrowDown")){
        if(currKey !== "w" && prevKey !== "w"){
            currKey = "s";
        }
    } else if ((e.key === "d") || (e.key === "ArrowRight")){
        if (currKey !== "a" && prevKey !== "a"){
            currKey = "d";
        }
    }

    // game over, waiting for user to hit any key to reset
    if (waitingToRestart){
        init();
        genFood();
        intervalID = window.setInterval(drawScreen, 250);
    }
});

drawGrid();
init();
genFood();
var intervalID = window.setInterval(drawScreen, 250);