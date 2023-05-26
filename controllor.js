const session = require('express-session');
const mysql = require('mysql');

const TableUsers = 'users';

function connectMysql(databaseName) {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: databaseName
    });
    connection.connect((err) => {
        if (err) { throw err; }
        console.log(`Successfully connect to MySQL server! Use database: ${databaseName}`);
    });
    return connection;
}

function disconnectMysql(connection) {
    connection.end((err) => {
        if (err) throw err;
        console.log('Successfully disconnect to MySQL server!');
    });
}

module.exports = {
    async login(req, res) {
        // 接收前端传来的数据
        console.log(`req.body=`, req.body);
        const user = {
            username: req.body.username,
            password: req.body.password
        }
        const connection = connectMysql('CATS');

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
                isAdmin: false
            };
            // 如果查询到，则返回成功
            if (results.length > 0) {
                console.log(`User ${user.username} exists:`,
                    results[0],
                    results[0].isAdmin ? 'this is admin' : 'this is not admin');
                response.isAdmin = results[0].isAdmin;
            }
            // 如果没有查询到，则返回失败
            else {
                console.log(`User ${user.username} does not exists!`);
                response.success = false;
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
        // 接收前端传来的数据
        const user = {
            username: req.body.username,
            password: req.body.password,
            balance: 0,
            isAdmin: Boolean(req.body.isAdmin)
        }
        // 连接数据库
        const connection = connectMysql('CATS');

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
                username: user.username
            };
            // 如果查询到，则返回成功
            if (results.length > 0) {
                console.log('User already exists:', results[0]);
                response.success = false;
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
            }
            disconnectMysql(connection);
            res.send(response);
        } catch (err) {
            console.error(err);
            disconnectMysql(connection);
            res.status(500).send('Internal Server Error');
        }
    }
    ,
    async addFlight(req, res) {
        // 连接数据库
        const connection = connectMysql('CATS');
        console.log(`req.body=`, req.body);
        // 向航班信息表flights中插入数据
        let sql = `INSERT INTO flights SET ?;`;

        // 定义响应数据
        let resData = {
            success: true,
            msg: ''
        }

        const promises = [];
        for (const newFlight of req.body) {
            const promise = new Promise((resolve, reject) => {
                connection.query(sql, newFlight, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });
            promises.push(promise);
        }
        Promise.all(promises).then((results) => {
            console.log('insert successfully: ', results);
            resData.success = true;
            resData.msg = 'Insert finished.';
            disconnectMysql(connection);
            res.send(resData);
        }).catch((err) => {
            console.error(err);
            console.log(err.sqlMessage);
            resData.success = false;
            resData.msg = 'Insert Error!';
            res.status(500).send(resData);
        });
    }
    ,
    async queryFlight(req, res) {
        // 连接数据库
        const connection = connectMysql('CATS');
        // console.log(`req.body=`, req.body);
        // 获取查询条件
        const start_city = req.body.start_city;
        const end_city = req.body.end_city;
        const first_order = req.body.first_order;
        // const second_order = req.body.second_order;
        let orderCondition = first_order;
        // orderCondition += second_order.length > 0 ? `,${second_order}` : '';


        // 定义响应数据
        let resData = {
            success: true,
            msg: '',
            queryRes: {}
        }

        // 向航班信息表flights中查询数据
        let sql = `SELECT * FROM flights WHERE start_city LIKE '%${start_city}%' AND end_city LIKE '%${end_city}%' ORDER BY ${orderCondition};`;
        console.log('queryCondition=', sql);
        const queryFlightPromise = new Promise((resolve, reject) => {
            connection.query(sql, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        queryFlightPromise.then((results => {
            // console.log(results);
            resData.queryRes = results;
            resData.msg = 'Query finished.';
            disconnectMysql(connection);
            res.send(resData);
        })).catch((err) => {
            console.error(err);
            console.log(err.sqlMessage);
            resData.success = false;
            resData.msg = 'Query Error!';
            res.status(500).send(resData);
        });
    }
    ,
    async deleteFlight(req, res) {
        // 连接数据库
        const connection = connectMysql('CATS');
        console.log(`req.body=`, req.body);

        // 定义响应数据
        let resData = {
            success: true,
            msg: ''
        }

        // 获取要删除的航班号
        const deletedFlights = req.body;
        const sql = `DELETE FROM flights WHERE flight IN (${deletedFlights.map(() => '?').join(', ')})`;
        const deleteFlightPromise = new Promise((resolve, reject) => {
            connection.query(sql, deletedFlights, (error, results) => {
                if (error) reject(error);
                else {
                    resolve(results);
                    console.log(`Deleted ${results.affectedRows} rows.`)
                };
            });
        });
        deleteFlightPromise.then((results => {
            // console.log(results);
            resData.msg = 'Delete finished.';
            disconnectMysql(connection);
            res.send(resData);
        })).catch((err) => {
            console.error(err);
            console.log(err.sqlMessage);
            resData.success = false;
            resData.msg = 'Delete Error!';
            res.status(500).send(resData);
        });
    }
    ,
    async updateFlight(req, res) {
        // 连接数据库
        const connection = connectMysql('CATS');
        console.log(`req.body=`, req.body);

        // 定义响应数据
        let resData = {
            success: true,
            msg: ''
        }

        // 获取要删除的航班号
        const updatedFlights = req.body;
        const sql = `UPDATE flights SET start_city = ?, end_city = ?, departure_date = ?, departure_time = ?, arrival_date = ?, arrival_time = ?, price = ?, discounted_tickets = ?, discount = ?, rest_tickets = ?, airline = ? WHERE flight = ?`;
        // 创建Promise组
        const promises = [];
        for (const flight of updatedFlights) {
            const up = [flight.start_city, flight.end_city, flight.departure_date, flight.departure_time, flight.arrival_date, flight.arrival_time, flight.price, flight.discounted_tickets, flight.discount, flight.rest_tickets, flight.airline, flight.flight]
            const updateFlightPromise = new Promise((resolve, reject) => {
                connection.query(sql, up, (error, results) => {
                    if (error) reject(error);
                    else resolve(results);
                });
            });
            promises.push(updateFlightPromise);
        }
        Promise.all(promises).then((results) => {
            console.log('update successfully: ', results);
            resData.success = true;
            resData.msg = 'Update finished.';
            disconnectMysql(connection);
            res.send(resData);
        }).catch((err) => {
            console.error(err);
            console.log(err.sqlMessage);
            resData.success = false;
            resData.msg = 'Update Error!';
            res.status(500).send(resData);
        });


    }
}

