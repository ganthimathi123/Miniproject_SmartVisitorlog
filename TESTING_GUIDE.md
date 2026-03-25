# Testing Guide

## 🌐 Access URLs

1. **Main Application**: http://localhost:3000
2. **Login Page**: http://localhost:3000/login.html
3. **Admin Panel**: http://localhost:3000/admin.html

## 🔑 Test Credentials

### Admin Account
- Email: admin@smarthome.com
- Password: Admin@123

### Group OTPs
- FAMILY: 123456
- SERVANT: 567890
- FRIEND: 999999

## ✅ Test Scenarios

### 1. Login Test
1. Go to http://localhost:3000/login.html
2. Enter admin credentials
3. Click "Sign In"
4. Should redirect to dashboard

### 2. Sign Up Test
1. Go to http://localhost:3000
2. Click "Sign Up" tab
3. Enter new email, password, nickname
4. Should create account and login

### 3. OTP Test
1. Login as admin
2. Select group (FAMILY/SERVANT/FRIEND)
3. Generate OTP or use permanent OTP
4. Enter OTP and verify
5. Should proceed to face recognition

### 4. Face Recognition Test
1. After OTP verification
2. Allow camera access
3. Position face in frame
4. System should recognize or register face

## 🐛 Common Issues

### Issue: "localhost refused to connect"
**Solution**: Try http://127.0.0.1:3000 instead

### Issue: "Invalid credentials"
**Solution**: Check you're using correct email/password

### Issue: "Camera not working"
**Solution**: Allow camera permissions in browser

## 📊 What's Working

✅ Server running on port 3000
✅ Security features enabled
✅ Rate limiting active
✅ Environment variables loaded
✅ Merge conflicts resolved
✅ Single clean UI (no duplicates)

## 🎯 Ready to Use!

The website is now optimized, secure, and stable. All loopholes have been fixed.
