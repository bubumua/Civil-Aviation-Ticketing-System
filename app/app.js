const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();

// 创建MySQL连接池
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'yourpassword',
    database: 'yourdatabase',
    insecureAuth: true // 如果使用MySQL 8.0或更高版本，可能需要添加此选项
});

// 使用中间件解析请求体和cookie
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// 使用Session中间件
app.use(session({
    secret: 'yoursecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // 如果使用HTTPS，请将secure选项设置为true
}));

// 注册路由
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // 检查用户名是否已经存在
    pool.query('SELECT * FROM users WHERE username = ?', [username], (error, results) => {
        if (error) throw error;

        if (results.length > 0) {
            res.status(400).send('用户名已经存在');
        } else {
            // 对密码进行加密
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) throw err;

                // 将用户信息插入到数据库中
                pool.query('INSERT INTO users SET ?', { username, password: hash }, (error, results) => {
                    if (error) throw error;

                    res.send('注册成功');
                });
            });
        }
    });
});

// 登录路由
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // 根据用户名查询用户信息
    pool.query('SELECT *FROM users WHERE username = ?', [username], (error, results) => {
        if (error) throw error;

        if (results.length > 0) {
            // 对比密码是否匹配
            bcrypt.compare(password, results[0].password, (err, match) => {
                if (err) throw err;

                if (match) {
                    // 如果密码匹配，将用户ID保存到Session中
                    req.session.userId = results[0].id;
                    res.send('登录成功');
                } else {
                    res.status(400).send('用户名或密码错误');
                }
            });
        } else {
            res.status(400).send('用户名或密码错误');
        }
    });
});

// 验证登录状态的中间件
const requireLogin = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).send('请先登录');
    }
};

// 受保护的路由，需要登录才能访问
app.get('/protected', requireLogin, (req, res) => {
    res.send('您已经登录');
});

// 退出登录路由
app.post('/logout', (req, res) => {
    // 将Session中的用户ID删除
    delete req.session.userId;
    res.send('已退出登录');
});

// 启动服务器
app.listen(3000, () => {
    console.log('服务器已启动');
});