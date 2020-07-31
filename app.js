var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
var logger = require("morgan");
var passport = require("passport");
var app = express();
const cors = require("cors");
var session = require("express-session");
const termRouter = require("./routers/term");
var casLogin = require("./middleware/casLogin");

const students = require("./spoofData");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("super secret"));
var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "supersecret",
    resave: false,
    saveUninitialized: true,
  })
);

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
app.use(
  "/:term",
  function (req, res, next) {
    // Check to make sure student id exists on request
    if (req.query.dirid) {
      if (students.find((x) => x.dirid === req.query.dirid)) {
        next();
      } else {
        res.status(400).send("Student doesn't exist");
      }
    } else {
      console.log("missing student id");
      res.status(400).send("Missing student id");
    }
  },
  termRouter
);

module.exports = app;
