const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env file');
  process.exit(1);
}

const app = express();
const server = http.createServer(app);

// Secure CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

const io = socketIo(server, {
  cors: { 
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Security: Limit payload size to prevent DoS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static('public'));

// Security middleware
const { rateLimit, errorHandler } = require('./middleware/security');
app.use(rateLimit()); // Apply rate limiting to all routes

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/visitor', require('./routes/visitor'));
app.use('/api/door', require('./routes/door'));
app.use('/api/user', require('./routes/user'));
app.use('/api/qr-access', require('./routes/qr-access'));
app.use('/api/access', require('./routes/access'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/face', require('./routes/face'));

// Error handling middleware (must be last)
app.use(errorHandler);

// Socket.io for real-time communication with connection limits
let activeConnections = 0;
const MAX_CONNECTIONS = 100;

io.on('connection', (socket) => {
  activeConnections++;
  
  if (activeConnections > MAX_CONNECTIONS) {
    console.warn(`Connection limit reached: ${activeConnections}`);
    socket.disconnect(true);
    activeConnections--;
    return;
  }
  
  console.log(`Client connected (${activeConnections} active)`);
  
  // Rate limiting per socket
  const rateLimits = new Map();
  
  const checkRateLimit = (event) => {
    const now = Date.now();
    const limit = rateLimits.get(event) || { count: 0, resetTime: now + 60000 };
    
    if (now > limit.resetTime) {
      limit.count = 0;
      limit.resetTime = now + 60000;
    }
    
    limit.count++;
    rateLimits.set(event, limit);
    
    return limit.count <= 60; // 60 requests per minute
  };
  
  socket.on('voice-emotion', (data) => {
    if (!checkRateLimit('voice-emotion')) {
      socket.emit('error', { message: 'Rate limit exceeded' });
      return;
    }
    io.emit('emotion-detected', data);
  });
  
  socket.on('keypad-input', (data) => {
    if (!checkRateLimit('keypad-input')) {
      socket.emit('error', { message: 'Rate limit exceeded' });
      return;
    }
    console.log('Keypad input received:', data);
    io.emit('keypad-digit', data);
  });
  
  socket.on('keypad-clear', () => {
    if (!checkRateLimit('keypad-clear')) return;
    io.emit('keypad-cleared');
  });
  
  socket.on('keypad-submit', (data) => {
    if (!checkRateLimit('keypad-submit')) return;
    io.emit('keypad-submitted', data);
  });
  
  socket.on('disconnect', () => {
    activeConnections--;
    console.log(`Client disconnected (${activeConnections} active)`);
    rateLimits.clear();
  });
});

console.log('Using file-based storage (no MongoDB required)');

const PORT = process.env.PORT || 3000;

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️  Running in development mode - CORS and security are relaxed');
  }
});

module.exports = { io };
