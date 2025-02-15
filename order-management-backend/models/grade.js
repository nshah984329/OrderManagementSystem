// Importing required libraries
const mongoose = require('mongoose');

// Grade Schema
const GradeSchema = new mongoose.Schema({
  grade: { type: String, required: true, unique: true },
  density: { type: Number, required: true },
  chemicalComposition: { type: String, required: true },
});

const Grade = mongoose.model('Grade', GradeSchema);
// Exporting the Models
module.exports = Grade;
