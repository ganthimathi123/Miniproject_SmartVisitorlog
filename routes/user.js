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

// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = storage.findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { nickname, language, voiceProfile, faceId } = req.body;
    
    const user = storage.updateUser(req.userId, {
      nickname,
      language,
      voiceProfile,
      faceId
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json({ message: 'Profile updated', user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register face samples
router.post('/register-face', authMiddleware, async (req, res) => {
  try {
    const { userId, faceSamples } = req.body;
    
    // Verify user owns this account or is admin
    if (req.userId !== userId) {
      const user = storage.findUserById(req.userId);
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
    }
    
    // Validate face samples
    if (!faceSamples || !Array.isArray(faceSamples) || faceSamples.length < 5) {
      return res.status(400).json({ message: 'At least 5 face samples required' });
    }
    
    // Generate face ID
    const faceId = `FACE_${userId}_${Date.now()}`;
    
    // Store face samples
    const faceData = {
      faceId,
      userId,
      samples: faceSamples,
      registeredAt: new Date().toISOString(),
      sampleCount: faceSamples.length
    };
    
    storage.saveFaceData(faceId, faceData);
    
    // Update user with face ID
    storage.updateUser(userId, { faceId });
    
    res.json({ 
      message: 'Face registered successfully',
      faceId,
      sampleCount: faceSamples.length
    });
    
  } catch (error) {
    console.error('Face registration error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get registered face data
router.get('/face-data/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user owns this account or is admin
    if (req.userId !== userId) {
      const user = storage.findUserById(req.userId);
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
    }
    
    const user = storage.findUserById(userId);
    if (!user || !user.faceId) {
      return res.status(404).json({ message: 'No face data registered' });
    }
    
    const faceData = storage.getFaceData(user.faceId);
    if (!faceData) {
      return res.status(404).json({ message: 'Face data not found' });
    }
    
    res.json(faceData);
    
  } catch (error) {
    console.error('Get face data error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify face against registered samples
router.post('/verify-face', authMiddleware, async (req, res) => {
  try {
    const { userId, faceLandmarks } = req.body;
    
    if (!userId || !faceLandmarks) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    const user = storage.findUserById(userId);
    if (!user || !user.faceId) {
      return res.status(404).json({ message: 'No face registered for this user' });
    }
    
    const faceData = storage.getFaceData(user.faceId);
    if (!faceData) {
      return res.status(404).json({ message: 'Face data not found' });
    }
    
    console.log(`\n🔍 Verifying face for user: ${user.nickname || user.email}`);
    console.log(`   Registered samples: ${faceData.samples.length}`);
    
    // Enhanced comparison with multiple algorithms
    let similarities = [];
    const threshold = 0.70; // 70% similarity required for authentication
    
    for (let i = 0; i < faceData.samples.length; i++) {
      const sample = faceData.samples[i];
      
      // Use multiple comparison methods
      const euclideanSim = compareFaceLandmarksEuclidean(faceLandmarks, sample.landmarks);
      const cosineSim = compareFaceLandmarksCosine(faceLandmarks, sample.landmarks);
      const normalizedSim = compareFaceLandmarksNormalized(faceLandmarks, sample.landmarks);
      
      // Weighted average of all methods
      const combinedSimilarity = (euclideanSim * 0.4) + (cosineSim * 0.3) + (normalizedSim * 0.3);
      
      similarities.push({
        index: i,
        euclidean: euclideanSim,
        cosine: cosineSim,
        normalized: normalizedSim,
        combined: combinedSimilarity
      });
      
      console.log(`   Sample ${i + 1}: Euclidean=${euclideanSim.toFixed(3)}, Cosine=${cosineSim.toFixed(3)}, Normalized=${normalizedSim.toFixed(3)}, Combined=${combinedSimilarity.toFixed(3)}`);
    }
    
    // Find best matches
    const maxSimilarity = Math.max(...similarities.map(s => s.combined));
    const matchCount = similarities.filter(s => s.combined >= threshold).length;
    const avgSimilarity = similarities.reduce((sum, s) => sum + s.combined, 0) / similarities.length;
    
    // Strict verification: require at least 5 samples matching above 70% threshold
    const MINIMUM_MATCHES = 5;
    const verified = maxSimilarity >= threshold && matchCount >= MINIMUM_MATCHES;
    
    console.log(`   Max similarity: ${(maxSimilarity * 100).toFixed(1)}%`);
    console.log(`   Avg similarity: ${(avgSimilarity * 100).toFixed(1)}%`);
    console.log(`   Matches above threshold (70%): ${matchCount}/${faceData.samples.length}`);
    console.log(`   Required matches: ${MINIMUM_MATCHES}`);
    console.log(`   Verified: ${verified ? '✅ YES' : `❌ NO - ${matchCount < MINIMUM_MATCHES ? 'Insufficient matches (need 5+)' : 'This person is not the authenticated user'}`}\n`);
    
    res.json({
      verified,
      confidence: maxSimilarity,
      avgConfidence: avgSimilarity,
      matchCount,
      totalSamples: faceData.samples.length,
      threshold,
      details: similarities
    });
    
  } catch (error) {
    console.error('Face verification error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Enhanced comparison algorithms

// Method 1: Euclidean distance (improved with better scaling)
function compareFaceLandmarksEuclidean(landmarks1, landmarks2) {
  if (!landmarks1 || !landmarks2) return 0;
  
  let totalDistance = 0;
  const points = Math.min(landmarks1.length, landmarks2.length);
  
  for (let i = 0; i < points; i++) {
    const dx = landmarks1[i][0] - landmarks2[i][0];
    const dy = landmarks1[i][1] - landmarks2[i][1];
    totalDistance += Math.sqrt(dx * dx + dy * dy);
  }
  
  const avgDistance = totalDistance / points;
  // Improved scaling - more sensitive to small differences
  const similarity = Math.max(0, 1 - (avgDistance / 150));
  
  return similarity;
}

// Method 2: Cosine similarity
function compareFaceLandmarksCosine(landmarks1, landmarks2) {
  if (!landmarks1 || !landmarks2) return 0;
  
  // Flatten landmarks to vectors
  const vec1 = landmarks1.flat();
  const vec2 = landmarks2.flat();
  
  const points = Math.min(vec1.length, vec2.length);
  
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;
  
  for (let i = 0; i < points; i++) {
    dotProduct += vec1[i] * vec2[i];
    mag1 += vec1[i] * vec1[i];
    mag2 += vec2[i] * vec2[i];
  }
  
  mag1 = Math.sqrt(mag1);
  mag2 = Math.sqrt(mag2);
  
  if (mag1 === 0 || mag2 === 0) return 0;
  
  const cosineSim = dotProduct / (mag1 * mag2);
  // Convert from [-1, 1] to [0, 1]
  return (cosineSim + 1) / 2;
}

// Method 3: Normalized distance with relative positioning
function compareFaceLandmarksNormalized(landmarks1, landmarks2) {
  if (!landmarks1 || !landmarks2) return 0;
  
  const points = Math.min(landmarks1.length, landmarks2.length);
  
  // Calculate bounding boxes for normalization
  const getBounds = (landmarks) => {
    const xs = landmarks.map(p => p[0]);
    const ys = landmarks.map(p => p[1]);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys)
    };
  };
  
  const bounds1 = getBounds(landmarks1);
  const bounds2 = getBounds(landmarks2);
  
  const width1 = bounds1.maxX - bounds1.minX;
  const height1 = bounds1.maxY - bounds1.minY;
  const width2 = bounds2.maxX - bounds2.minX;
  const height2 = bounds2.maxY - bounds2.minY;
  
  if (width1 === 0 || height1 === 0 || width2 === 0 || height2 === 0) return 0;
  
  // Normalize landmarks relative to bounding box
  let totalDiff = 0;
  
  for (let i = 0; i < points; i++) {
    const norm1X = (landmarks1[i][0] - bounds1.minX) / width1;
    const norm1Y = (landmarks1[i][1] - bounds1.minY) / height1;
    const norm2X = (landmarks2[i][0] - bounds2.minX) / width2;
    const norm2Y = (landmarks2[i][1] - bounds2.minY) / height2;
    
    const dx = norm1X - norm2X;
    const dy = norm1Y - norm2Y;
    totalDiff += Math.sqrt(dx * dx + dy * dy);
  }
  
  const avgDiff = totalDiff / points;
  // Better threshold for normalized comparison
  const similarity = Math.max(0, 1 - (avgDiff * 1.5));
  
  return similarity;
}

// Legacy function for backward compatibility
function compareFaceLandmarks(landmarks1, landmarks2) {
  return compareFaceLandmarksEuclidean(landmarks1, landmarks2);
}

module.exports = router;

