var app = require('express')();
var server = require('http').createServer(app);
// http server를 socket.io server로 upgrade한다
var io = require('socket.io')(server);
var mysql = require('mysql');
var db_config = require('./config/database.js');
var connection = mysql.createConnection(db_config);

// localhost:3000으로 서버에 접속하면 클라이언트로 index.html을 전송한다
app.get('/', function(req, res) {
  res.sendFile(__dirname +'/room_list.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('room_list', () => {
    let sql =`SELECT * FROM waiting_room;`;
    connection.query(sql, function(error, result, fields) {
      if (error) {
            console.log(error);
      }else {
            io.emit('room_list', result);
            // io.to(socket.id).emit('room_list', result); 개인에게 데이터 전송
      }
    });
  });

  socket.on('disconnect', () => {
  console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('Connected at 3000');
});
