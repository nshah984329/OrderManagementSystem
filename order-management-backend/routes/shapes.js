// routes/shapes.js
const express = require('express');
const router = express.Router();
const Shape = require('../models/shape');

// Get all shapes
router.get('/', async (req, res) => {
  try {
    const shapes = await Shape.find();
    console.log('Shapes fetched from DB:', shapes); // Log data
    res.json(shapes);
  } catch (error) {
    console.error('Error fetching shapes:', error.message);
    res.status(500).send(error.message);
  }
});




router.post('/', async (req, res) => {
  try {
    const { shapeId } = req.body;

    // Check for hardcoding
    if (!shapeId) {
      return res.status(400).json({ message: 'Shape ID is required.' });
    }

    // Check for duplicate shapeId
    const existingShape = await Shape.findOne({ shapeId });
    if (existingShape) {
      return res.status(400).json({ message: 'Shape with this ID already exists.' });
    }

    // Create a new shape
    const newShape = new Shape(req.body);
    await newShape.save();
    res.status(201).json(newShape);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;