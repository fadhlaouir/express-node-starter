/* -------------------------------------------------------------------------- */
/*                                Dependencies                                */
/* -------------------------------------------------------------------------- */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/* -------------------------------------------------------------------------- */
/*                                Event Schema                                */
/* -------------------------------------------------------------------------- */
const EventSchema = new Schema(
  {
    gallery: [String],
    photo: String,
    title: { type: String, required: true },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

// export Event Schema
module.exports = mongoose.model('Event', EventSchema);
