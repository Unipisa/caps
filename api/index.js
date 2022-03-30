const express = require('express');
var app = express();

const port = process.env.PORT || 3000;

const router = require('./router');
app.use(router);

app.listen(port, function() {
    console.log(`CAPS API server started on port ${port}`)
});
