var { Employee } = require('../models/employee');

var authenticate = (req, res, next) => {
    
    var token = req.header('x-auth-token');
    console.log(token);
    Employee.findByToken(token).then((emp) => {
        if (!emp) {
            return Promise.reject();
        }
        req.emp = emp;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(200).send({
            data: null,
            code: 4010,
            error: 'UnAuthorized Token'
        });
    })
}

module.exports = { authenticate }