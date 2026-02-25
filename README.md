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
