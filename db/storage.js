const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const VISITORS_FILE = path.join(DB_DIR, 'visitors.json');
const OTP_FILE = path.join(DB_DIR, 'otps.json');
const REQUESTS_FILE = path.join(DB_DIR, 'requests.json');
const ACCESS_LOG_FILE = path.join(DB_DIR, 'access_logs.json');
const FACE_DATA_FILE = path.join(DB_DIR, 'face_data.json');

// Create data directory if it doesn't exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

if (!fs.existsSync(VISITORS_FILE)) {
  fs.writeFileSync(VISITORS_FILE, JSON.stringify([]));
}

if (!fs.existsSync(OTP_FILE)) {
  fs.writeFileSync(OTP_FILE, JSON.stringify([]));
}

if (!fs.existsSync(REQUESTS_FILE)) {
  fs.writeFileSync(REQUESTS_FILE, JSON.stringify([]));
}

if (!fs.existsSync(ACCESS_LOG_FILE)) {
  fs.writeFileSync(ACCESS_LOG_FILE, JSON.stringify([]));
}

if (!fs.existsSync(FACE_DATA_FILE)) {
  fs.writeFileSync(FACE_DATA_FILE, JSON.stringify({}));
}

class Storage {
  readUsers() { const data = fs.readFileSync(USERS_FILE, 'utf8'); return JSON.parse(data); }
  writeUsers(users) { fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2)); }
  findUserByEmail(email){ const users=this.readUsers(); return users.find(u=>u.email===email); }
  findUserById(id){ const users=this.readUsers(); return users.find(u=>u.id===id); }
  findUserByPhone(phone){ const users=this.readUsers(); return users.find(u=>u.phone===phone); }
  createUser(userData){ const users=this.readUsers(); const newUser={ id:Date.now().toString(), ...userData, createdAt:new Date().toISOString(), lastLogin:null, accessCount:0 }; users.push(newUser); this.writeUsers(users); return newUser; }
  updateUser(id,updates){ const users=this.readUsers(); const i=users.findIndex(u=>u.id===id); if(i!==-1){ users[i]={...users[i],...updates,updatedAt:new Date().toISOString()}; this.writeUsers(users); return users[i]; } return null; }
  deleteUser(id){ const users=this.readUsers(); const filtered=users.filter(u=>u.id!==id); this.writeUsers(filtered); return filtered.length<users.length; }
  readVisitors(){ const data=fs.readFileSync(VISITORS_FILE,'utf8'); return JSON.parse(data); }
  writeVisitors(visitors){ fs.writeFileSync(VISITORS_FILE, JSON.stringify(visitors,null,2)); }
  createVisitor(visitorData){ const visitors=this.readVisitors(); const newVisitor={id:Date.now().toString(), ...visitorData, timestamp:new Date().toISOString()}; visitors.push(newVisitor); this.writeVisitors(visitors); return newVisitor; }
  getAllVisitors(){ return this.readVisitors().sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)); }
  getVisitorsByPersonId(id){ return this.readVisitors().filter(v=>v.personId===id).sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)); }
  getVisitorsByCategory(c){ return this.readVisitors().filter(v=>v.category===c).sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)); }
  getVisitorsByDateRange(s,e){ const visitors=this.readVisitors(); return visitors.filter(v=>{const d=new Date(v.timestamp); return d>=new Date(s)&&d<=new Date(e);} ).sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)); }
  readOTPs(){ const data=fs.readFileSync(OTP_FILE,'utf8'); return JSON.parse(data); }
  writeOTPs(otps){ fs.writeFileSync(OTP_FILE, JSON.stringify(otps,null,2)); }
  storeOTP(phone,otp,category,expiresAt){ const otps=this.readOTPs(); const newOTP={id:Date.now().toString(), phone, otp, category, expiresAt, used:false, createdAt:new Date().toISOString()}; otps.push(newOTP); this.writeOTPs(otps); return newOTP; }
  getOTP(phone){ const otps=this.readOTPs(); return otps.find(o=>o.phone===phone&& !o.used && Date.now()<o.expiresAt); }
  markOTPUsed(phone){ const otps=this.readOTPs(); const otp=otps.find(o=>o.phone===phone && !o.used); if(otp){ otp.used=true; otp.usedAt=new Date().toISOString(); this.writeOTPs(otps);} }
  cleanExpiredOTPs(){ const otps=this.readOTPs(); const valid=otps.filter(o=>Date.now()<o.expiresAt||o.used); this.writeOTPs(valid); }
  readRequests(){ const data=fs.readFileSync(REQUESTS_FILE,'utf8'); return JSON.parse(data); }
  writeRequests(r){ fs.writeFileSync(REQUESTS_FILE, JSON.stringify(r,null,2)); }
  storePendingRequest(d){ const r=this.readRequests(); const q={id:Date.now().toString(), ...d, status:'pending', createdAt:new Date().toISOString(), otp:null}; r.push(q); this.writeRequests(r); return q; }
  getPendingRequests(){ return this.readRequests().filter(r=>r.status==='pending'); }
  getAllRequests(){ return this.readRequests().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)); }
  getRequestById(id){ return this.readRequests().find(r=>r.id===id); }
  updateRequestStatus(id,status,otp=null){ const r=this.readRequests(); const t=r.find(x=>x.id===id); if(t){ t.status=status; if(otp) t.otp=otp; t.updatedAt=new Date().toISOString(); this.writeRequests(r);} return t; }
  readAccessLogs(){ const data=fs.readFileSync(ACCESS_LOG_FILE,'utf8'); return JSON.parse(data); }
  writeAccessLogs(l){ fs.writeFileSync(ACCESS_LOG_FILE, JSON.stringify(l,null,2)); }
  logAccess(d){ const l=this.readAccessLogs(); const e={id:Date.now().toString(), ...d, timestamp:new Date().toISOString()}; l.push(e); this.writeAccessLogs(l); return e; }
  getAccessLogs(limit=100){ return this.readAccessLogs().sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)).slice(0,limit); }
  getAccessLogsByPhone(p){ return this.readAccessLogs().filter(l=>l.phone===p).sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)); }
  getAccessLogsByCategory(c){ return this.readAccessLogs().filter(l=>l.category===c).sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)); }
  getStatistics(){ const users=this.readUsers(); const visitors=this.readVisitors(); const requests=this.readRequests(); const logs=this.readAccessLogs(); return { totalUsers:users.length, usersByCategory:{family:users.filter(u=>u.category==='family').length, friends:users.filter(u=>u.category==='friends').length, servants:users.filter(u=>u.category==='servants').length, service:users.filter(u=>u.category==='service').length, guest:users.filter(u=>u.category==='guest').length }, totalVisitors:visitors.length, totalAccessLogs:logs.length, pendingRequests:requests.filter(r=>r.status==='pending').length, approvedRequests:requests.filter(r=>r.status==='approved').length, rejectedRequests:requests.filter(r=>r.status==='rejected').length, todayVisitors:visitors.filter(v=>new Date(v.timestamp).toDateString()===new Date().toDateString()).length } }
  cleanupOldData(daysToKeep=30){ const c=new Date(); c.setDate(c.getDate()-daysToKeep); const visitors=this.readVisitors(); const recentVisitors=visitors.filter(v=>new Date(v.timestamp)>c); this.writeVisitors(recentVisitors); const requests=this.readRequests(); const recentRequests=requests.filter(r=>new Date(r.createdAt)>c); this.writeRequests(recentRequests); this.cleanExpiredOTPs(); return { visitorsRemoved:visitors.length-recentVisitors.length, requestsRemoved:requests.length-recentRequests.length}; }
  readFaceData(){ const data=fs.readFileSync(FACE_DATA_FILE,'utf8'); return JSON.parse(data); }
  writeFaceData(d){ fs.writeFileSync(FACE_DATA_FILE, JSON.stringify(d,null,2)); }
  saveFaceData(id,d){ const f=this.readFaceData(); f[id]=d; this.writeFaceData(f); return d; }
  getFaceData(id){ const f=this.readFaceData(); return f[id]; }
  deleteFaceData(id){ const f=this.readFaceData(); delete f[id]; this.writeFaceData(f); }
}

module.exports = new Storage();
