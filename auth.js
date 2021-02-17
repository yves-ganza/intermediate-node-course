const User = require('./models/User')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')
const { ObjectID } = require('mongodb')

module.exports = (app) => {
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
        console.log(`User ${username} logged in`)
        return done(null, user)
      })
    })
  )
}
