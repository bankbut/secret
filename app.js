//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

console.log(process.env.SECRET);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true}, function(err) {
  if(err) {
    console.log("can't connect");
  } else {
    console.log("success connect 555555");
  }
});

/*Simple version of Mongoose Schema
const userSchema = {
  email: String,
  password: String
};
*/

//Full version of mongoose-Schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

/*to apply npm method "dotenv", const secret will be move to .env file.
//const secret = "Thisisourlittlesecret."; //works as a key used to encrypt the database
//More method of mongoose-encryption in npmjs.com
//Read more documentation of 'Plugin' on mongoose website to give more functionality on SCHEMA
//userSchema.plugin(encrypt, { secret: secret }); //This will encrypt the entire database
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });//This will Encrypt only on Certain fields
*/

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {
  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });

  newUser.save(function(err) {
    if(err) {
      console.log(err);
    } else {
      res.render("secrets");
    }
  }); //This term means it will render secrets.ejs only from the /register or / login route
});

app.post("/login", function(req, res) {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, function(err, foundUser) {
    if(!foundUser) {
      res.redirect("/login");
      console.log(err);
    } else {
      if(foundUser) {//if foundUser === email
        if(foundUser.password === password) {
          res.render("secrets");
        } else {
          res.redirect("/login");
        }
      }
    }
  });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
