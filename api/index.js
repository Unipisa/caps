const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
var app = express();

const ApiException = require('./exceptions/ApiException');
const router = require('./router');

const port = process.env.PORT || 3000;

app.use('/api/v0/', router);

app.use('/js/', express.static('../frontend/js'));
app.use('/img/', express.static('./webroot/img'));
app.use('/favicon.ico', express.static('./webroot/favicon.ico'));

const spa = (req, res) => res.sendFile(path.join(__dirname, "../frontend/index.html"))
app.use("/", spa)

function logErrors(err, req, res, next) {
    console.error(`catched error: ${err.message}`);
    next(err);
}

app.use(logErrors); // log errors on console

app.use(ApiException.apiErrors); // convert ApiErrors into http responses

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/caps').then(res => {
    app.listen(port, function() {
        console.log(`CAPS API server started: http://localhost:${port}/`)
    });
})


