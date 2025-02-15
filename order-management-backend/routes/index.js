// Importing required libraries
const express = require('express');
const router = express.Router();

// Import individual route handlers
const ordersRoutes = require('./orders');
const gradesRoutes = require('./grades');
const shapesRoutes = require('./shapes');
const lineItemsRoutes = require('./lineitems');
const processesRoutes = require('./processes');
const vendorsRoutes = require('./vendors');
const lineItemProcessesRoutes = require('./lineitemprocesses');
const vendorProcessesRoutes = require('./vendorprocesses');
const executionDetailsRoutes = require('./executiondetails')
// Use route handlers
router.use('/orders', ordersRoutes);
router.use('/grades', gradesRoutes);
router.use('/shapes', shapesRoutes);
router.use('/lineitems', lineItemsRoutes);
router.use('/processes', processesRoutes);
router.use('/vendors', vendorsRoutes);
router.use('/lineitemprocesses', lineItemProcessesRoutes);
router.use('/vendorprocesses', vendorProcessesRoutes);
router.use('/executiondetails',executionDetailsRoutes);
module.exports = router;