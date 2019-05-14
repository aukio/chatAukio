const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const socket = require('socket.io');
const Message = require("./models/Message");
const PrivMessage = require("./models/Pmessage");
var http = require('http');
var compression = require('compression');

const app = express();

// Passport config
require("./config/passport")(passport);

//DB Config
const db = require("./config/keys").MongoURI;

// Connect to Mongo
mongoose.connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err));

// EJS
app.use(expressLayouts);
app.set("view engine", "ejs");

app.use(express.static(__dirname + '/public'));
app.use(express.static('views'));
app.use('/', express.static('public_html'))


//Bodyparser
app.use(express.urlencoded({ extended: false }));

// Express Session
app.use(session({
  secret: 'hellomena',
  resave: true,
  saveUninitialized: true
}));

// Passprt middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global Vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});


// Routes
app.use("/", require("./routes/index"))
app.use("/users", require("./routes/users"));
app.use("/chat", require("./routes/chatIndex"));


app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
})
//Setup Connected user

const PORT = process.env.PORT || 7822;

const server = http.createServer(app).listen(80);

var io = socket(server);
const connectedUsers = [];

io.sockets.on("connection", (socket) => {


  /*<<<-----Function wich calculates all current connected users  (copy paste stuff)------>>>*/
  /*<<<--------------------------------------------------------------------------------->>>*/
  Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) size++;
    }
    return size;
  };

  /*<-When new user makes connection they emit event which holds username, this stores it to connected users array alongside with user's socket.id------>>>*/
  /*<<<--------------------------------------------------------------------------------->>>*/

  socket.on("newUserToServer", function (data) {

    var usr = connectedUsers.find(connectedUsers => connectedUsers.userID == socket.id);
    if (usr) {
      for (var i = 0; i < connectedUsers.length; i++) {
        if (connectedUsers[i] === usr) {
          connectedUsers.splice(i, 1);
        }
      }
    }
    else {
      connectedUsers.push({
        userName: data.userName,
        userID: socket.id,
        room: data.room
      });
    }
    socket.join(data.room)
    for (var i = 0; i < connectedUsers.length; i++) {
      console.log(" user " + connectedUsers[i].userName + " connected with this " + connectedUsers[i].userID + " id " + i + " on socket connection  " + socket.id);
    }

    var usersInCurrentRoom = []

    for (let i = 0; i < connectedUsers.length; i++ &&!usr) {
      if (connectedUsers[i].room == data.room) {
        var usr = usersInCurrentRoom.find(usersInCurrentRoom => usersInCurrentRoom.userName == data.userName);
        if (!usr) {
          usersInCurrentRoom.push(connectedUsers[i])
        }
      }
    }


    io.to(data.room).emit('UserListToClient',{
      connectedUsers: usersInCurrentRoom
    });
    io.to(data.room).emit('eventMessage',{
      eventMessage: data.userName + " joined room"
    });
  });




  /*<<<--handling someone's disconnecting, removing them from connected users list--->>>*/
  /*<-------------------------------------------------------------------------------->>>*/

  socket.on("disconnect", (reason) => {
    var usr = connectedUsers.find(connectedUsers => connectedUsers.userID == socket.id);
    if (usr) {
      for (var i = 0; i < connectedUsers.length; i++) {
        if (connectedUsers[i] === usr) {
          console.log("removed id " + connectedUsers[i].userID)
          connectedUsers.splice(i, 1);
        }
      }

      var usersInCurrentRoom = []
      for (let i = 0; i < connectedUsers.length; i++) {
        if (connectedUsers[i].room == usr.room) {
          usersInCurrentRoom.push(connectedUsers[i])
        }
      }
  
      io.to(usr.room).emit('UserListToClient',{
        connectedUsers: usersInCurrentRoom
      });
      /*
      io.to(usr.room).emit('eventMessage',{
        eventMessage: "disconnect"
      });
*/
    }

    
    console.log("disconnect emit: connected users size " + Object.size(connectedUsers) + " after " + socket.id + " disconnect for " + reason + " reason");
  });

  //testing if this reconnect ever launches
  socket.on("reconnect", function (data) {
    console.log("reconnected")
  });

  /*<<<---------Ilmoita konsolissa uusi viesti ja emittaa se muille------->>>*/

  socket.on('chatToServer', function (data) {
    io.to(data.roomToSend).emit('chat', data);

    var d = new Date();
    console.log(data.userName + " sended message " + data.message + " from room " + data.roomToSend + " at " +
      d.getHours() + ":" + d.getMinutes() + " " + d.getDate() + "." + (+1 + +d.getMonth()) + "." + d.getFullYear())

    const newMessage = new Message({
      name: data.userName,
      message: data.message,
      room: data.roomToSend,
      date: (getFormattedTime(d) + " " + d.getDate() + "." + (+1 + +d.getMonth()) + " " + d.getFullYear())
    });
    newMessage.save()
      .then(message => {
      })
      .catch(err => console.log(err));
  });

  /*<<<---Handles private messaging---->>>*/

  socket.on("whisperToServer", (data) => {
    var usr = connectedUsers.find(connectedUsers => connectedUsers.userName == data.userToSend);
    if (usr) {
      io.to(usr.userID).emit("whisperToUser", data);

      var d = new Date();
      console.log(data.userName + " sended message " + data.message + " To user " + data.userToSend + " at " +
        d.getHours() + ":" + d.getMinutes() + " " + d.getDate() + "." + (+1 + +d.getMonth()) + "." + d.getFullYear())
      const newPrivMessage = new PrivMessage({
        name: data.userName,
        SendedTo: data.userToSend,
        message: data.message,
        date: (getFormattedTime(d) + " " + d.getDate() + "." + (+1 + +d.getMonth()) + " " + d.getFullYear())
      });
      newPrivMessage.save()
        .then(message => {
        })
        .catch(err => console.log(err));


      io.to(socket.id).emit("whisperToUser", data);
    }
    else{
      io.to(socket.id).emit('eventMessage',{
        eventMessage: "cannot send private message, either username is wrong or person has left the server"
      });
    }
  })
});


String.prototype.paddingLeft = function (paddingValue) {
  return String(paddingValue + this).slice(-paddingValue.length);
};

String.prototype.format = function () {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function (match, number) {
    return typeof args[number] != 'undefined' ? args[number] : match;
  });
};

function getFormattedTime(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();

  hours = hours.toString().paddingLeft("00");
  minutes = minutes.toString().paddingLeft("00");

  return "{0}:{1}".format(hours, minutes);
};



app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});