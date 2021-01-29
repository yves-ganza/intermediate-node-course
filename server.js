const express= require('express');
const mongoose= require('mongoose');
const bodyParser= require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10
const User = require('./models/User');
const port=8000;
const app= express();

mongoose.connect('mongodb://localhost/UserData', {useNewUrlParser: true, useUnifiedTopology: true});

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.json());


app.listen(port, ()=>{
	console.log(`server is listening on port:${port}`)
})

function sendResponse(res, err, data){
  if(err){
    res.json({success: false, message: err})
  }
  else if(!data){
    res.json({success: false, message: 'Not Found'})
  }
  else {
    res.json({success: true, data: data})
  }
}
app.get('/',(req, res)=>{
  res.sendFile(__dirname + '/views/index.html')
})
app.post('/users',(req,res)=>{
  bcrypt.hash(req.body.newData.password, saltRounds, (err, hash)=>{
    if(err){
      res.json({success: false, message: "Enter valid password"})
    }
    else{
      User.create({
        name: req.body.newData.name,
        email: req.body.newData.email,
        password: hash
      },
      (err, data)=>{sendResponse(res, err, data)})
    }
  })
})

app.route('/users/:id')
.get((req,res)=>{
  User.findById(req.params.id, (err, data)=>{sendResponse(res, err, data)})
})
.put((req,res)=>{
  User.findByIdAndUpdate(req.params.id,
    {
      name: req.body.newData.name,
      email: req.body.newData.email,
      password: req.body.newData.password
    },
    {new: true},
    (err, data)=>{sendResponse(res, err, data)})
})
.delete((req,res)=>{
  User.findByIdAndDelete(req.params.id, (err, data)=>{sendResponse(res, err, data)})
})