// Security middleware for rate limiting and input validation

// Simple in-memory rate limiter
const rateLimitStore = new Map();

function rateLimit(options = {}) {
  const windowMs = options.windowMs || 60000; // 1 minute
  const max = options.max || 60; // 60 requests per window
  const message = options.message || 'Too many requests, please try again later';
  
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const record = rateLimitStore.get(key);
    
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      rateLimitStore.set(key, record);
      return next();
    }
    
    if (record.count >= max) {
      return res.status(429).json({ message });
    }
    
    record.count++;
    rateLimitStore.set(key, record);
    next();
  };
}

// Strict rate limiter for authentication endpoints
function authRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: 'Too many login attempts, please try again after 15 minutes'
  });
}

// OTP rate limiter
function otpRateLimit() {
  return rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // 3 attempts
    message: 'Too many OTP attempts, please try again after 5 minutes'
  });
}

// Input validation middleware
function validateInput(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Invalid input', 
        details: error.details.map(d => d.message)
      });
    }
    next();
  };
}

// Sanitize error messages in production
function errorHandler(err, req, res, next) {
  console.error('Error:', err);
  
  if (process.env.NODE_ENV === 'production') {
    // Don't leak error details in production
    res.status(err.status || 500).json({
      message: 'An error occurred',
      ...(err.status === 400 && { details: err.message })
    });
  } else {
    // Show full error in development
    res.status(err.status || 500).json({
      message: err.message,
      stack: err.stack
    });
  }
}

// Clean up old rate limit records periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime + 60000) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Every 5 minutes

module.exports = {
  rateLimit,
  authRateLimit,
  otpRateLimit,
  validateInput,
  errorHandler
};
