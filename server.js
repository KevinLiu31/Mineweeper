const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const roomnum = new Map();
const socketRoomPair = new Map();
var board = null;
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/home', (req, res) => { 
  res.render('home');
});

app.get('/index', (req, res) => { 
  res.render('index', { layout: false });
});

app.get('/index/:roomID', (req, res) => { 
  const roomID = req.params.roomID;
  res.render('index', { layout: false, roomID: roomID });
});

server.listen(8001, () => {
  console.log("Server is running on port 8001");
});

io.on("connection", (socket) => {
  console.log("Socket connected: " + socket.id);
  
  socket.on('disconnect', () => {
    console.log("Socket disconnected: " + socket.id);
  });
});

const gameSpace = io.of('/index');
gameSpace.on('connection', (socket) => {
  console.log(`Socket connected2: ${socket.id}`);
  socket.on('joinRoom', (roomID) => {
    if(!roomnum.has(roomID)||roomnum.get(roomID) < 2){
    socket.join(roomID);
    const rooms = Array.from(socket.rooms);
    console.log(rooms);
    socketRoomPair.set(socket.id, roomID);
    console.log(`${socket.id} joined room ${roomID}`);
    if (!roomnum.has(roomID)) {
      roomnum.set(roomID, 0);
    }
    roomnum.set(roomID, roomnum.get(roomID) + 1);
    console.log(roomnum.get(roomID));
    socket.on('board', (data) => {
      if (roomnum.get(roomID) === 1) {
        board = data;
        // console.log("hi");
        // Handle the initial board setup or logic when the first player joins
        console.log(`Initial board received from ${socket.id} for room ${roomID}`);
        console.log(data);
        // Emit the board to other players in the room, if needed
      }else if(roomnum.get(roomID) === 2){
        console.log("starting");
        socket.nsp.to(roomID).emit("start");
      }
      console.log(roomID);
      console.log(socket.room);
      socket.emit('board',board);
      io.to(roomID).emit('board', board);
      console.log("board sent");
    });
  }else{
    socket.emit("roomFull");
  }
  socket.on("onMove", (data)=>{
    socket.to(roomID).emit("onMove", (data));
  });
  });
  socket.on('disconnect', () => {
    console.log(`Socket disconnected2: ${socket.id}`);
    // Decrease the count of clients in the room and handle room cleanup logic if needed
    const roomID = socketRoomPair.get(socket.id);
    roomnum.set(roomID, roomnum.get(roomID) - 1);
    console.log(`Client left room ${roomID}: ${socket.id}`);
    socketRoomPair.delete(socket.id);
    if(roomnum.get(roomID) === 0){
      roomnum.delete(roomID);
    }
    if(roomnum.get(roomID)==1){
      socket.emit("DC_end_game");
    }
    });
});