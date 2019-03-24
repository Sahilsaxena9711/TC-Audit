var mongoose = require('mongoose');

var AuditSchema = new mongoose.Schema({
    empId: {
        type: String,
        required: true,
        default: "NA"
    },
    name: {
        type: String,
        required: true,
        default: "NA"
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
        required: true,
        default: "NA"
    },
    date: {
        type: Date,
        // required: true,
        // default: "NA"
    },
    billImage: {
        type: String,
        default: "NA"
    },
    status: {
        type: String,
        required: true,
        default: "NA"
    },
    month: {
        type: String,
        required: true,
        default: "NA"
    }
});


var Audit = mongoose.model('Audit', AuditSchema);

module.exports = { Audit };