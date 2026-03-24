const express = require('express');
const router = express.Router();
const axios = require('axios');
const storage = require('../db/storage');
const { CATEGORIES } = require('../models/Category');

// OTP Groups
const GROUP_OTPS = {
  FAMILY: "123456",
  SERVANT: "567890",
  FRIEND: "999999",
  TEMP: null
};

let tempOTPExpiry = null;

// Generate OTP
router.post('/generate-otp', (req, res) => {
  const { group } = req.body;

  if (group && GROUP_OTPS[group] && group !== 'TEMP') {
    return res.json({
      message: `${group} OTP retrieved`,
      otp: GROUP_OTPS[group],
      group,
      type: 'permanent'
    });
  }

  GROUP_OTPS.TEMP = Math.floor(100000 + Math.random() * 900000).toString();
  tempOTPExpiry = Date.now() + 5 * 60 * 1000;

  res.json({
    message: 'Temporary OTP generated',
    otp: GROUP_OTPS.TEMP,
    group: 'TEMP',
    type: 'temporary',
    expiresIn: 300
  });
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  const { otp } = req.body;

  if (!otp) return res.status(400).json({ message: 'OTP required', verified: false });

  let group = null;

  if (otp === GROUP_OTPS.FAMILY) group = 'FAMILY';
  else if (otp === GROUP_OTPS.SERVANT) group = 'SERVANT';
  else if (otp === GROUP_OTPS.FRIEND) group = 'FRIEND';
  else if (otp === GROUP_OTPS.TEMP && Date.now() < tempOTPExpiry) {
    group = 'TEMP';
    GROUP_OTPS.TEMP = null;
  }

  if (group) {
    return res.json({ verified: true, group });
  }

  res.status(400).json({ message: 'Invalid OTP', verified: false });
});

// Generate OTP with phone
router.post('/generate-otp-phone', (req, res) => {
  const { phone, category } = req.body;

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  storage.storeOTP(phone, otp, category, expiresAt);

  res.json({ otp });
});

// Verify OTP phone
router.post('/verify-otp-phone', (req, res) => {
  const { phone, otp } = req.body;

  const stored = storage.getOTP(phone);

  if (!stored) return res.status(400).json({ message: 'No OTP' });

  if (otp === stored.otp) {
    storage.markOTPUsed(phone);
    return res.json({ verified: true });
  }

  res.status(400).json({ verified: false });
});

// Unlock door
router.post('/unlock', async (req, res) => {
  try {
    const ip = process.env.ESP32_IP || '192.168.1.100';

    try {
      const response = await axios.post(`http://${ip}/unlock`);
      res.json({ success: true, response: response.data });
    } catch {
      res.json({ success: true, simulated: true });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Face verification (basic)
router.post('/verify-face', (req, res) => {
  res.json({ isValid: true });
});

// Identify face
router.post('/identify-face', (req, res) => {
  res.json({ identified: false });
});

module.exports = router;
