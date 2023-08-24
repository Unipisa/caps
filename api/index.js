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
const User = require('./models/User')

const port = process.env.PORT || 3000;

var app = express();

function logErrors(err, req, res, next) {
    console.error(`catched error: ${err.message}`);
    next(err);
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/caps').then(res => {

    // (!) this runction is asyncronous
    create_admin_user()
    
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
    app.use(logErrors); // log errors on console
    
    app.use(ApiException.apiErrors); // convert ApiErrors into http responses
    
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


async function createOrUpdateUser({username, password}) {
  if (!username) throw new Error("username is required")

  let user = await User.findOne({ username })
  if (!user) {
    user = await User.create({ username })
  }

  if (password) {
      await user.setPassword(password)
      await user.save()
  }
  return user
}

async function create_admin_user() {
  const username = process.env.ADMIN_USER
  const password = process.env.ADMIN_PASSWORD
  if (!username) {
    console.log("set ADMIN_USER to create an admin user")
    return
  }
  
  if (username) {
    console.log("username:", username)
    const admin = await createOrUpdateUser({
      username,
      password
    })
    if (password) {
        console.log(`Password reset for user "${admin.username}"`)
    } else {
      console.log(`Password not provided (set ADMIN_PASSWORD)`)
    }
  }

  const n = await User.countDocuments({})
  if ( n == 0) {
    console.log(`No users in database. Create one by setting ADMIN_USER and ADMIN_PASSWORD`)
  }
}
