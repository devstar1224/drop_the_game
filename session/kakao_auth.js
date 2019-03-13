// WARNING: ※주위!! 보안정보 취급!! 출력값은 필요한것만! 신중하게 생각! 코드 수정시 SQL Injection 방지를 위해 sql PlaceHolder 반드시 사용.
exports.run = async (app, connection, ip) => {
  let moment = require('moment');
  let passport = require('passport');
  let KakaoStrategy = require('passport-kakao').Strategy
  let session = require('express-session');
  let helmet = require('helmet');
  let assert = require('assert');
  let login_api_config = require('../config/login_api.js')
  let session_secret = require('../config/session_conf.js');
  let MYSQLStore = require('express-mysql-session')(session);
  let session_store = new MYSQLStore(require('../config/database.js'));
  let commandFile = require('../app.js');

  passport.use('kakao', new KakaoStrategy({
    clientID : login_api_config.kakao.client_id,
    callbackURL : login_api_config.kakao.callback_url
    },
    function(accessToken, refreshToken, profile, done) {
      process.nextTick(function () {
        
        let sql = `SELECT COUNT(ID) AS ID FROM ACCOUNT_INFO WHERE ID= ? AND SIGN_UP_MEDIA ='kakao';`;
        connection.query(sql, profile._json.id, function(error, result, fields) {
          if (error) {
                console.log(error);
          }else {
            if (!result[0].ID){// 첫가입
              sql = `INSERT INTO ACCOUNT_INFO(ID, NICK, MAIL, IP, BAN, USER_JOIN, SIGN_UP_MEDIA, SIGN_UP_DATE) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
              connection.query(sql,[profile._json.id, profile._json.properties.nickname, profile._json.email, ip, 0, 0, "kakao", `${moment()}`] ,function(error, result, fields) {
                if (error) {
                  console.log(error);
                }else {
                  sql = `INSERT INTO ID_INFO(ID, LV, EXP, POINT, TOTAL, VICTORY, GRADE, PROFILE_PIC_PATH) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
                  connection.query(sql, [profile._json.id, 1, 0, 0, 0, 0, 0, profile._json.properties.profile_image], function(error, result, fields) {
                    if (error) {
                      console.log(error);
                    }
                  });
                }
              });
            }else{
              commandFile.logging(profile._json.id, ip, `${moment()}`, 'Login Success');
            }
          }
        });
        // console.log(profile);
        return done(null, profile);
    	});
    }
  ));

  app.use(session({
    secret : session_secret.secret,
    resave : true,
    saveUninitialized : true,
    cookie :{maxAge : 360000, httpOnly : true},
    store : session_store,
    rolling : true
  }));

  app.use(helmet.hsts({
    maxAge : 10886400000,
    includeSubdomains : true
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/auth/kakao',
  	passport.authenticate('kakao', null), function(req, res) {
      console.log('/auth/kakao failed, stopped');
  });

  app.get('/kakao_oauth',
    passport.authenticate('kakao', {
      failureRedirect: '#!/auth/login'
    }), function(req, res) {
        commandFile.info(app);
        res.redirect('/');
  });

  passport.serializeUser(function(user, done) {
  	done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
  	done(null, obj);
  });

}
