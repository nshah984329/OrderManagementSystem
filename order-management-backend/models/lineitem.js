// Importing required libraries
const mongoose = require('mongoose');

// Line Item Schema
const LineItemSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  lineItemId: {type: String, required: true, unique: true},
  shape: { type: String, required: true },
  grade: { type: String, required: true },
  dimensions: {
    length: { type: Number ,default:null },
    breadth: { type: Number ,default:null },
    thickness: { type: Number ,default:null} ,
    diameter: { type: Number ,default:null },
  },
  quantity: { type: Number, required: true },
  weight: { type: Number, required: true },
  processIds: { type: [String] },
  vendorIds: { type: [String] },
});


const LineItem = mongoose.model('LineItem', LineItemSchema);
// Exporting the Models
module.exports =LineItem;
