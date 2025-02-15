// routes/vendors.js
const express = require('express');
const router = express.Router();
const Vendor = require('../models/vendor');

// Get all vendors
router.get('/', async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error.message);
    res.status(500).send(error.message);
  }
});

// Create a new vendor
router.post('/', async (req, res) => {
  const { vendorId, contact, location } = req.body;

  if (!vendorId) {
    return res.status(400).json({ error: 'Vendor ID is required.' });
  }

  try {
    const newVendor = new Vendor({ vendorId, contact, location });
    await newVendor.save();
    res.status(201).json(newVendor); // Return the created vendor object
  } catch (error) {
    console.error('Error creating vendor:', error.message);
    res.status(400).json({ error: error.message });
  }
});


// Update vendor details
router.put('/:vendorId', async (req, res) => {
  try {
    const vendorId = decodeURIComponent(req.params.vendorId); // Explicitly decode vendorId
    const updates = req.body;

    const updatedVendor = await Vendor.findOneAndUpdate({ vendorId }, updates, { new: true });
    if (!updatedVendor) {
      return res.status(404).json({ error: 'Vendor not found.' });
    }

    res.status(200).json(updatedVendor);
  } catch (err) {
    console.error('Error updating vendor:', err.message);
    res.status(500).json({ error: 'Failed to update vendor.' });
  }
});
module.exports = router;