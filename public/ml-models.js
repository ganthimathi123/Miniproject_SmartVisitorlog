const API_URL = 'http://localhost:3000/api';
let currentCategory = null;
let accessRequestId = null;
let faceDetectionModel = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeCategorySelection();
  initializePhoneForm();
  initializeOTPVerification();
  loadFaceDetectionModel();
});

// Load face detection model
async function loadFaceDetectionModel() {
  try {
    faceDetectionModel = await blazeface.load();
    console.log('Face detection model loaded');
  } catch (error) {
    console.error('Error loading face detection model:', error);
  }
}

// Category Selection
function initializeCategorySelection() {
  const categoryBtns = document.querySelectorAll('.category-btn');

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentCategory = btn.dataset.category;
      showScreen('phone-screen');
    });
  });
}

// Phone Form
function initializePhoneForm() {
  const form = document.getElementById('phone-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('visitor-name').value;
    const phone = document.getElementById('phone-number').value;

    await checkRegistration(name, phone);
  });
}

// Check if user is registered
async function checkRegistration(name, phone) {
  try {
    const response = await fetch(`${API_URL}/access/check-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: phone,
        category: currentCategory,
        name: name
      })
    });

    const data = await response.json();

    if (data.isRegistered) {
      accessRequestId = data.accessRequestId;
      document.getElementById('otp-display').textContent = data.otp;
      showScreen('otp-screen');
    } else {
      showScreen('waiting-screen');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// OTP Verification
function initializeOTPVerification() {
  const btn = document.getElementById('verify-otp-btn');

  btn.addEventListener('click', async () => {
    const otp = document.getElementById('otp-input').value;

    const res = await fetch(`${API_URL}/access/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessRequestId, otp })
    });

    const data = await res.json();

    if (data.verified) {
      startFaceRecognition();
    } else {
      alert('Invalid OTP');
    }
  });
}

// Face recognition (basic flow)
function startFaceRecognition() {
  showScreen('face-screen');
}

// Screen switch helper
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Back button
function goBack() {
  showScreen('category-screen');
}
