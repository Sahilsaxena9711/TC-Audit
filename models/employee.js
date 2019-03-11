var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var _ = require('lodash');
var mongoose = require('mongoose');

var EmployeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        minLength: 6,
        required: true,
        trim: true
    },
    empId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    role: {
        type: String,
        required: true,
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }],
});

EmployeeSchema.methods.toJSON = function () {
    var emp = this;
    var empObject = emp.toObject();
    return _.pick(empObject, ["empId", "tokens", "_id", "role"])
}

EmployeeSchema.methods.generateAuthToken = function () {
    var emp = this;
    var access = 'auth';
    var token = jwt.sign({
        _id: emp._id.toHexString(),
        access,
        empId: emp.empId,
        role: emp.role
    }, 'encodedsecret').toString();
    emp.tokens = emp.tokens.concat([{ access, token }]);
    return emp.save().then(() => {
        return token;
    });
};

EmployeeSchema.statics.findByToken = function (token) {
    var Employee = this;
    var decoded;
    try {
        decoded = jwt.verify(token, 'encodedsecret');
    } catch (e) {
        return Promise.reject();
    }
    return Employee.findOne({
        _id: decoded._id,
    }).then((emp) => {
        return emp;
    });
}

EmployeeSchema.statics.findByCredential = function (empId, password) {
    var Employee = this;
    return Employee.findOne({empId}).then((emp) => {
        if(!emp){
            return Promise.reject();
        }
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, emp.password, (err, res) => {
                if(res){
                    resolve(emp);
                }else{
                    reject();
                }
            });
        });
    });
}

EmployeeSchema.pre('save', function (next) {
    var emp = this;
    if (emp.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(emp.password, salt, (err, hash) => {
                emp.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

var Employee = mongoose.model('Employee', EmployeeSchema);

module.exports = { Employee };