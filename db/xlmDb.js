var mongoose = require( 'mongoose' );
var Schema   = mongoose.Schema;

var Transaction = new Schema(
    {
        "hash" : {type: String, index:{unique: true}},
        "blockNumber" : Number,
        "from" : String,
        "to" : String,
        "value" : Number,
        "fee" : Number
    }, {collection: "Transaction"});


mongoose.model('Transaction', Transaction);
module.exports.Transaction = mongoose.model('Transaction');


mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/xlmDB');