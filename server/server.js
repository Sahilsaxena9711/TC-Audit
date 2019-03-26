require('../config/config');

var express = require('express');
var bodyparser = require('body-parser');
var _ = require('lodash')
var { Employee } = require('../models/employee');
var { Requirement } = require('../models/requirement');
var { Audit } = require('../models/audit');
var { authenticate } = require('../middleware/authenticate');
var { pathAuth } = require('../middleware/pathAuth');
var { mongoose } = require('./db/mongoose');


var app = express();

console.log(process.env.PORT);
const port = process.env.PORT || 8080;

app.use(bodyparser.json());



app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'x-auth-token,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    // res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

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

app.post('/employee/changePassword', authenticate, (req, res) => {
    var body = _.pick(req.body, ['oldPassword', 'newPassword']);

    Employee.findByCredential(req.emp.empId, body.oldPassword).then((emp) => {
        emp.password = body.newPassword
        emp.save().then(() => {
            res.status(200).send({
                data: { data: null, message: `Password Changed Successfully` },
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
    }).catch(() => {
        res.status(200).send({
            data: null,
            code: 4000,
            error: "Error the old password was incorrect"
        });
    })
});

//GET ALL USER
app.get('/employee/all', authenticate, (req, res) => {
    if (req.emp.role == "HR") {
        Employee.find().then((emp) => {
            let names = _.map(emp, function (object) {
                return _.pick(object, ['name', 'empId']);
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
    var body = _.pick(req.body, ['invId', 'invBrand', 'invName', 'type', 'billImage'])
    var inv = new Audit(body);
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

//ADD INV BY EMP
app.post('/inventory/emp/add', authenticate, (req, res) => {
    var body = _.pick(req.body, ['invId', 'invBrand', 'invName', 'type', 'billImage'])
    body.name = req.emp.name;
    body.empId = req.emp.empId;
    var inv = new Audit(body);
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

//INV EDIT 
app.post('/inventory/edit', authenticate, (req, res) => {
    var body = _.pick(req.body, ['invId', 'invName', 'invBrand', 'type', 'id'])
    Audit.findOne({ _id: body.id }).then((aud) => {
        if (!aud) {
            res.status(200).send({
                data: null,
                code: 4000,
                error: 'No Inventory found with that Inventory ID'
            });
        } else {
            aud.invId = body.invId;
            aud.invName = body.invName;
            aud.invBrand = body.invBrand;
            aud.type = body.type;
            aud.save().then(() => {
                res.status(200).send({
                    data: { data: aud, message: `Inventory Edited Successfully!` },
                    code: 2000,
                    error: null
                });
            }).catch((e) => {
                res.status(200).send({
                    data: null,
                    code: 4000,
                    error: `Inventory with Inventory ID ${body.invId} already exists`
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
})

//ALL INV
app.get('/inventory/all', authenticate, (req, res) => {
    Audit.find().then((inv) => {
        res.status(200).send({
            data: { data: inv, message: `Request Completed Successfully!` },
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
    Audit.find({ empId }).then((inv) => {
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
        let body = _.pick(req.body, ['empId', 'name', 'invId']);
        Audit.findOne({ invId: body.invId }).then((inv) => {
            if (!inv) {
                res.status(200).send({
                    data: null,
                    code: 4000,
                    error: `No Inventory found for Inventory-ID : ${body.invId}`
                });
            } else {
                inv.empId = body.empId;
                inv.name = body.name;
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

//UNASSIGNED INV
app.get('/inventory/unassigned', authenticate, (req, res) => {
    if (req.emp.role == "HR") {
        Audit.find({ empId: "NA" }).then((inventory) => {
            res.status(200).send({
                data: { data: inventory, message: "Request Completed Successfully" },
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
})


//AUDIT

//GET AUDIT
app.get('/audit', authenticate, (req, res) => {
    if (req.emp.role == "HR") {
        Audit.find({ empId: { $not: { $eq: "NA" } }, comment: { $not: { $eq: "NA" } } }).then((audit) => {
            res.status(200).send({
                data: { data: audit, message: "Request Completed Successfully" },
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
})

//ADD AUDIT
app.post('/audit/add', authenticate, (req, res) => {
    var body = _.pick(req.body, ['invId', 'month', 'status', 'comment', 'date'])
    body.empId = req.emp.empId;
    body.name = req.emp.name;
    Audit.findOne({ invId: body.invId }).then((aud) => {
        if (!aud) {
            // var audit = new Audit(body);
            // audit.save().then((audit) => {
            //     res.status(200).send({
            //         data: { data: audit, message: "Audit Added Successfully" },
            //         code: 2000,
            //         error: null
            //     });
            // }).catch((e) => {
            res.status(200).send({
                data: null,
                code: 4000,
                error: `No Inventory Found with Inventory ID ${body.invId}`
            });
            // })
        } else {
            aud.status = body.status;
            aud.comment = body.comment;
            aud.month = body.month
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

//GET UNAUDITED INV
app.get('/audit/unaudited/:month', authenticate, (req, res) => {
    var month = req.params.month;
    Audit.find({ month: { $not: { $eq: month } }, empId: { $not: { $eq: "NA" } } }).then((aud) => {
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
    })
})


//REQUIREMENT

//ADD REQUIREMNT
app.post('/requirement/add', authenticate, (req, res) => {
    var body = _.pick(req.body, ['comment', 'date']);
    body.name = req.emp.name;
    body.empId = req.emp.empId
    var requirement = new Requirement(body);
    requirement.save().then(() => {
        res.status(200).send({
            data: { data: requirement, message: "Requirement Added Successfully" },
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
})

app.get('/requirement/my', authenticate, (req, res) => {
    var empId = req.emp.empId;
    Requirement.find({ empId }).then((requirement) => {
        res.status(200).send({
            data: { data: requirement, message: "Request Completed Successfully" },
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
})

app.get('/requirement/all/pending', authenticate, (req, res) => {
    Requirement.find({ status: "Pending" }).then((requirement) => {
        res.status(200).send({
            data: { data: requirement, message: "Request Completed Successfully" },
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
})

app.get('/requirement/complete/:id', authenticate, (req, res) => {
    var id = req.params.id
    Requirement.findOne({ _id: id }).then((requirement) => {
        if (!requirement) {
            res.status(200).send({
                data: null,
                code: 4000,
                error: `Requirement not found`
            });
        } else {
            requirement.status = "Approved";
            requirement.save().then(() => {
                res.status(200).send({
                    data: { data: requirement, message: "Requiremnet Approved Successfully" },
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
    })
})

app.get('/requirement/reject/:id', authenticate, (req, res) => {
    var id = req.params.id
    Requirement.findOne({ _id: id }).then((requirement) => {
        if (!requirement) {
            res.status(200).send({
                data: null,
                code: 4000,
                error: `Requirement not found`
            });
        } else {
            requirement.status = "Rejected";
            requirement.save().then(() => {
                res.status(200).send({
                    data: { data: requirement, message: "Requiremnet Rejected Successfully" },
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
    })
})

app.post('/requirement/commenthr', authenticate, (req, res) => {
    var body = _.pick(req.body, ['id', 'commentHr']);
    Requirement.findOne({ _id: body.id }).then((requirement) => {
        if (!requirement) {
            res.status(200).send({
                data: null,
                code: 4000,
                error: `Requirement not found`
            });
        } else {
            requirement.commentHr = body.commentHr;
            requirement.save().then(() => {
                res.status(200).send({
                    data: { data: requirement, message: "Comment Added Successfully" },
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
    })
})


app.listen(port, function () {
    console.log(`Starting app on port ${port}`);
});
module.exports = { app };