const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/search', async (req, res) => {
  const { query } = req.query;
  // Placeholder for real contact search
  res.json({ results: [], query });
});

module.exports = router;
