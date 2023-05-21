const mysql = require('mysql');


const TableUsers = 'users';

function connectMysql() {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'CATS'
    });
    connection.connect((err) => {
        if (err) { throw err; }
        console.log('Successfully connect to MySQL server!');
    });
    return connection;
}

function disconnectMysql(connection) {
    connection.end((err) => {
        if (err) throw err;
        console.log('Successfully disconnect to MySQL server!');
    });
}

function databaseExist(connection, databaseName) {
    connection.query('SHOW DATABASES', (err, results) => {
        if (err) throw err;
        const databaseExists = results.some((result) => result.Database === databaseName);
        if (databaseExists) {
            console.log(`Database ${databaseName} already exists`);
            return true;
        } else {
            console.log(`Database ${databaseName} does not exist`);
            return false;
        }
    });
}

function tableExist(connection, tableName) {
    return new Promise((resolve, reject) => {
        connection.query(`SHOW TABLES LIKE '${tableName}'`, (err, results) => {
            if (err) reject(err);
            const tableExists = results.length > 0;
            if (tableExists) {
                console.log(`Table ${tableName} already exists`);
                resolve(true);
            } else {
                console.log(`Table ${tableName} does not exist`);
                resolve(false);
            }
        });
    });
}

module.exports = {
    async login(req, res) {
        console.log(`req.body=`, req.body);
        const user = {
            username: req.body.username,
            password: req.body.password,
            balance: 0,
            isAdmin: Boolean(req.body.isAdmin)
        }
        const connection = connectMysql();
        // 如果用户表不存在，则创建并插入管理员用户
        if (!tableExist(connection, TableUsers)) {
            console.log('Table users creating');
            let sql = `CREATE TABLE users (
                            username VARCHAR(255) UNIQUE PRIMARY KEY,
                            password VARCHAR(255),
                            balance FLOAT CHECK(balance>=0),
                            isAdmin BOOLEAN
                        );
                        INSERT INTO users VALUES ('admin','admin',99999,1);
                        INSERT INTO users VALUES ('a','a',0,1);`;
            // 将数据库操作封装成 Promise 对象
            const createTablePromise = new Promise((resolve, reject) => {
                connection.query(sql, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            try {
                await createTablePromise; // 等待 Promise 对象完成
                console.log('Table users created');
            } catch (err) {
                console.error(err);
            }
        }
        // 查询用户表中是否存在该用户
        let sql = `SELECT * FROM users WHERE username = '${user.username}' AND password='${user.password}'`;
        const selectUserPromise = new Promise((resolve, reject) => {
            connection.query(sql, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        selectUserPromise.then((results) => {
            let response = {
                success: true,
                username: user.username,
                isAdmin: false,
                statusCode: 100
            };
            // 如果查询到，则返回成功
            if (results.length > 0) {
                console.log(`User ${user.username} exists:`, results[0], results[0].isAdmin ? 'this is admin' : 'this is not admin');
                response.isAdmin = results[0].isAdmin;
            } else {
                console.log(`User ${user.username} does not exists!`);
                response.success = false;
                response.statusCode = 200;
            }
            disconnectMysql(connection);
            res.send(response);
        }).catch((err) => {
            console.error(err);
            disconnectMysql(connection);
            res.status(500).send('Internal Server Error');
        })
    }
    ,
    async signup(req, res) {
        console.log(`req.body=${req.body}`);
        const user = {
            username: req.body.username,
            password: req.body.password,
            balance: 0,
            isAdmin: Boolean(req.body.isAdmin)
        }
        const connection = connectMysql();
        // 如果用户表不存在，则创建并插入管理员用户
        if (!tableExist(connection, TableUsers)) {
            console.log('Table users creating');
            let sql = `CREATE TABLE users (
                            username VARCHAR(255) UNIQUE PRIMARY KEY,
                            password VARCHAR(255),
                            balance FLOAT CHECK(balance>=0),
                            isAdmin BOOLEAN
                        );
                        INSERT INTO users VALUES (admin,admin,99999,1),
                        INSERT INTO users VALUES (a,a,0,1)`;
            // 将数据库操作封装成 Promise 对象
            const createTablePromise = new Promise((resolve, reject) => {
                connection.query(sql, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });
            try {
                await createTablePromise; // 等待 Promise 对象完成
                console.log('Table users created');
            } catch (err) {
                console.error(err);
            }
        }
        // 查询用户表中是否存在该用户
        let sql = `SELECT * FROM users WHERE username = '${user.username}'`;
        const selectUserPromise = new Promise((resolve, reject) => {
            connection.query(sql, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        try {
            const results = await selectUserPromise; // 等待 Promise 对象完成
            let response = {
                success: true,
                username: user.username,
                statusCode: 100
            };
            // 如果查询到，则返回成功
            if (results.length > 0) {
                console.log('User already exists:', results[0]);
                response.success = false;
                response.statusCode = 200;
            }
            // 若没查询到，插入该用户
            else {
                console.log('User does not exists.');
                let sql = 'INSERT INTO users SET ?';
                const insertUserPromise = new Promise((resolve, reject) => {
                    connection.query(sql, user, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
                try {
                    await insertUserPromise; // 等待 Promise 对象完成
                    console.log('User inserted!');
                } catch (err) {
                    console.error(err);
                }
                response.success = true;
                response.statusCode = 100;
            }
            disconnectMysql(connection);
            res.send(response);
        } catch (err) {
            console.error(err);
            disconnectMysql(connection);
            res.status(500).send('Internal Server Error');
        }
    }
}

