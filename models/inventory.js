var mongoose = require('mongoose');

var InventorySchema = new mongoose.Schema({
    empId: {
        type: String,
        default: "NA"
    },
    invId: {
        type: String,
        required: true,
        unique: true,
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
    }
});


var Inventory = mongoose.model('Inventory', InventorySchema);

module.exports = { Inventory };