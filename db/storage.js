const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const VISITORS_FILE = path.join(DB_DIR, 'visitors.json');
const OTP_FILE = path.join(DB_DIR, 'otps.json');
const REQUESTS_FILE = path.join(DB_DIR, 'requests.json');
const ACCESS_LOG_FILE = path.join(DB_DIR, 'access_logs.json');
const FACE_DATA_FILE = path.join(DB_DIR, 'face_data.json');

// Create folder
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initialize files
[USERS_FILE, VISITORS_FILE, OTP_FILE, REQUESTS_FILE, ACCESS_LOG_FILE].forEach(file => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify([]));
  }
});

if (!fs.existsSync(FACE_DATA_FILE)) {
  fs.writeFileSync(FACE_DATA_FILE, JSON.stringify({}));
}

class Storage {
  read(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }

  write(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  }

  // USERS
  findUserByEmail(email) {
    return this.read(USERS_FILE).find(u => u.email === email);
  }

  findUserByPhone(phone) {
    return this.read(USERS_FILE).find(u => u.phone === phone);
  }

  createUser(userData) {
    const users = this.read(USERS_FILE);
    const user = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    this.write(USERS_FILE, users);
    return user;
  }

  // VISITORS
  createVisitor(data) {
    const visitors = this.read(VISITORS_FILE);
    const visitor = {
      id: Date.now().toString(),
      ...data,
      timestamp: new Date().toISOString()
    };
    visitors.push(visitor);
    this.write(VISITORS_FILE, visitors);
    return visitor;
  }

  // OTP
  storeOTP(phone, otp, expiresAt) {
    const otps = this.read(OTP_FILE);
    const obj = {
      phone,
      otp,
      expiresAt,
      used: false
    };
    otps.push(obj);
    this.write(OTP_FILE, otps);
    return obj;
  }

  // REQUESTS
  storePendingRequest(data) {
    const requests = this.read(REQUESTS_FILE);
    const req = {
      id: Date.now().toString(),
      ...data,
      status: 'pending'
    };
    requests.push(req);
    this.write(REQUESTS_FILE, requests);
    return req;
  }

  // LOGS
  logAccess(data) {
    const logs = this.read(ACCESS_LOG_FILE);
    logs.push({
      id: Date.now().toString(),
      ...data,
      timestamp: new Date().toISOString()
    });
    this.write(ACCESS_LOG_FILE, logs);
  }
}

module.exports = new Storage();
