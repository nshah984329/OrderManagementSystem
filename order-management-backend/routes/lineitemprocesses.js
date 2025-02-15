const express = require('express');
const router = express.Router();
const LineItemProcess = require('../models/lineitemprocess');

// Create a new LineItemProcess
router.post('/', async (req, res) => {
  try {
    const { lineItemId, processId, vendorId, sequence, customId } = req.body;
    console.log('lineitemprocess: POST - Raw Input Data:', { lineItemId, processId, vendorId, sequence, customId });
    if (!customId) {
      customId = `${lineItemId}/${vendorId}/${processId}/${sequence}`;
      console.log('lineitemprocess: POST - Generated missing customId:', customId);
    }
    if (!lineItemId || !processId || !vendorId || !customId ) {
      console.error('lineitemprocess: POST - Missing required fields:', { lineItemId, processId, vendorId, customId});
      return res.status(400).json({ message: 'Missing required fields: lineItemId, processId, vendorId.' });
    }

    const decodedLineItemId = decodeURIComponent(lineItemId);
    console.log('lineitemprocess: POST - Decoded lineItemId:', decodedLineItemId);

    const newProcess = new LineItemProcess({
      lineItemId: decodedLineItemId,
      processId,
      vendorId,
      sequence,
      customId,
    });
    
    const savedProcess = await newProcess.save();
    
    console.log('lineitemprocess: POST - Saved Process:', savedProcess);

    res.status(201).json({ message: 'Line item process created successfully.', savedProcess });
  } catch (error) {
    console.error('lineitemprocess: POST - Error creating line item process:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Fetch all LineItemProcesses for a specific LineItem
router.get('/:lineItemId', async (req, res) => {
  try {
    const lineItemId = decodeURIComponent(req.params.lineItemId);
    console.log('Fetching processes for lineItemId:', lineItemId);

    const processes = await LineItemProcess.find({ lineItemId }).sort({ sequence: 1 });

    const processesWithIds = processes.map((process, index) => ({
      ...process._doc,
      id: process._id ? process._id.toString() : `process-${index}`, // Ensure every item has an `id`
      sequence: process.sequence || index + 1, // Fallback for missing sequence
      processId: process.processId || `unknown-process-${index}`, // Fallback for missing processId
      vendorId: process.vendorId || `unknown-vendor-${index}`, // Fallback for missing vendorId
    }));

    console.log('Processed lineItemProcesses:', processesWithIds);
    res.json(processesWithIds);
  } catch (error) {
    console.error('Error fetching processes:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


// Reorder LineItemProcesses for a specific LineItem
router.put('/reorder/:lineItemId', async (req, res) => {
  try {
    const lineItemId = decodeURIComponent(req.params.lineItemId);
    const { reorderedProcesses } = req.body;

    if (!Array.isArray(reorderedProcesses)) {
      return res.status(400).json({ message: 'Invalid data format. Expecting an array of processes.' });
    }

    const bulkOps = reorderedProcesses.map((process) => ({
      updateOne: {
        filter: { _id: process.lineItemProcessId },
        update: { sequence: process.sequence },
      },
    }));

    const bulkResult = await LineItemProcess.bulkWrite(bulkOps);
    console.log('Bulk Write Result:', bulkResult);

    if (bulkResult.nModified !== reorderedProcesses.length) {
      console.warn('Some sequences were not updated:', bulkResult);
    }

    res.json({ message: 'Processes reordered successfully.', bulkResult });
  } catch (error) {
    console.error('Error reordering processes:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


// Update a specific LineItemProcess
router.put('/:lineItemProcessId', async (req, res) => {
  try {
    console.log('lineitemprocess: PUT Update - Raw Params:', req.params, 'Body:', req.body);

    const lineItemProcessId = decodeURIComponent(req.params.lineItemProcessId);
    console.log('lineitemprocess: PUT Update - Decoded lineItemProcessId:', lineItemProcessId);

    const { processId, vendorId, sequence } = req.body;

    const updatedProcess = await LineItemProcess.findByIdAndUpdate(
      lineItemProcessId,
      { processId, vendorId, sequence },
      { new: true }
    );

    console.log('lineitemprocess: PUT Update - Updated Process:', updatedProcess);

    if (!updatedProcess) {
      return res.status(404).json({ message: 'Line item process not found.' });
    }

    res.json({ message: 'Line item process updated successfully.', updatedProcess });
  } catch (error) {
    console.error('lineitemprocess: PUT Update - Error updating line item process:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Delete a specific LineItemProcess
router.delete('/:lineItemProcessId', async (req, res) => {
  try {
    console.log('lineitemprocess: DELETE - Raw Params:', req.params);

    const lineItemProcessId = decodeURIComponent(req.params.lineItemProcessId);
    console.log('lineitemprocess: DELETE - Decoded lineItemProcessId:', lineItemProcessId);

    const deletedProcess = await LineItemProcess.findByIdAndDelete(lineItemProcessId);
    console.log('lineitemprocess: DELETE - Deleted Process:', deletedProcess);

    if (!deletedProcess) {
      return res.status(404).json({ message: 'Line item process not found.' });
    }

    res.json({ message: 'Line item process deleted successfully.', deletedProcess });
  } catch (error) {
    console.error('lineitemprocess: DELETE - Error deleting line item process:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;
