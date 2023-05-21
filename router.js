const express = require('express');
const cors = require('cors');
const controllor = require('./controllor');
const expressRouter = express.Router();

//这里是直接引用了controller层indexCtrl.js中的login方法
expressRouter.get('/flight', cors(), controllor.login);
expressRouter.post('/login', controllor.login);
expressRouter.post('/signup', controllor.signup);

module.exports = expressRouter;