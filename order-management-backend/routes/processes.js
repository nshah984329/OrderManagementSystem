// routes/processes.js
const express = require('express');
const router = express.Router();
const Process = require('../models/process');

// Get all processes
router.get('/', async (req, res) => {
  try {
    const processes = await Process.find();
    res.json(processes);
  } catch (error) {
    console.error('Error fetching processes:', error.message);
    res.status(500).send(error.message);
  }
});

// Create a new process
router.post('/', async (req, res) => {
  try {
    const newProcess = new Process(req.body);
    await newProcess.save();
    res.status(201).json(newProcess);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;