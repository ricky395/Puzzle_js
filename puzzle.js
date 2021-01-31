var KEY_ENTER = 13,
    KEY_LEFT = 37,
    KEY_UP = 38,
    KEY_RIGHT = 39,
    KEY_DOWN = 40,
    KEY_W = 87,
    KEY_A = 65,
    KEY_S = 83,
    KEY_D = 68,
    KEY_R = 82,
    KEY_ESC = 27,
    KEY_M = 77,
    mouseX = 0, mouseY = 0,
    screen = null,
    
    canvas = null,
    ctx = null,
    lastKeyPress = null,
    lastRelease,
    pressing = [],
    roundEnd = false,
    currentMap = 0,
    elapsed = 0,

    score,
    newRecord = false,
    maps = [],
    mapMinX, mapMaxX, mapMinY, mapMaxY,
    mapWidth, mapHeight,
    mapOffsetX, mapOffsetY,
    blockSize = 72,
    currentMap = null,
    currentMapIndex = 0,
    maxIndexReached = 0,
    lastValidPosition = null,
    goalPositionX = 999,
    goalPositionY = 999,
    movementsNo = 0,

    spritesheet = new Image(),
    puzleInfo = new Image(),
    bg = new Image(),

    tapBeepSnd = new Audio(),
    goalSnd = new Audio(),
    moveSnd = new Audio();

maps[0] = [ 
    [1, 2, 2, 2, 2, 3]
];

maps[1] = [
    [1, 0, 0, 0, 0, 3],
    [2, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 2],
    [2, 2, 2, 2, 2, 2]
];

maps[2] = [
    [0, 3, 0],
    [1, 2, 2],
    [2, 2, 2],
    [0, 2, 2]
];

maps[3] = [
    [2, 0, 2, 2, 2, 1],
    [2, 2, 2, 2, 0, 2],
    [2, 2, 2, 2, 2, 2],
    [0, 2, 2, 3, 2, 2],
    [2, 2, 2, 0, 0, 0]
];

maps[4] = [
    [0, 3, 0],
    [0, 5, 0],
    [1, 2, 2]
];

maps[5] = [
    [2, 2, 2],
    [2, 3, 2],
    [0, 1, 4]
];

maps[6] = [
    [0, 0, 3, 0, 0, 0],
    [2, 2, 2, 5, 2, 0],
    [0, 0, 0, 0, 2, 0],
    [5, 2, 2, 5, 2, 2],
    [0, 1, 0, 0, 0, 0]
];

maps[7] = [
    [0, 2, 2, 2, 2, 2, 0, 0, 3],
    [0, 2, 0, 0, 0, 2, 0, 0, 2],
    [2, 2, 2, 0, 2, 2, 2, 0, 2],
    [1, 2, 2, 0, 2, 2, 2, 2, 2],
    [4, 2, 2, 0, 4, 2, 2, 0, 0],
];

maps[8] = [
    [2, 2, 2],
    [2, 3, 2],
    [4, 1, 4]
];

maps[9] = [
    [2, 2, 2, 2, 2],
    [2, 2, 3, 2, 2],
    [2, 2, 2, 2, 4],
    [2, 2, 2, 0, 1]
];

function setMap() {
    var col = 0,
        row = 0,
        columns = 0,
        rows = 0;

    mapMinX = 999,
    mapMaxX = 0,
    mapMinY = 999,
    mapMaxY = 0;

    for (row = 0, rows = currentMap.length; row < rows; ++row) {
        for (col = 0, columns = currentMap[row].length; col < columns; ++col) {

            if (currentMap[row][col] === 1 || currentMap[row][col] === 2 || currentMap[row][col] === 4 || currentMap[row][col] === 5)
                checkMapDimensions(col, row);

            else if (currentMap[row][col] === 3) {
                checkMapDimensions(col, row);
                goalPositionX = col;
                goalPositionY = row;
            }
        }
    }
}

function checkMapDimensions(col, row) {

    if (mapMinX > col)
        mapMinX = col;

    if (mapMaxX < col)
        mapMaxX = col;

    if (mapMinY > row)
        mapMinY = row;

    if (mapMaxY < row)
        mapMaxY = row;

    mapWidth = mapMaxX - mapMinX;
    mapHeight = mapMaxY - mapMinY;
}

