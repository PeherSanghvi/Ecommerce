# 🚀 Deployment Guide

## Admin Dashboard + Product Details Page Deployment

**Date:** July 22, 2026  
**Status:** Production Ready  
**Version:** 1.0  
**Build Time:** 72 seconds  
**Build Errors:** 0

---

## 📋 Table of Contents

1. [Pre-Deployment](#pre-deployment)
2. [Frontend Deployment](#frontend-deployment)
3. [Backend Deployment](#backend-deployment)
4. [Verification](#verification)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)
7. [Rollback](#rollback)

---

## 🔍 Pre-Deployment

### Environment Checklist

**Backend Services (30 minutes before deployment)**

```bash
# Check MongoDB
mongo --version
# Expected: version 4.0+

# Test MongoDB connection
mongosh "mongodb://localhost:27017"
# Check orders collection exists
db.orders.countDocuments()
# Expected: Count > 0

# Check OpenSearch
curl -X GET "http://localhost:9200/"
# Expected: Status 200, version shown

# Check OpenSearch index
curl -X GET "http://localhost:9200/orders-index/_stats"
# Expected: Status 200, index exists

# Check Node.js
node --version
# Expected: v18.0.0 or higher

npm --version
# Expected: v8.0.0 or higher
```

**Backend Service Status**

```bash
# Check if backend is running
curl http://localhost:5000/api/health
# Expected: { "status": "ok" }

# Check if SearchController is working
curl -X POST http://localhost:5000/api/search/orders \
  -H "Content-Type: application/json" \
  -d '{"page": 0, "size": 10}'
# Expected: Status 200, orders array returned
```

**Environment Variables**

```bash
# Verify .env file contains:
OPENSEARCH_HOST=localhost
OPENSEARCH_PORT=9200
OPENSEARCH_SCHEME=http
OPENSEARCH_USERNAME=
OPENSEARCH_PASSWORD=
MONGODB_URI=mongodb://localhost:27017/ecom
INDEX_NAME=orders-index
```

---

## 🎨 Frontend Deployment

### Step 1: Build Production Bundle

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not done)
npm install

# Build for production
npm run build

# Expected output:
# ✓ 3920 modules transformed
# ✓ Rendering chunks
# ✓ Computing gzip size
# ✓ Built in 72 seconds
# Errors: 0
# Bundle size: 631.20 kB (189.38 kB gzipped)
```

### Step 2: Verify Build Output

```bash
# Check dist folder structure
ls -la dist/

# Expected structure:
# ├── index.html (0.68 kB)
# ├── assets/
# │   ├── index-XXXX.css (53.80 kB)
# │   └── index-XXXX.js (631.20 kB)

# Verify key files exist
test -f dist/index.html && echo "✓ index.html exists"
test -f dist/assets/index*.css && echo "✓ CSS exists"
test -f dist/assets/index*.js && echo "✓ JS exists"
```

### Step 3: Deploy to Web Server

#### Option A: Nginx

```bash
# 1. Stop Nginx
sudo systemctl stop nginx

# 2. Backup current build (if exists)
sudo cp -r /var/www/html /var/www/html.backup.$(date +%Y%m%d)

# 3. Copy new build
sudo rm -rf /var/www/html/*
sudo cp -r frontend/dist/* /var/www/html/

# 4. Set permissions
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# 5. Verify Nginx config
sudo nginx -t
# Expected: "syntax is ok" and "test is successful"

# 6. Start Nginx
sudo systemctl start nginx

# 7. Verify Nginx running
sudo systemctl status nginx
# Expected: "active (running)"
```

**Nginx Configuration (.conf):**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Document root
    root /var/www/html;
    index index.html index.htm;

    # SPA routing - fallback to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss;
}
```

#### Option B: Apache

```bash
# 1. Stop Apache
sudo systemctl stop apache2

# 2. Backup current build
sudo cp -r /var/www/html /var/www/html.backup.$(date +%Y%m%d)

# 3. Copy new build
sudo rm -rf /var/www/html/*
sudo cp -r frontend/dist/* /var/www/html/

# 4. Set permissions
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# 5. Enable required modules
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod ssl

# 6. Restart Apache
sudo systemctl restart apache2

# 7. Verify Apache running
sudo systemctl status apache2
```

**Apache Configuration (.htaccess):**

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # SPA routing
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE text/javascript
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-Content-Type-Options "nosniff"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

#### Option C: Docker

```bash
# 1. Create Dockerfile (if not exists)
cat > Dockerfile << 'EOF'
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# 2. Build Docker image
docker build -t ecom-frontend:latest .

# 3. Stop old container
docker stop ecom-frontend || true
docker rm ecom-frontend || true

# 4. Run new container
docker run -d \
  --name ecom-frontend \
  -p 80:80 \
  -p 443:443 \
  -v /etc/letsencrypt:/etc/letsencrypt \
  ecom-frontend:latest

# 5. Verify container running
docker ps | grep ecom-frontend
# Expected: Container listed as running
```

---

## 🔧 Backend Deployment

### Step 1: Update Backend Code

```bash
# Navigate to backend
cd backend-node

# Pull latest changes
git pull origin main

# Check what changed
git log --oneline -5
# Expected: searchService.js modification visible

# Install any new dependencies
npm install
```

### Step 2: Verify Changes

```bash
# Check searchService.js changes
git diff HEAD~1 src/services/searchService.js
# Expected: Field mapping changes visible (+25 lines)

# Verify no breaking changes
npm test
# Expected: All tests pass
```

### Step 3: Deploy Backend

#### Option A: Direct Server Deployment

```bash
# 1. Stop current backend
pm2 stop ecom-backend || systemctl stop ecom-backend

# 2. Backup current version
cp -r /opt/ecom-backend /opt/ecom-backend.backup.$(date +%Y%m%d)

# 3. Copy new code
cp -r backend-node/* /opt/ecom-backend/

# 4. Install dependencies
cd /opt/ecom-backend
npm install --production

# 5. Start backend
pm2 start ecosystem.config.js
# OR
systemctl start ecom-backend

# 6. Verify running
curl http://localhost:5000/api/health
# Expected: { "status": "ok" }
```

#### Option B: Docker Deployment

```bash
# 1. Build Docker image
docker build -t ecom-backend:latest -f Dockerfile .

# 2. Stop old container
docker stop ecom-backend || true
docker rm ecom-backend || true

# 3. Run new container
docker run -d \
  --name ecom-backend \
  -p 5000:5000 \
  --env-file .env \
  -e MONGODB_URI=mongodb://mongo:27017/ecom \
  -e OPENSEARCH_HOST=opensearch \
  ecom-backend:latest

# 4. Verify container
docker logs ecom-backend
# Expected: Server running on port 5000
```

#### Option C: Kubernetes Deployment

```bash
# 1. Build and push image
docker build -t yourdomain.com/ecom-backend:latest .
docker push yourdomain.com/ecom-backend:latest

# 2. Update deployment
kubectl set image deployment/ecom-backend \
  ecom-backend=yourdomain.com/ecom-backend:latest

# 3. Monitor rollout
kubectl rollout status deployment/ecom-backend
# Expected: "deployment 'ecom-backend' successfully rolled out"

# 4. Check pods
kubectl get pods -l app=ecom-backend
# Expected: Pods running and ready
```

---

## ✅ Verification

### Smoke Tests

```bash
# 1. Check frontend loads
curl -I http://localhost/
# Expected: Status 200

# 2. Check frontend content
curl http://localhost/ | grep "<!DOCTYPE html"
# Expected: HTML content returned

# 3. Check backend health
curl http://localhost:5000/api/health
# Expected: { "status": "ok" }

# 4. Test search endpoint
curl -X POST http://localhost:5000/api/search/orders \
  -H "Content-Type: application/json" \
  -d '{"page": 0, "size": 10}'
# Expected: Status 200, orders array

# 5. Test product endpoint
curl http://localhost:5000/api/products/507f1f77bcf86cd799439011
# Expected: Status 200, product data

# 6. Check OpenSearch
curl http://localhost:9200/orders-index/_count
# Expected: Status 200, count shown
```

### Browser Testing

```
1. Open https://yourdomain.com in browser

2. Test Admin Dashboard:
   - Navigate to /admin
   - Should see dashboard with search bar and filters
   - Try searching for an order
   - Verify results display
   - Check KPI cards show numbers

3. Test Product Details:
   - Navigate to /products
   - Click on a product
   - Should go to /products/:id
   - Verify image gallery loads
   - Try zooming on image
   - Click add to cart
   - Verify wishlist button works

4. Check Console:
   - No JavaScript errors
   - No 404s for assets
   - No CORS errors
   - All API calls successful (200, 201)
```

### Performance Testing

```bash
# 1. Check page load time
curl -w "@curl-format.txt" -o /dev/null -s http://localhost/

# 2. Check API response time
time curl -X POST http://localhost:5000/api/search/orders \
  -H "Content-Type: application/json" \
  -d '{"page": 0, "size": 10}'
# Expected: < 200ms

# 3. Check resource sizes
curl -I http://localhost/assets/index*.js
# Expected: 631.20 kB (or similar)

# 4. Monitor system resources
top -b -n 1 | head -20
# Check CPU and memory usage
```

### Error Monitoring

```bash
# Check application logs
# Frontend
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Backend
pm2 logs ecom-backend
# OR
journalctl -u ecom-backend -f

# Docker
docker logs -f ecom-backend
docker logs -f ecom-frontend
```

---

## 📈 Post-Deployment

### Deployment Verification (1 hour after)

```bash
# 1. Verify services running
systemctl status nginx
systemctl status ecom-backend
# OR
pm2 status
# OR
docker ps

# 2. Check logs for errors
grep -i error /var/log/nginx/error.log
pm2 logs ecom-backend | grep -i error

# 3. Monitor metrics
curl http://localhost:5000/api/health
curl http://localhost:9200/_cluster/health

# 4. Test key features
# Search orders
curl -X POST http://localhost:5000/api/search/orders \
  -H "Content-Type: application/json" \
  -d '{"keyword": "test", "page": 0, "size": 10}'

# Get product
curl http://localhost:5000/api/products/507f1f77bcf86cd799439011
```

### Monitoring Setup

```bash
# 1. Application Performance Monitoring (APM)
# If using Datadog, New Relic, or similar:
curl -I http://yourdomain.com  # Check metrics collected

# 2. Uptime Monitoring
# Set up monitoring for:
# - https://yourdomain.com/admin
# - https://yourdomain.com/products
# - https://yourdomain.com/api/health

# 3. Error Tracking
# Monitor:
# - Browser console errors
# - Backend error logs
# - API error responses

# 4. Performance Tracking
# Monitor:
# - Page load times
# - API response times
# - Search query performance
```

### User Communication

```
Email to team/users:

Subject: New Admin Dashboard & Product Details Page Live

We've deployed two major improvements:

1. Admin Search Dashboard (URL: /admin)
   - Search orders instantly
   - Filter by status, date, amount
   - View analytics and KPIs
   - Rebuild index when needed

2. Amazon-Style Product Details
   - Professional product pages
   - Image gallery with zoom
   - Product specifications
   - Related products section

New Features:
✓ Real-time search with OpenSearch
✓ Advanced filtering
✓ Responsive design
✓ Smooth animations
✓ Professional UI/UX

If you encounter any issues, please report to: support@yourdomain.com

Thank you!
```

---

## 🔧 Troubleshooting

### Frontend Issues

**Page shows blank or 404**
```bash
# Check if dist/ folder exists
ls -la /var/www/html/
# Expected: index.html present

# Check Nginx configuration
sudo nginx -t

# Check file permissions
ls -la /var/www/html/index.html
# Expected: readable by www-data user

# Solution:
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

**Routes not working (/products/:id shows 404)**
```bash
# Check SPA fallback configuration
grep -A 5 "try_files" /etc/nginx/sites-enabled/default
# Should have: try_files $uri $uri/ /index.html;

# If not present, add to Nginx config and reload:
sudo systemctl reload nginx
```

**CSS/JS not loading**
```bash
# Check asset paths in dist/
ls -la dist/assets/

# Check Content-Type headers
curl -I https://yourdomain.com/assets/index*.js
# Should show: Content-Type: application/javascript

# Check compression
curl -I https://yourdomain.com/assets/index*.js | grep -i content-encoding
# Should show gzip if enabled
```

**Animations lag on mobile**
```bash
# Check browser console for errors
# Open DevTools → Console tab
# Look for JavaScript errors

# Check performance in DevTools
# Open DevTools → Performance tab
# Record while interacting
# Check for long tasks or dropped frames
```

### Backend Issues

**API returns 500 error**
```bash
# Check backend logs
pm2 logs ecom-backend

# Check if backend running
curl http://localhost:5000/api/health

# Restart backend
pm2 restart ecom-backend

# Check error in backend
tail -50 ~/.pm2/logs/ecom-backend-error.log
```

**Search returns no results**
```bash
# Check OpenSearch connection
curl http://localhost:9200/

# Check index exists
curl http://localhost:9200/orders-index/_stats

# Verify data indexed
curl http://localhost:9200/orders-index/_count

# If index empty, rebuild
curl -X POST http://localhost:5000/api/admin/reindex

# Verify data synced
curl http://localhost:9200/orders-index/_count
# Should show count > 0
```

**API calls fail with CORS error**
```bash
# Check CORS headers
curl -I http://yourdomain.com/api/health

# Add CORS headers to proxy
# Nginx example:
add_header 'Access-Control-Allow-Origin' '*';
add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE';

# Reload web server
sudo systemctl reload nginx
```

**Database connection fails**
```bash
# Check MongoDB running
sudo systemctl status mongod

# Test MongoDB connection
mongosh mongodb://localhost:27017

# Check .env MONGODB_URI
cat backend-node/.env | grep MONGODB_URI

# Verify connection string
# Should be: mongodb://localhost:27017/ecom

# Restart backend if connection string changed
pm2 restart ecom-backend
```

### Performance Issues

**Slow search responses**
```bash
# Check OpenSearch health
curl http://localhost:9200/_cluster/health

# Check index stats
curl http://localhost:9200/orders-index/_stats

# Optimize index if needed
curl -X POST http://localhost:9200/orders-index/_forcemerge

# Monitor query time
curl -X POST http://localhost:9200/orders-index/_search \
  -H "Content-Type: application/json" \
  -d '{"query": {"match_all": {}}}' | grep took
```

**High memory usage**
```bash
# Check what's using memory
top -o %MEM | head -20

# Check if there's a memory leak
# Monitor memory over time
watch -n 1 free -h

# If backend leaking:
pm2 kill
npm install
pm2 start

# Check for connection leaks in code
```

**Slow page load**
```bash
# Run Lighthouse
# Open Chrome DevTools → Lighthouse
# Run performance audit
# Review recommendations

# Check largest assets
curl -I https://yourdomain.com/assets/index*.js | grep content-length

# Enable gzip compression (if not already)
# Check Nginx config has gzip enabled
grep -A 5 "gzip on" /etc/nginx/nginx.conf
```

---

## 🔄 Rollback

### Quick Rollback (< 5 minutes)

```bash
# 1. Check backup exists
ls -la /var/www/html.backup*
ls -la /opt/ecom-backend.backup*

# 2. Restore frontend
sudo rm -rf /var/www/html
sudo cp -r /var/www/html.backup.YYYYMMDD /var/www/html
sudo systemctl reload nginx

# 3. Restore backend
sudo rm -rf /opt/ecom-backend
sudo cp -r /opt/ecom-backend.backup.YYYYMMDD /opt/ecom-backend
cd /opt/ecom-backend
npm install
pm2 restart ecom-backend

# 4. Verify rollback
curl http://localhost:5000/api/health
curl -I http://localhost/
```

### Docker Rollback

```bash
# 1. List image history
docker images ecom-backend

# 2. Stop current container
docker stop ecom-backend

# 3. Run previous version
docker run -d \
  --name ecom-backend-old \
  -p 5000:5000 \
  --env-file .env \
  ecom-backend:previous

# 4. Update DNS or load balancer to point to old instance
# Or rename container to make it active again
docker rename ecom-backend-old ecom-backend

# 5. Verify running
docker ps | grep ecom-backend
```

### Kubernetes Rollback

```bash
# 1. Check rollout history
kubectl rollout history deployment/ecom-backend

# 2. Rollback to previous version
kubectl rollout undo deployment/ecom-backend

# 3. Monitor rollback
kubectl rollout status deployment/ecom-backend

# 4. Verify pods
kubectl get pods -l app=ecom-backend
```

### Post-Rollback

```bash
# 1. Verify services
curl http://localhost:5000/api/health

# 2. Run smoke tests
# Navigate to /admin
# Navigate to /products
# Test search
# Test product details

# 3. Check logs
pm2 logs ecom-backend
tail -f /var/log/nginx/access.log

# 4. Notify team
# "Deployment rolled back to previous version"
# "Issue: [describe issue]"
# "ETA for re-deploy: [time]"
```

---

## 📞 Emergency Contacts

**During Deployment:**
- Deployment Lead: ________________
- Backend Team: ________________
- Frontend Team: ________________
- DevOps: ________________

**If Issues Found:**
- Escalation: ________________
- On-Call: ________________

---

## ✅ Deployment Checklist

**Before Deployment:**
- [ ] All code reviewed
- [ ] Build successful (0 errors)
- [ ] Tests passed
- [ ] Backups created
- [ ] Team notified
- [ ] Rollback plan ready

**During Deployment:**
- [ ] Frontend deployed
- [ ] Backend deployed
- [ ] Services verified
- [ ] Smoke tests passed
- [ ] Performance acceptable

**After Deployment:**
- [ ] Monitoring active
- [ ] Logs being tracked
- [ ] Users notified
- [ ] Team monitoring
- [ ] Issues tracked

---

## 📝 Deployment Notes

**Date:** ________________
**Deployer:** ________________
**Duration:** ________________
**Issues:** ________________
**Status:** ☐ Success ☐ Partial ☐ Rollback

**Notes:**
```
_____________________________________________
_____________________________________________
_____________________________________________
```

---

**Document Date:** July 22, 2026  
**Status:** READY FOR DEPLOYMENT  
**Version:** 1.0
