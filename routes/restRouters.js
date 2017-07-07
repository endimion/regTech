/*jslint
es6, maxerr: 10, node */

"use strict";


const express = require('express');
const router = express.Router();
const request = require('request');
const hfcService = require('../service/HfcService');
const o2x = require('object-to-xml');
const log4js = require('log4js');
const auth = require('../utils/AuthUtils.js').authorizeAll;
const authLei = require('../utils/AuthUtils.js').authorizeLei;

log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'logs/app.log', category: 'log' }
  ],replaceConsole: true
});
const logger = log4js.getLogger('log');


module.exports = router;

// define the home page route
router.get('/getFIManagers',auth,  (req, res) => {
    hfcService.getFiManagers("testFiId")
    .then(result =>{
        res.status(200).json(result);
    })
    .catch(err=>{
      console.log(err);
      logger.error(err);
      res.status(500).send(err);
    })
});

router.get('/getPending',authLei,  (req, res) => {
    hfcService.getPending("testFiId")
    .then(result =>{
        res.status(200).json(result);
    })
    .catch(err=>{
      console.log(err);
      logger.error(err);
      res.status(500).send(err);
    })
});


router.get('/report/:fiManager/:contract',auth,  (req, res) => {
    let fiManager = req.params.fiManager;
    let contract = req.params.contract;

    hfcService.getReport("testFiId",fiManager,contract)
    .then(result =>{
        let report = {
            report : result
        }
        res.set('Content-Type', 'text/xml');
        res.status(200).send(o2x(report));
    })
    .catch(err=>{
      console.log(err);
      logger.error(err);
      res.status(500).send(err);
    })
});



router.get('/addFIManagers/:fiManager',auth,  (req, res) => {
    let fiManagerId =  req.params.fiManager;
    hfcService.addFIManager(fiManagerId)
    .then(result =>{
        res.status(200).send(result);
    })
    .catch(err=>{
      console.log(err);
      logger.error(err);
      res.status(500).send(err);
    })
});



router.get('/addActus/:fiManager', auth, (req, res) => {
  let fiManagerId =  req.params.fiManager;

  let event1 = {
      RelatedEvent:"Cash Flow it Inception of the Contract",
      EventCode: "VD",
      DateOfOccurance : "01/07/2017",
      AffectedVariables: "Principal",
      ListofVariables: "Var1, Var2, Var3, Var4, Var5, Var6, Var7, Var8, Var9, Var10",
      Values: "100, 100, 100, 100, 100, 100, 100, 100, 100, 100"
  };

  let event2 = {
    RelatedEvent:"Capitalization of Accrued Interest",
    EventCode: "CIP",
    DateOfOccurance : "05/07/2017",
    AffectedVariables: "Accrued Interest",
    ListofVariables: "Var1, Var2, Var3, Var4, Var5, Var6, Var7, Var8, Var9, Var10",
    Values: "100, 100, 100, 100, 100, 100, 100, 100, 100, 100"
  };
  let event3 = {
    RelatedEvent:"Payment of Accrued Interest",
    EventCode: "IP",
    DateOfOccurance : "09/07/2017",
    AffectedVariables: "Interest",
    ListofVariables: "Var1, Var2, Var3, Var4, Var5, Var6, Var7, Var8, Var9, Var10",
    Values: "100, 100, 100, 100, 100, 100, 100, 100, 100, 100"
  };

  let state1  = {StateID:"1",StateReport: [event1,event2,event3]};
  let state2  = {StateID:"2",StateReport: [event1,event2,event3]};
  let theStates = {StateList : [state1,state2]};



  let actusJSON = {
    Id : "testId",
    Validated : "false",
    State : "0",
    Particiapant: "testParticipant",
    ParticipatingPartyContractRole: "testParticipatingPartyContractRole",
    States: theStates
  }


    console.log(actusJSON);

    hfcService.addActus(fiManagerId,actusJSON)
    .then(result =>{
        res.status(200).send(result);
    })
    .catch(err=>{
      logger.error(err);
      console.log(err);
      res.status(500).send(err);
    })
});




router.post('/addActus/:fiManager', auth,  (req, res) => {
  let fiManagerId =  req.params.fiManager;
  let actusJSON = req.body;
  // logger.info(fiManagerId);
  // logger.info(actusJSON);
  hfcService.addActus(fiManagerId,actusJSON)
    .then(result =>{
        res.status(200).send(result);
    })
    .catch(err=>{
      logger.error(err);
      console.log(err);
      res.status(500).send(err);
    })
});





router.get('/update', (req,res) =>{
  hfcService.update("fiManagerId")
  .then(result =>{
      res.status(200).send(result);
  })
  .catch(err=>{
    console.log(err);
    res.status(500).send(err);
  })
});







router.get('/time', (req,res) =>{
  let date = new Date();
  let day = date.getDate();
  if(day < 10){
    day = "0"+day
  }
  let month = date.getMonth();
  if (month < 10){
    month = "0" + month
  }
  let year = date.getFullYear();
  res.send(day+"/"+month+"/"+year);
});
