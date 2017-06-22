const express = require("express");
const mustacheExpress = require("mustache-express");
const bodyParser = require("body-parser");
const session = require("express-session");
const sessionConfig = require("./sessionConfig");
const checkAuth = require("./middleware/checkAuth.js"); // END

const app = express();
const port = process.env.PORT || 8080;

var users = [];

// MUSTACHE
app.engine("mustache", mustacheExpress());
app.set("views", "./public");
app.set("view engine", "mustache");

// MIDDLEWARE
app.use("/", express.static("./public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session(sessionConfig));

// ROUTES
app.get("/", function(req, res) {
  console.log("session", req.session);
  res.render("index");
});

app.get("/signup", function(req, res) {
  res.render("signup");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.post("/login", function(req, res) {
  if (!req.body || !req.body.username || !req.body.password) {
    // no data at login
    return res.redirect("/login");
  }

  var requestingUser = req.body;
  var userRecord;

  users.forEach(function(item) {
    console.log(item);
    if (item.username === requestingUser.username) {
      userRecord = item;
    }
  });

  if (!userRecord) {
    return res.redirect("/login"); // user not found
  }

  if (requestingUser.password === userRecord.password) {
    req.session.user = userRecord;
    return res.redirect("/profile");
  } else {
    return res.redirect("/login");
  }
});

app.get("/profile", checkAuth, function(req, res) {
  res.render("profile", { user: req.session.user });
});

app.get("/logout", function(req, res) {
  req.session.destroy();
});

app.post("/users", function(req, res) {
  if (!req.body || !req.body.username || !req.body.password) {
    return res.redirect("/");
  }

  var newUser = {
    username: req.body.username,
    password: req.body.password
  };

  users.push(newUser);
  console.log("users: ", users);
  return res.redirect("login");
});

// LISTEN
app.listen(port, function() {
  console.log("Server is running on port", port);
});
