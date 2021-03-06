var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);
var handlers = require('./request-handlers');
var socketHandlers = require('./socket-handlers');

// Middleware
var parser = require('body-parser');

var port = process.env.PORT || 3000;

// Set what we are listening on.
app.set("port", port);

// Logging and parsing
app.use(parser.json());

// Serve the client files
app.use(express.static(__dirname + "/../client"));

// If we are being run directly, run the server.
if (!module.parent) {
  http.listen(app.get("port"));
  console.log("Listening on", app.get("port"));
}

/*----------  Socket listeners  ----------*/

// When user navigates to website
io.on('connection', function (socket) {

  console.log("\nSOCKET " + socket.id, "connected.\n");
  console.log('This is the users object:\n', socketHandlers.users);

  // When user signs in: emitted from AppView
  socket.on('login', function (data) {

    console.log("\nSOCKET " + socket.id, "logged in.\n");

    ///////////////////
    // TEST USERNAME
    // var data = {username : "balls"};
    ////////////////////

    socketHandlers.loginUser(data, socket.id);

    ////////////////////////
    // TEST JOIN GAME FUNCTION - REMOVE THIS WHEN JOIN GAME BUTTON IS ADDED
    // var opponentId = socketHandlers.joinGameOrWait(socket.id);
    // // If an opponent is found
    // if (opponentId) {
    //   // Look up the usernames
    //   var playerName = socketHandlers.users[socket.id].username;
    //   var opponentName = socketHandlers.users[opponentId].username;
    //   // Emit match event to tell players to start game
    //   io.to(socket.id).emit('match', { opponentName : opponentName });
    //   io.to(opponentId).emit('match', { opponentName : playerName });
    //   console.log(playerName + " and " + opponentName +
    //     " now know they are matched");
    // }
    //////////

  });

  // When user wants to join a game
  socket.on('requestJoinGame', function(data) {
    var opponentId = socketHandlers.joinGameOrWait(socket.id);
    // If an opponent is found
    if (opponentId) {
      // Look up the usernames
      var playerName = socketHandlers.users[socket.id].username;
      var opponentName = socketHandlers.users[opponentId].username;
      // Emit match event to tell players to start game
      io.to(socket.id).emit('match', { opponentName : opponentName });
      io.to(opponentId).emit('match', { opponentName : playerName });
      console.log(playerName + " and " + opponentName +
        " now know they are matched");
    }
  });

  // When player updates server with score
  socket.on('update', function (data) {
    // Update the player's score
    socketHandlers.updateScore(socket.id, data);

    // Report user's score to the opponent
    var opponentId = socketHandlers.users[socket.id].opponent;
    io.to(opponentId).emit('update', data);

    // Check for end of game
    var result = socketHandlers.checkForEndGame(socket.id, opponentId);

    // Tell players of the results
    if (result) {
      io.to(result['winner']).emit('win');
      io.to(result['loser']).emit('lose');
    }
  });

  // On disconnect
  socket.on('disconnect', function () {
    if (socketHandlers.users[socket.id]) {
      var opponentId = socketHandlers.users[socket.id].opponent;
      // If user has an opponent, report that the opponent won
      if (opponentId) {
        io.to(opponentId).emit('win');
      }
      socketHandlers.removePlayer(socket.id, opponentId);
    }
    console.log("\nSOCKET " + socket.id, "disconnected.");
  });
});

/*----------  Routes  ----------*/

// request user data from database
app.use('/user', handlers.user);

// login user and create session
app.use('/login', handlers.login);

// register a new user to the databse
app.use('/register', handlers.register);

// serve passage to the client
app.use('/text', handlers.text);
