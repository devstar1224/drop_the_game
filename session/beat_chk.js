let commandFile = require('../app.js');
let moment = require('moment');

exports.run = (req, io, connection) => {
    io.once('connection', (socket) => {
            login_conn(req, connection)
        socket.once('disconnect', () => {
            logout_disconn(req, connection);
        });
    });
}

async function login_conn(req, connection){
    let sql = `UPDATE ACCOUNT_INFO SET USER_JOIN = 1 WHERE ID = ?`;
    connection.query(sql, req.user.id, function(error, result, fields) { // 로깅은 oauth 때 로깅을 하고 여기 호출됨.
        if (error) {
            console.log(error);
        }else {
            // console.log('An user Login!');
        }
    });
}

async function logout_disconn(req, connection){
    let sql = `UPDATE ACCOUNT_INFO SET USER_JOIN = 0 WHERE ID = ?`
    connection.query(sql, req.user.id, function(error, result, fields) {
        if (error) {
            console.log(error);
        }
    });
}