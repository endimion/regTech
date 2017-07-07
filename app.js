/*jslint es6 */
/*jslint node: true */
"use strict";


const express = require('express');
const app = express();
const port = 8000;
const restRouters = require('./routes/restRouters.js');
const userRouters = require('./routes/userRouters.js');
const cron = require('node-cron');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session'); //warning The default server-side session storage, MemoryStore, is purposely not designed for a production environment.
                                            //compatible session stores https://github.com/expressjs/session#compatible-session-stores
const hfcService = require('./service/HfcService');
const FileStore = require('session-file-store')(session);
const basic = require('./utils/basicFunctions');
const timeout = require('connect-timeout');
const cookieParser = require('cookie-parser');
const morgan  = require('morgan');
const log4js = require('log4js');
log4js.configure({
  appenders: [
    { type: 'console' },
    { type: 'file', filename: 'logs/app.log', category: 'log' }
  ],replaceConsole: true
});
const logger = log4js.getLogger('log');

// view engine setup
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'pug');

//middlewares
app.use(express.static('public'));
// instruct the app to use the `bodyParser()` middleware for all routes
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cookieParser());
app.use(session({
  store: new FileStore(),
  name: 'clientAppCookie',
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
})); //set up middleware for session handling
app.use(morgan('tiny')); //http request logger
app.use(timeout(120000));
app.use('/',restRouters);
app.use('/auth',userRouters);


app.use(haltOnTimedout);//the following timeout middleware has to be the last middleware


//start the server
const server = app.listen(port,"127.0.0.1", (err,res) => {
  if(err){
    console.log("error!!", err);
    logger.error("error!!", err);
  }else{
    let host = server.address().address;
    console.log("Example app listening at http://%s:%s", host, port);
    console.log("server started");
    console.log("SRV address"+ process.env.SRV_ADDR);
    basic.init();

    //call the update function on the leiManager every day
    cron.schedule('0 22 * * *', function(){
      console.log('running update task every day at 22:00pm');
      hfcService.update("fiManagerId")
      .then(result =>{
        logger.info(result);
        console.log(result);
      })
      .catch(err=>{console.log(err);});
    });
  }
});


// catch the uncaught errors that weren't wrapped in a domain or try catch statement
// do not use this in modules, but only in applications, as otherwise we could have multiple of these bound
process.on('uncaughtException', function(err) {
    // handle the error safely
    logger.error(err);
    console.log(err);
});


function haltOnTimedout(req, res, next){
  if (!req.timedout) next();
}
