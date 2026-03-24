const express = require('express');
const router = express.Router();
const storage = require('../db/storage');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get profile
router.get('/profile', authMiddleware, (req, res) => {
  const user = storage.findUserById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { password, ...userData } = user;
  res.json(userData);
});

// Update profile
router.put('/profile', authMiddleware, (req, res) => {
  const user = storage.updateUser(req.userId, req.body);

  if (!user) return res.status(404).json({ message: 'User not found' });

  const { password, ...userData } = user;
  res.json(userData);
});

// Register face
router.post('/register-face', authMiddleware, (req, res) => {
  const { userId, faceSamples } = req.body;

  if (!faceSamples || faceSamples.length < 5) {
    return res.status(400).json({ message: 'Need 5 samples' });
  }

  const faceId = `FACE_${userId}_${Date.now()}`;

  storage.saveFaceData(faceId, {
    faceId,
    userId,
    samples: faceSamples
  });

  storage.updateUser(userId, { faceId });

  res.json({ faceId });
});

// Get face data
router.get('/face-data/:userId', authMiddleware, (req, res) => {
  const user = storage.findUserById(req.params.userId);

  if (!user || !user.faceId) {
    return res.status(404).json({ message: 'No face data' });
  }

  res.json(storage.getFaceData(user.faceId));
});

// Verify face
router.post('/verify-face', authMiddleware, (req, res) => {
  const { userId, faceLandmarks } = req.body;

  const user = storage.findUserById(userId);
  if (!user || !user.faceId) {
    return res.status(404).json({ message: 'No face registered' });
  }

  const faceData = storage.getFaceData(user.faceId);

  let maxSimilarity = 0;

  for (let sample of faceData.samples) {
    const sim = compare(faceLandmarks, sample.landmarks);
    maxSimilarity = Math.max(maxSimilarity, sim);
  }

  res.json({
    verified: maxSimilarity > 0.7,
    confidence: maxSimilarity
  });
});

// Simple comparison
function compare(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.abs(a[i][0] - b[i][0]) + Math.abs(a[i][1] - b[i][1]);
  }
  return Math.max(0, 1 - sum / 1000);
}

module.exports = router;
