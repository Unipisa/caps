#!/usr/bin/env ts-node-script
const express = require('express')
const morgan = require('morgan')
const session = require('express-session')
const passport = require('passport')
const mongoose = require('mongoose')
const path = require('path')
const cors = require('cors')
const { randomUUID } = require('crypto')
const MongoStore = require('connect-mongo')
const dotenv = require('dotenv')
dotenv.config() // read environment variabiles from .env
dotenv.config({ path: `.env.local`, override: true }) // override with .env.local

const ApiException = require('./exceptions/ApiException');
const router = require('./router');
const test = require('./test')
const User = require('./models/User')

const port = process.env.PORT || 3000;

var app = express();

function logErrors(err : any, req : any, res : any, next : any) {
    console.error(`catched error: ${err.message}`);
    next(err);
}

const mongo_uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/caps'
mongoose.connect(mongo_uri).then((res : any) => {
  console.log("Connected to MongoDB", mongo_uri)

    // (!) this function is asyncronous
    create_admin_user()
    
    const cors_origin = process.env.CORS_ORIGIN || "http://localhost:3000"
    app.use(cors({
        origin: cors_origin.split(","),
        optionsSuccessStatus: 200,
        credentials: true // Needed for the client to handle session
      }))
    
    app.use(morgan('tiny')) // access log

    const client = mongoose.connection.getClient()
    console.log(`client: ${client}`)
    console.log(`dbName: ${process.env.MONGO_DB}`)
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

    app.use('/api/v0/', router);
    
    app.use('/js/', express.static('./webroot/js'));
    app.use('/img/', express.static('./webroot/img'));
    app.use('/favicon.ico', express.static('./webroot/favicon.ico'));
    
    const spa = (req : any, res : any) => res.sendFile(path.join(__dirname, "./webroot/index.html"));

    app.use("/", spa);
    app.use(logErrors); // log errors on console
    
    app.use(ApiException.apiErrors); // convert ApiErrors into http responses
    
    app.listen(port, function() {
        console.log(`CAPS API server started: http://localhost:${port}/`)
        test()
    });
})


async function createOrUpdateUser({username, password, admin = true} : {username? : string, password? : string, admin? : boolean}) {
  if (!username) throw new Error("username is required")

  let user = await User.findOne({ username })
  if (!user) {
    user = await User.create({ 
        username,
        name: username,
        id_number: "0000000",
        first_name: username,
        last_name: username,
        email: `${username}@nomail.com`,
        admin,
      })
  }

  if (password) {
      console.log(`set password for user "${user.username}" to password of length ${password.length}`)
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
