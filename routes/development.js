var models = require("../models.js");
var bcrypt = require('bcrypt');

exports.createUsers = function(req, res){
    // this is to populate the database for development
    var hashedk = bcrypt.hashSync("keely", 10);
    var hasheda = bcrypt.hashSync("arjun", 10);
    var hashedn = bcrypt.hashSync("notad", 10);
    var hashedu = bcrypt.hashSync("unapp", 10);
    var hashedsh = bcrypt.hashSync("shwasted", 10);
    var shwasted = new models.User({name: "Shwasted", password: hashedsh, approved: true, tab: 0, admin: false, _orders:[], isguest:false});
    shwasted.save(function(err){
        if (err) return ("error saving Shwasted", err);
        console.log('Shwasteds saved');
    });

    var keely = new models.User({name: "Keely", password: hashedk, approved: true, tab: 0, admin: true, _orders:[], isguest:false});
    var arjun = new models.User({name: "Arjun", password: hasheda, approved: true, tab: 0, admin: true, _orders:[], isguest:false});
    var notad = new models.User({name: "Notad", password: hashedn, approved: true, tab: 0, admin: false, _orders:[], isguest:false});
    var unapp = new models.User({name: "Unapp", password: hashedu, approved: false, tab: 0, admin: false, _orders:[], isguest:false});
    keely.save(function(err){
        if (err) return ("error saving Keely", err);
        console.log('Keely saved');
    });
    arjun.save(function(err){
        if (err) return ("error saving Arjun", err);
        console.log('Arjun saved');
    });
    notad.save(function(err){
        if (err) return ("error saving Notad", err);
        console.log('Notad saved');
    });
    unapp.save(function(err){
        if (err) return ("error saving Unapp", err);
        console.log('Unapp saved');
    });
    res.send("Users created");
}

exports.drinks = function(req, res){
    // Populate database with liquids and drinks
    var empty = new models.Liquid({name: "Empty", type: "nothing", alcoholic: false});
    empty.save(function(err){
        if (err) return ("error saving Empty", err);
        console.log('Empty saved');
    });
    var rum = new models.Liquid({name: "Rum", type: "Rum", alcoholic: true});
    rum.save(function(err){
        if (err) return ("error saving Rum", err);
        console.log('Rum saved');
    });
    var coke = new models.Liquid({name: "Coke", type: "Soda", alcoholic: false});
    coke.save(function(err){
        if (err) return ("error saving Coke", err);
        console.log('Coke saved');
    });
    var vodka = new models.Liquid({name: "Vodka", type: "Vodka", alcoholic: true});
    vodka.save(function(err){
        if (err) return ("error saving Vodka", err);
        console.log('Vodka saved');
    });
    var oj = new models.Liquid({name: "Orange Juice", type: "Juice", alcoholic: false});
    oj.save(function(err){
        if (err) return ("error saving Orange Juice", err);
        console.log('Orange Juice saved');
    });
    var gin = new models.Liquid({name: "Gin", type: "Gin", alcoholic: true});
    gin.save(function(err){
        if (err) return ("error saving Gin", err);
        console.log('Gin saved');
    });
    var gingerAle = new models.Liquid({name: "Ginger Ale", type: "Soda", alcoholic: true});
    gingerAle.save(function(err){
        if (err) return ("error saving Ginger Ale", err);
        console.log('Ginger Ale saved');
    });
    var gandga = new models.Drink({_liquids: [{_liquid:gin, units:1}, {_liquid:gingerAle, units:3}], name: "Gin and Ginger Ale", cost: 1.5, price: 3, image: "/images/ginandginger.jpg", imageSmall: '/images/ginandginger-small.jpg'});
    gandga.save(function(err){
        if (err) return ("error saving Gin and Ginger Ale", err);
        console.log('Gin and Ginger Ale saved');
    });
    var randc = new models.Drink({_liquids: [{_liquid:rum, units:1}, {_liquid:coke, units:3}], name: "Rum and Coke", cost: 1.5, price: 3, image: "/images/randc.jpg", imageSmall: '/images/randc-small.jpg'});
    randc.save(function(err){
        if (err) return ("error saving Rum and Coke", err);
        console.log('Rum and Coke saved');
    });
    var voj = new models.Drink({_liquids: [{_liquid:vodka, units:1}, {_liquid:oj, units:3}], name: "Screwdriver", cost: 2, price: 3, image: 'images/screwdriver.jpg', imageSmall: '/images/screwdriver-small.jpg'});
    voj.save(function(err){
        if (err) return ("error saving Vodka Orange Juice", err);
        console.log('Vodka Orange Juice saved');
    });

    res.send("Liquids and drinks populated");
}

exports.testFlash = function (req, res){
    req.flash('info', 'Flash works baby!');
    res.redirect('/');
}