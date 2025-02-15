// Importing required libraries
const mongoose = require('mongoose');

// VendorProcess Schema
const VendorProcessSchema = new mongoose.Schema({
  vendorId: { type: String, required: true, ref: 'Vendor' },
  processId: { type: String, required: true, ref: 'Process' },
});
const VendorProcess=mongoose.model('VendorProcess', VendorProcessSchema);
// Exporting the Models
module.exports = VendorProcess;
