const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const mongoose = require('mongoose');
// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get a single order by orderId
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('Querying for orderId:', orderId); // Log the queried orderId
    const order = await Order.findOne({ orderId });
    if (!order) {
      console.log('Order not found for ID:', orderId); // Log missing order
      return res.status(404).send('Order not found');
    }
    console.log('Found order:', order); // Log found order
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error.message);
    res.status(500).send(error.message);
  }
});


const Counter = mongoose.model(
  'Counter',
  new mongoose.Schema({
    name: { type: String, required: true },
    seq: { type: Number, required: true },
  })
);

async function getNextSequence(name) {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}


router.post('/', async (req, res) => {
  console.log('POST /api/orders hit with body:', req.body);
  try {
    const { creator, responsible, company } = req.body;

    if (!creator || !responsible || !company) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const nextSeq = await getNextSequence('orders');
    const orderId = `MM-${String(nextSeq).padStart(4, '0')}`;

    const newOrder = new Order({ creator, responsible, company, orderId });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error.message);
    res.status(500).send('Failed to create order');
  }
});

router.get('/nextId', async (req, res) => {
  try {
    const nextSeq = await getNextSequence('orders');
    const nextOrderId = `MM-${String(nextSeq).padStart(4, '0')}`;
    res.json({ nextOrderId });
  } catch (error) {
    console.error('Error fetching next order ID:', error.message);
    res.status(500).send('Failed to fetch next order ID');
  }
});

// Update an existing order
router.put('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const updates = req.body;

    const updatedOrder = await Order.findOneAndUpdate({ orderId }, updates, { new: true });
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error.message);
    res.status(500).send('Failed to update order');
  }
});

// Delete an existing order
router.delete('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const deletedOrder = await Order.findOneAndDelete({ orderId });
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error.message);
    res.status(500).send('Failed to delete order');
  }
});


module.exports = router;
