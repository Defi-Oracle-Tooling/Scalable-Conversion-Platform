const express = require('express');
const router = express.Router();

router.post('/convert', async (req, res) => {
  try {
    res.json({ message: 'Conversion initiated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/rates', async (req, res) => {
  try {
    res.json({ rates: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
