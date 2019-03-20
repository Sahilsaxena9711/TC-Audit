var mongoose = require('mongoose');

var RequirementSchema = new mongoose.Schema({
    empId: {
        type: String,
        required: true
    },
    name: {
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
        required: true,
        default: "Pending"
    }
});


var Requirement = mongoose.model('Requirement', RequirementSchema);

module.exports = { Requirement };