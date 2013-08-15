
/*
 * GET home page.
 */

var models = require('../models');

exports.index = function(req, res){
  models.Shwasted.findOne({name:"Shwasted"}).populate('_orders.order').exec(function (err, user){    
    if (user._orders){
      var TopAllTime = topOrders(user._orders);
      var now = new Date();
      var yesterday = now;
      yesterday.setDate(now.getDate()-1);
      var recentOrders = [];
      for (var i=0; i<user._orders.length; i++){
        console.log(user._orders[i].time);
        if(user._orders[i].time>yesterday){
          recentOrders.push(user._orders[i]);
        }
      }
      if (recentOrders.length>0){
        var TopTonight = topOrders(recentOrders);
      } else {
        var TopTonight = [];
      }
    } else{
      var TopAllTime = [];
      var TopTonight = [];
    };
    console.log(TopTonight);
    console.log("Sorted Orders", TopAllTime);
    models.Drink.find().exec(function (err, drinks){
      if (TopTonight[0]) {
        var topTonight = [];
        models.Drink.findOne({name: TopTonight[0][0]}).exec(function (err, topTonight0){
          topTonight.push(topTonight0);
          if (TopTonight[1]){
            models.Drink.findOne({name: TopTonight[1][0]}).exec(function (err, topTonight1){
              topTonight.push(topTonight1);
              if (TopTonight[2]){
                models.Drink.findOne({name: TopTonight[2][0]}).exec(function (err, topTonight2){
                  topTonight.push(topTonight2);
                  TopDrinksOfAllTime(TopAllTime, res, req, drinks, topTonight);;
                });
              } else {
                TopDrinksOfAllTime(TopAllTime, res, req, drinks, topTonight);
              }
            });
          } else{
            TopDrinksOfAllTime(TopAllTime, res, req, drinks, topTonight);
          }
        });
      } else {
        if (TopAllTime) {
          TopDrinksOfAllTime(TopAllTime, res, req, drinks, topTonight);
        } else {
          res.render('index', { title: 'Shwastinator', me:req.session.user, drinks:drinks});             
        }
      }
    });
  });
};

function TopDrinksOfAllTime(TopAllTime, res, req, drinks, topTonight) {
  if (TopAllTime[0]){
    var topDrinks = []
    models.Drink.findOne({name: TopAllTime[0][0]}).exec(function (err, alltime0) {
      topDrinks.push(alltime0);
      if (TopAllTime[1]){
        models.Drink.findOne({name: TopAllTime[1][0]}).exec(function (err, alltime1) {
          topDrinks.push(alltime1);
          if (TopAllTime[2]){
            models.Drink.findOne({name: TopAllTime[2][0]}).exec(function (err, alltime2) {
              topDrinks.push(alltime2);
              if (topTonight) {
                res.render('index', { title: 'Shwastinator', me:req.session.user, drinks:drinks, topDrinks:topDrinks, topTonight:topTonight});
              } else {
                res.render('index', { title: 'Shwastinator', me:req.session.user, drinks:drinks, topDrinks:topDrinks});
              }
            });
          } else{
            if (topTonight) {
                res.render('index', { title: 'Shwastinator', me:req.session.user, drinks:drinks, topDrinks:topDrinks, topTonight:topTonight});
            } else {
              res.render('index', { title: 'Shwastinator', me:req.session.user, drinks:drinks, topDrinks:topDrinks});
            }
          }
        });
      } else{
        if (topTonight) {
          res.render('index', { title: 'Shwastinator', me:req.session.user, drinks:drinks, topDrinks:topDrinks, topTonight:topTonight});
        } else {
          res.render('index', { title: 'Shwastinator', me:req.session.user, drinks:drinks, topDrinks:topDrinks});
        }
      }
    });
  } else{
    res.render('index', {title: 'Shwastinator', me:req.session.user, drinks:drinks});
  }
}



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