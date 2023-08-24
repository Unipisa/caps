const express = require('express')
const morgan = require('morgan')
const session = require('express-session')
const passport = require('passport')
const mongoose = require('mongoose')
const LocalStrategy = require('passport-local')
const path = require('path')
const cors = require('cors')
const { randomUUID } = require('crypto')
const MongoStore = require('connect-mongo')
require('dotenv').config() // read environment variabiles from .env

const ApiException = require('./exceptions/ApiException');
const router = require('./router');
const test = require('./test')

const port = process.env.PORT || 3000;

var app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN.split(","),
    optionsSuccessStatus: 200,
    credentials: true // Needed for the client to handle session
  }))

app.use(morgan('tiny')) // access log

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
    app.use(session({
        secret: process.env.SESSION_SECRET || randomUUID(),
        cookie: { maxAge: 2628000000 },
        resave: true,
        saveUninitialized: false,
        store: MongoStore.create({
            client: mongoose.connection.getClient(),
            dbName: process.env.MONGO_DB,
            collectionName: "sessions",
            stringify: false,
            autoRemove: "interval",
            autoRemoveInterval: 30
        })
    }))
    
    app.use(passport.session())
    
    app.listen(port, function() {
        console.log(`CAPS API server started: http://localhost:${port}/`)
        test()
    });
})


