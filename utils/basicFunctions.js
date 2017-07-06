'use strict';

// process.env.GOPATH = __dirname;
process.env.GOPATH = __dirname; //this is needed when you want to deploy. HFC  searches in the GOAPTH folder for
//the chaincode
// console.log("GO ENV " + process.env.GOPATH); //this should maybe be passed as  parameter to the app

var hfc = require('hfc');
var util = require('util');
var fs = require('fs');
const https = require('https');


var userObj;

var chaincodeID;
//var certFile = 'us.blockchain.ibm.com.cert';
// var chaincodeIDPath = __dirname + "/chaincodeID";
var chaincodeIDPath = __dirname + "/../chaincodeIDLocalHost";


// object to hold all of the configuration of the
// blockchain
let networkConfig = {
  certFile :'us.blockchain.ibm.com.cert'
};


//initNetwork();

//exported modules
exports.init = initNetwork;
exports.config = networkConfig;
exports.enrollAndRegisterUsers = enrollAndRegisterUsers;
exports.query = queryByReqAndAttributes;
exports.invoke = invokeWithParams;
exports.deploy = deployChaincodeWithParams;

function initNetwork() {
  try {
    networkConfig.config = JSON.parse(fs.readFileSync(__dirname + '/../config/config.json', 'utf8'));
    // Create a client blockchin.
    networkConfig.chain = hfc.newChain(networkConfig.config.chainName);

  } catch (err) {
    console.log(err);
    console.log("config.json is missing or invalid file, Rerun the program with right file")
    process.exit();
  }


  setupSinglePeer();
  // setup();
  // //Check if chaincode is already deployed
  // //TODO: Deploy failures aswell returns chaincodeID, How to address such issue?
  if (fileExists(chaincodeIDPath)) {
    // Read chaincodeID and use this for sub sequent Invokes/Queries
    networkConfig.chaincodeID = fs.readFileSync(chaincodeIDPath, 'utf8');
  }
  console.log("\nFound chaincodeID " + networkConfig.chaincodeID );
}








//init();


function setup() {
  // Configure the KeyValStore which is used to store sensitive keys
  // as so it is important to secure this storage.
  // The FileKeyValStore is a simple file-based KeyValStore, but you
  // can easily implement your own to store whereever you want.
  networkConfig.chain.setKeyValStore( hfc.newFileKeyValStore(__dirname+'/../tmp/keyValStore') );
  // Set the URL for member services
  networkConfig.chain.setMemberServicesUrl("grpc://172.17.0.1:7054");
  // Add a peer's URL to send the requests to
  networkConfig.chain.addPeer("grpc://172.17.0.1:9051");
  networkConfig.chain.eventHubConnect("grpc://172.17.0.1:9053");
  process.on('exit', function() {
    chain.eventHubDisconnect();
  });
}

function setupSinglePeer() {
  // Configure the KeyValStore which is used to store sensitive keys
  // as so it is important to secure this storage.
  // The FileKeyValStore is a simple file-based KeyValStore, but you
  // can easily implement your own to store whereever you want.
  networkConfig.chain.setKeyValStore( hfc.newFileKeyValStore(__dirname+'/../tmp/keyValStore') );
  // Set the URL for member services
  networkConfig.chain.setMemberServicesUrl("grpc://172.17.0.1:7054");
  // Add a peer's URL to send the requests to
  networkConfig.chain.addPeer("grpc://172.17.0.1:7051");
  networkConfig.chain.eventHubConnect("grpc://172.17.0.1:7053");
  process.on('exit', function() {
    chain.eventHubDisconnect();
  });
}


