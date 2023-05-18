const express = require('express');
const morgan = require('morgan');
const router = require('./router');
const bodyParser = require('body-parser');

const hostName = '127.0.0.1'; //代理服务器主机名
const port = 4000; // 端口号
const server = express();

// set listen host&port
server.listen(port, hostName, () => {
    console.log(`server running.... at ${hostName}:${port}`)
});
server.use(bodyParser.json());//将其解析为json格式
server.use(bodyParser.urlencoded({ extended: false })); //挂载配置post解析body模块
// use router to deal with req & res,GET or POST
server.use(router);
// 将morgan挂载在服务器，并将监听内容打印在控制台
server.use(morgan('dev'));
// 挂载使用express的static方法，__dirname 相当于当前目录的根目录，其作用是在根目录下的src文件夹内查找服务器所请求的文件
server.use(express.static(__dirname + '/src'));

// 设置CORS头
server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
