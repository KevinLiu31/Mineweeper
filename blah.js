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
        const randomIndex = Math.floor(Math.random() * (cells.length-3))+3;
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
}