function initLevel() {

    // Copia de array
    currentMap = JSON.parse(JSON.stringify(maps[currentMapIndex]));
    setMap();

    mapOffsetX = canvas.width / 2 - mapWidth * blockSize / 2 - canvas.offsetLeft - blockSize / 2;
    mapOffsetY = canvas.height / 2 - mapHeight * blockSize / 2 - canvas.offsetTop - blockSize / 2;

    newRecord = false;
}

function reset() {
    roundEnd = false;
    lastKeyPress = null;
    movementsNo = 0;
    
    initLevel();
}

function checkVictory() {

    for (var i = 0, L = currentMap[i].length; i < L; ++i) {
        for (var j = 0, L2 = currentMap.length; j < L2; ++j) {

            // Condicion de victoria
            if (currentMap[j][i] === 1 && i === goalPositionX && j === goalPositionY){
                goalSnd.play();
                roundEnd = true;
            }
        }
    }
}

function nextLevel() {

    if (currentMapIndex < maps.length - 1)
        ++currentMapIndex;

    else screen = "menu";
}

function drawImg(xIndex, yIndex, xPos, yPos) {

    ctx.drawImage(spritesheet, blockSize * xIndex, blockSize * yIndex, 
        blockSize, blockSize, xPos, yPos, blockSize, blockSize);
}

function drawGoal(col, row) {

    if (col === goalPositionX && row === goalPositionY)
        drawImg(2, 0, mapOffsetX + col * blockSize, mapOffsetY + row * blockSize); 
}

function move(j, i, direction) {

    // Bloques movibles
    if (currentMap[j][i] === 1 || currentMap[j][i] === 4) {

        if (lastValidPosition !== null) {

            // Se cambian posiciones
            if (direction === "up" || direction === "down")
                currentMap[lastValidPosition][i] = currentMap[j][i];

            if (direction === "left" || direction === "right")           
                currentMap[j][lastValidPosition] = currentMap[j][i];

            // VacÃ­a las antiguas posiciones de los cuadrados
            currentMap[j][i] = 2;

            // Actualiza la Ãºltima posiciÃ³n vÃ¡lida
            if (direction === "up" && lastValidPosition + 1 < currentMap.length)
                ++lastValidPosition;

            else if (direction === "down" && lastValidPosition - 1 > 0)
                --lastValidPosition;

            else if (direction === "left" && lastValidPosition + 1 < currentMap[j].length)
                ++lastValidPosition;

            else if (direction === "right" && lastValidPosition - 1 > 0)
                --lastValidPosition;
        }
    }

    // PosiciÃ³n vÃ¡lida
    if (lastValidPosition == null && (currentMap[j][i] === 2 || currentMap[j][i] === 3)) {

        if (direction === "up" || direction === "down")
            lastValidPosition = j;

        if (direction === "left" || direction === "right")
            lastValidPosition = i;
    }

    // Resetea posiciÃ³n vÃ¡lida
    else if (currentMap[j][i] === 0 || currentMap[j][i] === 4 || currentMap[j][i] === 5 || currentMap[j][i] === 1)
        lastValidPosition = null;
}

function intersects() {

    var x = (mouseX - mapOffsetX) / blockSize;
    var y = (mouseY - mapOffsetY) / blockSize;

    if (x >= 0 && x <= mapWidth + 1 && y >= 0 && y <= mapHeight + 1){

        x = ~~x;
        y = ~~y;

        if (currentMap[y][x] == 4){

            currentMap[y][x] = 5;
            tapBeepSnd.play();
        }

        else if (currentMap[y][x] == 5){

            currentMap[y][x] = 4;
            tapBeepSnd.play();
        }
    }
}

function checkPress(posX, posY, width, height, action) {
    
    if (mouseX > posX && mouseX < posX + width && mouseY > posY && mouseY < posY + height)
    {
        tapBeepSnd.play();
        action();
    }
}

function tryToChangeMap(index) {

    if (index >= 0 && index < maxIndexReached + 1){

        currentMapIndex = index;
        initLevel();
    }
}

function arraysEqual(arr1, arr2) {

    for(var i = arr1.length - 1; i >= 0; --i) {
        for (var j = arr1[i].length - 1; j >= 0; --j) {
            if(arr1[i][j] !== arr2[i][j])
                return false;
        }
    }

    return true;
}

