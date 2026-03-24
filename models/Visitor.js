<<<<<<< HEAD
const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  personId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: 'Unknown'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  imageUrl: {
    type: String,
    default: null
  },
  accessGranted: {
    type: Boolean,
    default: false
  },
  emotionDetected: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('Visitor', visitorSchema);
=======
const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  personId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: 'Unknown'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  imageUrl: {
    type: String,
    default: null
  },
  accessGranted: {
    type: Boolean,
    default: false
  },
  emotionDetected: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('Visitor', visitorSchema);
>>>>>>> bef748dd58cc032f2e9c5527e21a8411c0f1eadd
