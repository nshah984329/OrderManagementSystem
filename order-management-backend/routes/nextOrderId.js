
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
  module.exports = router;