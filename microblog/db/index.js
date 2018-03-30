var mongoose = require('mongoose');
var settings = require('../settings');
var ObjectId = mongoose.Schema.Types.ObjectId;

mongoose.connect(settings.dbUrl,{useMongoClient:true});
var db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error:'));
db.once('open',function () {
    console.log('we are connected');
})

mongoose.model('User',new mongoose.Schema({
    username:{type:String,require:true},
    email:{type:String,require:true},
    password:{type:String,require:true},
    avatar:{type:String,require:true},
}));
mongoose.model('Article',new mongoose.Schema({
    title:{type:String,require:true},
    content:{type:String,require:true},
    img:{type:String},
    createAt:{type:Date,default:Date.now()},
    author:{type:ObjectId,ref:'User'},
}));

global.Modle = function (type) {
    return mongoose.model(type);
}