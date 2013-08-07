var io = require('socket.io-client');

//Keely if it complains when you do localhost comment out the herokuapp line and uncomment the localhost

var socket = io.connect('http://shwastinator.herokuapp.com/notify');
// var socket = io.connect('http://localhost:3000/notify');

exports.push = function (user, message, type) {
  //user: name of user to notify normally req.session.user.name
  //message: what you want to tell user
  //type: either info, warning or success
  socket.emit('push', {name: user, notification: message, type: type});
}