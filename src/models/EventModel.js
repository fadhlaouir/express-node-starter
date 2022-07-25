/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/* -------------------------------------------------------------------------- */
/*                                Event Schema                                */
/* -------------------------------------------------------------------------- */
const EventSchema = new Schema({
  gallery: [String],
  photo: String,
  start_at: Date,
  end_at: Date,
  link: String,
  isEvent: Boolean,
  ar: {
    event_name: { type: String, required: true },
    description: String,
    event_location: String,
  },
  fr: {
    event_name: { type: String, required: true },
    description: String,
    event_location: String,
  },
  coordinates: {
    latitude: String,
    longitude: String,
  },
  createdAt: Date,
  updatedAt: Date,
});

// export Event Schema
module.exports = mongoose.model('Event', EventSchema);
