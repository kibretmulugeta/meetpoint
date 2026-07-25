const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: null },
  status: { type: String, enum: ['pending', 'accepted', 'declined', 'tentative'], default: 'pending' }
}, { _id: false });

const appointmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: null },
  start_time: { type: Date, required: true }, // Stored as UTC
  end_time: { type: Date, required: true }, // Stored as UTC
  timezone: { type: String, required: true },
  location: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    place_id: { type: String, default: null },
    google_maps_url: { type: String, default: null }
  },
  organizer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  participants: [participantSchema]
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
