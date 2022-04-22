const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
var app = express();

const port = process.env.PORT || 3000;

const router = require('./router');
app.use('/api/v0/', router);

app.use('/js/', express.static('../frontend/js'));
app.use('/img/', express.static('../backend/webroot/img'));
app.use('/favicon.ico', express.static('../backend/webroot/favicon.ico'));

const spa = (req, res) => res.sendFile(path.join(__dirname, "../frontend/index.html"))
app.use("/", spa)

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/caps').then(res => {
    app.listen(port, function() {
        console.log(`CAPS API server started: http://localhost:${port}/`)
    });
})


