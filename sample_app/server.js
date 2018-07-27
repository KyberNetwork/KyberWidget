// A very  simple app which store tx in memory

const express = require('express')
var cors = require('cors')
const app = express()
var bodyParser = require('body-parser');

app.locals.txs = [];

app.use(cors())
app.use(express.static('public'));
app.use(bodyParser.text());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.options('*', cors())

const handleCallback = (req, res) => {
    // include query string
    const txObj = Object.assign({_timestamp: Date.now()}, req.query);
    // include POST content
    console.log(typeof req.body);
    if (typeof req.body === "string") {
        Object.assign(txObj, JSON.parse(req.body));
    } else {
        Object.assign(txObj, req.body || {});
    }

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
    app.locals.txs.length = 0;
    res.send("Done!");
});

app.listen(4000, () => console.log('Example app listening on port 4000!'))