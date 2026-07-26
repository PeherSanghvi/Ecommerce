# MongoDB Atlas Setup & Connection Guide

## 🎯 Your MongoDB Atlas URI

```
mongodb+srv://muazshaikh7861_db_user:o9rpwtF2FOqm2TSJ@ecommerce.gqqsrqa.mongodb.net/?appName=ecommerce
```

This is already configured in `backend-node/.env`

---

## ⚠️ CRITICAL STEP: Whitelist Your IP

**This is the MOST COMMON reason for connection failures**

### Your IP Address
```
192.168.29.120
```

### How to Whitelist:

1. **Open MongoDB Atlas**
   - Go to https://cloud.mongodb.com/
   - Log in with your account

2. **Select Your Project**
   - Click on your project that has the `ecommerce` cluster

3. **Go to Network Access**
   - Left sidebar → Click "Network Access"

4. **Add Your IP**
   - Click "Add IP Address" button (top right)
   - Click "Add Current IP Address" 
   - MongoDB will auto-detect your IP: `192.168.29.120`
   - Click "Confirm"

5. **Wait 2-3 Minutes**
   - Atlas needs time to update firewall rules
   - You'll see a green checkmark when ready

---

## 🧪 Test Your Connection

Once your IP is whitelisted:

```bash
cd backend-node
npm run seed:users
```

**Expected output:**
```
🔌 Connecting to MongoDB...
   URI: mongodb+srv://muazshaikh7861_db_user:***@ecommerce.gqqsrqa.mongodb.net/?appName=ecommerce
✓ Connected to MongoDB
✓ Inserting Users...
✓ Inserted 8 Users
✓ Database Seed Complete
```

If you see this, you're connected! ✅

---

## 📋 Files Changed for Atlas

### 1. `.env` (Your connection string is here)
```env
MONGODB_URI=mongodb+srv://muazshaikh7861_db_user:o9rpwtF2FOqm2TSJ@ecommerce.gqqsrqa.mongodb.net/?appName=ecommerce
PORT=8082
OPENSEARCH_NODE=http://localhost:9200
```

### 2. `src/config/database.js`
- ✅ Removed hardcoded localhost fallback
- ✅ Added Atlas-optimized timeouts
- ✅ Added connection retry logic
- ✅ Added helpful error messages

### 3. `src/scripts/startWorker.js`
- ✅ Now validates MONGODB_URI is set

### 4. `src/workers/changeStreamWorker.js`
- ✅ Removed hardcoded `mongodb://localhost:27017` fallback
- ✅ Now uses environment variable only

---

## 🚀 Quick Start Commands

After IP is whitelisted and seeding works:

```bash
# Start the server
npm start

# In another terminal - start the change stream worker (optional)
npm run worker

# Test the server
curl http://localhost:8082/health
```

---

## ❌ If You Get This Error

```
✗ MongoDB connection error: querySrv ECONNREFUSED _mongodb._tcp.ecommerce.gqqsrqa.mongodb.net
```

**This means:** Your IP is not whitelisted in Atlas

**Solution:**
1. Go to MongoDB Atlas → Network Access
2. Add `192.168.29.120` to the whitelist
3. Wait 2-3 minutes
4. Try again

---

## 🔑 Your Credentials

- **Username:** `muazshaikh7861_db_user`
- **Password:** `o9rpwtF2FOqm2TSJ`
- **Cluster:** `ecommerce.gqqsrqa.mongodb.net`
- **Database:** `ecommerce`

These are embedded in your `.env` file.

---

## ✅ All Systems Ready

Your backend is now fully configured for MongoDB Atlas:

- ✅ Connection string set in `.env`
- ✅ All files coordinated with Atlas URI
- ✅ No localhost dependencies remain
- ✅ Ready to connect

**Next Step:** Whitelist your IP → Test connection → Start server