function paint(ctx) {

    // Clean canvas
    ctx.fillStyle = '#e5e1d0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (screen === "game")
    {
        // Nivel
        ctx.textBaseline = "middle";
        ctx.fillStyle = '#b2afa2';
        ctx.textAlign = 'right';
        ctx.font = "150px Verdana";
        ctx.fillText(currentMapIndex + 1, canvas.width - 10, 150 / 2);

        for (row = 0, rows = currentMap.length; row < rows; ++row) {
            for (col = 0, columns = currentMap[row].length; col < columns; ++col) {

                if (currentMap[row][col] === 2) //Suelo
                {
                    drawImg(1, 0, mapOffsetX + col * blockSize, mapOffsetY + row * blockSize);
                    drawGoal(col, row);
                }

                else if (currentMap[row][col] === 3) //Meta
                {
                    drawImg(1, 0, mapOffsetX + col * blockSize, mapOffsetY + row * blockSize);
                    drawImg(2, 0, mapOffsetX + col * blockSize, mapOffsetY + row * blockSize);
                }

                else if (currentMap[row][col] === 4) //Bloques
                {
                    drawImg(1, 0, mapOffsetX + col * blockSize, mapOffsetY + row * blockSize);
                    drawGoal(col, row);
                    drawImg(0, 1, mapOffsetX + col * blockSize, mapOffsetY + row * blockSize);
                }

                else if (currentMap[row][col] === 5) //Bloques inamovibles
                {
                    drawImg(1, 0, mapOffsetX + col * blockSize, mapOffsetY + row * blockSize);
                    drawImg(1, 1, mapOffsetX + col * blockSize, mapOffsetY + row * blockSize);
                }

                else if (currentMap[row][col] === 1) //Jugador
                {
                    drawImg(1, 0, mapOffsetX + col * blockSize, mapOffsetY + row * blockSize);
                    drawGoal(col, row);
                    drawImg(0, 0, mapOffsetX + col * blockSize, mapOffsetY + row * blockSize);
                }
            }
        }

        // Pintado de las flechas de cambio de nivel
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(270 * Math.PI/180);

        if (currentMapIndex === 0)
            ctx.globalAlpha = 0.3;
        else ctx.globalAlpha = 1;

        ctx.drawImage(spritesheet, 2 * blockSize + 1, blockSize, blockSize, 25, - blockSize / 2, - canvas.width / 2 + 10, blockSize, 25);
        ctx.rotate(180 * Math.PI/180);

        if (currentMapIndex >= maxIndexReached || currentMapIndex === maps.length - 1)
            ctx.globalAlpha = 0.3;
        else ctx.globalAlpha = 1;

        ctx.drawImage(spritesheet, 2 * blockSize + 1, blockSize, blockSize, 25, - blockSize / 2, - canvas.width / 2 + 10, blockSize, 25);
        ctx.restore();


        ctx.fillStyle = '#000';
        //ctx.fillText('Last Press: ' + lastKeyPress, 5, 20);
        
        ctx.textAlign = 'left';
        ctx.font = "15px Verdana";
        ctx.fillText("R:  reset", 10, canvas.height - 20);

        // Dibuja al final de la ronda
        if (roundEnd) {
            ctx.textAlign = 'center';
            ctx.font = "30px Verdana";
            ctx.fillText("Level completed!", canvas.width / 2, 40);

            ctx.fillStyle = '#111';
            ctx.font = "15px Verdana";
            ctx.fillText("Movements done: " + movementsNo, canvas.width / 2, 80);

            if (newRecord)
            {
                ctx.save();
                ctx.rotate(-12 * Math.PI/180);
                ctx.font = "30px Arial Black";
                ctx.fillText("New Record!", canvas.width / 2 - 130, canvas.height - 20);
                ctx.restore();
            }

            ctx.font = "12px Verdana";
            ctx.fillText("Press any key to continue", canvas.width / 2, canvas.height - 20);

            ctx.textAlign = 'left';
            ctx.font = "10px Verdana";
        }
    }

    else if (screen === "menu")
    {   
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.globalAlpha = 0.3;
        ctx.drawImage(bg, 0 + (~~(elapsed * 10) % 10) * 450, 0, 450, 450, canvas.width / 2 - 450 / 2, canvas.height / 2 - 180, 450, 450);
        ctx.globalAlpha = 1;

        ctx.fillStyle = '#db9341';
        ctx.font = "80px Impact";
        ctx.fillText("Swipe & Fit", canvas.width / 2, canvas.height / 2 - 220);

        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.font = "30px Verdana";
        ctx.fillText("Play!", canvas.width / 2, canvas.height / 2);
        ctx.fillText("Instructions", canvas.width / 2, canvas.height / 2 + 50);
        ctx.fillText("Best scores", canvas.width / 2, canvas.height / 2 + 100);
    }

    else if (screen === "info")
    {
        ctx.fillStyle = '#c4bfaa';
        ctx.fillRect(canvas.width / 2 - puzleInfo.width / 2 - 40, canvas.height / 2 - puzleInfo.height / 2 - 80, puzleInfo.width + 80, puzleInfo.height + 80);
        ctx.drawImage(puzleInfo, canvas.width / 2 - puzleInfo.width / 2, canvas.height / 2 - puzleInfo.height / 2 - 40);

        ctx.fillStyle = '#111';
        ctx.textAlign = 'center';
        ctx.font = "30px Verdana";
        ctx.fillText("Back to menu", canvas.width / 2, canvas.height - 40);
    }

    else if (screen === "score")
    {
        ctx.fillStyle = '#111';
        ctx.textAlign = 'center';
        ctx.font = "30px Verdana";
        ctx.fillText("Best scores", canvas.width / 2, 50);

        ctx.fillStyle = '#234177';
        ctx.font = "20px Verdana";
        ctx.textAlign = 'left';
        var initY = 100;

        // Tabla puntuaciones
        for (var i = 0, L = score.length; i < L; ++i) {

            if (score[i] !== ',' && typeof score[i] !== 'undefined' && score[i] !== null){
                var t = "move";
                if (score[i] > 1)
                    t += "s";

                ctx.fillText("Level " + (i + 1) + " ......... " + score[i] + " " + t, canvas.width / 2 - 110, initY + i * 30);
            }
        }

        ctx.textAlign = 'center';
        ctx.fillStyle = '#111';
        ctx.font = "30px Verdana";
        ctx.fillText("Back to menu", canvas.width / 2, canvas.height - 40);
    }
}

