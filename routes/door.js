const express = require('express');
const router = express.Router();
const axios = require('axios');
const storage = require('../db/storage');
const { CATEGORIES, CATEGORY_PERMISSIONS } = require('../models/Category');

// Group-based OTP system from environment variables
const GROUP_OTPS = {
  FAMILY: process.env.FAMILY_OTP || "123456",
  SERVANT: process.env.SERVANT_OTP || "567890",
  FRIEND: process.env.FRIEND_OTP || "999999",
  TEMP: null  // Admin-generated temporary OTP
};

// Warn if using default OTPs
if (!process.env.FAMILY_OTP || !process.env.SERVANT_OTP || !process.env.FRIEND_OTP) {
  console.warn('⚠️  WARNING: Using default group OTPs. Set FAMILY_OTP, SERVANT_OTP, FRIEND_OTP in .env file!');
}

let tempOTPExpiry = null;

// Generate OTP - Admin can generate temporary OTP or use group OTPs
router.post('/generate-otp', (req, res) => {
  const { group } = req.body;
  
  // If group specified, return that group's OTP
  if (group && GROUP_OTPS[group] && group !== 'TEMP') {
    return res.json({ 
      message: `${group} OTP retrieved`, 
      otp: GROUP_OTPS[group],
      group: group,
      type: 'permanent'
    });
  }
  
  // Generate temporary OTP (default behavior)
  GROUP_OTPS.TEMP = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
  tempOTPExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
  
  console.log('Generated TEMP OTP:', GROUP_OTPS.TEMP);
  
  res.json({ 
    message: 'Temporary OTP generated', 
    otp: GROUP_OTPS.TEMP,
    group: 'TEMP',
    type: 'temporary',
    expiresIn: 300 // seconds
  });
});

// Get all group OTPs (admin only)
router.get('/group-otps', (req, res) => {
  res.json({
    groups: {
      FAMILY: { otp: GROUP_OTPS.FAMILY, type: 'permanent' },
      SERVANT: { otp: GROUP_OTPS.SERVANT, type: 'permanent' },
      FRIEND: { otp: GROUP_OTPS.FRIEND, type: 'permanent' },
      TEMP: { 
        otp: GROUP_OTPS.TEMP, 
        type: 'temporary',
        expiresAt: tempOTPExpiry,
        active: GROUP_OTPS.TEMP && Date.now() < tempOTPExpiry
      }
    }
  });
});

// Verify OTP - Check against all group OTPs
router.post('/verify-otp', (req, res) => {
  const { otp, group } = req.body;
  
  if (!otp) {
    return res.status(400).json({ 
      message: 'OTP is required',
      verified: false 
    });
  }
  
  let matchedGroup = null;
  let isValid = false;
  
  // Check against all groups
  if (otp === GROUP_OTPS.FAMILY) {
    matchedGroup = 'FAMILY';
    isValid = true;
  } else if (otp === GROUP_OTPS.SERVANT) {
    matchedGroup = 'SERVANT';
    isValid = true;
  } else if (otp === GROUP_OTPS.FRIEND) {
    matchedGroup = 'FRIEND';
    isValid = true;
  } else if (otp === GROUP_OTPS.TEMP && GROUP_OTPS.TEMP !== null) {
    // Check TEMP OTP expiry
    if (Date.now() > tempOTPExpiry) {
      GROUP_OTPS.TEMP = null;
      return res.status(400).json({ 
        message: 'Temporary OTP expired. Please generate a new one.',
        verified: false 
      });
    }
    matchedGroup = 'TEMP';
    isValid = true;
    
    // Clear TEMP OTP after use (one-time use)
    GROUP_OTPS.TEMP = null;
    tempOTPExpiry = null;
  }
  
  if (isValid) {
    console.log(`OTP verified for group: ${matchedGroup}`);
    res.json({ 
      message: `Access granted for ${matchedGroup} group!`, 
      verified: true,
      group: matchedGroup,
      proceedToFaceRecognition: true
    });
  } else {
    res.status(400).json({ 
      message: 'Invalid OTP. Please try again.',
      verified: false 
    });
  }
});

