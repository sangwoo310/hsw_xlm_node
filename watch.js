require('./db/xlmDb');

const StellarSdk = require('stellar-sdk');
const mongoose = require('mongoose');
const transaction = mongoose.model('Transaction');

StellarSdk.Network.useTestNetwork();

const server = new StellarSdk.Server('http://127.0.0.1:8000', {allowHttp: true});

const receiverPublicKey = 'GC7KEMSROLNXCSL24NYYSOXB36XTE6P3HGAGI5CMQCO6TZOVP36TQFCF'; // planbit 지갑주소들어가야함

const lastCursor=0; // or load where you left off

const txHandler = function (txResponse) {
    var amount = StellarSdk.xdr.TransactionEnvelope.fromXDR(txResponse.envelope_xdr, 'base64')._attributes.tx._attributes.operations[0]._attributes.body._value._attributes.amount;

    var tx = {
        txId : txResponse.hash,
        blockNumber : Number(txResponse.source_account_sequence),
        from : txResponse.source_account,
        to : receiverPublicKey,
        amt : (amount.low)*(10**-7),
        fee : (txResponse.fee_paid)*(10**-7)
    }

    transaction.collection.insert(tx).then( docs => {
        console.log(docs);
    }).catch( e => {
        console.log(e);
    })

};

const es = server.transactions()
    .forAccount(receiverPublicKey)
    .cursor('now')
//.cursor(lastCursor)
    .stream({
        onmessage: txHandler
    });

console.log("*** stellar lumens watch start ***");
