const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const router = express.Router();

router.get('/', authenticate, (req, res) => {
  res.json({ success: true, message: 'Documents route - coming in Week 2', data: [] });
});

module.exports = router;