const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Lawyers route - coming in Week 2', data: [] });
});

module.exports = router;