function act(deltaTime) {
    
    if (screen === "game")
    {
        lastValidPosition = null;

        if (!roundEnd)
        {
            // Resetea la escena
            if (lastKeyPress === KEY_R)
            {
                reset();
            }

            else if (lastKeyPress === KEY_ESC || lastKeyPress === KEY_M)
            {
                screen = "menu";
            }

            // Deteccion click
            else if (lastRelease === 1)
            {
                intersects();
            }

            // Comprueba movimientos hacia arriba
            else if (lastKeyPress === KEY_UP || lastKeyPress === KEY_W)
            {
                var auxMap = JSON.parse(JSON.stringify(currentMap));
                if (mapHeight + 1 > 1) {
                    for (var i = 0, L = currentMap[i].length; i < L; ++i) {
                        for (var j = 0, L2 = currentMap.length; j < L2; ++j) {

                            move(j, i, "up");
                        }
                        lastValidPosition = null;
                    }
                    if (!arraysEqual(auxMap, currentMap)){
                        moveSnd.play();
                        ++movementsNo;
                    }
                }
                checkVictory();
            }

            // Comprueba movimientos hacia la derecha
            else if (lastKeyPress === KEY_RIGHT || lastKeyPress === KEY_D)
            {
                var auxMap = JSON.parse(JSON.stringify(currentMap));
                if (mapWidth + 1 > 1) {
                    for (var j = 0, L = currentMap.length; j < L; ++j) {
                        for (var i = currentMap[j].length - 1; i >= 0; --i) {

                            move(j, i, "right");
                        }
                        lastValidPosition = null;
                    }
                    if (!arraysEqual(auxMap, currentMap)){
                        moveSnd.play();
                        ++movementsNo;
                    }
                }
                checkVictory();
            }

            // Comprueba movimientos hacia abajo
            else if (lastKeyPress === KEY_DOWN || lastKeyPress === KEY_S)
            {
                var auxMap = JSON.parse(JSON.stringify(currentMap));
                if (mapHeight + 1 > 1) {
                    for (var i = 0, L = currentMap[i].length; i < L; ++i) {
                        for (var j = currentMap.length - 1; j >= 0; --j) {

                            move(j, i, "down");
                        }
                        lastValidPosition = null;
                    }
                    if (!arraysEqual(auxMap, currentMap)){
                        moveSnd.play();
                        ++movementsNo;
                    }
                }
                checkVictory();
            }

            // Comprueba movimientos hacia la izquierda
            else if (lastKeyPress === KEY_LEFT || lastKeyPress === KEY_A)
            {
                var auxMap = JSON.parse(JSON.stringify(currentMap));
                if (mapWidth + 1 > 1) {
                    for (var j = 0, L = currentMap.length; j < L; ++j) {
                        for (var i = 0; i < currentMap[j].length; ++i) {

                            move(j, i, "left");
                        }
                        lastValidPosition = null;
                    }
                    if (!arraysEqual(auxMap, currentMap)){
                        moveSnd.play();
                        ++movementsNo;
                    }
                }
                checkVictory();
            }
        }
        

        // Al acabar un nivel...
        else
        {   
            if (typeof score[currentMapIndex] !== 'undefined'){

                    if (score[currentMapIndex] > movementsNo)
                        newRecord = true;
                    else newRecord = false;
            }

            if (lastKeyPress !== KEY_R && lastKeyPress >= 13 && lastKeyPress <= 90 || lastRelease === 1){
                
                // Comprobacion de mejores puntuaciones
                if (typeof score[currentMapIndex] !== 'undefined'){

                    if (score[currentMapIndex] > movementsNo)
                        score[currentMapIndex] = movementsNo;
                    else newRecord = false;
                }

                else score[currentMapIndex] = movementsNo;

                if (maxIndexReached < currentMapIndex + 1 && currentMapIndex + 1 < maps.length)
                    maxIndexReached = currentMapIndex + 1;

                if (maxIndexReached === null)
                    maxIndexReached = currentMapIndex;

                // Guardado local
                localStorage.setItem('score', JSON.stringify(score));
                localStorage.setItem('level', JSON.stringify(maxIndexReached));

                nextLevel();
                reset();
            }
        }    

        if (lastRelease === 1){

            checkPress(0, 0, 50, canvas.height, function() {tryToChangeMap(currentMapIndex - 1)} );
            checkPress(canvas.width - 50, 0, 50, canvas.height, function() {tryToChangeMap(currentMapIndex + 1)} );
        }    
    }

    else if (screen === "menu")
    {
        if (lastRelease === 1)
        {
            checkPress(canvas.width / 2 - 100, canvas.height / 2 - 25, 200, 35, function() {screen = "game"; initLevel();} );
            checkPress(canvas.width / 2 - 100, canvas.height / 2 + 20, 200, 60, function() {screen = "info"} );
            checkPress(canvas.width / 2 - 100, canvas.height / 2 + 70, 200, 60, function() {screen = "score"} );
        }
    }

    else if (screen === "info")
    {
        if (lastRelease === 1)
        {
            checkPress(canvas.width / 2 - 100, canvas.height - 70, 200, 60, function() {screen = "menu"} );
        }

        else if (lastKeyPress === KEY_ESC || lastKeyPress === KEY_M)
        {
            screen = "menu";
        }
    }

    else if (screen === "score")
    {
        if (lastRelease === 1)
        {
            checkPress(canvas.width / 2 - 100, canvas.height - 70, 200, 60, function() {screen = "menu"} );
        }

        else if (lastKeyPress === KEY_ESC || lastKeyPress === KEY_M)
        {
            screen = "menu";
        }
    }

    // Elapsed time
    elapsed += deltaTime;
    if (elapsed > 3600) {
        elapsed -= 3600;
    }

    lastRelease = null;
    lastKeyPress = null;
}

