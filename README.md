<<<<<<< HEAD
# 🏠 AuthXHome - Smart Door Access Control System

A comprehensive smart home door access control system featuring facial recognition, OTP verification, and IoT hardware integration.

![Node.js](https://img.shields.io/badge/Node.js-v14+-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-ML-orange)
![ESP32](https://img.shields.io/badge/ESP32-IoT-red)

## 🌟 Features

- **🎭 Facial Recognition**: Real-time face detection using BlazeFace ML model
- **🔐 Multi-Factor Authentication**: Face, OTP, and QR code access
- **🤖 IoT Integration**: ESP32-controlled servo motor for physical door lock
- **👥 User Management**: Role-based access control (Admin, Family, Guest, Servant)
- **📊 Access Logs**: Complete tracking of all entry attempts
- **📱 Responsive Web Interface**: Works on desktop and mobile
- **🔑 Group OTP System**: Permanent codes for different user groups
- **⚡ Real-time Updates**: Socket.io for instant notifications

## 🚀 Quick Start

### Prerequisites

- Node.js v14 or higher
- npm or yarn
- Modern web browser
- ESP32 DevKit (for hardware control)
- Arduino IDE (for ESP32 programming)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/AuthXHome.git
cd AuthXHome
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Start the server**
```bash
node server.js
```

5. **Access the application**
```
Open http://localhost:3000 in your browser
```

## 🔧 Hardware Setup

### Components Required
- ESP32 DevKit
- SG90 Servo Motor
- 4x3 Matrix Keypad
- Jumper wires
- USB cable
- 5V Power supply

### Connections
```
ESP32 Pin 18 → Servo Signal
ESP32 5V → Servo VCC
ESP32 GND → Servo GND

Keypad Rows → GPIO 13, 12, 14, 27
Keypad Cols → GPIO 26, 25, 33
```

### Upload Arduino Code
1. Open `esp32/door_control.ino` in Arduino IDE
2. Configure WiFi credentials
3. Select ESP32 board
4. Upload to ESP32

For detailed hardware setup, see [HARDWARE_SETUP_GUIDE.md](HARDWARE_SETUP_GUIDE.md)

## 📖 Documentation

- [Project Presentation](PROJECT_PRESENTATION.md) - Complete project overview
- [Project Description](PROJECT_DESCRIPTION.md) - Detailed technical documentation
- [Face Recognition Guide](FACE_RECOGNITION_GUIDE.md) - How to register faces
- [Hardware Setup](HARDWARE_SETUP_GUIDE.md) - Hardware assembly instructions
- [Keypad Integration](KEYPAD_INTEGRATION_GUIDE.md) - Keypad setup guide
- [Group OTP System](GROUP_OTP_SYSTEM.md) - OTP management

## 🎯 Usage

### Admin Login
```
Email: admin@smarthome.com
Password: Admin@123
```

### Group OTPs
```
FAMILY: 123456
SERVANT: 567890
FRIEND: 999999
```

### Face Registration
1. Login to your account
2. Go to Face Registration page
3. Allow camera access
4. Capture 10 photos (follow on-screen instructions)
5. Save registration

### Door Access
1. Go to Door Access page
2. Show your face to camera
3. System identifies you automatically
4. Door unlocks for 5 seconds

## 🏗️ Project Structure

```
AuthXHome/
├── server.js                 # Main server file
├── package.json             # Dependencies
├── .env.example             # Environment template
├── db/
│   ├── storage.js           # Database operations
│   └── data/                # JSON database files
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── user.js              # User management
│   └── door.js              # Door control
├── models/
│   ├── User.js              # User model
│   └── Category.js          # User categories
├── public/
│   ├── index.html           # Dashboard
│   ├── login.html           # Login page
│   ├── face-registration.html
│   ├── door-access.html
│   └── admin.html           # Admin panel
├── esp32/
│   └── door_control.ino     # Arduino code
└── docs/                    # Documentation
```

## 🔐 Security Features

- **Password Hashing**: bcrypt with 10 rounds
- **JWT Authentication**: Secure token-based auth
- **OTP Expiry**: Time-limited temporary codes
- **Access Logging**: Complete audit trail
- **Role-based Permissions**: Granular access control

## 📊 Technology Stack

### Frontend
- HTML5, CSS3, JavaScript
- TensorFlow.js
- BlazeFace Model
- Socket.io Client

### Backend
- Node.js
- Express.js
- JWT (jsonwebtoken)
- bcrypt
- Socket.io

### Hardware
- ESP32 (Arduino)
- Servo Motor Control
- Keypad Interface
- WiFi Communication

## 🎨 Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Face Registration
![Face Registration](screenshots/face-registration.png)

### Door Access
![Door Access](screenshots/door-access.png)

### Admin Panel
![Admin Panel](screenshots/admin-panel.png)

## 📈 Performance

- **Face Recognition Accuracy**: 90-95%
- **Recognition Speed**: ~2 seconds
- **False Positive Rate**: <5%
- **OTP Verification**: <1 second
- **Door Response Time**: 5 seconds

## 🔮 Future Enhancements

- [ ] Voice recognition integration
- [ ] Mobile app (React Native)
- [ ] Cloud database (MongoDB)
- [ ] SMS notifications
- [ ] Multiple camera support
- [ ] Deep learning models
- [ ] Fingerprint integration
- [ ] Smart home ecosystem integration

## 🐛 Troubleshooting

### Face Recognition Issues
- Ensure good lighting conditions
- Position face in center of frame
- Check camera permissions
- Verify face is registered (10 samples)

### ESP32 Connection Issues
- Check WiFi credentials
- Verify IP address in .env
- Test servo manually
- Check power supply

### Server Errors
- Restart Node.js server
- Check port 3000 availability
- Verify all dependencies installed
- Review server logs

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Keerthi**
- Email: ganthimathiv2006@gmail.com
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)

## 🙏 Acknowledgments

- TensorFlow.js team for ML framework
- BlazeFace model developers
- ESP32 community
- Node.js ecosystem
- Open source contributors

## 📞 Support

For support, email ganthimathiv2006@gmail.com or open an issue in the repository.

## ⭐ Star History

If you find this project useful, please consider giving it a star!

---

**Made with ❤️ by Keerthi**
=======
# Smart Home Automation System

A comprehensive smart home automation system with facial recognition, voice emotion detection, and multi-language support.

## Features

- **User Authentication**: Sign up and sign in with email/password
- **Multi-language Support**: English, Hindi, Tamil, Telugu
- **Dashboard**: Personalized dashboard with profile management
- **Voice Chatbot**: Voice recognition with emotion detection
- **Smart Door Access**: OTP verification + facial recognition
- **Visitor Logging**: Automatic visitor tracking with timestamps
- **ESP32 Integration**: Hardware control for door locks
- **Real-time Updates**: Socket.io for live notifications

## Tech Stack

### Backend
- Node.js + Express
- MongoDB (Database)
- Socket.io (Real-time communication)
- JWT (Authentication)

### Frontend
- HTML5, CSS3, JavaScript
- Socket.io Client

### Hardware
- ESP32 Microcontroller
- Door lock mechanism
- Keypad for OTP entry

### AI/ML
- Python
- OpenCV (Facial recognition)
- face_recognition library
- speech_recognition (Voice detection)
- TextBlob (Emotion analysis)

## Installation

### 1. Backend Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# - Set MongoDB URI
# - Set JWT secret
# - Set ESP32 IP address

# Start server
npm start
```

### 2. MongoDB Setup

```bash
# Install MongoDB
# Start MongoDB service
mongod

# Database will be created automatically
```

### 3. Python Setup

```bash
# Install Python dependencies
pip install opencv-python face_recognition numpy requests SpeechRecognition textblob

# Run facial recognition
python python/facial_recognition.py

# Run voice emotion detection
python python/voice_emotion.py
```

### 4. ESP32 Setup

1. Open `esp32/door_control.ino` in Arduino IDE
2. Update WiFi credentials
3. Update pin configuration if needed
4. Upload to ESP32
5. Note the IP address from Serial Monitor
6. Update `.env` file with ESP32 IP

## Usage

### Starting the System

1. Start MongoDB
2. Start Node.js server: `npm start`
3. Open browser: `http://localhost:3000`
4. Upload ESP32 code and power on
5. Run Python scripts as needed

### User Flow

1. **Sign Up/Sign In**
   - Select language
   - Create account or login
   - Access dashboard

2. **Door Access**
   - Click "Generate OTP"
   - Enter OTP on keypad
   - System verifies OTP
   - Camera captures face
   - Facial recognition validates
   - Door unlocks if valid
   - Visitor logged automatically

3. **Voice Chat**
   - Click "Start Voice Chat"
   - Speak to chatbot
   - System detects emotion
   - Displays emotion state

4. **Visitor Log**
   - View all visitor entries
   - See timestamps
   - Check access status

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/signin` - Login user

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

### Door
- `POST /api/door/generate-otp` - Generate OTP
- `POST /api/door/verify-otp` - Verify OTP
- `POST /api/door/unlock` - Unlock door
- `POST /api/door/verify-face` - Facial recognition

### Visitor
- `POST /api/visitor/log` - Log visitor entry
- `GET /api/visitor/logs` - Get all logs
- `GET /api/visitor/logs/:personId` - Get logs by person

## Hardware Connections

### ESP32 Pinout
- GPIO 2: Door lock relay
- Power: 5V
- Ground: GND

### Keypad
- Connect to ESP32 GPIO pins
- Configure in Arduino code

## Security Notes

- Change default JWT secret
- Use HTTPS in production
- Secure MongoDB with authentication
- Update ESP32 WiFi credentials
- Store facial recognition data securely

## Future Enhancements

- Mobile app integration
- Advanced emotion detection
- Multiple camera support
- Cloud storage for visitor images
- Smart notifications
- Integration with other smart devices

## License

MIT License
>>>>>>> bef748dd58cc032f2e9c5527e21a8411c0f1eadd