// Generate OTP with phone (for advanced features)
router.post('/generate-otp-phone', (req, res) => {
  const { phone, category } = req.body;
  
  if (!phone || !category) {
    return res.status(400).json({ message: 'Phone and category required' });
  }
  
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  
  storage.storeOTP(phone, otp, category, expiresAt);
  
  res.json({ 
    message: 'OTP generated', 
    otp, // In production, send via SMS/WhatsApp
    expiresIn: 300 // seconds
  });
});

// Request OTP for unknown users (requires admin approval)
router.post('/request-otp', (req, res) => {
  const { phone, name, purpose } = req.body;
  
  if (!phone) {
    return res.status(400).json({ message: 'Phone number required' });
  }
  
  const request = storage.storePendingRequest({
    phone,
    name: name || 'Unknown',
    purpose: purpose || 'Visit',
    category: CATEGORIES.GUEST
  });
  
  res.json({
    message: 'Access request sent to admin',
    requestId: request.id,
    status: 'pending'
  });
});

// Admin: Get pending requests
router.get('/pending-requests', (req, res) => {
  const requests = storage.getPendingRequests();
  res.json(requests);
});

// Admin: Approve request and generate OTP
router.post('/approve-request', (req, res) => {
  const { requestId } = req.body;
  
  const request = storage.updateRequestStatus(requestId, 'approved');
  
  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }
  
  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes for guests
  
  storage.storeOTP(request.phone, otp, request.category, expiresAt);
  storage.updateRequestStatus(requestId, 'approved', otp);
  
  res.json({
    message: 'Request approved',
    otp, // Send via WhatsApp in production
    phone: request.phone
  });
});

// Admin: Reject request
router.post('/reject-request', (req, res) => {
  const { requestId } = req.body;
  
  const request = storage.updateRequestStatus(requestId, 'rejected');
  
  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }
  
  res.json({ message: 'Request rejected' });
});

// Verify OTP with phone (for advanced features)
router.post('/verify-otp-phone', (req, res) => {
  const { phone, otp } = req.body;
  
  const storedOTP = storage.getOTP(phone);
  
  if (!storedOTP) {
    return res.status(400).json({ message: 'No OTP found for this phone' });
  }
  
  if (storedOTP.used) {
    return res.status(400).json({ message: 'OTP already used' });
  }
  
  if (Date.now() > storedOTP.expiresAt) {
    return res.status(400).json({ message: 'OTP expired' });
  }
  
  if (otp === storedOTP.otp) {
    storage.markOTPUsed(phone);
    res.json({ 
      message: 'OTP verified', 
      verified: true,
      category: storedOTP.category,
      proceedToFaceRecognition: true
    });
  } else {
    res.status(400).json({ message: 'Invalid OTP', verified: false });
  }
});

// Unlock door (send command to ESP32)
router.post('/unlock', async (req, res) => {
  try {
    const esp32Ip = process.env.ESP32_IP || '192.168.1.100'; // Default IP
    
    console.log(`Attempting to unlock door via ESP32 at ${esp32Ip}`);
    
    try {
      // Send unlock command to ESP32
      const response = await axios.post(`http://${esp32Ip}/unlock`, 
        { duration: 5000 },
        { timeout: 5000 }
      );
      
      console.log('ESP32 response:', response.data);
      res.json({ 
        message: 'Door unlocked successfully',
        esp32Response: response.data,
        success: true
      });
    } catch (esp32Error) {
      // ESP32 not reachable - simulate unlock for testing
      console.warn('ESP32 not reachable, simulating unlock:', esp32Error.message);
      
      res.json({ 
        message: 'Door unlock command sent (ESP32 simulation mode)',
        success: true,
        simulated: true,
        note: 'Connect ESP32 for actual door control'
      });
    }
  } catch (error) {
    console.error('Door unlock error:', error);
    res.status(500).json({ 
      message: 'Failed to unlock door', 
      error: error.message,
      success: false
    });
  }
});

