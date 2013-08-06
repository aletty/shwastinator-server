var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var userSchema = new Schema({
  name: {type: String, unique: true},
  password: {type: String, required: true},
  approved: Boolean,
  _orders: [{type: Schema.Types.ObjectId, ref: 'Drink', time: Date.now }],
  tab: Number,
  image: String,
  guest: [{type: Schema.Types.ObjectId, ref: 'User'}],
  admin: Boolean,
  isguest: Boolean
});

var User = mongoose.model('User', userSchema);

var shwastedSchema = new Schema({
  name: String,
  _orders: [{type: Schema.Types.ObjectId, ref: 'Drink', time: Date.now}],
  _queue: [{
    drink: {type: Schema.Types.ObjectId, ref: 'Drink'}, 
    user: {type: Schema.Types.ObjectId, ref: 'User'}
  }],
  tab: Number
});

var Shwasted = mongoose.model('Shwasted', shwastedSchema);

var drinkSchema = new Schema({
  _liquids: [{
    _liquid:{ type: Schema.Types.ObjectId, ref: 'Liquid' }, 
    units: Number}],
  name: {type: String, unique: true},
  cost: Number,
  price: Number,
  image: String,
  imageSmall: String
});

var Drink = mongoose.model('Drink', drinkSchema);

var liquidSchema = new Schema({
  name: {type: String, unique: true},
  type: String,
  alcoholic: Boolean,
  pump: {type: Number, default: 0} 
});

var Liquid = mongoose.model('Liquid', liquidSchema);

exports.Shwasted = Shwasted;
exports.User = User;
exports.Drink = Drink;
exports.Liquid = Liquid;