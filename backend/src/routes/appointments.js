const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const { protect } = require('../middleware/authMiddleware');

// Ensure user is authenticated for all routes
router.use(protect);

// Create Appointment
router.post('/', async (req, res) => {
  try {
    const newApp = new Appointment({
      ...req.body,
      organizer_id: req.user._id
    });
    const saved = await newApp.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Appointments
router.get('/', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    let query = {
      $or: [
        { organizer_id: req.user._id },
        { "participants.email": req.user.email }
      ]
    };
    
    if (start_date || end_date) {
      query.start_time = {};
      if (start_date) query.start_time.$gte = new Date(start_date);
      if (end_date) query.start_time.$lte = new Date(end_date);
    }
    
    const appointments = await Appointment.find(query);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single Appointment
router.get('/:id', async (req, res) => {
  try {
    const app = await Appointment.findById(req.params.id);
    if (!app) return res.status(404).json({ message: "Not found" });
    
    const isOrganizer = app.organizer_id.toString() === req.user._id.toString();
    const isParticipant = app.participants.some(p => p.email === req.user.email);
    
    if (!isOrganizer && !isParticipant) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    res.json(app);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// RSVP
router.post('/:id/rsvp', async (req, res) => {
  try {
    const { status } = req.query;
    const app = await Appointment.findById(req.params.id);
    
    if (!app) return res.status(404).json({ message: "Not found" });
    
    const participantIndex = app.participants.findIndex(p => p.email === req.user.email);
    
    if (participantIndex === -1) {
      return res.status(403).json({ message: "You are not a participant" });
    }
    
    app.participants[participantIndex].status = status;
    app.participants[participantIndex].user_id = req.user._id;
    await app.save();
    
    res.json(app);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
