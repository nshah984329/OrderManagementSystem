const mongoose = require('mongoose');

const ShapeSchema = new mongoose.Schema({
  shapeId: { type: String, required: true, unique: true },
});

const Shape = mongoose.model('Shape', ShapeSchema);

module.exports = Shape; // Ensure this line is exporting the model
