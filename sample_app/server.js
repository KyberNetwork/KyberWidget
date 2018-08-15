/**
A very simple NodeJS express app which stores txs in local memory
If you restart the webserver, txs history will be lost

Future improvements might include:
    - save tx history to some kind of persistent storage (file, database)
    - timer/job to auto-detect transaction status (success/failed/lost)
*/

const express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors')

const app = express();
app.locals.txs = [];

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.text()); // JSON as plain text
app.use(bodyParser.json()); // application/json
app.use(bodyParser.urlencoded({ extended: true })); // application/x-www-form-urlencoded

app.options('*', cors())

const handleCallback = (req, res) => {
    // include query string (for get)
    const txObj = Object.assign({_timestamp: Date.now()}, req.query);
    // include post content
    if (typeof req.body === "string") {
        // JSON with content type of plain text
        Object.assign(txObj, JSON.parse(req.body));
    } else {
        // application/json OR application/x-www-form-urlencoded
        Object.assign(txObj, req.body || {});
    }

    // store the tx into local memory
    app.locals.txs.unshift(txObj);

    res.json({
        success: true,
        data: txObj
    });
}

app.get('/callback', handleCallback);
app.post('/callback', handleCallback)

app.get('/list', (req, res) => {
    res.json(app.locals.txs);
});

app.get('/clear', (req, res) => {
    app.locals.txs.length = 0; // clear array content
    res.send("Done!");
});

app.listen(4000, () => console.log('Sample KyberPay app listening on port 4000!'))