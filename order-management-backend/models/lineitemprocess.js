// Importing required libraries
const mongoose = require('mongoose');

// Counter Schema for tracking sequence values
const CounterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  seq: { type: Number, required: true },
});

const Counter = mongoose.model('CounterSequence', CounterSchema);

module.exports = Counter;

// LineItemProcess Schema
const LineItemProcessSchema = new mongoose.Schema({
  lineItemId: { type: String, required: true, ref: 'LineItem' },
  processId: { type: String, required: true, ref: 'Process' },
  vendorId: { type: String, required: true, ref: 'Vendor' },
  sequence: { type: Number },
  date: { 
    type: String, 
    default: () => new Date().toISOString().split('T')[0] // Format: yyyy-MM-dd 
  },
  actualWeightSent: { type: Number, default: 0 },
  weightReceived: { type: Number, default: 0 },
  receivedDate: { 
    type: String, 
    default: () => new Date().toISOString().split('T')[0] // Format: yyyy-MM-dd 
  },
  received: { type: Boolean, default: false },
  customId: { type: String, unique: true, required: true }, // Custom Unique ID
});

// Middleware to generate `customId` before saving
LineItemProcessSchema.pre('save', function (next) {
  this.customId = `${this.lineItemId}/${this.vendorId}/${this.processId}/${this.sequence}`;
  next();
});
const LineItemProcess = mongoose.model('LineItemProcess', LineItemProcessSchema);

// Exporting the Models
module.exports = LineItemProcess;
