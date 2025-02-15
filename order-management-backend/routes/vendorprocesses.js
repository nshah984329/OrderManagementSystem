const express = require('express');
const router = express.Router();
const VendorProcess = require('../models/vendorprocess');
const Vendor = require('../models/vendor');

// Get all vendor processes for a specific vendor
router.get('/:vendorId', async (req, res) => {
  try {
    const vendorId = decodeURIComponent(req.params.vendorId); // Explicitly decode vendorId
    console.log('Decoded vendorId:', vendorId);

    // Ensure vendorId exists in the database
    const vendorProcesses = await VendorProcess.find({ vendorId });

    // Handle case where no records exist
    if (!vendorProcesses || vendorProcesses.length === 0) {
      console.log(`No processes found for vendorId: ${vendorId}`);
      return res.status(200).json({ message: 'No processes linked to this vendor.', vendorProcesses: [] });
    }

    res.status(200).json(vendorProcesses);
  } catch (err) {
    console.error('Error fetching vendor processes:', err.message);
    res.status(500).json({ error: 'Failed to fetch vendor processes.' });
  }
});



// Delete a vendor-process link
router.delete('/:vendorId/:processId', async (req, res) => {
  try {
    const vendorId = decodeURIComponent(req.params.vendorId); // Decode vendorId
    const processId = decodeURIComponent(req.params.processId); // Decode processId

    const deleted = await VendorProcess.findOneAndDelete({ vendorId, processId });
    if (!deleted) {
      return res.status(404).json({ error: 'Vendor process not found.' });
    }

    res.status(200).json({ message: 'VendorProcess deleted successfully.' });
  } catch (err) {
    console.error('Error deleting vendor process:', err.message);
    res.status(500).json({ error: 'Failed to delete vendor process.' });
  }
});

// Create a new vendor process
router.post('/', async (req, res) => {
  try {
    const { vendorId, processId } = req.body;

    // Validate request body
    if (!vendorId || !processId) {
      return res.status(400).json({ error: 'vendorId and processId are required.' });
    }

    const newVendorProcess = new VendorProcess(req.body);
    await newVendorProcess.save();
    res.status(201).json(newVendorProcess);
  } catch (error) {
    console.error('Error creating vendor process:', error.message);
    res.status(400).json({ error: error.message });
  }
});
// Get all vendor processes
router.get('/', async (req, res) => {
  try {
    const vp = await VendorProcess.find();
    res.json(vp);
  } catch (error) {
    console.error('Error fetching vendors:', error.message);
    res.status(500).send(error.message);
  }
});

module.exports = router;
