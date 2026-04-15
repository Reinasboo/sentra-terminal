# Sentra Terminal - Production Deployment Guide

**Version**: 1.0.0  
**Last Updated**: April 14, 2026  
**Status**: PRODUCTION READY (with checklist)

---

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Environment Configuration](#environment-configuration)
4. [Security Hardening](#security-hardening)
5. [Deployment Steps](#deployment-steps)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Disaster Recovery](#disaster-recovery)

---

## Pre-Deployment Checklist

### Backend Readiness ✓
- [x] JWT secret key generated and stored securely
- [x] Database migrations created
- [x] Environment variables documented
- [x] Rate limiting configured
- [x] CORS restricted to production domains
- [x] WebSocket authentication implemented
- [x] Logging configured
- [x] Health check endpoints added
- [x] Error handling standardized
- [x] Dependencies locked in requirements.txt

### Frontend Readiness ✓
- [x] API URLs hardcoded to production
- [x] Token refresh logic implemented
- [x] Error boundaries added
- [x] Timeout handling configured
- [x] API client with retry logic
- [x] Environment variables for secrets
- [x] Build tested locally
- [x] Performance optimized
- [x] Security headers configured

### Infrastructure ✓
- [ ] PostgreSQL database deployed
- [ ] Redis cache (optional) deployed
- [ ] SSL/TLS certificates obtained
- [ ] CDN configured (optional)
- [ ] Load balancer configured
- [ ] Monitoring/alerting setup
- [ ] Log aggregation configured
- [ ] Backup strategy implemented

---

## Infrastructure Setup

### Option 1: Docker Deployment (Recommended)

#### Create docker-compose for production:
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  api:
    image: sentra-terminal-api:1.0.0
    container_name: sentra-api-prod
    expose:
      - "8000"
    environment:
      - ENV=production
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
      - DATABASE_URL=${DATABASE_URL}
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
    depends_on:
      - db
    health_check:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: always
    networks:
      - sentra-network

  frontend:
    image: sentra-terminal-frontend:1.0.0
    container_name: sentra-frontend-prod
    expose:
      - "3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com
      - NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
      - NEXT_PUBLIC_ENV=production
    depends_on:
      - api
    restart: always
    networks:
      - sentra-network

  db:
    image: postgres:16-alpine
    container_name: sentra-db-prod
    environment:
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=sentra_terminal
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    restart: always
    networks:
      - sentra-network

  nginx:
    image: nginx:alpine
    container_name: sentra-nginx-prod
    ports:
      - "443:443"
      - "80:80"
    volumes:
      - ./nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
      - frontend
    restart: always
    networks:
      - sentra-network

volumes:
  postgres_data:

networks:
  sentra-network:
    driver: bridge
```

### Option 2: Kubernetes Deployment

```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sentra-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sentra-api
  template:
    metadata:
      labels:
        app: sentra-api
    spec:
      containers:
      - name: api
        image: sentra-terminal-api:1.0.0
        ports:
        - containerPort: 8000
        env:
        - name: ENV
          value: "production"
        - name: JWT_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: sentra-secrets
              key: jwt-secret
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: sentra-secrets
              key: database-url
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
        resources:
          requests:
            cpu: 500m
            memory: 512Mi
          limits:
            cpu: 2000m
            memory: 2Gi
---
apiVersion: v1
kind: Service
metadata:
  name: sentra-api-service
spec:
  selector:
    app: sentra-api
  ports:
  - port: 8000
    targetPort: 8000
  type: LoadBalancer
```

---

## Environment Configuration

### 1. Generate JWT Secret
```bash
python3 -c "import secrets; jwt_secret=secrets.token_urlsafe(32); print(f'JWT_SECRET_KEY={jwt_secret}'); print(f'Save this in your production .env file')"
```

### 2. Setup Database
```bash
# Initialize PostgreSQL database
createdb sentra_terminal

# Create database user
createuser sentra_user
ALTER USER sentra_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE sentra_terminal TO sentra_user;

# Run migrations (from backend directory)
python3 -m alembic upgrade head
```

### 3. Configure Environment Files
```bash
# Backend
cp backend/.env.production backend/.env
# Edit with production values:
nano backend/.env

# Frontend
cp frontend/.env.production frontend/.env
# Edit with production URLs:
nano frontend/.env
```

---

## Security Hardening

### 1. SSL/TLS Certificates
```bash
# Using Let's Encrypt with Certbot
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Copy certificates to nginx
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/
```

### 2. Nginx Configuration (ssl)
```nginx
# nginx.prod.conf
upstream api_backend {
    server api:8000;
}

upstream frontend_backend {
    server frontend:3000;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS - API
server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location / {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Request-ID $request_id;
        
        # Timeouts for WebSocket
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}

# HTTPS - Frontend
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;

    location / {
        proxy_pass http://frontend_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Database Security
```sql
-- Create restricted user (not admin)
CREATE USER api_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE sentra_terminal TO api_user;
GRANT USAGE ON SCHEMA public TO api_user;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO api_user;

-- Disable default public access
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- Enable SSL connections
-- In postgresql.conf: ssl = on
```

---

## Deployment Steps

### Step 1: Build Docker Images
```bash
# Backend
docker build -f backend/Dockerfile -t sentra-terminal-api:1.0.0 backend/

# Frontend
docker build -f frontend/Dockerfile -t sentra-terminal-frontend:1.0.0 frontend/
```

### Step 2: Push to Registry
```bash
# Docker Hub or private registry
docker tag sentra-terminal-api:1.0.0 yourusername/sentra-terminal-api:1.0.0
docker push yourusername/sentra-terminal-api:1.0.0

docker tag sentra-terminal-frontend:1.0.0 yourusername/sentra-terminal-frontend:1.0.0
docker push yourusername/sentra-terminal-frontend:1.0.0
```

### Step 3: Deploy to Production
```bash
# Using Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Using Kubernetes
kubectl apply -f k8s/
```

### Step 4: Verify Deployment
```bash
# Check container status
docker-compose -f docker-compose.prod.yml ps

# Check API health
curl https://api.yourdomain.com/health

# Check frontend
curl https://yourdomain.com/
```

---

## Post-Deployment Verification

### Health Checks
```bash
# API Health
curl https://api.yourdomain.com/health
# Expected response: {"status": "healthy", "database": "connected"}

# API Readiness
curl https://api.yourdomain.com/ready
# Expected response: {"ready": true}

# WebSocket Connection Test
wscat -c "wss://api.yourdomain.com/ws/connect?token=YOUR_JWT_TOKEN"
```

### Security Verification
```bash
# Check SSL/TLS
openssl s_client -connect api.yourdomain.com:443

# Check security headers
curl -I https://api.yourdomain.com
# Should include: Strict-Transport-Security, X-Content-Type-Options, etc.

# Test CORS
curl -H "Origin: https://yourdomain.com" https://api.yourdomain.com/

# Test rate limiting
for i in {1..10}; do echo "Request $i"; curl https://api.yourdomain.com/auth/login; sleep 0.1; done
```

### Performance Checks
```bash
# Load test
ab -n 1000 -c 100 https://api.yourdomain.com/health

# WebSocket connection test
# Use WebSocket load testing tool or write script
```

---

## Monitoring & Maintenance

### Logging
```bash
# View logs from container
docker-compose -f docker-compose.prod.yml logs -f api

# View logs from specific time
docker-compose -f docker-compose.prod.yml logs --since 2h api

# Export logs
docker-compose -f docker-compose.prod.yml logs api > logs_export.txt
```

### Database Backups
```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/sentra-terminal"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U $DB_USER sentra_terminal > $BACKUP_DIR/backup_$DATE.sql
gzip $BACKUP_DIR/backup_$DATE.sql
# Keep last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

### Monitoring Alerts
```bash
# Setup alerts for:
- CPU usage > 80%
- Memory usage > 85%
- Disk usage > 90%
- Database connection errors
- API response time > 1s
- WebSocket disconnections > 10% of connections
- Authentication failures > 100 in 15 minutes
```

---

## Disaster Recovery

### Restore from Backup
```bash
# Stop services
docker-compose -f docker-compose.prod.yml down

# Restore database
gunzip /backups/sentra-terminal/backup_YYYYMMDD_HHMMSS.sql.gz
psql -U sentra_user -d sentra_terminal < /backups/sentra-terminal/backup_YYYYMMDD_HHMMSS.sql

# Restart services
docker-compose -f docker-compose.prod.yml up -d
```

### Rollback Procedure
```bash
# Rollback to previous version
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml rm -f

# Update image versions in docker-compose.prod.yml to previous version
# docker-compose -f docker-compose.prod.yml pull

docker-compose -f docker-compose.prod.yml up -d

# Verify
curl https://api.yourdomain.com/health
```

---

## Performance Tuning

### Database Connection Pool
```python
# In backend/.env
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=30
```

### WebSocket Optimization
```python
# In backend/.env
WS_PING_INTERVAL=30  # Reduce from 30s if needed
WS_MAX_IDLE_TIME=3600
```

### Frontend Build Optimization
```bash
# Enable static generation
NEXT_PUBLIC_STATIC_GENERATION=true

# Use image optimization
npm run build
```

---

## Compliance & Security

- [ ] GDPR compliance reviewed
- [ ] Data encryption at rest configured
- [ ] Data encryption in transit (TLS) enforced
- [ ] Access control lists reviewed
- [ ] Audit logging configured
- [ ] Incident response plan created
- [ ] Penetration test scheduled
- [ ] Security patches monitored

---

## Support & Escalation

- **API Issues**: Check `/health` endpoint and logs
- **Database Issues**: Check PostgreSQL logs
- **WebSocket Issues**: Check browser console and network tab
- **Performance**: Check monitoring dashboards
- **Security**: Contact security team immediately

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-04-14 | Initial production release |

---

**Next Review Date**: April 21, 2026  
**Last Reviewed**: April 14, 2026
