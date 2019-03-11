var { Employee } = require('../models/employee');

var pathAuth = (req, res, next) => {
    var token = req.params.token;
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

module.exports = { pathAuth }