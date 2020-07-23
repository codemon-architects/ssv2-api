const passport = require("passport");

module.exports = function (options = {}) {
  const app = options.app;
  //const frontend = app.get('frontend');
  const frontend = "http://localhost:3000/test";
  const errorRedirectURL = `${frontend}?invalid`;
  //const { cookie: cookieParams } = app.get('authentication');
  const cookieParams = {
    enabled: true,
    name: "express-jwt",
    httpOnly: false,
    secure: false,
    maxAge: 86400000,
  };

  return function casLogin(req, res, next) {
    passport.authenticate("cas", function (err, user, info) {
      if (err) {
        // login error
        console.error(info);
        res.redirect(errorRedirectURL);
      }

      // user authenticated
      res.redirect(`${req.query.service}?dir=${user}`);
      //res.send("Logged in!")
      //return app.passport.createJWT({ userId: 'populateWithAUserId' }, app.get('authentication')).then(accessToken => {
      // have to do this manually for feathers-authentication-client to accept the jwt
      // default maxAge is 86400000 or 1 day in MS
      //console.log('will this get reached?')
      //res.cookie(cookieParams.name, accessToken, { maxAge: cookieParams.maxAge, httpOnly: !!cookieParams.httpOnly });
      //res.redirect(frontend);
      // });
    })(req, res, next);
  };
};
