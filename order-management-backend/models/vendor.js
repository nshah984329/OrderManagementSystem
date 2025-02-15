// Importing required libraries
const mongoose = require('mongoose');

// Vendor Schema
const VendorSchema = new mongoose.Schema({
  vendorId: { type: String, required: true, unique: true },
  contact: { type: String },
  location: { type: String },
});
const Vendor = mongoose.model('Vendor', VendorSchema);

// Exporting the Models
module.exports = Vendor;
