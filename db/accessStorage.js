const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, 'data');
const ACCESS_REQUESTS_FILE = path.join(DB_DIR, 'access_requests.json');
const REGISTERED_USERS_FILE = path.join(DB_DIR, 'registered_users.json');

// Create folder
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initialize files
if (!fs.existsSync(ACCESS_REQUESTS_FILE)) {
  fs.writeFileSync(ACCESS_REQUESTS_FILE, JSON.stringify([]));
}

if (!fs.existsSync(REGISTERED_USERS_FILE)) {
  fs.writeFileSync(REGISTERED_USERS_FILE, JSON.stringify([]));
}

class AccessStorage {
  read(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }

  write(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  }

  // Access Requests
  createAccessRequest(data) {
    const requests = this.read(ACCESS_REQUESTS_FILE);
    const newRequest = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString()
    };
    requests.push(newRequest);
    this.write(ACCESS_REQUESTS_FILE, requests);
    return newRequest;
  }

  getAccessRequestById(id) {
    return this.read(ACCESS_REQUESTS_FILE).find(r => r.id === id);
  }

  updateAccessRequest(id, updates) {
    const requests = this.read(ACCESS_REQUESTS_FILE);
    const index = requests.findIndex(r => r.id === id);
    if (index !== -1) {
      requests[index] = { ...requests[index], ...updates };
      this.write(ACCESS_REQUESTS_FILE, requests);
      return requests[index];
    }
    return null;
  }

  getAllAccessRequests() {
    return this.read(ACCESS_REQUESTS_FILE).sort((a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  getPendingAccessRequests() {
    return this.read(ACCESS_REQUESTS_FILE).filter(r => r.status === 'pending');
  }

  // Users
  registerUser(data) {
    const users = this.read(REGISTERED_USERS_FILE);
    const user = {
      id: Date.now().toString(),
      ...data,
      registeredAt: new Date().toISOString()
    };
    users.push(user);
    this.write(REGISTERED_USERS_FILE, users);
    return user;
  }

  findUserByPhone(phoneNumber) {
    return this.read(REGISTERED_USERS_FILE).find(u => u.phoneNumber === phoneNumber);
  }

  getAllRegisteredUsers() {
    return this.read(REGISTERED_USERS_FILE);
  }
}

module.exports = new AccessStorage();
