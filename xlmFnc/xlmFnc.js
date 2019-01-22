const StellarSdk = require('stellar-sdk');
const CONSTS = require('../const/commConsts');

StellarSdk.Network.usePublicNetwork();
//StellarSdk.Network.useTestNetwork();

var server = new StellarSdk.Server('http://127.0.0.1:8000', {allowHttp: true});
//var server = new StellarSdk.Server('https://horizon.stellar.org');

var sourceSecretKey = CONSTS.PLANBIT.ADDRESS

var sourceKeypair = StellarSdk.Keypair.fromSecret(sourceSecretKey);
var sourcePublicKey = sourceKeypair.publicKey();

var coreBalance = function() {
    return new Promise((resolve, reject) => {
        server.loadAccount(sourcePublicKey).then(account => {
            account.balances.forEach(balance => {
                resolve(balance.balance);
            });
        });
    });
}

module.exports = {
    getBalance : (addr) => {
        return new Promise((resolve, reject) => {
            if(addr == 'planbit'){
                address = 'GCSHZPQHIPIZRFNSXNGDQN2PISDU5OISEJPRKPGKVLD4BGO637CNJQSF'; //추가해야함
            } else {
                address = addr;
            }

            server.loadAccount(address).then(account => {
                account.balances.forEach(balance => {
                    resolve(balance.balance);
                });
            });
        })
    },

    signTransaction : (to, amt, tag) => {
        return new Promise(async (resolve, reject) => {
            var balanceCheck = await coreBalance();
            if(Number(amt) >= balanceCheck) {
                let errObj = {
                    "message" : "balance is not enough"
                }
                reject(errObj)
            } else {
                server.loadAccount(sourcePublicKey).then(account => {
                    var transaction = new StellarSdk.TransactionBuilder(account)
                    // Add a payment operation to the transaction
                    .addOperation(StellarSdk.Operation.payment({
                        destination: to,
                        // The term native asset refers to lumens
                        asset: StellarSdk.Asset.native(),
                        // Specify 350.1234567 lumens. Lumens are divisible to seven digits past
                        // the decimal. They are represented in JS Stellar SDK in string format
                        // to avoid errors from the use of the JavaScript Number data structure.
                        amount: amt.toString(),
                    }))
                    // Uncomment to add a memo (https://www.stellar.org/developers/learn/concepts/transactions.html)
                    .addMemo(StellarSdk.Memo.text(tag))
                    .build();

                    // Sign this transaction with the secret key
                    // NOTE: signing is transaction is network specific. Test network transactions
                    // won't work in the public network. To switch networks, use the Network object
                    // as explained above (look for StellarSdk.Network).
                    transaction.sign(sourceKeypair);

                    resolve(transaction);

                }).catch(e => {
                    // console.log("catch")
                    // console.error(e);
                    reject(e);
                });
            }
        });
    },

    rawTransaction : (tx) => {
        return new Promise((resolve, reject) => {
            server.submitTransaction(tx).then(transactionResult => {
                // console.log(JSON.stringify(transactionResult, null, 2));
                resolve(transactionResult.hash);
            }).catch(function(err) {
                reject(err)
            });
        });
    }
}