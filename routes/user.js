
/*
 * GET users listing.
 */
var models = require("../models.js");
var bcrypt = require('bcrypt');
var notify = require('../utils/notify.js');

exports.profile = function(req, res){
  models.User.findOne({name: req.session.user.name}).populate('_orders.order').exec(function (err, me){
    console.log(me);
    var sortedOrders = topOrders(me._orders);
    if(sortedOrders.length>=3){
      models.Drink.find({$or: [ {name: sortedOrders[0][0]}, {name: sortedOrders[1][0]}, {name: sortedOrders[2][0]}]}).exec(function (err, topDrinks){
        console.log(sortedOrders);
        res.render('profile', {title: me.name, me: me, topDrinks:topDrinks});
      });
    } else {
      res.render('profile', {title: me.name, me: me});
    }
  });
};

exports.signin = function(req, res){
    res.render('signin', {title: 'Shwastinator'});
}

exports.signup = function(req, res){
    res.render('signup', {title: 'Shwastinator'});
}

exports.create = function(req, res){   
  var hashedPassword = bcrypt.hashSync(req.body.uncryptpass, 10);
  var new_user = new models.User({name: req.body.username, password: hashedPassword, approved: false, tab:0, admin:false, _orders:[], isguest:false});
  new_user.save(function(err){
    if (err) return console.log("error while saving new user" + req.body.username, err);
      req.session.user = new_user;
      res.send({redirect: '/'}); 
  });
}

exports.login = function(req,res){
  console.log("login");
  models.User.find({name: req.body.username}).exec(function(err, user){
    if (err) throw err;
    if (user.length == 0){
      res.send({verified: false});
    } else {
      console.log("user");
      var rightEnteredPassword = user[0].password;
      var success  = bcrypt.compareSync(req.body.uncryptpass, rightEnteredPassword);
      if (success) {
        req.session.user = user[0];
        res.send({redirect: '/'});
      } else {
        req.flash('warning', 'Username/password incorrect');
        res.send({redirect: '/signin'});
      }
    }
  });
}

exports.logout = function(req,res){
  delete req.session.user;
  res.redirect('/');
}

exports.orderDrink = function(req, res){
  models.User.findOne({name:req.session.user.name}).exec(function (err, user){
    if(user.approved){
      models.Drink.findOne({name: req.body.drinkOrdered}).populate('_liquids._liquid').exec(function (err, drink) {
        models.User.update({name:req.session.user.name}, {$inc: {tab: drink.price}, $push: {_orders:{order:drink, time:new Date()}}}, function (err, numAffected, raw) {
          if (err) {
            notify.push(req.session.user.name, err, 'warning');
          } else {
            notify.push(req.session.user.name, req.body.drinkOrdered + ' ordered', 'success');
          }
        });
        models.Shwasted.findOneAndUpdate({name:"Shwasted"}, {$inc: {tab: drink.price}, $push: {_orders:{order: drink, time:new Date()}, _queue:{drink: drink, user: user}}}).exec(function (err, shwasted) {
          if (shwasted._queue.length == 1) {
            pushQueue(drink, user);
          }
        });
      });
    }
    else{
      notify.push(req.session.user.name, "Not approved yet :( Find Keely or Arjun and ask them to approve you", 'warning');
    }
  })
}

exports.allUsers = function(req, res){
  models.User.find({}).exec(function(err, users){
    res.render('allUsers', {title: 'All Users',  me: req.session.user, users:users, });
  })
}

exports.friendProfile = function(req, res){
  models.User.findOne({name: req.params.friend}).populate('_orders').exec(function (err, user){
    var sortedOrders = topOrders(user._orders)
    if(sortedOrders.length>=3){
      models.Drink.find({$or: [ {name: sortedOrders[0][0]}, {name: sortedOrders[1][0]}, {name: sortedOrders[2][0]}]}).exec(function (err, topDrinks){
        console.log(sortedOrders);
        console.log(topOrders);
        res.render('friendProfile', {title: user.name, me: req.session.user, friend: user, topDrinks:topDrinks});
      });
    } else {
      res.render('friendProfile', {title: user.name, me: req.session.user, friend: user});
    }  
  });
};

function topOrders(_orders) {
    //takes name of liquid and pump number
  var hist = {};
  for (var i=0; i<_orders.length; i++){
    if(!hist[_orders[i].order.name]){
      hist[_orders[i].order.name]=1;
    }
    else
      hist[_orders[i].order.name]= hist[_orders[i].order.name]+1;
  }
  var sortable = [];
  for (var drink in hist)
    sortable.push([drink, hist[drink]])
  sortable.sort(function(a, b) {return b[1] - a[1]})
  return sortable;
}

exports.addGuest = function(req, res){
  res.render('addGuest', {title:'Add Guest', me:req.session.user, });
}

exports.newGuest = function(req, res){
  console.log(req.body);
  var hashedPassword = bcrypt.hashSync(req.body.uncryptpass, 10);
  var guest_user = new models.User({name: req.body.username, password: hashedPassword, approved: true, tab:0, admin:false, _orders:[], isguest: true});
  guest_user.save(function(err){
    if (err) return console.log("error while saving new user" + req.body.username, err);
  });
  models.User.update({name:req.session.user.name},
      {$push: {guest:guest_user}}).exec();
}

//queue management
var io = require('socket.io-client');
//Keely if it complains when on localhost comment out the herokuapp line and uncomment the localhost
// var socket = io.connect('http://shwastinator.herokuapp.com/pi');
var socket = io.connect('http://localhost:3000/pi');

function pushQueue(drink, user) {
  //drink to the queue
  socket.emit('update queue', {drink: drink, user: user});
}

socket.on('shift queue', function(){
  models.Shwasted.update({name:"Shwasted"}, {$pop: {_queue:-1}}).exec();
  models.Shwasted.findOne({name:"Shwasted"}).exec(function (err, shwasted) {
    if (shwasted._queue.length > 0){
      models.Drink.findById(shwasted._queue[0].drink).populate('_liquids._liquid').exec(function (err, drink) {
        pushQueue(drink, ' ');
      });      
    }
  });
});