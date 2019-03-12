require('../config/config');

var express = require('express');
var bodyparser = require('body-parser');
var _ = require('lodash')
var { Employee } = require('../models/employee');
var { Inventory } = require('../models/inventory');
var { Audit } = require('../models/audit');
var { authenticate } = require('../middleware/authenticate');
var { pathAuth } = require('../middleware/pathAuth');
var { mongoose } = require('./db/mongoose');


var app = express();

const port = process.env.PORT || 8010;

app.use(bodyparser.json());

//AUTH API

//SIGNUP
app.post('/employee', (req, res) => {
    var body = _.pick(req.body, ['empId', 'password', 'role', 'name']);
    var emp = new Employee(body);
    emp.save().then((emp) => {
        return emp.generateAuthToken();
    }).then(() => {
        res.status(200).send({
            data: { data: null, message: `Signed up Successfully!` },
            code: 2000,
            error: null
        });
    }).catch((e) => {
        res.status(200).send({
            data: null,
            code: 4000,
            error: e.message
        });
    });
});

//GET ALL USER
app.get('/employee/all', authenticate, (req, res) => {
    if (req.emp.role == "HR") {
        Employee.find().then((emp) => {
            let names = _.map(emp, function (object) {
                return _.pick(object, ['name']);
            });
            res.status(200).send({
                data: { data: names, message: "Request Completed Successfully" },
                code: 2000,
                error: null
            });
        }).catch((e) => {
            res.status(200).send({
                data: null,
                code: 4000,
                error: e.message
            });
        })
    } else {
        res.status(200).send({
            data: null,
            code: 4000,
            error: "This request can only be made by HR"
        });
    }
});

//LOGIN
app.post('/employee/login', (req, res) => {
    var body = _.pick(req.body, ['empId', 'password']);
    Employee.findByCredential(body.empId, body.password).then((emp) => {
        res.status(200).send({
            data: { data: emp, message: "Request Completed Successfully" },
            code: 2000,
            error: null
        });
    }).catch((e) => {
        res.status(200).send({
            data: null,
            code: 4000,
            error: "Invalid Employee-ID or Password"
        });
    });
});


// INVENTORY API

//ADD INV
app.post('/inventory/add', authenticate, (req, res) => {
    var body = _.pick(req.body, ['empId', 'invId', 'invBrand', 'invName', 'type'])
    var inv = new Inventory(body);
    inv.save().then((inv) => {
        res.status(200).send({
            data: { data: inv, message: `Inventory Added Successfully!` },
            code: 2000,
            error: null
        });
    }).catch((e) => {
        res.status(200).send({
            data: null,
            code: 4000,
            error: e.message
        });
    });
});

//INV BY EMPID
app.get('/inventory', authenticate, (req, res) => {
    var empId = req.emp.empId;
    Inventory.find({ empId }).then((inv) => {
        res.status(200).send({
            data: { data: inv, message: "Request Completed Successfully" },
            code: 2000,
            error: null
        });
    }).catch((e) => {
        res.status(200).send({
            data: null,
            code: 4000,
            error: e.message
        });
    });
});

//ASSIGN INV
app.post('/inventory/assign', authenticate, (req, res) => {
    if (req.emp.role == "HR") {
        let body = _.pick(req.body, ['empId', 'invId']);
        Inventory.findOne({ invId: body.invId }).then((inv) => {
            if (!inv) {
                res.status(200).send({
                    data: null,
                    code: 4000,
                    error: `No Inventory found for Inventory-ID : ${body.invId}`
                });
            } else {
                inv.empId = body.empId;
                inv.save().then((inv) => {
                    res.status(200).send({
                        data: { data: inv, message: "Request Completed Successfully" },
                        code: 2000,
                        error: null
                    });
                }).catch((e) => {
                    res.status(200).send({
                        data: null,
                        code: 4000,
                        error: e.message
                    });
                })
            }
        }).catch((e) => {
            res.status(200).send({
                data: null,
                code: 4000,
                error: e.message
            });
        });
    } else {
        res.status(200).send({
            data: null,
            code: 4000,
            error: "This request can only be made by HR"
        });
    }
});


//ADD AUDIT
app.post('/audit/add', authenticate, (req, res) => {
    var body = _.pick(req.body, ['invId', 'invBrand', 'invName', 'type', 'comment', 'date'])
    body.empId = req.emp.empId;

    Audit.findOne({ invId: body.invId }).then((aud) => {
        if (!aud) {
            var audit = new Audit(body);
            audit.save().then((audit) => {
                res.status(200).send({
                    data: { data: audit, message: "Audit Added Successfully" },
                    code: 4000,
                    error: null
                });
            }).catch((e) => {
                res.status(200).send({
                    data: null,
                    code: 4000,
                    error: e.message
                });
            })
        } else {
            aud.comment = body.comment;
            aud.date = body.date;
            aud.save().then(() => {
                res.status(200).send({
                    data: { data: aud, message: "Audit Added Successfully" },
                    code: 2000,
                    error: null
                });
            }).catch((e) => {
                res.status(200).send({
                    data: null,
                    code: 4000,
                    error: e.message
                });
            });
        }
    }).catch((e) => {
        res.status(200).send({
            data: null,
            code: 4000,
            error: e.message
        });
    });
});


app.listen(port, () => {
    console.log(`Starting app on port ${port}`);
});
module.exports = { app };