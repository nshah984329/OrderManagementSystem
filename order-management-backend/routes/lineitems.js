const express = require('express');
const router = express.Router();
const LineItem = require('../models/lineitem');
const Order = require('../models/order');
const mongoose = require('mongoose');
const LineItemProcess = require('../models/lineitemprocess'); // Import LineItemProcess model
const ExecutionDetail = require('../models/executiondetail'); // Import ExecutionDetail model

router.put('/test/:lineItemId', (req, res) => {
  const lineItemId = decodeURIComponent(req.params.lineItemId);
  console.log('Test route hit with ID:', lineItemId);
  res.send(`Received ID: ${lineItemId}`);
});


router.put('/:lineItemId', async (req, res) => {
  try {
    const lineItemId = decodeURIComponent(req.params.lineItemId);
    console.log('Decoded Line Item ID:', lineItemId);

    console.log('Request Body:', req.body); // Log the request body

    const { processIds = [], vendorIds = [] } = req.body;
    console.log('Parsed processIds:', processIds); // Log parsed data
    console.log('Parsed vendorIds:', vendorIds);

    const updatedLineItem = await LineItem.findOneAndUpdate(
      { lineItemId },
      { $set: { processIds, vendorIds } },
      { new: true }
    );

    if (!updatedLineItem) {
      console.log(`No line item found for ID: ${lineItemId}`);
      return res.status(404).json({ message: 'Line item not found' });
    }

    console.log('Updated Line Item:', updatedLineItem);
    res.json(updatedLineItem);
  } catch (error) {
    console.error('Error updating line item:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.delete('/:lineItemId', async (req, res) => {
  const lineItemId = decodeURIComponent(req.params.lineItemId); // Decode ID

  try {
    console.log(`Deleting line item: ${lineItemId}`);

    // 🗑️ 1️⃣ Delete the LineItem
    const deletedLineItem = await LineItem.findOneAndDelete({ lineItemId });
    if (!deletedLineItem) {
      return res.status(404).json({ message: 'Line item not found' });
    }

    // 🗑️ 2️⃣ Delete Related LineItemProcesses
    const deletedProcesses = await LineItemProcess.deleteMany({ lineItemId });
    console.log(`Deleted ${deletedProcesses.deletedCount} LineItemProcesses for ${lineItemId}`);

    // 🗑️ 3️⃣ Delete Related ExecutionDetails
    const deletedExecutions = await ExecutionDetail.deleteMany({ lineItemId });
    console.log(`Deleted ${deletedExecutions.deletedCount} ExecutionDetails for ${lineItemId}`);

    res.json({ 
      message: 'Line item and related records deleted successfully', 
      deletedProcesses: deletedProcesses.deletedCount,
      deletedExecutions: deletedExecutions.deletedCount
    });

  } catch (error) {
    console.error('Error deleting line item:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Fetch all line items
router.get('/', async (req, res) => {
  try {
    const lineItems = await LineItem.find().populate({
      path: 'orderId', // Assuming `orderId` references `Order`
      select: 'orderId creator responsible', // Include these fields from `Order`
    });

    const formattedLineItems = lineItems.map((item) => ({
      ...item._doc, // Spread original document fields
      dimensions: {
        length: item.length || null,
        breadth: item.breadth || null,
        thickness: item.thickness || null,
        diameter: item.diameter || null,
      },
    }));

    res.json(formattedLineItems);
  } catch (error) {
    console.error('Error fetching line items:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new line item
const Counter1 = mongoose.model(
  'Counter1',
  new mongoose.Schema({
    name: { type: String, required: true },
    seq: { type: Number, required: true },
  })
);
async function getNextLineItemSequence(orderId) {
  const counterName = `lineitems_${orderId}`;
  const counter = await Counter1.findOneAndUpdate(
    { name: counterName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

router.post('/', async (req, res) => {
  try {
    const { orderId, dimensions, ...rest } = req.body;
    console.log('Received dimensions:', dimensions); // Debug log

    if (!orderId) {
      return res.status(400).json({ message: 'Missing orderId' });
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const nextSequence = await getNextLineItemSequence(orderId);
    const lineItemId = `${orderId}/${String(nextSequence).padStart(2, '0')}`;
    if (dimensions) {
      if (
        !['length', 'breadth', 'thickness', 'diameter'].every(
          (key) => dimensions[key] === null || typeof dimensions[key] === 'number'
        )
      ) {
        return res.status(400).json({ message: 'Dimensions must be numbers or null' });
      }
    }
    const newLineItem = new LineItem({
      ...rest,
      orderId: order._id,
      lineItemId,
      dimensions: dimensions || {}, // Ensure dimensions is passed
    });

    const savedLineItem = await newLineItem.save();
    res.status(201).json(savedLineItem);
  } catch (error) {
    if (error.code === 11000) {
      console.error('Duplicate key error:', error.message);
      return res.status(400).json({ message: 'Line item ID must be unique' });
    }
    console.error('Error creating line item:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

router.get('/:lineItemId', async (req, res) => {
  try {
    // Decode the lineItemId to match MongoDB storage format
    const lineItemId = decodeURIComponent(req.params.lineItemId);
    console.log('Decoded Line Item ID:', lineItemId);

    // Fetch from database using the decoded lineItemId
    const lineItem = await LineItem.findOne({ lineItemId });

    if (!lineItem) {
      return res.status(404).json({ message: 'Line item not found' });
    }

    res.json(lineItem);
  } catch (error) {
    console.error('Error fetching line item:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Fetch line items for a specific order
router.get('/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId }); // Find order by `orderId`
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const lineItems = await LineItem.find({ orderId: order._id }); // Query using `_id`
    res.json(lineItems);
  } catch (error) {
    console.error('Error fetching line items:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Generate the next line item ID for an order
router.get('/nextLineItemId/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const lastLineItem = await LineItem.aggregate([
      { $match: { orderId: order._id } },
      {
        $group: {
          _id: null,
          maxSequence: { $max: { $toInt: { $arrayElemAt: [{ $split: ['$lineItemId', '/'] }, 1] } } },
        },
      },
    ]);

    const nextSequence = lastLineItem.length > 0 ? lastLineItem[0].maxSequence + 1 : 1;
    const nextLineItemId = `${orderId}/${String(nextSequence).padStart(2, '0')}`;

    res.json({ nextLineItemId });
  } catch (error) {
    console.error('Error generating next line item ID:', error.message);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});



module.exports = router;
