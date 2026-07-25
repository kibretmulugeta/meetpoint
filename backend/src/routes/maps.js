const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({ error: "Google Maps API key not configured" });
    }
    
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get(url);
    
    res.json({ results: response.data.predictions || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/place/:place_id', async (req, res) => {
  try {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({ error: "Google Maps API key not configured" });
    }
    
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${req.params.place_id}&fields=name,formatted_address,geometry,url&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get(url);
    
    const result = response.data.result || {};
    
    res.json({
      name: result.name,
      address: result.formatted_address,
      latitude: result.geometry?.location?.lat,
      longitude: result.geometry?.location?.lng,
      google_maps_url: result.url,
      place_id: req.params.place_id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
