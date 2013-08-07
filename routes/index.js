
/*
 * GET home page.
 */

var models = require('../models');

exports.index = function(req, res){
  models.Shwasted.findOne({name:"Shwasted"}).populate('_orders.order').exec(function (err, user){    
    var now = new Date();
    var yesterday = now;
    yesterday.setDate(now.getDate()-1);
    models.Shwasted.findOne({name:"Shwasted"}).populate('_orders.order').where('_orders.time').gt(yesterday).exec(function (err, recent){
      if (user._orders){
        var TopAllTime = topOrders(user._orders);
      } else {
        var TopAllTime = [];
      }
      if (recent) {
        var TopTonight = topOrders(recent._orders);
      } else {
        var TopTonight = [];
      }
      console.log(TopTonight);
      console.log("Sorted Orders", TopAllTime);
      models.Drink.find().exec(function (err, drinks){
        if (TopTonight.length >= 3) {
          models.Drink.find({$or: [ {name: TopTonight[0][0]}, {name: TopTonight[1][0]}, {name: TopTonight[2][0]}]}).exec(function (err, topTonight){
            models.Drink.find({$or: [ {name: TopAllTime[0][0]}, {name: TopAllTime[1][0]}, {name: TopAllTime[2][0]}]}).exec(function (err, topDrinks){
              res.render('index', { title: 'Shwastinator', me:req.session.user, drinks:drinks, topDrinks:topDrinks, topTonight:topTonight});
            });
          });
        } else {
          if (TopAllTime.length >= 3) {
            models.Drink.find({$or: [ {name: TopAllTime[0][0]}, {name: TopAllTime[1][0]}, {name: TopAllTime[2][0]}]}).exec(function (err, topDrinks){
              res.render('index', { title: 'Shwastinator', me:req.session.user, drinks:drinks, topDrinks:topDrinks});
            });
          } else {
            res.render('index', {title: 'Shwastinator', me:req.session.user, drinks:drinks});            
          }
        }
      });
    });
  });
};

function topOrders(_orders) {
  if (_orders){

    var hist = {};
    for (var i=0; i<_orders.length; i++){
      if(!hist[_orders[i].order.name]){
        hist[_orders[i].order.name]=1;
      }
      else
        hist[_orders[i].order.name]= hist[_orders[i].order.name]+1;
    }
    console.log(hist);
    var sortable = [];
    for (var drink in hist)
      sortable.push([drink, hist[drink]])
    sortable.sort(function(a, b) {return b[1] - a[1]})
    return sortable;    
  }
  else 
    return false;
}

exports.queue = function(req, res) {
  models.Shwasted.findOne({name:"Shwasted"}).populate('_queue.drink _queue.user').exec(function (err, shwasted) {
    res.render('queue',{title: 'Shwastinator', me: req.session.user, shwasted: shwasted});
  });
}