const mongoose = require('mongoose');
const ExecutionDetailSchema = new mongoose.Schema({
  processId: { type: String, ref: 'Process', required: true },
  vendorId: { type: String, ref: 'Vendor', required: true },
  lineItemId: { type: String, ref: 'LineItem', required: true },
  orderId: { type: String, ref: 'Order', required: true },
  outWeight: { type: Number, required: true }, // Weight sent
  inWeight: { type: Number, default: 0 }, // Weight received
  actualWeightSent: { type: Number, default: 0 }, // ✅ Add this
  actualWeightReceived: { type: Number, default: 0 }, // ✅ Add this
  dateSent: { type: Date, required: true },
  dateReceived: { type: Date, default: null },
  piecesSent: { type: Number, required: true },
  piecesReceived: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Complete'],
    default: 'Pending',
  },
  dateCreated: { type: Date, default: Date.now },
});

const ExecutionDetail = mongoose.model('ExecutionDetail', ExecutionDetailSchema);
module.exports = ExecutionDetail;
