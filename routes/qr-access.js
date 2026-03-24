const express = require('express');
const router = express.Router();
const storage = require('../db/storage');
const { CATEGORIES, CATEGORY_OTPS } = require('../models/Category');

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
    res.status(500).json({ message: error.message });
  }
});

// Verify OTP
router.post('/verify-category-otp', (req, res) => {
  const { category, otp } = req.body;

  if (CATEGORY_OTPS[category] === otp) {
    return res.json({ verified: true });
  }

  res.status(400).json({ verified: false });
});

// Request approval
router.post('/request-admin-approval', (req, res) => {
  const { name, phoneNumber } = req.body;

  const id = `REQ_${Date.now()}`;

  global.pendingOTPs[id] = {
    name,
    phoneNumber,
    status: 'pending'
  };

  res.json({ requestId: id });
});

// Check approval
router.get('/check-approval-status/:id', (req, res) => {
  const reqData = global.pendingOTPs[req.params.id];

  if (!reqData) return res.status(404).json({ message: 'Not found' });

  if (reqData.status === 'approved') {
    return res.json({
      status: 'approved',
      otp: global.adminGeneratedOTPs[req.params.id]
    });
  }

  res.json({ status: 'pending' });
});

// Admin approve
router.post('/admin/approve-request', (req, res) => {
  const { requestId } = req.body;

  const reqData = global.pendingOTPs[requestId];
  if (!reqData) return res.status(404).json({ message: 'Not found' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  reqData.status = 'approved';
  global.adminGeneratedOTPs[requestId] = otp;

  res.json({ otp });
});

// Verify admin OTP
router.post('/verify-admin-otp', (req, res) => {
  const { requestId, otp } = req.body;

  if (global.adminGeneratedOTPs[requestId] === otp) {
    return res.json({ verified: true });
  }

  res.status(400).json({ verified: false });
});

// Face + unlock
router.post('/verify-face-and-unlock', (req, res) => {
  const { userId, requestId, category } = req.body;

  storage.createVisitor({
    personId: userId || requestId,
    category: category || CATEGORIES.UNKNOWN,
    accessGranted: true
  });

  res.json({ success: true });
});

module.exports = router;