// Facial recognition verification
router.post('/verify-face', async (req, res) => {
  try {
    const { imageData, personId, phone, category } = req.body;
    
    // In production, integrate with facial recognition API
    // For now, simulate verification
    const isValid = true; // Replace with actual facial recognition logic
    
    res.json({
      message: 'Face verification complete',
      isValid,
      personId,
      phone,
      category
    });
  } catch (error) {
    res.status(500).json({ message: 'Face verification failed', error: error.message });
  }
});

// Identify person by face (no login required)
router.post('/identify-face', async (req, res) => {
  try {
    const { faceLandmarks, faceImage } = req.body;
    
    if (!faceLandmarks) {
      return res.status(400).json({ message: 'Face landmarks required' });
    }
    
    console.log('🔍 Attempting to identify person by face...');
    
    // Get all users
    const users = storage.readUsers();
    
    // Get all face data
    const allFaceData = storage.readFaceData();
    
    let bestMatch = null;
    let bestConfidence = 0;
    const threshold = 0.70; // 70% similarity required for authentication
    
    // Check each user's registered face
    for (const user of users) {
      if (!user.faceId) continue;
      
      const faceData = allFaceData[user.faceId];
      if (!faceData) continue;
      
      console.log(`   Checking against ${user.nickname || user.email}...`);
      
      // Compare against all samples
      for (const sample of faceData.samples) {
        const similarity = compareFaceLandmarks(faceLandmarks, sample.landmarks);
        
        if (similarity > bestConfidence) {
          bestConfidence = similarity;
          bestMatch = {
            user: {
              id: user.id,
              email: user.email,
              nickname: user.nickname,
              language: user.language
            },
            confidence: similarity
          };
        }
      }
    }
    
    if (bestMatch && bestConfidence >= threshold) {
      console.log(`✅ Person identified: ${bestMatch.user.nickname} (${(bestConfidence * 100).toFixed(1)}%)`);
      
      // Log access
      storage.logAccess({
        userId: bestMatch.user.id,
        userName: bestMatch.user.nickname,
        method: 'face_recognition',
        confidence: bestConfidence,
        accessGranted: true
      });
      
      res.json({
        identified: true,
        user: bestMatch.user,
        confidence: bestConfidence,
        message: `Welcome ${bestMatch.user.nickname}!`
      });
    } else {
      console.log(`❌ No match found. Best confidence: ${(bestConfidence * 100).toFixed(1)}% (Required: 70%+)`);
      
      // Log failed attempt
      storage.logAccess({
        userId: null,
        userName: 'Unknown',
        method: 'face_recognition',
        confidence: bestConfidence,
        accessGranted: false
      });
      
      res.json({
        identified: false,
        confidence: bestConfidence,
        message: 'Face not recognized - similarity below 70% threshold'
      });
    }
    
  } catch (error) {
    console.error('Face identification error:', error);
    res.status(500).json({ message: 'Face identification failed', error: error.message });
  }
});

// Helper function to compare face landmarks
function compareFaceLandmarks(landmarks1, landmarks2) {
  if (!landmarks1 || !landmarks2) return 0;
  
  let totalDistance = 0;
  const points = Math.min(landmarks1.length, landmarks2.length);
  
  for (let i = 0; i < points; i++) {
    const dx = landmarks1[i][0] - landmarks2[i][0];
    const dy = landmarks1[i][1] - landmarks2[i][1];
    totalDistance += Math.sqrt(dx * dx + dy * dy);
  }
  
  const avgDistance = totalDistance / points;
  const similarity = Math.max(0, 1 - (avgDistance / 200));
  
  return similarity;
}

module.exports = router;
