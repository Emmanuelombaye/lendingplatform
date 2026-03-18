# Vertex Loans Deployment Guide

## Fixed Deployment Issues

### Issues Resolved:
1. ✅ **Render.yaml Configuration** - Fixed environment variable handling and added health checks
2. ✅ **Build Optimization** - Added code splitting to reduce bundle sizes
3. ✅ **Environment Variables** - Created production environment files
4. ✅ **Database Migration** - Added proper Prisma migration commands
5. ✅ **CORS Configuration** - Properly configured allowed origins

---

## Deployment Instructions

### 1. Backend Deployment (Render)

#### Prerequisites:
- MySQL database (Railway/PlanetScale/etc.)
- Render account

#### Steps:
1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Fix deployment configuration"
   git push origin main
   ```

2. **Create Render Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `vertexloans/backend` as root directory
   - Use the settings from `backend/render.yaml`

3. **Set Environment Variables in Render Dashboard**
   ```
   DATABASE_URL=mysql://user:password@host:port/database
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   SERVER_TOKEN_SECRET=your-super-secret-token-key-min-32-chars
   NODE_ENV=production
   PORT=5000
   
   # Optional but recommended:
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   FLW_PUBLIC_KEY=your-flutterwave-public-key
   FLW_SECRET_KEY=your-flutterwave-secret-key
   ```

4. **Deploy**
   - Render will automatically build and deploy
   - Wait for deployment to complete
   - Note your backend URL: `https://vertex-loans-api.onrender.com`

---

### 2. Frontend Deployment (Vercel/Render)

#### Option A: Vercel (Recommended for Frontend)

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Deploy Main Client**
   ```bash
   cd vertexloans
   vercel --prod
   ```

3. **Deploy Admin Portal**
   ```bash
   cd admin-portal
   vercel --prod
   ```

4. **Set Environment Variables in Vercel Dashboard**
   - Go to Project Settings → Environment Variables
   - Add:
     ```
     VITE_API_URL=https://vertex-loans-api.onrender.com/api
     NODE_ENV=production
     ```

#### Option B: Render Static Sites

1. **Create Static Site for Main Client**
   - New + → Static Site
   - Root Directory: `vertexloans`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

2. **Create Static Site for Admin Portal**
   - New + → Static Site
   - Root Directory: `vertexloans/admin-portal`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

---

### 3. Environment Variables Setup

#### Backend (.env in Render Dashboard)
```env
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=minimum-32-character-secret-key-here
SERVER_TOKEN_SECRET=minimum-32-character-secret-key-here
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://getvertexloans.com,https://admin.getvertexloans.com
```

#### Frontend (.env.production)
Already created in:
- `vertexloans/.env.production`
- `vertexloans/admin-portal/.env.production`

Update the Supabase URLs if needed.

---

### 4. Database Setup

1. **Generate Prisma Client**
   ```bash
   cd backend
   npx prisma generate
   ```

2. **Push Schema to Database**
   ```bash
   npx prisma db push
   ```

3. **Seed Database (Optional)**
   ```bash
   npm run seed
   ```

---

### 5. Post-Deployment Verification

#### Test Backend:
```bash
curl https://vertex-loans-api.onrender.com/
# Should return: "Vertex Loans Backend is running"
```

#### Test API Endpoints:
```bash
curl https://vertex-loans-api.onrender.com/api/public/settings
# Should return settings data
```

#### Test Frontend:
- Visit your deployed frontend URL
- Check browser console for errors
- Verify API calls are working

---

### 6. Common Issues & Solutions

#### Issue: "Cannot find module" errors
**Solution:** Ensure all dependencies are in `package.json`, not just `devDependencies`

#### Issue: Database connection fails
**Solution:** 
- Verify DATABASE_URL is correct
- Check if database allows connections from Render IPs
- Ensure database is running

#### Issue: CORS errors
**Solution:**
- Update CORS_ORIGIN in backend environment variables
- Add your frontend domain to allowed origins in `backend/src/app.ts`

#### Issue: Build fails with "out of memory"
**Solution:**
- The build optimization in vite.config.ts should help
- If still failing, increase Render instance size

#### Issue: Environment variables not loading
**Solution:**
- Ensure variables are set in Render/Vercel dashboard
- For Vite, variables must start with `VITE_`
- Restart the service after adding variables

---

### 7. Monitoring & Maintenance

#### Logs:
- **Render:** Dashboard → Service → Logs tab
- **Vercel:** Dashboard → Deployments → View Function Logs

#### Database Backups:
- Set up automated backups in your database provider
- Railway: Automatic backups available
- PlanetScale: Built-in branching and backups

#### Updates:
```bash
# Update dependencies
npm update

# Rebuild and redeploy
git add .
git commit -m "Update dependencies"
git push origin main
```

---

### 8. Security Checklist

- [ ] Change all default secrets (JWT_SECRET, SERVER_TOKEN_SECRET)
- [ ] Use strong database passwords
- [ ] Enable HTTPS only (automatic on Render/Vercel)
- [ ] Set up proper CORS origins
- [ ] Don't commit .env files to git (already in .gitignore)
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting (already configured)
- [ ] Regular security updates

---

### 9. Performance Optimization

The following optimizations have been applied:

1. **Code Splitting** - Vendor chunks separated
2. **Minification** - Terser with console removal
3. **Tree Shaking** - Unused code removed
4. **Compression** - Gzip enabled by default on Render/Vercel
5. **Caching** - Static assets cached with proper headers

---

### 10. Support

For deployment issues:
- Check Render/Vercel status pages
- Review deployment logs
- Contact support@getvertexloans.com

---

## Quick Deploy Commands

```bash
# Backend (from vertexloans/backend)
npm install
npx prisma generate
npm run build
npm start

# Frontend (from vertexloans)
npm install
npm run build

# Admin Portal (from vertexloans/admin-portal)
npm install
npm run build
```

---

## URLs After Deployment

- **Backend API:** https://vertex-loans-api.onrender.com
- **Main Client:** https://getvertexloans.com (or your Vercel URL)
- **Admin Portal:** https://admin.getvertexloans.com (or your Vercel URL)

---

**Last Updated:** March 14, 2026
**Version:** 1.0.0
