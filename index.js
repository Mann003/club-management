const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
var MongoDBStore = require("connect-mongodb-session")(session);
const http = require("http");
const cors = require('cors')

require('dotenv').config()

const User = require("./models/user");
const Pictures = require("./models/pictures")


const app = express();
const server = http.createServer(app);

const socketIO = require("socket.io");
const io = new socketIO.Server(server);

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("chat-sent", (data) => {
    console.log(data);

    socket.emit("sent-response");
    socket.broadcast.emit("update-chat", data);
  });
});

app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json({}));
app.use(flash());
const MONGO_URI =
  "mongodb+srv://lci2020015:gPR1OkYY28ZSvrcM@cluster0.9of41cg.mongodb.net/?";
var store = new MongoDBStore({
  uri: MONGO_URI,
  collection: "sessions",
});

const setLocale = (req, res, next) => {
  res.locals.isLogged = req.session.isLogged || false;
  next();
};

const isAuth = (req, res, next) => {
  if (req.session.isLogged) {
    next();
  }
  res.status(302).redirect("/login");
};

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: store,
  })
);

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    server.listen(process.env.PORT || 3000, () => {
      console.log(`Listening to port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("OH NO error");
  });
app.use(setLocale);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/profile", (req, res) => {
  res.render("profile", { user: req.session.user || "Guest" });
});

app.get("/gallery", (req, res) => {
  res.render("gallery");
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  const { password, cpassword, firstname, lastname, email } = req.body;

  User.findOne({ email: email }).then(async (user) => {
    if (user) {
      res.send("User already exists");
    }
    const epasswd = password;

    const newUser = new User({
      firstname,
      lastname,
      password: epasswd,
      email,
    });
    await newUser.save();
    req.session.isLogged = true;
    res.redirect("/login");
  });
});

app.post("/login", async (req, res) => {
  var email = req.body.email;
  var password = req.body.password;

  const database = await User.findOne({ email: email });
  // console.log(databaseno)

  if (!database) {
    res.send("NO USER FOUND");
  } else if (database.password != password) {
    res.send("INCORRECT PASSWORD");
  } else {
    req.session.isLogged = true;
    req.session.user = database;
    res.redirect("profile");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});
