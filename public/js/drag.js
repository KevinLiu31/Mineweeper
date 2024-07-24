// // script.js
// let isDragging = false;
// let startX, startY, scrollLeft, scrollTop;

// document.addEventListener('mousedown', (e) => {
//     isDragging = true;
//     startX = e.pageX - document.documentElement.scrollLeft;
//     startY = e.pageY - document.documentElement.scrollTop;
//     scrollLeft = document.documentElement.scrollLeft;
//     scrollTop = document.documentElement.scrollTop;
//     document.body.style.cursor = 'grabbing'; // Change cursor on drag
// });

// document.addEventListener('mouseleave', () => {
//     isDragging = false;
//     document.body.style.cursor = 'grab'; // Reset cursor
// });

// document.addEventListener('mouseup', () => {
//     isDragging = false;
//     document.body.style.cursor = 'grab'; // Reset cursor
// });

// document.addEventListener('mousemove', (e) => {
//     if (!isDragging) return;
//     e.preventDefault();
//     const x = e.pageX - document.documentElement.scrollLeft;
//     const y = e.pageY - document.documentElement.scrollTop;
//     const walkX = (x - startX) * 2; // Horizontal scroll speed
//     const walkY = (y - startY) * 2; // Vertical scroll speed
//     document.documentElement.scrollLeft = scrollLeft - walkX;
//     document.documentElement.scrollTop = scrollTop - walkY;
// });
const container = document.querySelector('.container');
const content = document.querySelector('.minesweeper');

let isDragging = false;
let startX, scrollLeft, scrollTop;

container.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - container.offsetLeft;
    startY = e.pageY - container.offsetTop;
    scrollLeft = container.scrollLeft;
    scrollTop = container.scrollTop;
    container.style.cursor = 'grabbing'; // Change cursor on drag
});

container.addEventListener('mouseleave', () => {
    isDragging = false;
    container.style.cursor = 'grab'; // Reset cursor
});

container.addEventListener('mouseup', () => {
    isDragging = false;
    container.style.cursor = 'grab'; // Reset cursor
});

container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const y = e.pageY - container.offsetTop;
    const walkX = (x - startX) * 2; // Scroll speed
    const walkY = (y - startY) * 2;
    container.scrollLeft = scrollLeft - walkX;
    container.scrollTop = scrollTop - walkY;
});