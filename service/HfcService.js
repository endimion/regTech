/*jslint es6 */
/*jslint node: true */

'use strict';
const basic = require('../utils/basicFunctions');
const chainCodeQuery = require('../utils/ChaincodeQuery.js');
const util = require('util');




exports.addFIManager = function(userId){
  return new Promise(function(resolve,reject){
    let invArgs = [ ];
    let _enrollAttr = [{name:'userId',value:userId}];
    let _invAttr = ['userId'];
    let invReq = {
      chaincodeID: basic.config.chaincodeID,
      fcn: "addFIManager",
      args: invArgs,
      attrs: _invAttr
    };
    let invFnc = invokeCurryPromise(invReq);
    makeHfcCall(invFnc,1,resolve,reject,userId,_enrollAttr)();
  });

};

exports.addActus = function(userId, actusJSON){
  return new Promise(function(resolve,reject){
    let invArgs = [JSON.stringify(actusJSON)];
    let _enrollAttr = [{name:'userId',value:userId}];
    let _invAttr = ['userId'];
    let invReq = {
      chaincodeID: basic.config.chaincodeID,
      fcn: "addActus",
      args: invArgs,
      attrs: _invAttr
    };
    let invFnc = invokeCurryPromise(invReq);
    makeHfcCall(invFnc,1,resolve,reject,userId,_enrollAttr)();
  });
};



exports.update = function(userId){
  return new Promise(function(resolve,reject){
    let invArgs = [];
    let _enrollAttr = [{name:'userId',value:userId}];
    let _invAttr = ['userId'];
    let invReq = {
      chaincodeID: basic.config.chaincodeID,
      fcn: "update",
      args: invArgs,
      attrs: _invAttr
    };
    let invFnc = invokeCurryPromise(invReq);
    makeHfcCall(invFnc,1,resolve,reject,userId,_enrollAttr)();
  });
};




exports.getFiManagers = function(userId){
  return new Promise(function(resolve,reject){
    let queryArgs = [];
    let _enrollAttr = [{name:'userId',value: userId}];
    let queryAttributes = ['userId'];
    let testQ2 = new chainCodeQuery(queryAttributes, queryArgs, basic.config.chaincodeID,"getFIManagers",basic.query);
    let testQfunc2 = testQ2.makeQuery.bind(testQ2);
    let success = function(response){
      resolve(JSON.parse(response));
    };
    makeHfcCall(testQfunc2,1,success,reject,userId,_enrollAttr)();
  });
};


exports.getPending = function(userId){
  return new Promise(function(resolve,reject){
    let queryArgs = [];
    let _enrollAttr = [{name:'userId',value: userId}];
    let queryAttributes = ['userId'];
    let testQ2 = new chainCodeQuery(queryAttributes, queryArgs, basic.config.chaincodeID,"getPending",basic.query);
    let testQfunc2 = testQ2.makeQuery.bind(testQ2);
    let success = function(response){
      resolve(JSON.parse(response));
    };
    makeHfcCall(testQfunc2,1,success,reject,userId,_enrollAttr)();
  });
};






exports.getReport = function(userId, fiManager,contract){
  return new Promise(function(resolve,reject){
    let queryArgs = [fiManager,contract];
    let _enrollAttr = [{name:'userId',value: userId}];
    let queryAttributes = ['userId'];
    let testQ2 = new chainCodeQuery(queryAttributes, queryArgs, basic.config.chaincodeID,"getReport",basic.query);
    let testQfunc2 = testQ2.makeQuery.bind(testQ2);
    let success = function(response){
      resolve(JSON.parse(response));
    };
    makeHfcCall(testQfunc2,1,success,reject,userId,_enrollAttr)();
  });
};




/**
* Wraps the invokation request to a promise and curries the fuction so as to take only the
*  user object as input.
@param invRequest, the invokation request object to publish a supplementRequest
*/
function invokeCurryPromise(invRequest){
  return function(user){
    return  new Promise(function(resolve,reject){
      console.log("will send invoke request:\n");
      console.log(invRequest);
      basic.invoke(user,invRequest)
      .then(rsp => {
        console.log("the response is: \n");
        console.log(rsp);
        resolve(rsp);
      }).catch(err => {
          console.log("the error is: \n");
        console.log(err);
        reject(err)
      });
    });
  }
}


/**
closure to include a counter, to attempt to publish for a max of 10 times;
  @param hfcFunc, the hyperledger function to call
  @param times, the times we will retry to call that function
  @param successCallback, function to call in case of successCallback
  @param failureCallback, function to call in case of failure
  @param user, the UserName of the user that will be enrolled
  @param enrollAttributes the attributes to enroll the user
**/
function makeHfcCall(hfcFunc,times,successCallback,failureCallback,user,enrollAttributes){
  return (function(){
      let counter = 0;
      // console.log("hfcFunc,times,retryFunction,successCallback,failureCallback");
      let innerFunction = function(){
          // firstStep(user,enrollAttributes)
          basic.enrollAndRegisterUsers(user,enrollAttributes)
          .then(hfcFunc)
          .then( rsp => {
            counter = times;
            successCallback(rsp);
          })
          .catch(err =>{
            if(counter < times){
              console.log("AN ERROR OCCURED!!! atempt:"+counter+"\n");
              console.log(err);
              counter ++;
              innerFunction();
            }else{
              console.log("HfcService");
              console.log(err);
              // failureCallback("failed, to get  supplements after " + counter + " attempts");
              try{
                let error = JSON.parse(util.format("%j",err));
                failureCallback(error.msg);
              }catch(e){
                console.log(e);
                failureCallback(util.format("%j",err));
              }
            }
          });
      };

      return innerFunction;
    })();
}
