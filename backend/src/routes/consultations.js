const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const router = express.Router();

router.get('/', authenticate, (req, res) => {
  res.json({ success: true, message: 'Consultations route - coming in Week 2', data: [] });
});

module.exports = router;