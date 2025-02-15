// routes/grades.js
const express = require('express');
const router = express.Router();
const Grade = require('../models/grade');

// Get all grades
router.get('/', async (req, res) => {
  try {
    const grades = await Grade.find();
    res.json(grades);
  } catch (error) {
    console.error('Error fetching grades:', error.message);
    res.status(500).send(error.message);
  }
});

// Create a new grade
router.post('/', async (req, res) => {
  try {
    const { grade, density, chemicalComposition } = req.body;
    const newGrade = new Grade({ grade, density, chemicalComposition });
    await newGrade.save();
    res.status(201).json(newGrade);
  } catch (error) {
    res.status(400).send(error.message);
  }
});


module.exports = router;