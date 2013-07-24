var models = require("../models.js");
var async = require("async");

exports.home = function(req, res) {
    console.log(req.session.user)
    models.Liquid.find().exec(function (err, liquids){
        res.render('admin', {title: 'Admin Page', 
            me: req.session.user, 
            liquids:liquids});        
    })
}

exports.liquid = function(req, res) {
    res.render('liquid', {title: 'Add a New Liquid', me: req.session.user});
}


exports.addLiquid = function(req, res){
    console.log("adding liquid object");
    console.log(req.body);
    var newliquid = new models.Liquid({name: req.body.liquid, type: req.body.drinkType, alcoholic: req.body.alcoholic});
    newliquid.save(function(err){
        if (err) return ("error saving liquid", err);
        console.log('liquid saved');
    });
    res.redirect("/admin");
};

exports.createDrinks = function(req, res) {
    models.Liquid.find().exec(function (err, liquids){
        res.render('createDrinks', {title: 'Create Drinks', me: req.session.user, liquids:liquids});        
    })
}

exports.saveDrink = function(req, res) {
  console.log('saving drink');
  var drink = new models.Drink({_liquids: [], name: req.body.newDrink.name, cost: parseFloat(req.body.newDrink.cost), price: parseFloat(req.body.newDrink.price), image: req.body.newDrink.image, imageSmall: req.body.newDrink.imageSmall});
  req.body.newDrink.ingredientList.forEach(function(ingredient, index, array) {
    models.Liquid.findOne({name: ingredient.name}).exec(function (err, liquid) {
      if (err) {
        console.log(err);
      } else {
        drink._liquids.push({_liquid: liquid, units: parseInt(ingredient.units)});
        if (drink._liquids.length == req.body.newDrink.ingredientList.length) {
          drink.save(function(err){
            if (err){
              console.log(err);
            } else {
              res.send({redirect: '/createDrinks'});
            }
          });
        }
      }
    });
  });
}

function updatePump(liquidName, pumpNumber) {
    //takes name of liquid and pump number
    models.Liquid.update({name: liquidName}, {$set: {pump: pumpNumber}}).exec();
}

exports.saveSetup = function(req, res){
    console.log('saving setup');
    models.Liquid.update({},{pump: 0},{multi: true}, function(err, numAffected, raw){
        if (err){
            console.log(err);
            return false;
        }
        updatePump(req.body.pump1, 1);
        updatePump(req.body.pump2, 2);
        updatePump(req.body.pump3, 3);
        updatePump(req.body.pump4, 4);
        updatePump(req.body.pump5, 5);
        updatePump(req.body.pump6, 6);
        updatePump(req.body.pump7, 7);
        updatePump(req.body.pump8, 8);
        updatePump(req.body.pump9, 9);
        updatePump(req.body.pump10, 10);
        updatePump(req.body.pump11, 11);
        updatePump(req.body.pump12, 12);
        updatePump(req.body.pump13, 13);
    });
}

exports.approveUsers = function(req, res){
    models.User.find({approved:false}).exec(function (err, users){
        res.render('ApproveUsers', {title: 'Approve Users', me: req.session.user, users:users});        
    })
}

exports.approved = function(req,res) {
    console.log(req.body);
    models.User.update({name:req.body.userToApp}, {approved:true}).exec(function (err, user){
        console.log(user);
    })
}

exports.logPayment = function(req, res) {
    models.User.find().exec(function(err, users){
        res.render('logPayment', {title: "Log Payment", me:req.session.user, users: users});
    });
}

exports.credit = function(req, res) {
    console.log(req.body);
    models.User.update({name:req.body.userToCredit}, {$inc: {tab: -req.body.amount}}, function callback (err, numAffected) {
  // numAffected is the number of updated documents
    })
}