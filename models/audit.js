var mongoose = require('mongoose');

var AuditSchema = new mongoose.Schema({
    empId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    invId: {
        type: String,
        required: true,
        unique: true
    },
    invBrand: {
        type: String,
        required: true
    },
    invName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: true
    }
});


var Audit = mongoose.model('Audit', AuditSchema);

module.exports = { Audit };