var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var passport = require("passport");
var app = express();
var session = require("express-session");
var casLogin = require("./middleware/casLogin");
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("super secret"));

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "supersecret",
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/test", function (req, res) {
  res.send("Welcome to Passport with CAS!!! You are logged in.");
});

//var serverBaseURL = app.get('http') + app.get('host') + ':' + app.get('port')+'/';
//const serverBaseURL = 'https://shib.idm.umd.edu/shibboleth-idp/profile/cas/';
const serverBaseURL = "http://localhost:3000/";

// Configure CAS Authentication Strategy for Passport
const cas = new (require("passport-cas").Strategy)(
  {
    ssoBaseURL: "https://shib.idm.umd.edu/shibboleth-idp/profile/cas/",
    serverBaseURL,
    validate: "/serviceValidate",
  },
  function (user, cb) {
    // all we get from CAS validation is the directoryID, which is all we need
    if (user != null) {
      console.log("LOGIN SUCCESS ---> ", user);
      cb(null, user);
    } else {
      cb(null, false, { message: "cannot decode CAS response" });
    }
  }
);
passport.use(cas);

app.use("/cas_login", casLogin({ app: app }));

module.exports = app;
