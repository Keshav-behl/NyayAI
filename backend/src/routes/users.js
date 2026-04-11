const express = require('express');
const { authenticate } = require('../middleware/authenticate');
const router = express.Router();

router.get('/profile', authenticate, (req, res) => {
  res.json({ success: true, message: 'Users route - coming in Week 2', userId: req.user.id });
});

module.exports = router;