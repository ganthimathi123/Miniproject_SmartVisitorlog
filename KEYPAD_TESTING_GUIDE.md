# Keypad to Website Integration - Testing Guide

## ✅ Feature: Real-Time OTP Input from Keypad

The OTP input field on the website automatically fills as you type on the hardware keypad (or simulator).

## 🎯 How It Works

```
Hardware Keypad → ESP32 → WebSocket → Server → Website OTP Field
```

When you press a number on the keypad:
1. ESP32 detects the key press
2. Sends digit via WebSocket to server
3. Server broadcasts to all connected clients
4. Website receives digit and adds it to OTP input field
5. After 6 digits, auto-submits for verification

## 🧪 Testing Methods

### Method 1: Web Simulator (No Hardware Needed)

1. **Open Main Page**
   - Go to: http://localhost:3000
   - Login as admin: admin@smarthome.com / Admin@123

2. **Open Keypad Simulator**
   - In a NEW TAB, go to: http://localhost:3000/keypad-test.html
   - Keep both tabs visible (side by side)

3. **Test Real-Time Input**
   - Click numbers on the simulator (1, 2, 3, 4, 5, 6)
   - Watch the OTP field on the main page fill automatically!
   - Each digit appears instantly as you click

4. **Test Auto-Submit**
   - After entering 6 digits, it auto-submits
   - Or press # to submit manually
   - Press * to clear

### Method 2: Hardware Keypad (ESP32 Required)

1. **Setup Hardware**
   - Connect 3x4 matrix keypad to ESP32
   - Upload `esp32/keypad_3x4.ino`
   - Update WiFi credentials and server IP

2. **Test Physical Keypad**
   - Open http://localhost:3000 on your computer
   - Login as admin
   - Press numbers on physical keypad
   - Watch OTP field update in real-time!

## 📋 Admin vs Regular User

### Admin User
- **Email:** admin@smarthome.com
- **Password:** Admin@123
- **Can See:**
  - ✅ Generate OTP button
  - ✅ OTP display area
  - ✅ Verify OTP button
  - ✅ OTP input field (auto-fills from keypad)

### Regular User
- **Cannot See:**
  - ❌ Generate OTP button (hidden)
  - ❌ OTP display area (hidden)
- **Can See:**
  - ✅ Verify OTP button
  - ✅ OTP input field (auto-fills from keypad)
  - ℹ️ Info message: "Please contact admin to get OTP"

## 🎮 Step-by-Step Test

### Test 1: Admin Generates OTP

1. Login as admin
2. Click "Generate OTP" button
3. Note the 6-digit OTP displayed (e.g., "123456")
4. OTP is now active for 5 minutes

### Test 2: User Enters OTP via Keypad

**Option A: Using Simulator**
1. Open keypad simulator in new tab
2. Click digits: 1 → 2 → 3 → 4 → 5 → 6
3. Watch main page OTP field fill automatically
4. After 6 digits, auto-verifies

**Option B: Using Hardware**
1. Press keys on physical keypad: 1-2-3-4-5-6
2. Watch website OTP field fill in real-time
3. Press # to submit (or auto-submits after 6 digits)

### Test 3: Verify Access

1. If OTP matches → "OTP verified successfully!"
2. Proceeds to facial recognition
3. After face verification → Door unlocks

## 🔍 Debugging

### Check WebSocket Connection

Open browser console (F12) and look for:
```
Connected to server
```

### Check Keypad Events

In browser console, you should see:
```
Keypad input received: {digit: "1"}
Keypad input received: {digit: "2"}
...
```

### Check Server Logs

Server console should show:
```
Keypad input received: { digit: '1' }
Keypad input received: { digit: '2' }
...
```

## 📱 Visual Flow

```
┌─────────────────────┐
│  Hardware Keypad    │
│  Press: 1 2 3 4 5 6 │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│      ESP32          │
│  WebSocket Client   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Node.js Server    │
│  Socket.IO Handler  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Website Browser   │
│  OTP Field: 123456  │ ← Fills automatically!
└─────────────────────┘
```

## ⚡ Key Features

1. **Real-Time Sync** - Instant digit display (< 100ms latency)
2. **Auto-Submit** - Submits after 6 digits automatically
3. **Visual Feedback** - Green flash when digit received
4. **Clear Function** - Press * to clear input
5. **Manual Submit** - Press # to submit anytime
6. **Admin Only Generation** - Only admin can generate OTP
7. **Universal Input** - Regular users can enter OTP from keypad

## 🎯 Current Status

✅ Server running on port 3000
✅ WebSocket handlers active
✅ Keypad integration ready
✅ Admin-only OTP generation
✅ Real-time input working
✅ Auto-submit enabled

## 🚀 Quick Test Command

1. Open http://localhost:3000 (login as admin)
2. Open http://localhost:3000/keypad-test.html (in new tab)
3. Click "Generate OTP" on main page
4. Click numbers on simulator
5. Watch magic happen! ✨

---

**Note:** The keypad input works for BOTH admin and regular users. Only the OTP generation is admin-only.
