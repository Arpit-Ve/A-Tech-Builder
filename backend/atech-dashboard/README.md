# A'tech Builder Dashboard — Setup Guide

## Step 1 — Backend changes

### Install packages
```bash
cd Portfolio/backend
npm install jsonwebtoken bcryptjs
```

### Copy these files
```
backend-additions/models/User.js         → backend/models/User.js          (NEW)
backend-additions/models/Order.js        → backend/models/Order.js         (REPLACE)
backend-additions/routes/auth.js         → backend/routes/auth.js          (NEW)
backend-additions/routes/order.js        → backend/routes/order.js         (REPLACE)
backend-additions/middleware/userAuth.js → backend/middleware/userAuth.js  (NEW)
```

### Edit backend/server.js — add 2 lines
```js
// near top with other requires:
const authRoutes = require('./routes/auth');

// with other app.use routes:
app.use('/api/auth', authRoutes);
```

### Edit backend/.env — add 1 line
```
JWT_SECRET=atech-super-secret-jwt-2026-change-this
```

### Restart backend
```bash
npm run dev
```

---

## Step 2 — React Dashboard

```bash
cd atech-dashboard
npm install
npm start
```

Opens at http://localhost:3000

---

## Pages

| URL | Page |
|-----|------|
| /login | User login + register |
| /admin | Admin login (API key) |
| /dashboard | User dashboard |
| /admin/dashboard | Admin dashboard |

## Admin API Key
Use the value of ADMIN_API_KEY from your .env file.
Example: sb-admin-2026-change-this-to-something-strong
