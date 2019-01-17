require('../db/xlmDb');

const fetch = require('node-fetch');
const mongoose = require('mongoose');
const transaction = mongoose.model('Transaction');

const fnXlm = require('../xlmFnc/xlmFnc');

function fnLogEvent(name, param, state, result) {
    var date = new Date();
    var log = {
        "function" : name,
        "time" : date.toString().substring(0, 24),
        "parameter" : param,
        "state" : state,
        "result" : {result},
    };
    console.log("%j", log);
}

function fnCommReturnValue(fnName, param, state, result, code) {
    let logMsg;
    if(state == "success") {
        result = result;
        message = null;
        logMsg = result;
    } else {
        result = null;
        message = result;
        logMsg = result;
    }

    var returnObj = {
        "result" : result,
        "code" : code,
        "message" : message
    }
    fnLogEvent(fnName, param, state, logMsg);
    return JSON.stringify(returnObj);
}

module.exports = function(app) {
    app.get('/test', (req, res) => {
        console.log("test come!!");
    });

    app.get('/getBalance/:addr', async (req, res) => {
        let addr = req.params.addr;
        
        let param = {
            "address" : addr
        };
        let state = "success";
        
        fnXlm.getBalance(addr).then( docs => {
            res.end(fnCommReturnValue('getBalance', param, state, docs, 0));
        }).catch(e => {
            state = "error";
            res.end(fnCommReturnValue('getBalance', param, state, e, 0));
        });
    });

    app.get('/getTransaction/:txId', (req, res) => {
        let txId = req.params.txId;
        let param = {
            "txId" : txId
        }
        
        transaction.find(param).lean(true).then( docs => {
            res.end(fnCommReturnValue('getTransaction', param, "success", JSON.stringify(docs[0]), 0));
        }).catch(e => {
            res.end(fnCommReturnValue('getTransaction', param, "error", e.message, -5));
        });
    });

    app.get('/feeCheck/:txId', (req, res) => {
        let txId = req.params.txId;
        let param = {
            "txId" : txId
        }
        
        transaction.find(param).lean(true).then( docs => {
            res.end(fnCommReturnValue('feeCheck', param, "success", docs[0].fee, 0));
        }).catch( e => {
            res.end(fnCommReturnValue('feeCheck', param, "error", e.message, -5));
        })
    });

    app.post('/sendTransaction', (req, res) => {
        let to = req.body.to;
        let amt = req.body.amt;
        let tag = req.body.tag;

        let param = {
            "to" : to,
            "amt" : amt,
            "tag" : tag
        }

        fnXlm.sendTransaction(to, amt, tag).then( docs => {
            res.end(fnCommReturnValue('sendTransaction', param, "success", docs, 0))
        }).catch( e => {
            let code;
            if(e.message == "destination is invalid") {
                code = -2;
            } else if(e.message == "balance is not enough") {
                code = -1;
            } else {
                code = -99;
            }
            res.end(fnCommReturnValue('sendTransaction', param, "error", e.message, code))
        });
    });
}