
// console.log("x");
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('#minesweeper');
    const opp = document.querySelector('#opponent_progress');
    const prog = document.querySelector('#progress');
    const width = 25;
    const height = 25;
    let cell_width = 75/width;
    let temp_index = 0;
    let count = 0;
    let running = false;
    let cells = [];
    let mines = [];
    first_move = false;
    if(cell_width < 4){
        cell_width = 4;
    }
    // console.log("x");
    // if(cell_width <)
    document.documentElement.style.setProperty('--cell-width', `${cell_width}vw`);
    const mineCount = Math.floor((0.2)*(width)*(height));
    function init() {
        running = false;
        first_move = false;
        grid.innerHTML = '';
        opponent_total = 0;
        opp.innerHTML=`Opponent: ${opponent_total}/${width*height}`;
        cells = [];
        mines = [];
        flags = 0;
        revealed = 0;
        prog.innerHTML=`Progress: ${revealed+flags}/${width*height}`;
        // running = true;
        grid.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
        grid.style.gridTemplateRows = `repeat(${height}, 1fr)`;
        for (let i = 0; i < width * height; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('id', i);
            cell.addEventListener('click', clickCell);
            cell.addEventListener('contextmenu', flagCell);
            grid.appendChild(cell);
            cells.push(cell);
        }
        //mines
        // console.log("x");
        do{
            const randomIndex = Math.floor(Math.random() * cells.length);
            if (!mines.includes(randomIndex)) {
                if(mines.length < (mineCount)){
                    mines.push(randomIndex);
                }else{
                    temp_index = randomIndex;
                }
            }
            // console.log(mines.length);
        }while (mines.length < (mineCount));
        //number near mines
        for (let i = 0; i < cells.length; i++) {
            if (!mines.includes(i)) {
                let total = 0;
                const isLeftEdge = i % width === 0;
                const isRightEdge = i % width === width - 1;

                if (i > 0 && !isLeftEdge && mines.includes(i - 1)) total++;
                if (i > width - 1 && !isRightEdge && mines.includes(i + 1 - width)) total++;
                if (i > width && mines.includes(i - width)) total++;
                if (i > width + 1 && !isLeftEdge && mines.includes(i - 1 - width)) total++;
                if (i < width * height - 1 && !isRightEdge && mines.includes(i + 1)) total++;
                if (i < width * (height - 1) && !isLeftEdge && mines.includes(i - 1 + width)) total++;
                if (i < width * (height - 1) - 1 && !isRightEdge && mines.includes(i + 1 + width)) total++;
                if (i < width * (height - 1) && mines.includes(i + width)) total++;
                if (total > 0) {
                    cells[i].setAttribute('data', total);
                }
            }
        }

        // send data to server
        const cellData = cells.map(cell => ({
            id: cell.getAttribute('id'),
            data: cell.getAttribute('data') || null
        }));

        const initialData = { mines, cells: cellData };
        socket.emit('board', initialData); 
    }
    function clickCell(e) {
        if(running){
            const cell = e.target;
            const cellId = parseInt(cell.getAttribute('id'));
            if (cell.classList.contains('revealed')) return;
            if (cell.classList.contains('flag')) return;
            if (mines.includes(cellId)) {
                if(!(first_move)){
                    mines.splice(mines.indexOf(cellId));
                    mines.push(temp_index);
                    revealCell(cell);
                    if (cell.getAttribute('data') == null) {
                        // console.log("hi");
                        checkAdjacent(cellId);
                    }
                }else{
                gameOver(cell);
                }
            } else {
                revealCell(cell);
                // console.log(cell.getAttribute('data'));
                if (cell.getAttribute('data') == null) {
                    // console.log("hi");
                    checkAdjacent(cellId);
                }
            }
            const moveData = flags+revealed;
            socket.emit("onMove", moveData);
            console.log("sending data to opponent");
            if(!first_move){
                first_move=true;
            }
            prog.innerHTML=`Progress: ${revealed+flags}/${width*height}`;
        }
        //win();
    }
    function revealCell(cell) {
        if(running){
            if(!cell.classList.contains('revealed')){
            cell.classList.add('revealed');
            const data = cell.getAttribute('data');
            revealed++;
            if (data) {
                cell.innerText = data;
            } else {
                cell.innerText = '';
            }
            win();
         }
        }
    }

    // Check adjacent cells
    function checkAdjacent(cellId) {
        const isLeftEdge = cellId % width === 0;
        const isRightEdge = cellId % width === width - 1;

        setTimeout(() => {
            if (cellId > 0 && !isLeftEdge) clickCell({ target: cells[cellId - 1] });
            if (cellId > width - 1 && !isRightEdge) clickCell({ target: cells[cellId + 1 - width] });
            if (cellId > width) clickCell({ target: cells[cellId - width] });
            if (cellId > width + 1 && !isLeftEdge) clickCell({ target: cells[cellId - 1 - width] });
            if (cellId < width * height - 1 && !isRightEdge) clickCell({ target: cells[cellId + 1] });
            if (cellId < width * (height - 1) && !isLeftEdge) clickCell({ target: cells[cellId - 1 + width] });
            if (cellId < width * (height - 1) - 1 && !isRightEdge) clickCell({ target: cells[cellId + 1 + width] });
            if (cellId < width * (height - 1)) clickCell({ target: cells[cellId + width] });
        }, 10);
    }

    // Flag a cell
    function flagCell(e) {
            e.preventDefault();
            if(running){
            const cell = e.target;

            if (cell.classList.contains('revealed')) return;
            if (!cell.classList.contains('flag')) {
                cell.classList.add('flag');
                cell.innerText = '🚩';
                flags++;
                win();
            } else {
                cell.classList.remove('flag');
                cell.innerText = '';
                flags--;
            }
        }
        const moveData = flags+revealed;
        socket.emit("onMove", moveData);
        prog.innerHTML=revealed+flags;
    }

    // Game over
    function gameOver(cell) {
        cells.forEach(cell => {
            const cellId = parseInt(cell.getAttribute('id'));
            if (mines.includes(cellId)) {
                cell.classList.add('mine');
                cell.innerText = '💣';
            }
        });
        alert('Game Over');
        running = false;
    }
    function win(){
        if(flags===mineCount){
            if(revealed === (width*height-mineCount)){
                alert('WIN');
                var audio = new Audio("/success.mp3");
                audio.play();
                running = false;
            }
        }
    }
    let seconds = 0;
    let minutes = 0;
    let hours = 0;
    const secondsStr = seconds.toString().padStart(2, '0');
    const minutesStr = minutes.toString().padStart(2, '0');
    const hoursStr = hours.toString().padStart(2, '0');
    document.getElementById('time').textContent = `Timer: ${hoursStr}:${minutesStr}:${secondsStr}`;
    function updateTimer() {
        seconds++;
    
        if (seconds >= 60) {
            seconds = 0;
            minutes++;
        }
    
        if (minutes >= 60) {
            minutes = 0;
            hours++;
        }
    
        const secondsStr = seconds.toString().padStart(2, '0');
        const minutesStr = minutes.toString().padStart(2, '0');
        const hoursStr = hours.toString().padStart(2, '0');
        document.getElementById('time').textContent = `Timer: ${hoursStr}:${minutesStr}:${secondsStr}`;
        // console.log(running);
    } // Update the timer every second
    var loading = setInterval(()=>{
        document.querySelector("#front_layer").innerHTML=`Players: 1/2${".".repeat(count)}`;
        count%=3;
        count+=1;
    }, 500);
    init();
    socket.on('board', (initialData) =>{
        mines = initialData.mines;
        cells = [];
        grid.innerHTML = '';
        initialData.cells.forEach(cellData => {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('id', cellData.id);
            cell.addEventListener('click', clickCell);
            cell.addEventListener('contextmenu', flagCell);
            if (cellData.data) {
                cell.setAttribute('data', cellData.data);
                //comment this line to hide numbers
                cell.textContent = cellData.data;
            }
            grid.appendChild(cell);
            cells.push(cell);
        });
    });
    socket.on("onMove", (moveData)=>{
        console.log("recieved opponent data");
        opponent_total = moveData;
        opp.innerHTML=`Opponent: ${opponent_total}/${width*height}`;
    });
    socket.on("start", () => {
        console.log("starting");
        let x = 3;
        
        const updateFrontLayer = (value) => {
            document.querySelector("#front_layer").innerHTML = `${value}`;
            console.log("***********");
        };
    
        const countdown = () => {
            if (x > 0) {
                console.log(x);
                setTimeout(() => {
                    updateFrontLayer(x);
                    x--;
                    countdown();
                }, 1000);
            } else {
                setTimeout(() => {
                    updateFrontLayer('GO!');
                }, 500);
            }
        };
    
        countdown();
    
        clearInterval(loading);
        setInterval(updateTimer, 1000);
    
        running = true;
        console.log("t");
        document.querySelector("#front_layer").innerHTML = ``;
        console.log("tT");
        const frontLayer = document.getElementById("front_layer");
        // frontLayer.style.width = "0px";
        // frontLayer.style.height = "0px";
        // frontLayer.style.fontSize = "0px";
    });
});