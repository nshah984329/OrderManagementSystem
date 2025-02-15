// Importing required libraries
const mongoose = require('mongoose');

// Process Schema
const ProcessSchema = new mongoose.Schema({
  processId: { type: String, required: true, unique: true },
});

const Process = mongoose.model('Process', ProcessSchema);


// Exporting the Models
module.exports = Process;
