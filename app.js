let app = require('express')();
let server = require('http').createServer(app);
let io = require('socket.io')(server);
let mysql = require('mysql');
let db_config = require('./config/database.js');
let connection = mysql.createConnection(db_config);
let moment = require('moment');

app.engine('html', require('ejs').renderFile); //엔진 ejs 형식에서 html 형식으로 변경
app.set('view engine', 'html');

app.get('/', function(req, res) {
  res.sendFile(__dirname +'/views/room/room_list.html');
});

app.get('/login', function(req, res) {

  commandFile = require('./session/naver_auth.js');
  commandFile.run(app, connection,  req.headers['x-forwarded-for'] || req.connection.remoteAddress); //네이버 로그인 준비

  commandFile = require('./session/kakao_auth.js');
  commandFile.run(app, connection,  req.headers['x-forwarded-for'] || req.connection.remoteAddress); //페북 로그인 준비

  res.sendFile(__dirname + '/views/login.html');
});

let commandFile = require('./resource.js');
commandFile.run(app);


io.on('connection', (socket) => {
  console.log('a user connected');

  socket.once('room_list', () => {
    let sql = `SELECT * FROM WAITING_ROOM;`;
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

exports.logging = (ID, IP, DATE, INFO) => {
  let sql = `INSERT INTO CONNECT_LOG(ID, RECENT_DATE, CONN_IP, ACCESS_INFO) VALUES (?, ?, ?, ?);`;
  connection.query(sql, [ID, DATE, IP, INFO], function(error, result, fields) {
    if (error) {
      console.log(error);
    }
  });
}

exports.info = (app) => {
  // WARNING: ※주위!! 보안정보 취급!! 출력값은 필요한것만! 신중하게 생각! 코드 수정시 SQL Injection 방지를 위해 sql PlaceHolder 반드시 사용.
  app.get('/user_info', ensureAuthenticated, function (req, res) {
        let sql = `SELECT EXP_INFO.EXP AS MAX_EXP, NICK, ID_INFO.* FROM ACCOUNT_INFO, ID_INFO, EXP_INFO WHERE ID_INFO.LV = EXP_INFO.LV AND ACCOUNT_INFO.ID = ID_INFO.ID AND ACCOUNT_INFO.ID = ?`;
        connection.query(sql, req.user.id, function(error, result, fields) {
          if (error) {
                console.log(error);
          }else {
             sql = `SELECT ID, NICK FROM ACCOUNT_INFO, FRIENDS_INFO WHERE ACCOUNT_INFO.USER_JOIN = 1 AND ACCOUNT_INFO.ID = FRIENDS_INFO.FRIEND_ID AND FRIENDS_INFO.MY_ID= ?`;
            connection.query(sql, req.user.id, function(error, friends_list_result, fields) {
              if (error) {
                    console.log(error);
              }else {
                let friends_len = friends_list_result.length;
                res.render('private_info/user_info', {
                   info: result, length: `${friends_len}`, friends : friends_list_result
                 });
              }
          });
        }
      });
    commandFile = require('./session/beat_chk.js');
    commandFile.run(req, io, connection); //사용자 온라인 자동체크
  });

  app.get('/playing', ensureAuthenticated, function(req, res){
          let sql = `SELECT ID, NICK FROM ACCOUNT_INFO, FRIENDS_INFO WHERE ACCOUNT_INFO.USER_JOIN = 1 AND ACCOUNT_INFO.ID = FRIENDS_INFO.FRIEND_ID AND FRIENDS_INFO.MY_ID= ?`; //온라인 유저 리스트 sql 수정 해야함.
          connection.query(sql, req.user.id, function(error, result, fields) {
          if (error) {
            console.log(error);
          }else {
            res.render('/userlist', { //html 기본 view 에서의 디렉토리
               on_users: result // on_users의 이름으로 객체전송
          }
        }
      });
    commandFile = require('./session/beat_chk.js');
    commandFile.run(req, io, connection); //사용자 온라인 자동체크
  });

  app.get('/logout', ensureAuthenticated, function(req, res){
    set_logout(req);
    req.logout();
    res.redirect('/');
  });
  
  function set_logout(req){
    let sql = `UPDATE ACCOUNT_INFO SET USER_JOIN = 0 WHERE ID = ?`
    connection.query(sql, req.user.id, function(error, result, fields) {
        if (error) {
            console.log(error);
        }
    });
  }

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login');
  }
}
