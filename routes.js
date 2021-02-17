const passport = require('passport')
const bcrypt = require('bcrypt')
const User = require('./models/User')
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  return res.redirect('/login')
}
module.exports = (app) => {
  app.route('/').get(ensureAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
  })

  app
    .route('/login')
    .get((req, res) => {
      res.sendFile(__dirname + '/views/login.html')
    })
    .post(
      passport.authenticate('local', { failureRedirect: '/login' }),
      (req, res) => {
        res.redirect('/')
      }
    )
      app.route('/logout').get(ensureAuthenticated, (req, res)=>{
        req.logout()
        res.redirect('/')
      })

  app.route('/register').post(
    (req, res, next) => {
      console.log('Registering...')
      User.findOne({ username: req.body.username }, (err, user) => {
        if (err) {
          console.log(err)
          next(err)
        } else if (user) {
          console.log('User already registered')
          res.redirect('/')
        } else {
          const hash = bcrypt.hashSync(req.body.password, 12)

          //Create User
          User.create(
            { username: req.body.username, password: hash },
            (err, user) => {
              if (err) {
                res.redirect('/')
              } else if (!user) {
                res.redirect('/')
              } else {
                console.log('User registered')
                next(null, user)
              }
            }
          )
        }
      })
    },
    passport.authenticate('local', { failureRedirect: '/login' }),
    (req, res) => {
      res.redirect('/profile')
    }
  )

  app.route('/profile').get(ensureAuthenticated, (req, res) => {
    res.render('profile', { username: req.user.username })
  })
}
