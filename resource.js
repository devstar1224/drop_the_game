
exports.run = async (app) => {

  app.get('/img/lock.png', function(req, res) { //lock img load
    res.sendFile(__dirname +'/img/lock.png');
  });

  app.get('/img/naver_login.png', function(req, res) {
    res.sendFile(__dirname +'/img/naver_login.png');
  });

  app.get('/img/kakao_login.png', function(req, res) {
    res.sendFile(__dirname +'/img/kakao_login.png');
  });

  app.get('/img/login_page.jpg', function(req, res) {
    res.sendFile(__dirname +'/img/login_page.jpg');
  });

  app.get('/img/anonymous.png', function(req, res) {
    res.sendFile(__dirname +'/img/anonymous.png');
  });
}
