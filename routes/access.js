const express = require('express');
const router = express.Router();
const accessStorage = require('../db/accessStorage');
const { CATEGORIES, CATEGORY_OTP_PREFIX } = require('../models/Category');

// Generate OTP based on category
function generateOTP(category) {
  const prefix = CATEGORY_OTP_PREFIX[category] || '9';
  const randomDigits = Math.floor(10000 + Math.random() * 90000).toString();
  return prefix + randomDigits;
}

// QR Code Access - Initial entry point
router.post('/qr-scan', async (req, res) => {
  try {
    const { deviceId, timestamp } = req.body;

    const accessRequest = accessStorage.createAccessRequest({
      deviceId,
      status: 'initiated',
      timestamp
    });

    res.json({
      success: true,
      accessRequestId: accessRequest.id,
      message: 'Please select your category and proceed'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check registration
router.post('/check-registration', async (req, res) => {
  try {
    const { phoneNumber, category } = req.body;

    const user = accessStorage.findUserByPhone(phoneNumber);

    if (user && user.category === category) {
      const otp = generateOTP(category);

      const accessRequest = accessStorage.createAccessRequest({
        visitorName: user.name,
        phoneNumber,
        category,
        otp,
        otpGeneratedBy: 'system',
        otpGeneratedAt: new Date().toISOString(),
        status: 'otp_generated',
        isRegistered: true
      });

      res.json({
        success: true,
        isRegistered: true,
        accessRequestId: accessRequest.id,
        otp,
        message: 'OTP generated. Enter to proceed.'
      });
    } else {
      res.json({
        success: true,
        isRegistered: false,
        message: 'Admin approval required.'
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Request admin OTP
router.post('/request-admin-otp', async (req, res) => {
  try {
    const { visitorName, phoneNumber, category, accessRequestId } = req.body;

    let accessRequest;

    if (accessRequestId) {
      accessRequest = accessStorage.updateAccessRequest(accessRequestId, {
        visitorName,
        phoneNumber,
        category,
        status: 'pending_admin_approval'
      });
    } else {
      accessRequest = accessStorage.createAccessRequest({
        visitorName,
        phoneNumber,
        category,
        status: 'pending_admin_approval',
        isRegistered: false
      });
    }

    res.json({
      success: true,
      accessRequestId: accessRequest.id,
      message: 'Waiting for admin approval'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin generate OTP
router.post('/admin/generate-otp', async (req, res) => {
  try {
    const { accessRequestId, adminId, approved } = req.body;

    if (!approved) {
      accessStorage.updateAccessRequest(accessRequestId, {
        status: 'denied',
        accessGranted: false
      });

      return res.json({ success: true, message: 'Denied' });
    }

    const request = accessStorage.getAccessRequestById(accessRequestId);

    const otp = generateOTP(request.category);

    accessStorage.updateAccessRequest(accessRequestId, {
      otp,
      otpGeneratedBy: adminId,
      otpGeneratedAt: new Date().toISOString(),
      status: 'otp_generated'
    });

    res.json({
      success: true,
      otp,
      message: 'OTP generated'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { accessRequestId, otp } = req.body;

    const request = accessStorage.getAccessRequestById(accessRequestId);

    if (request.otp === otp) {
      accessStorage.updateAccessRequest(accessRequestId, {
        otpVerified: true,
        status: 'otp_verified'
      });

      return res.json({ success: true, verified: true });
    }

    res.status(400).json({ verified: false });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Face verification
router.post('/verify-face', async (req, res) => {
  try {
    const { accessRequestId } = req.body;

    const request = accessStorage.getAccessRequestById(accessRequestId);

    if (!request.otpVerified) {
      return res.status(400).json({ message: 'Verify OTP first' });
    }

    accessStorage.updateAccessRequest(accessRequestId, {
      accessGranted: true,
      status: 'access_granted'
    });

    res.json({
      success: true,
      accessGranted: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Logs
router.get('/logs', (req, res) => {
  res.json(accessStorage.getAllAccessRequests());
});

module.exports = router;
