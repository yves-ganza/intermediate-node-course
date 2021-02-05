require('dotenv').config()
const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const saltRounds = 10
const User = require('./models/User')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const app = express()
const myDB = require('./connection')
const { ObjectID } = require('mongodb')

app.use(express.static(__dirname + '/public'))
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
  })
)

app.use(passport.initialize())
app.use(passport.session())

function sendResponse(res, err, data) {
  if (err) {
    res.json({ success: false, message: err })
  } else if (!data) {
    res.json({ success: false, message: 'Not Found' })
  } else {
    res.json({ success: true, data: data })
  }
}

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next()
  }
  return res.redirect('/login')
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(
  ()=>{
    app.route('/')
    .get(ensureAuthenticated,(req,res)=>{
      res.sendFile(__dirname + '/views/index.html')
    })

    app.route('/login')
    .get((req, res) => {
      res.sendFile(__dirname + '/views/login.html')
    })
    .post(passport.authenticate('local', {failureRedirect: '/login'}),(req, res)=>{
      console.log('Logged in')
      res.redirect('/')
    })

    app.route('/register').post((req, res, next)=>{
      console.log('Registering...')
      User.findOne({username: req.body.username}, (err, user)=>{
        if(err){
          console.log(err)
          next(err)
        }
        else if(user){
          console.log('User already registered')
          res.redirect('/')
        }
        else{
          const hash = bcrypt.hashSync(req.body.password, 12)
          User.create({
            username: req.body.username,
            password: hash
          }, (err, user)=>{
            console.log('h1')
            if(err){
              res.redirect('/')
            }
            else if(!user){
              res.redirect('/')
            }
            else{
              console.log('User registered')
              next(null, user)
            }
          })
        }
      })
    }, passport.authenticate('local', {failureRedirect: '/login'}), (req, res)=>{
      res.redirect('/')
    })

    app.post('/users', (req, res) => {
      User.create(
        {
          name: req.body.newData.name,
          email: req.body.newData.email,
          password: req.body.newData.password,
        },
        (err, data) => {
          sendResponse(res, err, data)
        }
      )
      /** 
      bcrypt.hash(req.body.newData.password, saltRounds, (err, hash) => {
        if (err) {
          res.json({ success: false, message: 'Enter valid password' })
        } else {
          
        }
      })*/
    })

    app.route('/profile').get(ensureAuthenticated, (req, res)=>{
      res.sendFile(__dirname+'/views/index.html');
    })
  
    app
      .route('/users/:id')
      .get((req, res) => {
        User.findById(req.params.id, (err, data) => {
          sendResponse(res, err, data)
        })
      })
      .put((req, res) => {
        User.findByIdAndUpdate(
          req.params.id,
          {
            name: req.body.newData.name,
            email: req.body.newData.email,
            password: req.body.newData.password,
          },
          { new: true },
          (err, data) => {
            sendResponse(res, err, data)
          }
        )
      })
      .delete((req, res) => {
        User.findByIdAndDelete(req.params.id, (err, data) => {
          sendResponse(res, err, data)
        })
      })

      passport.serializeUser((user, done) => {
        done(null, user._id)
      })
    
      passport.deserializeUser((id, done) => {
        User.findOne({ _id: new ObjectID(id) }, (err, user) => {
          done(null, user)
        })
      })
    
      passport.use(
        new LocalStrategy((username, password, done) => {
          User.findOne({ username: username }, (err, user) => {
            console.log(`User ${username} attempted to login`)
            if (err) {
              console.log(err)
              return done(err)
            }
            if (!user) {
              return done(null, false)
            }
            if (!bcrypt.compareSync(password, user.password)) {
              return done(null, false)
            }
            return done(null, user)
          })
        })
      )
  },
  err=>{
    app.get('/', (req, res)=>{
      res.json({success: false, message:err})
    })
  }
)


const port = process.env.PORT | 8000
app.listen(port, () => {
  console.log(`server is listening on port:${port}`)
})
