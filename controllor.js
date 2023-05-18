module.exports = {
    login(req, res) {
        console.log(req.body);
        let username = req.body.username,
            password = req.body.password,
            isAdmin = req.body.isAdmin;
        console.log(username, password, isAdmin);
        if (username == 'aaa' && password == 'aaa') {
            res.send({ success: 'true', name: username, password: password });
        } else {
            res.send({ success: 'false', name: username, password: password });
        }
    }
}
