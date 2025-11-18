# 🚀 Pinterest Backend - Production Deployment Guide

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB 5.0+
- Redis (optional, for caching)
- PM2 (for process management)
- Nginx (for reverse proxy)
- SSL certificate (Let's Encrypt recommended)

## 🔧 Environment Setup

### 1. Environment Variables

Create `.env` file in production:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000
CLIENT_URL=https://yourdomain.com

# Database
MONGO_URI=mongodb://localhost:27017/pinterest_prod

# JWT Secrets (Generate strong random strings)
ACCESS_TOKEN=your_super_secure_access_token_secret_here
REFRESH_TOKEN=your_super_secure_refresh_token_secret_here
VERIFY_TOKEN=your_super_secure_verify_token_secret_here
RESET_TOKEN=your_super_secure_reset_token_secret_here

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload (Cloudinary optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Logging
LOG_LEVEL=info
```

### 2. Database Setup

```bash
# Create production database
mongosh
use pinterest_prod

# Run index creation script
node scripts/addIndexes.js
```

### 3. File Permissions

```bash
# Create necessary directories
mkdir -p uploads/images uploads/videos logs

# Set proper permissions
chmod 755 uploads/
chmod 755 logs/
```

## 🚀 Deployment Steps

### 1. Install Dependencies

```bash
npm ci --only=production
```

### 2. Build and Test

```bash
# Run tests
npm test

# Start server for testing
npm start
```

### 3. PM2 Configuration

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'pinterest-backend',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

### 4. Start with PM2

```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

### 5. Nginx Configuration

Create `/etc/nginx/sites-available/pinterest-backend`:

```nginx
server {
    listen 80;
    server_name your-api-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-api-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-api-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-api-domain.com/privkey.pem;

    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubdomains; preload";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files
    location /uploads/ {
        alias /path/to/your/app/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5000;
        access_log off;
    }
}
```

### 6. SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-api-domain.com
```

### 7. Firewall Configuration

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## 📊 Monitoring & Maintenance

### 1. PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs pinterest-backend

# Restart application
pm2 restart pinterest-backend
```

### 2. Log Rotation

Create `/etc/logrotate.d/pinterest`:

```
/path/to/your/app/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 your-user your-group
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 3. Database Backup

Create a backup script `scripts/backup.sh`:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db pinterest_prod --out /path/to/backups/backup_$DATE
find /path/to/backups/ -type d -mtime +30 -exec rm -rf {} \;
```

Add to crontab:

```bash
# Daily backup at 2 AM
0 2 * * * /path/to/your/app/scripts/backup.sh
```

## 🔍 Health Checks & Monitoring

### 1. Application Health

```bash
# Health check endpoint
curl https://your-api-domain.com/health

# PM2 status
pm2 status
```

### 2. Database Monitoring

```bash
# MongoDB status
mongosh --eval "db.serverStatus()"

# Collection sizes
mongosh pinterest_prod --eval "db.stats()"
```

### 3. Log Monitoring

```bash
# View recent errors
tail -f logs/error.log

# Search for specific errors
grep "ERROR" logs/combined.log | tail -20
```

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :5000
   sudo kill -9 <PID>
   ```

2. **MongoDB connection issues**
   ```bash
   sudo systemctl status mongod
   sudo systemctl restart mongod
   ```

3. **Permission issues**
   ```bash
   sudo chown -R your-user:your-group /path/to/your/app
   ```

4. **Memory issues**
   ```bash
   pm2 monit
   pm2 reload pinterest-backend
   ```

## 📈 Performance Optimization

### 1. Database Optimization

```javascript
// Add compound indexes for common queries
db.pins.createIndex({ owner: 1, createdAt: -1 })
db.pins.createIndex({ board: 1, createdAt: -1 })
db.notifications.createIndex({ recipient: 1, isRead: 1, createdAt: -1 })
```

### 2. Caching Strategy

```javascript
// Implement Redis caching for:
// - User sessions
// - Popular pins/boards
// - Search results
// - API responses
```

### 3. CDN Integration

- Use CloudFront/Cloudflare for static assets
- Implement image optimization
- Cache API responses at edge locations

## 🔐 Security Checklist

- [x] HTTPS enabled
- [x] Helmet security headers
- [x] Rate limiting implemented
- [x] Input validation active
- [x] XSS protection enabled
- [x] CSRF protection (implement if needed)
- [x] Secure cookie settings
- [x] File upload restrictions
- [x] SQL injection prevention
- [x] Regular security updates

## 📞 Support

For issues:
1. Check logs: `pm2 logs`
2. Monitor resources: `pm2 monit`
3. Review error logs: `tail -f logs/error.log`
4. Check database: `mongosh pinterest_prod`

---

**🎉 Deployment Complete!**

Your Pinterest backend is now production-ready with full monitoring, security, and scalability features.
