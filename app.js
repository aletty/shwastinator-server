
/**
 * Module dependencies.
 */

var express = require('express')
var app = express();

var server = require('http').createServer(app)
  , io = require('socket.io').listen(server, {log: false})
  , routes = require('./routes')
  , user = require('./routes/user')
  , bcrypt = require('bcrypt')
  , index = require('./routes/index')
  , admin = require('./routes/admin')
  , http = require('http')
  , path = require('path')
  , dev = require('./routes/development')
  , mongoose = require('mongoose')
  , flash = require('connect-flash');

// all environments
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon(__dirname + "/public/images/favicon.png"));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(flash());
  app.use(express.static(__dirname + "/public"));
  app.use(app.router);

  var uristring =
    process.env.MONGODB_URI ||
    process.env.MONGOLAB_URI ||
    'mongodb://localhost/shwastinator';
  var mongoOptions = { db: { safe: true }};

  mongoose.connect(uristring, mongoOptions, function (err, res) {
    if (err) {
      console.log('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
      console.log('Succeeded connecting to:' + uristring + '.');
    }
  });
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

function checkLoggedIn() {
  return function(req, res, next) {
    if (!req.session.user){
      res.render('signinplease', {title: 'Sign In'});
    } else {
      next();
    };
  }
}

function checkAdmin() {
  return function(req, res, next) {
    if (!req.session.user.admin){
      res.render('signinplease', {title: 'Sign In'});
    } else {
      next();
    };
  }
}

app.get('/', checkLoggedIn(), routes.index);
app.get('/testFlash', checkLoggedIn(), dev.testFlash);
app.get('/signup', user.signup);
app.get('/signin', user.signin);
app.get('/profile',  checkLoggedIn(), user.profile);
app.post('/profilePic', checkLoggedIn(), user.profilePic);
app.get('/admin', checkAdmin(), admin.home);
app.post('/newUser', user.create);
app.get('/liquid', checkAdmin(), admin.liquid);
app.post('/addLiquid', checkAdmin(), admin.addLiquid);
app.get('/createUsers', dev.createUsers);
app.get('/drinks', dev.drinks);
app.post('/verify', user.login);
app.get('/logout', user.logout);
app.get('/createDrinks', checkAdmin(), admin.createDrinks);
app.post('/saveDrink', checkAdmin(), admin.saveDrink);
app.post('/saveSetup', checkAdmin(), admin.saveSetup);
app.get('/approveUsers', checkAdmin(), admin.approveUsers);
app.post('/approved', admin.approved);
app.post('/orderDrink', checkLoggedIn(), user.orderDrink);
app.get('/allUsers', checkLoggedIn(), user.allUsers);
app.get('/friendProfile/:friend', checkLoggedIn(), user.friendProfile);
app.get('/logPayment', checkAdmin(), admin.logPayment);
app.post('/credit', admin.credit);
app.get('/addGuest', checkLoggedIn(), user.addGuest);
app.post('/newGuest', checkLoggedIn(), user.newGuest);
app.get('/queue', checkLoggedIn(), index.queue);
app.get('/order', dev.addOrder);
app.post('/unapprove', admin.unapprove);
app.post('/clearQueue', admin.clearQueue);

server.listen(app.get('port'));

//heroku socket.io config settings
io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

//pi communication
io.of('/pi').on('connection', function (socket) {
  socket.on('update queue', function(data){
    socket.broadcast.emit('new drink', data);
    console.log('pushing');
    console.log(data);
  });

  socket.on('finish drink', function(){
    socket.broadcast.emit('shift queue');
  });
});

//real time notification logic
io.of('/notify').on('connection', function (socket) {
  socket.once('user', function(userData){
    socket.join(userData.name);
  });

  socket.on('push', function(data){
    socket.broadcast.to(data.name, data).emit('update', data);
  })
});