require('./db/xlmDb');

const StellarSdk = require('stellar-sdk');
const mongoose = require('mongoose');
const transaction = mongoose.model('Transaction');

StellarSdk.Network.usePublicNetwork();
//StellarSdk.Network.useTestNetwork();  //run testnet 

const server = new StellarSdk.Server('http://127.0.0.1:8000', {allowHttp: true});
//const server = new StellarSdk.Server('https://horizon.stellar.org');

const receiverPublicKey = 'GCSHZPQHIPIZRFNSXNGDQN2PISDU5OISEJPRKPGKVLD4BGO637CNJQSF'; // planbit 지갑주소들어가야함

const lastCursor=0; // or load where you left off

const txHandler = function (txResponse) {
    var amount = StellarSdk.xdr.TransactionEnvelope.fromXDR(txResponse.envelope_xdr, 'base64')._attributes.tx._attributes.operations[0]._attributes.body._value._attributes.amount;
    console.log('\n')
    //console.log(txResponse)
    console.log('\n')
    var tx = {
        hash : txResponse.hash,
        blockNumber : Number(txResponse.ledger_attr),
        from : txResponse.source_account,
        to : receiverPublicKey,
        value : (amount.low)*(10**-7),
        tag : txResponse.memo,
        fee : (txResponse.fee_paid)*(10**-7)
    }

    if(txResponse.source_account == receiverPublicKey) {
        return true;
    } else {
        transaction.collection.insert(tx).then( docs => {
            console.log(docs);
            return true;
        }).catch( e => {
            console.log(e);
            return true;
        });
    }

};

const es = server.transactions()
    .forAccount(receiverPublicKey)
    .cursor('now')
//  .cursor(lastCursor)
//  .cursor('any')
    .stream({
        onmessage: txHandler
    });

console.log("*** stellar lumens watch start ***");