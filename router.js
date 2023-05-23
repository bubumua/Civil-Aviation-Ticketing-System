const express = require('express');
const controllor = require('./controllor');
const cors = require('cors');

const expressRouter = express.Router();

//这里是直接引用了controller层indexCtrl.js中的login方法
expressRouter.post('/', controllor.login);
expressRouter.post('/login', controllor.login);
expressRouter.post('/signup', controllor.signup);
expressRouter.post('/addFlight', controllor.addFlight);
expressRouter.post('/queryFlight', controllor.queryFlight);
expressRouter.post('/deleteFlight', controllor.deleteFlight);
expressRouter.post('/updateFlight', controllor.updateFlight);

// expressRouter.get('/flight', cors(), controllor.login);

module.exports = expressRouter;