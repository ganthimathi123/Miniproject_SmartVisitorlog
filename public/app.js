console.log('🚀 Smart Home App Loading...');
console.log('API URL:', 'http://localhost:3000/api');

const API_URL = 'http://localhost:3000/api';
let socket;
let currentUser = null;
let currentLanguage = 'english';
let voiceAssistant = null;

// Translations
const translations = {
  english: {
    welcome: 'Welcome to Smart Home',
    signin: 'Sign In',
    signup: 'Sign Up',
    dashboard: 'Dashboard',
    voiceChat: 'Voice Chatbot',
    emotion: 'Emotion',
    startVoice: 'Start Voice Chat',
    stopVoice: 'Stop Voice Chat',
    doorAccess: 'Door Access',
    verifyOtp: 'Verify OTP',
    generateOtp: 'Generate OTP',
    visitorLog: 'Visitor Log'
  },
  hindi: {
    welcome: 'स्मार्ट होम में आपका स्वागत है',
    signin: 'साइन इन करें',
    signup: 'साइन अप करें',
    dashboard: 'डैशबोर्ड',
    voiceChat: 'वॉयस चैटबॉट',
    emotion: 'भावना',
    startVoice: 'वॉयस चैट शुरू करें',
    stopVoice: 'वॉयस चैट बंद करें',
    doorAccess: 'दरवाजा एक्सेस',
    verifyOtp: 'OTP सत्यापित करें',
    generateOtp: 'OTP जनरेट करें',
    visitorLog: 'आगंतुक लॉग'
  },
  tamil: {
    welcome: 'ஸ்மார்ட் ஹோம் க்கு வரவேற்கிறோம்',
    signin: 'உள்நுழைக',
    signup: 'பதிவு செய்க',
    dashboard: 'டாஷ்போர்டு',
    voiceChat: 'குரல் சாட்பாட்',
    emotion: 'உணர்ச்சி',
    startVoice: 'குரல் அரட்டை தொடங்கு',
    stopVoice: 'குரல் அரட்டை நிறுத்து',
    doorAccess: 'கதவு அணுகல்',
    verifyOtp: 'OTP சரிபார்க்கவும்',
    generateOtp: 'OTP உருவாக்கு',
    visitorLog: 'பார்வையாளர் பதிவு'
  },
  telugu: {
    welcome: 'స్మార్ట్ హోమ్‌కు స్వాగతం',
    signin: 'సైన్ ఇన్',
    signup: 'సైన్ అప్',
    dashboard: 'డాష్‌బోర్డ్',
    voiceChat: 'వాయిస్ చాట్‌బాట్',
    emotion: 'భావోద్వేగం',
    startVoice: 'వాయిస్ చాట్ ప్రారంభించండి',
    stopVoice: 'వాయిస్ చాట్ ఆపండి',
    doorAccess: 'తలుపు యాక్సెస్',
    verifyOtp: 'OTP ధృవీకరించండి',
    generateOtp: 'OTP రూపొందించండి',
    visitorLog: 'సందర్శకుల లాగ్'
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeAuth();
  initializeDashboard();
  checkAuth();

  initializeMLModels().then(success => {
    if (!success) console.warn('ML models failed to load');
  });
});

function initializeAuth() {
  const languageSelect = document.getElementById('language-select');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const signinForm = document.getElementById('signin-form');
  const signupForm = document.getElementById('signup-form');

  if (!signinForm) return;

  languageSelect.addEventListener('change', (e) => {
    currentLanguage = e.target.value;
    updateTranslations();
  });

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      document.getElementById(`${tab}-form`).classList.add('active');
    });
  });

  signinForm.addEventListener('submit', handleSignIn);
  signupForm.addEventListener('submit', handleSignUp);
}

function initializeDashboard() {
  document.getElementById('generate-otp').onclick = generateOTP;
  document.getElementById('verify-otp').onclick = verifyOTP;
  document.getElementById('start-voice').onclick = startVoiceChat;
  document.getElementById('stop-voice').onclick = stopVoiceChat;
  document.getElementById('profile-icon').onclick = showProfile;
  document.getElementById('logout-btn').onclick = handleLogout;
}

async function handleSignIn(e) {
  e.preventDefault();

  const email = document.getElementById('signin-email').value;
  const password = document.getElementById('signin-password').value;

  try {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      currentUser = data.user;
      currentLanguage = data.user.language;

      showDashboard();
      initializeSocket();
      loadVisitorLogs();
    } else {
      alert(data.message);
    }
  } catch {
    alert('Login error');
  }
}

async function handleSignUp(e) {
  e.preventDefault();

  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const nickname = document.getElementById('signup-nickname').value;

  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, nickname, language: currentLanguage })
  });

  const data = await response.json();

  if (response.ok) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    currentUser = data.user;
    showDashboard();
    initializeSocket();
  } else {
    alert(data.message);
  }
}

function checkAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');

  if (token && user) {
    currentUser = JSON.parse(user);
    currentLanguage = currentUser.language;
    showDashboard();
    initializeSocket();
    loadVisitorLogs();
  }
}

function showDashboard() {
  document.getElementById('auth-screen').classList.remove('active');
  document.getElementById('dashboard-screen').classList.add('active');
}

function handleLogout() {
  localStorage.clear();
  location.reload();
}

function updateTranslations() {
  document.querySelectorAll('[data-translate]').forEach(el => {
    const key = el.dataset.translate;
    el.textContent = translations[currentLanguage][key] || el.textContent;
  });
}

async function generateOTP() {
  const res = await fetch(`${API_URL}/door/generate-otp`, { method: 'POST' });
  const data = await res.json();
  document.getElementById('otp-display').textContent = data.otp;
}

async function verifyOTP() {
  const otp = document.getElementById('otp-input').value;

  const res = await fetch(`${API_URL}/door/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ otp })
  });

  const data = await res.json();
  alert(data.verified ? 'OTP Verified' : 'Invalid OTP');
}

function initializeSocket() {
  socket = io('http://localhost:3000');
}
