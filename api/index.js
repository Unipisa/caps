const express = require('express');
const mongoose = require('mongoose');
var app = express();

const port = process.env.PORT || 3000;

const router = require('./router');
app.use(router);

app.use(express.static('../frontend'));
app.use(express.static('../backend/webroot'));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/caps').then(res => {
    app.listen(port, function() {
        console.log(`CAPS API server started on port ${port}`)
    });
})


