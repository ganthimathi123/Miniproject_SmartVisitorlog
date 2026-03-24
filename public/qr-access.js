const express = require('express');
const router = express.Router();
const storage = require('../db/storage');
const { CATEGORIES, CATEGORY_OTPS } = require('../models/Category');

// Store pending OTP requests (in production, use Redis)
global.pendingOTPs = {};
global.adminGeneratedOTPs = {};

// Check user
router.post('/check-user', async (req, res) => {
  try {
    const { phoneNumber, email } = req.body;

    const users = storage.readUsers();
    const user = users.find(u => u.phoneNumber === phoneNumber || u.email === email);

    if (user && user.category && user.category !== CATEGORIES.UNKNOWN) {
      return res.json({
        isKnown: true,
        category: user.category,
        userId: user.id,
        name: user.nickname,
        requiresOTP: true
      });
    }

    res.json({
      isKnown: false,
      requiresAdminApproval: true
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify category OTP
router.post('/verify-category-otp', async (req, res) => {
  try {
    const { userId, category, otp } = req.body;

    if (CATEGORY_OTPS[category] === otp) {
      res.json({
        verified: true,
        nextStep: 'face-recognition'
      });
    } else {
      res.status(400).json({
        verified: false
      });
    }

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Request admin approval
router.post('/request-admin-approval', async (req, res) => {
  try {
    const { name, phoneNumber, purpose } = req.body;

    const requestId = `REQ_${Date.now()}`;

    global.pendingOTPs[requestId] = {
      name,
      phoneNumber,
      purpose,
      status: 'pending'
    };

    res.json({
      requestId,
      status: 'pending'
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check approval
router.get('/check-approval-status/:requestId', (req, res) => {
  const request = global.pendingOTPs[req.params.requestId];

  if (!request) return res.status(404).json({ message: 'Not found' });

  if (request.status === 'approved') {
    return res.json({
      status: 'approved',
      otp: global.adminGeneratedOTPs[req.params.requestId]
    });
  }

  res.json({ status: request.status });
});

// Admin approve
router.post('/admin/approve-request', (req, res) => {
  const { requestId } = req.body;

  const request = global.pendingOTPs[requestId];
  if (!request) return res.status(404).json({ message: 'Not found' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  request.status = 'approved';
  global.adminGeneratedOTPs[requestId] = otp;

  res.json({ otp });
});

// Verify admin OTP
router.post('/verify-admin-otp', (req, res) => {
  const { requestId, otp } = req.body;

  if (global.adminGeneratedOTPs[requestId] === otp) {
    return res.json({
      verified: true,
      nextStep: 'face-recognition'
    });
  }

  res.status(400).json({ verified: false });
});

// Face verify + unlock
router.post('/verify-face-and-unlock', async (req, res) => {
  try {
    const { userId, requestId, category } = req.body;

    const faceVerified = true;

    if (faceVerified) {
      storage.createVisitor({
        personId: userId || requestId,
        name: userId
          ? storage.findUserById(userId)?.nickname
          : global.pendingOTPs[requestId]?.name,
        category: category || CATEGORIES.UNKNOWN,
        accessGranted: true
      });

      return res.json({
        success: true,
        accessGranted: true
      });
    }

    res.status(400).json({ success: false });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
