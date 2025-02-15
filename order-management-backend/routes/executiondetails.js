const express = require('express');
const router = express.Router();
const ExecutionDetail = require('../models/executiondetail');
const mongoose = require('mongoose');

// 1️⃣ Fetch Execution Details Grouped by Vendor-Process
router.get('/grouped', async (req, res) => {
    try {
      const executionDetails = await ExecutionDetail.aggregate([
        {
          $lookup: {
            from: "processes", // Collection name (must match DB)
            localField: "processId", // Field in ExecutionDetail
            foreignField: "processId", // Field in Process (String)
            as: "processInfo",
          },
        },
        {
          $lookup: {
            from: "vendors",
            localField: "vendorId",
            foreignField: "_id",
            as: "vendorInfo",
          },
        },
        {
          $lookup: {
            from: "orders",
            localField: "orderId",
            foreignField: "_id",
            as: "orderInfo",
          },
        },
        {
          $unwind: { path: "$processInfo", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$vendorInfo", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$orderInfo", preserveNullAndEmptyArrays: true },
        },
      ]);
  
      res.json(executionDetails);
    } catch (error) {
      console.error("Error fetching execution details:", error.message);
      res.status(500).json({ error: error.message });
    }
  });
  

// 2️⃣ Create Execution Details (Multiple Line Items under a Vendor-Process)
router.post('/', async (req, res) => {
    try {
      const { processId, vendorId, lineItemId, orderId, outWeight, dateSent, piecesSent } = req.body;
  
      if (!processId || !vendorId || !lineItemId || !orderId) {
        console.error("🚨 Missing required fields in request body:", req.body);
        return res.status(400).json({ error: "Missing required fields: processId, vendorId, lineItemId, orderId" });
      }
  
      const newExecution = new ExecutionDetail({
        processId,
        vendorId,
        lineItemId,
        orderId,
        outWeight: outWeight !== undefined ? outWeight : 0, // Ensure valid weight
        inWeight: 0,
        dateSent: dateSent || new Date().toISOString().split('T')[0], // Ensure valid date
        dateReceived: null,
        piecesSent: piecesSent !== undefined ? piecesSent : 1, // Ensure valid piecesSent
        piecesReceived: 0,
        status: 'Pending',
        dateCreated: new Date(),
      });
  
      await newExecution.save();
      res.status(201).json(newExecution);
    } catch (error) {
      console.error('❌ Error adding execution details:', error.message);
      res.status(500).json({ error: error.message });
    }
  });
  

// 3️⃣ Update Execution Details (Receive Material & Update Status)
router.put('/:executionId', async (req, res) => {
  try {
    const { actualWeightSent, actualWeightReceived, dateReceived, piecesReceived, status } = req.body;

    // Restrict updates to only allowed fields
    const updateData = {};
    if (actualWeightSent !== undefined) updateData.actualWeightSent = actualWeightSent;
    if (actualWeightReceived !== undefined) updateData.actualWeightReceived = actualWeightReceived;
    if (dateReceived !== undefined) updateData.dateReceived = dateReceived;
    if (piecesReceived !== undefined) updateData.piecesReceived = piecesReceived;
    if (status) updateData.status = status;

    const updatedExecution = await ExecutionDetail.findByIdAndUpdate(req.params.executionId, updateData, { new: true });

    if (!updatedExecution) return res.status(404).json({ message: 'Execution detail not found' });

    res.json(updatedExecution);
  } catch (error) {
    console.error('Error updating execution details:', error.message);
    res.status(500).json({ error: error.message });
  }
});


// 4️⃣ Fetch Execution Details for a Specific Line Item
router.get('/lineitem/:lineItemId', async (req, res) => {
    try {
      let { lineItemId } = req.params;
      const DeclineItemId = decodeURIComponent(lineItemId)
      // Check if lineItemId is an ObjectId format
      const isValidObjectId = mongoose.Types.ObjectId.isValid(DeclineItemId);
  
      if (isValidObjectId) {
        lineItemId = new mongoose.Types.ObjectId(DeclineItemId);
      }
  
      console.log(`Fetching execution details for lineItemId: ${DeclineItemId}`);
  
      const executionDetails = await ExecutionDetail.find({
        'lineItems.lineItemId': DeclineItemId
      });
  
      if (!executionDetails.length) {
        return res.status(404).json({ message: 'No execution details found' });
      }
  
      res.json(executionDetails);
    } catch (error) {
      console.error('Error fetching execution details:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

// 5️⃣ Delete Execution Details (for a Vendor-Process)
router.delete('/:executionId', async (req, res) => {
  try {
    const deletedExecution = await ExecutionDetail.findByIdAndDelete(req.params.executionId);
    if (!deletedExecution) return res.status(404).json({ message: 'Execution detail not found' });

    res.json({ message: 'Execution details deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