/**
@param userName the name of the user we will enroll
@param enrollAttr an array containing the attributes the user will be enrolled
with, e.g. [{name:'typeOfUser',value:'University'}];
**/
function enrollAndRegisterUsers(userName,enrollAttr) {
  return new Promise(function(resolve,reject){
    try{
      // Enroll a 'admin' who is already registered because it is
      // listed in fabric/membersrvc/membersrvc.yaml with it's one time password.
      // console.log("will enroll admin with " + networkConfig.users[0].enrollId + " and " + networkConfig.users[0].enrollSecret)
      networkConfig.chain.enroll("admin", "Xurw3yU9zI0l", function(err, admin) {
          if (err){
             console.log("\nERROR: failed to enroll admin : " + err) ;
             reject(err) ;
          }
          // throw Error("\nERROR: failed to enroll admin : " + err);

          console.log("\nEnrolled admin sucecssfully with attributes");
          console.log(enrollAttr);;

          // Set this user as the chain's registrar which is authorized to register other users.
          networkConfig.chain.setRegistrar(admin);

          // let enrollAttr = [{name:'typeOfUser',value:'University'}];
          //creating a new user

          var registrationRequest = {
            enrollmentID: userName,
            affiliation: "bank_a",
            attributes: enrollAttr
          };


          networkConfig.chain.registerAndEnroll(registrationRequest, function(err, user) {
            if (err) reject(" Failed to register and enroll " + userName + ": " + err);//throw Error(" Failed to register and enroll " + networkConfig.newUserName + ": " + err);

            console.log("\nEnrolled and registered " + userName + " successfully");
            userObj = user;
            //setting timers for fabric waits
            // chain.setDeployWaitTime(config.deployWaitTime);
            networkConfig.chain.setDeployWaitTime(400);
            // networkConfig.chain.setInvokeWaitTime(60);
            // console.log("\nDeploying chaincode ...");

            //Similarly set timer for invocation transactions
            // networkConfig.chain.setInvokeWaitTime(100);
            resolve(user);
            // query2(user);
          });
        });
      }catch(err){reject(err)}
    });
  }





  /**
  @param userObj the user object obtained after enrolling a user
  @param a deploy request object, e.g.
  var deployRequest = {
  // Function to trigger
  fcn: networkConfig.config.deployRequest.functionName,
  // Arguments to the initializing function
  args: args,
  chaincodePath: networkConfig.config.deployRequest.chaincodePath,
  // the location where the startup and HSBN store the certificates
  certificatePath: networkConfig.network.cert_path
};
**/
function deployChaincodeWithParams(userObj,deployReq) {

  return new Promise(function(resolve,reject){
    // Trigger the deploy transaction
    var deployTx = userObj.deploy(deployReq);

    // Print the deploy results
    deployTx.on('complete', function(results) {
      // Deploy request completed successfully
      chaincodeID = results.chaincodeID;
      console.log("\nChaincode ID : " + chaincodeID);
      console.log(util.format("\nSuccessfully deployed chaincode: request=%j, response=%j", deployReq, results));
      // Save the chaincodeID
      console.log("will write at " + chaincodeIDPath + " the id " + chaincodeID);
      fs.writeFileSync(chaincodeIDPath, chaincodeID);
      //invoke();
      resolve(results);
    });

    deployTx.on('error', function(err) {
      // Deploy request failed
      console.log(util.format("\nFailed to deploy chaincode: request=%j, error=%j", deployReq, err));
      // process.exit(1);
      reject(err);
    });
  });
}



/**
@param the userObj that is returned after a scuessful enrollement of a user
@param the invokation request, e.g. invokeRequest = {
//     // Name (hash) required for invoke
//     chaincodeID: networkConfig.chaincodeID,
//     // Function to trigger
//     fcn: networkConfig.config.invokeRequest.functionName,
//     // Parameters for the invoke function
//     args: args
// };
**/
function invokeWithParams(userObj,invReq) {

    var txHash="qwe";

    return new Promise(function(resolve,reject){
      var eh = networkConfig.chain.getEventHub();
      // Trigger the invoke transaction
      var invokeTx = userObj.invoke(invReq);
      // Print the invoke results
      invokeTx.on('submitted', function(results) {
        // Invoke transaction submitted successfully
        console.log(util.format("\nSuccessfully submitted chaincode invoke transaction: request=%j, response=%j", invReq, results));
        txHash = results.uuid;

      });
      invokeTx.on('complete', function(results) {
        // Invoke transaction completed successfully
        console.log(util.format("\nSuccessfully completed chaincode invoke transaction: request=%j, response=%j", invReq, results));
        // resolve(results);
        // txHash = results.uuid;

      });
      invokeTx.on('error', function(err) {
        // Invoke transaction submission failed
        console.log(util.format("\nFailed to submit chaincode invoke transaction: request=%j, error=%j", invReq, err));
        if(util.format("%j",err).indexOf("timed out") >=0){
          console.log("Timeout detected!!")
          console.log("Timeout Time " + networkConfig.chain.getInvokeWaitTime());
          networkConfig.chain.setInvokeWaitTime( 40 );
        }
        reject(err);
      });

    
      var regid = eh.registerChaincodeEvent(invReq.chaincodeID, "evtsender", function(event) {
        console.log(util.format("Custom event received, payload: %j\n", event.payload.toString()));
        let eventJSON = JSON.parse(event.payload.toString());
        let eventMessage = eventJSON.Message;
        let eventBODY = eventJSON.Body;
        let eventTXID = eventJSON.TxId;

        if(eventMessage.indexOf("Error") >= 0){
          if(eventTXID === txHash){ //resolve promise only when the current transaction has finished
            eh.unregisterChaincodeEvent(regid);
            reject(eventMessage);
          }
        }
        if(eventMessage.indexOf("Tx chaincode finished OK") >= 0){
            if(eventTXID === txHash){ //resolve promise only when the current transaction has finished
              eh.unregisterChaincodeEvent(regid);
              resolve(eventMessage);
            }
            networkConfig.chain.setInvokeWaitTime(20);
        }
      });

    });


}




function queryByReqAndAttributes(userObj,request,attr) {

  return new Promise(function(resolve,reject){
    try{
      // Trigger the query transaction
      var queryTx = userObj.query(request);
      // Print the query results
      queryTx.on('complete', function(results) {
        // Query completed successfully
        console.log("\nSuccessfully queried  chaincode function: request=%j, value=%s", request, results.result.toString());
        //process.exit(0);
        resolve(results.result.toString());
      });
      queryTx.on('error', function(err) {
        // Query failed
        console.log("\nFailed to query chaincode, function: request=%j, error=%j", request, err);
        //process.exit(1);
        reject(err);
      });
    }catch(err){
      console.log("Error caught during query");
      reject(err);
    }

  });


}










function getArgs(request) {
  var args = [];
  for (var i = 0; i < request.args.length; i++) {
    args.push(request.args[i]);
  }
  return args;
}

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}
