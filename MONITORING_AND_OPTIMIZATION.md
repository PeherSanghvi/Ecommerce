# 📊 Monitoring & Optimization Guide

## Admin Dashboard + Product Details Page - Post-Deployment

**Date:** July 22, 2026  
**Status:** Live Monitoring  
**Build:** 72 seconds (0 errors)

---

## 📋 Table of Contents

1. [Monitoring Setup](#monitoring-setup)
2. [Performance Metrics](#performance-metrics)
3. [Error Tracking](#error-tracking)
4. [User Analytics](#user-analytics)
5. [Optimization Strategies](#optimization-strategies)
6. [Alerts & Thresholds](#alerts--thresholds)
7. [Weekly Reviews](#weekly-reviews)
8. [Continuous Improvement](#continuous-improvement)

---

## 🔍 Monitoring Setup

### Application Performance Monitoring (APM)

#### Option 1: Datadog

```bash
# 1. Install Datadog agent
DD_AGENT_MAJOR_VERSION=7 \
DD_API_KEY=YOUR_API_KEY \
DD_SITE=datadoghq.com \
bash -c "$(curl -L https://s3.amazonaws.com/dd-agent/scripts/install_agent.sh)"

# 2. Enable frontend monitoring
# Add to index.html <head>:
<script src="https://cdn-datadoghq.com/datadog-rum/v4/datadog-rum.js"></script>
<script>
  window.DD_RUM.init({
    applicationId: 'YOUR_APP_ID',
    clientToken: 'YOUR_CLIENT_TOKEN',
    site: 'datadoghq.com',
    service: 'ecom-frontend',
    env: 'production',
    version: '1.0.0',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'mask-user-input',
  });
  window.DD_RUM.startSessionReplayRecording();
</script>

# 3. Monitor dashboard
# Go to: app.datadoghq.com
# Dashboard → Service List → ecom-frontend & ecom-backend
```

#### Option 2: New Relic

```bash
# 1. Install agent
npm install @newrelic/browser-agent --save

# 2. Initialize in app
// main.jsx
import * as newRelicApi from '@newrelic/browser-agent/loaders/nr-loader'
newRelicApi.setErrorHandler(function(err) {
  console.log('New Relic caught error:', err)
})
newRelicApi.instrument({
  loaderType: 'spa'
})

# 3. Add backend monitoring
# In backend/package.json:
npm install newrelic --save

# 4. Start backend with monitoring
node -r newrelic app.js

# 5. View in New Relic
# Go to: one.newrelic.com
```

#### Option 3: Self-Hosted (Prometheus + Grafana)

```bash
# 1. Install Prometheus
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v /path/to/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus

# 2. Install Grafana
docker run -d \
  --name grafana \
  -p 3000:3000 \
  -e GF_SECURITY_ADMIN_PASSWORD=admin \
  grafana/grafana

# 3. Configure backend to export metrics
# In backend, add Prometheus client:
npm install prom-client --save

# 4. View dashboards
# Go to: http://localhost:3000
# Username: admin
# Password: admin
```

### Real User Monitoring (RUM)

```javascript
// frontend/src/main.jsx
import { setupRUM } from './utils/rum';

setupRUM({
  apiKey: process.env.VITE_RUM_API_KEY,
  environment: 'production',
  service: 'ecom-frontend',
  version: '1.0.0'
});

// frontend/src/utils/rum.js
export const setupRUM = (config) => {
  // Track page views
  window.addEventListener('load', () => {
    console.log('Page loaded:', window.location.pathname);
  });

  // Track API calls
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const startTime = performance.now();
    return originalFetch.apply(this, args)
      .then(response => {
        const duration = performance.now() - startTime;
        console.log(`API: ${args[0]} - ${duration.toFixed(0)}ms`);
        return response;
      });
  };

  // Track errors
  window.addEventListener('error', (event) => {
    console.error('Error:', event.error);
  });

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled rejection:', event.reason);
  });
};
```

### Infrastructure Monitoring

```bash
# 1. Monitor system resources
# Install node-exporter for Prometheus
docker run -d \
  --name node-exporter \
  -p 9100:9100 \
  prom/node-exporter

# 2. Monitor Docker containers
docker stats ecom-frontend ecom-backend

# 3. Monitor OpenSearch
curl -s http://localhost:9200/_cluster/health | jq .

# 4. Monitor MongoDB
mongosh
> db.serverStatus()
> db.stats()

# 5. Monitor Nginx
# Check connection count
netstat -an | grep ESTABLISHED | wc -l

# 6. Setup alerts
# Using Prometheus AlertManager for critical thresholds
```

---

## 📈 Performance Metrics

### Key Performance Indicators (KPIs)

#### Frontend Metrics

```javascript
// Track Core Web Vitals
if (window.web_vitals) {
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log);  // Cumulative Layout Shift
    getFID(console.log);  // First Input Delay
    getFCP(console.log);  // First Contentful Paint
    getLCP(console.log);  // Largest Contentful Paint
    getTTFB(console.log); // Time to First Byte
  });
}

// LCP (Largest Contentful Paint): < 2.5s ✅
// FID (First Input Delay): < 100ms ✅
// CLS (Cumulative Layout Shift): < 0.1 ✅
```

#### Backend Metrics

```javascript
// In backend/src/middleware/metrics.js
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Use middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path, res.statusCode)
      .observe(duration);
    httpRequestTotal
      .labels(req.method, req.route?.path, res.statusCode)
      .inc();
  });
  next();
});
```

#### Business Metrics

```javascript
// Track important events
const trackEvent = (eventName, eventData) => {
  console.log('Event:', eventName, eventData);
  
  // Send to analytics service (Mixpanel, Amplitude, etc.)
  if (window.analytics) {
    window.analytics.track(eventName, eventData);
  }
};

// Usage examples:
// Admin Dashboard
trackEvent('admin_search', { query_type: 'keyword', results_count: 42 });
trackEvent('admin_filter_applied', { filter_type: 'status', value: 'SHIPPED' });
trackEvent('admin_pagination', { page: 2, page_size: 20 });
trackEvent('admin_index_rebuild', { duration_seconds: 5 });

// Product Details
trackEvent('product_view', { product_id: 'abc123', category: 'electronics' });
trackEvent('product_image_zoom', { product_id: 'abc123' });
trackEvent('product_add_to_cart', { product_id: 'abc123', quantity: 2 });
trackEvent('product_buy_now', { product_id: 'abc123' });
trackEvent('product_wishlist_toggle', { product_id: 'abc123', action: 'add' });
```

### Monitoring Dashboard

```
Metrics to Display:

Frontend:
├── Page Load Time
│   ├── Median: < 2s
│   ├── 95th percentile: < 5s
│   └── 99th percentile: < 10s
├── Search Response Time (Admin)
│   ├── Median: < 200ms
│   ├── 95th percentile: < 500ms
│   └── 99th percentile: < 1s
├── Error Rate
│   ├── JavaScript errors: < 0.1%
│   ├── Network errors: < 0.05%
│   └── API errors: < 0.1%
├── User Sessions
│   ├── Daily active users
│   ├── Session duration (avg)
│   └── Bounce rate

Backend:
├── API Response Times
│   ├── GET /api/products/:id: < 200ms (95th)
│   ├── POST /api/search/orders: < 500ms (95th)
│   └── All APIs: < 1s (99th)
├── Error Rates
│   ├── 4xx errors: < 0.1%
│   ├── 5xx errors: < 0.01%
│   └── Timeouts: < 0.01%
├── Resource Usage
│   ├── CPU: < 70%
│   ├── Memory: < 80%
│   └── Disk: < 85%
├── Database
│   ├── Query time: < 100ms (avg)
│   ├── Connection pool: > 80% utilized
│   └── Replication lag: < 1s

OpenSearch:
├── Index Health: GREEN
├── Query Latency: < 100ms (avg)
├── Indexing Latency: < 50ms (avg)
├── Memory Usage: < 75%
└── Document Count: Growing

Uptime:
├── Frontend: > 99.95%
├── Backend: > 99.99%
├── OpenSearch: > 99.9%
└── MongoDB: > 99.9%
```

---

## 🚨 Error Tracking

### Setup Error Monitoring

```javascript
// frontend/src/utils/errorTracking.js
import * as Sentry from "@sentry/react";

export const initErrorTracking = () => {
  Sentry.init({
    dsn: process.env.VITE_SENTRY_DSN,
    environment: process.env.VITE_ENV,
    tracesSampleRate: 1.0,
    integrations: [
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
};

// Catch React errors
export const ErrorBoundary = Sentry.withProfiler(
  Sentry.ErrorBoundary
);

// Track custom errors
export const captureException = (error, context = {}) => {
  Sentry.captureException(error, {
    contexts: { custom: context }
  });
};
```

### Error Categories

```
1. JavaScript Errors
   - Uncaught exceptions
   - Syntax errors
   - Type errors
   - Reference errors
   
2. Network Errors
   - Failed API calls
   - Timeout errors
   - CORS errors
   - Connection errors

3. API Errors
   - 400 Bad Request
   - 401 Unauthorized
   - 403 Forbidden
   - 404 Not Found
   - 500 Server Error
   - 503 Service Unavailable

4. Performance Errors
   - Slow page load
   - Slow API response
   - Memory leaks
   - CPU spikes

5. Data Errors
   - Missing data
   - Invalid data format
   - Validation errors
   - Data mismatch
```

### Alert Rules

```yaml
# prometheus/rules/alerts.yml
groups:
  - name: app_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"
          
      - alert: SlowResponse
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
        for: 10m
        annotations:
          summary: "Slow response time detected"
          
      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes / 1024 / 1024 > 512
        for: 5m
        annotations:
          summary: "High memory usage detected"
          
      - alert: OpenSearchDown
        expr: up{job="opensearch"} == 0
        for: 1m
        annotations:
          summary: "OpenSearch is down"
          
      - alert: MongoDBDown
        expr: up{job="mongodb"} == 0
        for: 1m
        annotations:
          summary: "MongoDB is down"
```

---

## 📊 User Analytics

### Setup Analytics

```bash
# 1. Install analytics library
npm install @amplitude/analytics-browser @amplitude/analytics-node --save

# 2. Initialize in frontend
import * as amplitude from '@amplitude/analytics-browser';

amplitude.init('YOUR_API_KEY', {
  defaultTracking: true,
});

# 3. Track user events
amplitude.track('product_viewed', {
  product_id: '123',
  category: 'electronics',
  price: 99.99
});

# 4. Identify users
amplitude.setUserId('user_id_123');
```

### Key Events to Track

```javascript
// Admin Dashboard Events
{
  event: 'admin_search',
  properties: {
    search_type: 'keyword|order_id|product',
    query: 'user input',
    results_count: 42,
    time_to_result_ms: 150
  }
}

{
  event: 'admin_filter_applied',
  properties: {
    filter_type: 'status|date|amount',
    filter_value: 'SHIPPED',
    results_after_filter: 25
  }
}

{
  event: 'admin_pagination',
  properties: {
    from_page: 0,
    to_page: 1,
    page_size: 20
  }
}

// Product Details Events
{
  event: 'product_viewed',
  properties: {
    product_id: 'abc123',
    category: 'electronics',
    price: 9999,
    time_on_page_s: 45
  }
}

{
  event: 'product_zoom',
  properties: {
    product_id: 'abc123',
    image_index: 2,
    zoom_level: 1.5
  }
}

{
  event: 'add_to_cart',
  properties: {
    product_id: 'abc123',
    quantity: 2,
    price: 9999
  }
}

{
  event: 'buy_now',
  properties: {
    product_id: 'abc123',
    quantity: 1,
    price: 9999,
    authenticated: true
  }
}

{
  event: 'wishlist_toggle',
  properties: {
    product_id: 'abc123',
    action: 'add|remove',
    total_items: 5
  }
}
```

---

## ⚡ Optimization Strategies

### Frontend Optimization

#### 1. Code Splitting

```javascript
// Split large components
const Admin = lazy(() => import('../pages/Admin'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));

// Use Suspense for loading state
<Suspense fallback={<LoadingSpinner />}>
  <Admin />
</Suspense>
```

#### 2. Image Optimization

```javascript
// Use next-gen formats (WebP)
// Lazy load images
<img src={image} loading="lazy" />

// Responsive images
<picture>
  <source srcSet={webpUrl} type="image/webp" />
  <img src={jpgUrl} />
</picture>

// Compress images
// Use service like ImageOptim or TinyPNG
```

#### 3. Bundle Analysis

```bash
# Analyze bundle size
npm install --save-dev rollup-plugin-visualizer

# In vite.config.js
import { visualizer } from "rollup-plugin-visualizer";

export default {
  plugins: [visualizer()]
};

# Build and check report
npm run build
# Open dist/stats.html
```

#### 4. Caching Strategy

```javascript
// Service Worker for caching
// Install Workbox
npm install -D workbox-cli

# Configure caching
- Cache static assets (JS, CSS, fonts): 30 days
- Cache images: 7 days
- Cache API responses: 5 minutes (if applicable)
- Don't cache HTML (always fresh)
```

### Backend Optimization

#### 1. Database Indexing

```javascript
// Ensure MongoDB indexes exist
db.orders.createIndex({ "customer.name": 1 });
db.orders.createIndex({ "status": 1 });
db.orders.createIndex({ "order_date": -1 });
db.orders.createIndex({ "total_minor": 1 });

// Check indexes
db.orders.getIndexes();

// Monitor index usage
db.orders.aggregate([
  { $indexStats: {} }
]);
```

#### 2. OpenSearch Optimization

```bash
# Optimize index
curl -X POST http://localhost:9200/orders-index/_forcemerge

# Set optimal refresh interval
curl -X PUT http://localhost:9200/orders-index/_settings \
  -d '{"index": {"refresh_interval": "30s"}}'

# Monitor index performance
curl http://localhost:9200/orders-index/_stats
```

#### 3. Query Optimization

```javascript
// Profile slow queries
db.setProfilingLevel(1, { slowms: 100 });

// Check slow query log
db.system.profile.find({millis: {$gt: 100}}).sort({ts: -1}).limit(5).pretty();

// Analyze query plan
db.orders.find({status: "SHIPPED"}).explain("executionStats");
```

#### 4. Connection Pooling

```javascript
// Configure connection pool
const mongoUrl = 'mongodb://localhost:27017/ecom?' +
  'maxPoolSize=100&' +
  'minPoolSize=10&' +
  'waitQueueTimeoutMS=10000';

// Monitor pool
const client = mongoClient;
client.on('connectionPoolMonitoring', (event) => {
  console.log('Pool event:', event);
});
```

### Infrastructure Optimization

#### 1. CDN Configuration

```bash
# Serve static assets via CDN
# Add to Nginx config
location /assets/ {
  proxy_cache_key "$scheme$request_method$host$request_uri";
  proxy_cache_valid 200 7d;
  proxy_pass http://cdn_backend;
}
```

#### 2. Load Balancing

```nginx
# Distribute traffic
upstream backend {
  least_conn;
  server backend1:5000;
  server backend2:5000;
  server backend3:5000;
}

server {
  location /api/ {
    proxy_pass http://backend;
  }
}
```

#### 3. Auto-Scaling

```bash
# Kubernetes auto-scaling
kubectl autoscale deployment ecom-backend \
  --min=2 --max=10 --cpu-percent=70

# Check scaling status
kubectl get hpa
```

---

## 🔔 Alerts & Thresholds

### Critical Alerts

```yaml
# Response Time SLA: 500ms (95th percentile)
alert: SLA_Response_Time
threshold: p95_response_time > 500ms
action: Page on-call engineer

# Error Rate SLA: < 0.1%
alert: SLA_Error_Rate
threshold: error_rate > 0.1%
action: Page on-call engineer

# Availability SLA: > 99.9%
alert: SLA_Availability
threshold: uptime < 99.9%
action: Page on-call engineer

# Search Query Performance: < 200ms (avg)
alert: Search_Slow
threshold: avg_search_time > 200ms
action: Investigate OpenSearch
```

### Warning Alerts

```yaml
# Response Time Warning: 300ms (95th percentile)
alert: Slow_Response
threshold: p95_response_time > 300ms
action: Alert operations team

# Error Rate Warning: > 0.05%
alert: High_Error_Rate
threshold: error_rate > 0.05%
action: Alert operations team

# Resource Usage Warning: 70% CPU
alert: High_CPU_Usage
threshold: cpu_percent > 70%
action: Alert operations team

# Memory Usage Warning: 80%
alert: High_Memory_Usage
threshold: memory_percent > 80%
action: Alert operations team
```

---

## 📋 Weekly Reviews

### Every Monday Morning (30 minutes)

```
1. Check Health Dashboard
   [ ] Frontend availability: 100%?
   [ ] Backend availability: 100%?
   [ ] OpenSearch cluster healthy?
   [ ] MongoDB replication healthy?

2. Review Performance Metrics
   [ ] Page load time: Normal?
   [ ] Search response time: Normal?
   [ ] Error rate: Acceptable?
   [ ] Resource usage: Normal?

3. Check Error Log
   [ ] Any critical errors?
   [ ] Any patterns?
   [ ] Any new errors?

4. User Analytics
   [ ] Daily active users trending?
   [ ] Key features being used?
   [ ] Any drop-off in usage?

5. Review Alerts
   [ ] Any triggered alerts?
   [ ] False positives?
   [ ] Need to adjust thresholds?
```

### Weekly Metrics Report

```
Week of: _______________

Availability:
✓ Frontend: 99.99%
✓ Backend: 99.99%
✓ OpenSearch: 99.9%
✓ MongoDB: 99.99%

Performance (95th percentile):
✓ Page load: 2.1s (target: < 2.5s)
✓ Search query: 150ms (target: < 200ms)
✓ Product page: 1.8s (target: < 2s)
✓ API endpoints: 150ms (target: < 500ms)

Errors:
✓ JavaScript errors: 0.01%
✓ Network errors: 0.005%
✓ API errors: 0.005%

Users:
✓ Daily active: 1,250
✓ Search queries: 15,000
✓ Product views: 8,500
✓ Add to cart: 2,100
✓ Checkouts: 850

Issues & Actions:
- Issue: [description]
  Action: [resolution]
  Status: [open/closed]
```

---

## 🎯 Continuous Improvement

### Monthly Review (1 hour)

```
1. Performance Analysis
   - Identify slow endpoints
   - Analyze database queries
   - Review cache hit rates
   - Check CDN performance

2. User Experience Analysis
   - Review user feedback
   - Analyze user sessions
   - Check bounce rate
   - Identify drop-off points

3. Infrastructure Review
   - Capacity planning
   - Resource optimization
   - Cost analysis
   - Security review

4. Roadmap Planning
   - Features to optimize
   - Technical debt
   - Infrastructure improvements
   - Testing improvements
```

### Optimization Backlog

```
Priority 1 (Critical Performance):
- [ ] Bundle size reduction (target: < 500KB gzipped)
- [ ] Search latency optimization (target: < 100ms avg)
- [ ] Image delivery optimization

Priority 2 (Important UX):
- [ ] Implement virtual scrolling for large tables
- [ ] Add skeleton loading states
- [ ] Implement progressive image loading

Priority 3 (Nice to Have):
- [ ] Dark mode support
- [ ] Offline mode support
- [ ] Advanced analytics dashboard
```

### Success Metrics

```
Current State:
├── Page Load Time: 2.0s (95th) ✓
├── Search Query: 150ms (avg) ✓
├── Error Rate: 0.01% ✓
├── Availability: 99.99% ✓
└── User Satisfaction: 4.5/5 ✓

Target State (3 months):
├── Page Load Time: 1.5s (95th) ← 25% improvement
├── Search Query: 100ms (avg) ← 33% improvement
├── Error Rate: < 0.005% ← 50% improvement
├── Availability: 99.99% ← Maintain
└── User Satisfaction: 4.7/5 ← Increase
```

---

## 📞 On-Call Procedures

### Escalation Path

```
1. Alert Triggered (Auto)
   ↓
2. On-Call Engineer Gets Paged
   - Wait 5 minutes for acknowledgment
   - If no ack, page backup
   ↓
3. Initial Investigation (5 minutes)
   - Check dashboard
   - Check logs
   - Identify issue type
   ↓
4. Mitigation (15 minutes)
   - Apply temporary fix
   - Scale up if needed
   - Route traffic if possible
   ↓
5. Root Cause Analysis (30 minutes)
   - Investigate deeper
   - Identify root cause
   - Plan permanent fix
   ↓
6. Resolution (varies)
   - Deploy fix
   - Monitor for regression
   - Update stakeholders
   ↓
7. Post-Incident Review
   - Document incident
   - Update runbooks
   - Plan improvements
```

### On-Call Checklist

```
When Alerted:
[ ] Acknowledge alert within 5 minutes
[ ] Check dashboard status
[ ] Check error logs
[ ] Check slow query logs
[ ] Identify issue type
[ ] Determine severity (P1/P2/P3)
[ ] Notify stakeholders if P1
[ ] Start incident timeline
[ ] Begin mitigation
[ ] Keep logs of actions
[ ] Test resolution
[ ] Communicate completion

After Resolution:
[ ] Document incident
[ ] Create post-mortem (if P1)
[ ] Update runbooks
[ ] Share lessons learned
[ ] Plan preventive measures
[ ] Update monitoring/alerts
```

---

## 📊 Sample Dashboard Queries

### Grafana Queries (PromQL)

```promql
# Average response time last 5 minutes
rate(http_request_duration_seconds_sum[5m]) /
rate(http_request_duration_seconds_count[5m])

# 95th percentile response time
histogram_quantile(0.95, http_request_duration_seconds)

# Error rate
rate(http_requests_total{status_code=~"5.."}[5m])

# Request rate
rate(http_requests_total[5m])

# CPU usage
process_resident_memory_bytes / 1024 / 1024

# Memory usage
process_virtual_memory_bytes / 1024 / 1024
```

### Datadog Queries

```
# Service monitoring
avg:trace.web.request.duration{service:ecom-frontend}

# Error rate
avg:trace.web.errors{service:ecom-backend}

# Resource monitoring
avg:system.cpu.user{host:prod-*}
avg:system.mem.percent{host:prod-*}

# Custom metrics
avg:custom.search.latency{service:ecom-backend}
```

---

## ✅ Implementation Checklist

- [ ] APM tools configured (Datadog/New Relic/Prometheus)
- [ ] RUM tracking enabled
- [ ] Error tracking setup (Sentry)
- [ ] Analytics configured (Amplitude)
- [ ] Dashboard created
- [ ] Alert rules configured
- [ ] On-call schedule established
- [ ] Runbooks updated
- [ ] Team trained on monitoring
- [ ] Weekly review scheduled
- [ ] Monthly review scheduled

---

## 📞 Support Contacts

**On-Call:** ________________  
**Escalation:** ________________  
**Datadog Admin:** ________________  
**OpenSearch Admin:** ________________  
**MongoDB Admin:** ________________

---

**Document Date:** July 22, 2026  
**Status:** Live Monitoring Ready  
**Next Review:** One Week Post-Deployment
