var StellarSdk = require('stellar-sdk');
// StellarSdk.Network.usePublicNetwork();
StellarSdk.Network.useTestNetwork();
var server = new StellarSdk.Server('http://127.0.0.1:8000', {allowHttp: true});

//var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

//var keypair = StellarSdk.Keypair.random();
//console.log('Secret Key:', keypair.secret());
//console.log('Public Key:', keypair.publicKey()); //address
//Secret Key: SBGXEWN4K4VYONS4W3XOKC2ISEBZ2JVA3CJKUEFJIAJPU2MQ5QPBTAG3
//Public Key: GBXU4A6ZPWY6EGTBXPOO2JMZYI5FYD34KVQIEDN6FLHB2HKVTRP7NGKT



//Secret Key: SDUSENYCLQHQZC2YOUOHS5PXOQPKI74OOMEYLOIV5R35USNLAJMGCUJS
//Public Key: GC7KEMSROLNXCSL24NYYSOXB36XTE6P3HGAGI5CMQCO6TZOVP36TQFCF
var receiverPublicKey = 'GC7KEMSROLNXCSL24NYYSOXB36XTE6P3HGAGI5CMQCO6TZOVP36TQFCF';

var secretKey = 'SBGXEWN4K4VYONS4W3XOKC2ISEBZ2JVA3CJKUEFJIAJPU2MQ5QPBTAG3';
var keypair = StellarSdk.Keypair.fromSecret(secretKey);
var newKeypair = StellarSdk.Keypair.random(); // 신규 생성할 계정
server
    .loadAccount(keypair.publicKey())
    .then(function (account) {
      var transaction = new StellarSdk.TransactionBuilder(account)
        .addOperation(StellarSdk.Operation.createAccount({
          destination: receiverPublicKey,
          startingBalance: "1" // 최소 1 XLM 필요
        })).build();
      transaction.sign(keypair); // 트랜잭션 서명
      return server.submitTransaction(transaction); // 트랜잭션 전송
  })
  .then(function (transactionResult) {
    console.log('tx hash:', transactionResult.hash);
  });