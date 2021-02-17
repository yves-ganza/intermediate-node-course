require('dotenv').config()
const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const passport = require('passport')
const app = express()
const routes = require('./routes')
const auth = require('./auth')

app.set('view engine', 'pug')
app.set('views', __dirname+'/views/')
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

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(
  ()=>{
    routes(app)
    auth(app)
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
