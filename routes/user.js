
/*
 * GET users listing.
 */
var models = require("../models.js");
var bcrypt = require('bcrypt');


exports.profile = function(req, res){
  models.User.findOne({name: req.session.user.name}).populate('_orders').exec(function (err, me){
    var sortedOrders = topOrders(me._orders);
    if(sortedOrders.length>=3){
      models.Drink.find({$or: [ {name: sortedOrders[0][0]}, {name: sortedOrders[1][0]}, {name: sortedOrders[2][0]}]}).exec(function (err, topDrinks){
        console.log(sortedOrders);
        res.render('profile', {title: me.name, me: me, topDrinks:topDrinks, messages: req.flash('info'), warnings: req.flash('warning'), successes: req.flash('success')});
      });
    } else{
      res.render('profile', {title: me.name, me: me, messages: req.flash('info'), warnings: req.flash('warning'), successes: req.flash('success')});
    }
      
  });
};

exports.signin = function(req, res){
    res.render('signin', {title: 'Shwastinator', messages: req.flash('info'), warnings: req.flash('warning'), successes: req.flash('success')});
}

exports.signup = function(req, res){
    res.render('signup', {title: 'Shwastinator', messages: req.flash('info'), warnings: req.flash('warning'), successes: req.flash('success')});
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

exports.orderDrink = function(req, res){
  console.log(req.body.drinkOrdered);
  models.Drink.findOne({name: req.body.drinkOrdered}, function (err, drink) {
    models.User.update({name:req.session.user.name},
      {$inc: {tab: drink.price}, $push: {_orders:drink}}).exec();
  });
  models.Drink.findOne({name: req.body.drinkOrdered}, function (err, drink) {
    models.User.update({name:"Shwasted"},
      {$inc: {tab: drink.price}, $push: {_orders:drink}}).exec();
  });
}

exports.allUsers = function(req, res){
  models.User.find({}).exec(function(err, users){
    res.render('allUsers', {title: 'All Users',  me: req.session.user, users:users, messages: req.flash('info'), warnings: req.flash('warning'), successes: req.flash('success')});
  })
}

exports.friendProfile = function(req, res){
  models.User.findOne({name: req.params.friend}).populate('_orders').exec(function (err, user){
    var sortedOrders = topOrders(user._orders)
    res.render('friendProfile', {title: user.name, me: req.session.user, friend: user, messages: req.flash('info'), warnings: req.flash('warning'), successes: req.flash('success')});
  });
};


function topOrders(_orders) {
    //takes name of liquid and pump number
  var hist = {};
  for (var i=0; i<_orders.length; i++){
    if(!hist[_orders[i].name]){
      hist[_orders[i].name]=1;
    }
    else
      hist[_orders[i].name]= hist[_orders[i].name]+1;
  }
  var sortable = [];
  for (var drink in hist)
    sortable.push([drink, hist[drink]])
  sortable.sort(function(a, b) {return b[1] - a[1]})
  return sortable;
}

exports.addGuest = function(req, res){
  res.render('addGuest', {title:'Add Guest', me:req.session.user, messages: req.flash('info'), warnings: req.flash('warning'), successes: req.flash('success')});
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