/*jslint
es6, maxerr: 10, node */

"use strict";


const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../model/User.js');
const secretKey = process.env.SECRET_KEY; //the secret comes from an enviroment variable


module.exports = router;


router.post('/register', (req,res) =>{
  let userJSON = req.body ; //in the body of the HTTP request we should have received a json here
  let hashedPass = bcrypt.hashSync(req.body.password, 10);
  userJSON.password = hashedPass;
  //save the user in the db...
  return res.json(userJSON);
});



router.post('/signin', (req,res) =>{
  let userJSON = req.body;
  if(userJSON.email == 'triantafyllou.ni@gmail.com'){ //this should be a lookup in the db
    if(userModel.comparsePasswords(req.body.password)){ //for the scope of teh test the password is "password"

      //create the jwt token and sign it
      let  claims = {
        sub: userJSON.userName,
        iss: 'https://mytestapp.com',
        scope: "self, admins"
      }
      let access_token = jwt.sign(claims,secretKey);
      // console.log(access_token);
      res.cookie('access_token',access_token,{
        httpOnly: true
        // secure: true      // for your production environment
      });

      res.json({"result":"ok"});

    }else{
      return res.status(401).json({ message: 'Authentication failed. Password does not match.' });
    }
  }else{
     return res.status(401).json({ message: 'Authentication failed. User not found.' });
  }
});

//
// exports.loginRequired = (req,res,next) =>{
//   if (req.user) {
//     next();
//   } else {
//     return res.status(401).json({ message: 'Unauthorized user!' });
//   }
// };
