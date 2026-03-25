# Security Setup Guide

## 🔒 Critical Security Steps

### 1. Change Default Credentials (REQUIRED)

Edit your `.env` file and change these values:

```env
# Change this to a strong, random password
ADMIN_PASSWORD=YourSecurePassword123!

# Change these to random 6-digit codes
FAMILY_OTP=987654
SERVANT_OTP=456789
FRIEND_OTP=111222
```

### 2. Generate Strong JWT Secret (REQUIRED)

Replace the JWT_SECRET with a strong random string:

```bash
# On Linux/Mac:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# On Windows PowerShell:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and update `.env`:
```env
JWT_SECRET=your_generated_secret_here
```

### 3. Configure CORS for Production

Update `.env` with your actual domain:

```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 4. Set Production Environment

When deploying to production:

```env
NODE_ENV=production
```

This will:
- Hide error details from users
- Disable password logging
- Enable stricter security

## 🛡️ Security Features Implemented

### ✅ Fixed Issues

1. **CORS Protection** - Only allowed origins can access API
2. **Rate Limiting** - Prevents brute force attacks
3. **Environment Variables** - No hardcoded credentials
4. **Input Validation** - Protects against malformed data
5. **Error Sanitization** - No information leakage
6. **Connection Limits** - Prevents DoS on WebSocket
7. **Graceful Shutdown** - Proper cleanup on exit
8. **JWT Validation** - Checks for JWT_SECRET on startup

### 🔄 Rate Limits

- **General API**: 60 requests/minute per IP
- **Login**: 5 attempts per 15 minutes
- **OTP**: 3 attempts per 5 minutes
- **WebSocket Events**: 60 events/minute per connection

## 📋 Pre-Deployment Checklist

- [ ] Changed ADMIN_PASSWORD in .env
- [ ] Changed all GROUP_OTPs in .env
- [ ] Generated new JWT_SECRET
- [ ] Updated ALLOWED_ORIGINS for production domain
- [ ] Set NODE_ENV=production
- [ ] Tested login with new credentials
- [ ] Verified CORS works with production domain
- [ ] Set up HTTPS/SSL certificate
- [ ] Configured firewall rules
- [ ] Set up automated backups
- [ ] Configured monitoring/logging

## 🚀 Production Deployment

### Recommended: Use PM2 for Process Management

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server.js --name smart-home

# Enable startup script
pm2 startup
pm2 save

# Monitor
pm2 monit
```

### Enable HTTPS

Use Let's Encrypt for free SSL:

```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Update your server to use HTTPS
```

### Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## 🔍 Monitoring

### Check Logs

```bash
# PM2 logs
pm2 logs smart-home

# System logs
tail -f /var/log/syslog
```

### Monitor Performance

```bash
pm2 monit
```

## 🆘 Security Incident Response

If you suspect a security breach:

1. **Immediately** change all passwords and OTPs
2. Generate new JWT_SECRET (invalidates all tokens)
3. Check access logs: `db/data/access_logs.json`
4. Review user accounts for unauthorized access
5. Restart the server
6. Monitor for suspicious activity

## 📞 Support

For security issues, contact: ganthimathiv2006@gmail.com

---

**Remember**: Security is an ongoing process. Regularly update dependencies and review logs.
