var io = require('socket.io-client');

//Keely if it complains when you do localhost comment out the herokuapp line and uncomment the localhost

var socket = io.connect('http://shwastinator.herokuapp.com/pi');
// var socket = io.connect('http://localhost:3000/notify');

exports.pushQueue = function (drink) {
  //drink to add to the queue
  socket.emit('update queue', {drink: drink});
}