function repaint() {
    window.requestAnimationFrame(repaint);
    paint(ctx);
}

function run() {
    setTimeout(run, 50);
    act(0.05);
}

function init() {

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    
    spritesheet.src = 'images/puzzle_sprites.png';
    puzleInfo.src = 'images/puzzle_info.png';
    bg.src = 'images/bg.png';

    // Init audios
    tapBeepSnd.src = 'sound/tapBeep.wav';
    goalSnd.src = 'sound/goal.wav';
    moveSnd.src = 'sound/move.wav';

    // Se inicializa el controlador de escena
    screen = "menu";

    // Retrieve the object from storage
    var scoreItem = localStorage.getItem('score');
    var levelItem = localStorage.getItem('level');

    score = JSON.parse(scoreItem);
    maxIndexReached = JSON.parse(levelItem);

    if (score === null)
        score = new Array(maps.length);

    if (maxIndexReached !== null)
        currentMapIndex = maxIndexReached;

    run();
    repaint();
}

window.addEventListener('load', init, false);

document.addEventListener('keydown', function (evt) {
    lastKeyPress = evt.which;
}, false);

document.addEventListener('mouseup', function (evt) { 
    lastRelease = evt.which; 
}, false);

window.addEventListener('mousemove', function(evt){
    mouseX = evt.x - canvas.offsetLeft;
    mouseY = evt.y - canvas.offsetTop;
});