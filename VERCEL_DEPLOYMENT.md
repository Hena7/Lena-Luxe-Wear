# 🚀 Vercel Deployment Guide for Lena Luxe Wear

## 🚨 CRITICAL SECURITY PATCH (Jan 29, 2026)

**Issue**: Critical RCE vulnerability in React Server Components (CVE-2025-55182).
**Fix**: You MUST update `next`, `react`, and `react-dom` to the latest versions.
**Status**: We have run `npm install next@latest react@latest react-dom@latest`. Push these changes to deploy safely.

## Issue You're Experiencing

Your build is failing at the `npx prisma generate` step during deployment. This is typically caused by missing environment variables in Vercel.

## ✅ Step-by-Step Fix

### 1. Configure Environment Variables in Vercel

Go to your Vercel project dashboard and add these environment variables:

**Path**: Project Settings → Environment Variables

Add the following **FOUR** variables (make sure they are set for all environments: Production, Preview, Development):

```env
DATABASE_URL=postgresql://postgres.pjwvdwyodanaepprfptw:8zPd8r8rWmgrgLqu@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.pjwvdwyodanaepprfptw:8zPd8r8rWmgrgLqu@aws-1-eu-central-1.pooler.supabase.com:5432/postgres

JWT_SECRET=lena-garment-store-secret-key-change-me

JWT_EXPIRES_IN=1d
```

⚠️ **IMPORTANT NOTES**:

- The `DATABASE_URL` uses port **6543** (Transaction pooling) with `?pgbouncer=true` parameter
- The `DIRECT_URL` uses port **5432** (Direct connection)
- **NEVER** commit `.env` file to GitHub - it's already in `.gitignore`

### 2. Understanding the Database URLs

**Supabase provides two types of connection strings:**

1. **Transaction Pooling (Port 6543)**:
   - Used for serverless environments like Vercel
   - Handles connection pooling automatically
   - Add `?pgbouncer=true` parameter
2. **Direct Connection (Port 5432)**:
   - Used for migrations and local development
   - Direct database connection without pooling

### 3. Where to Find Your Supabase Connection Strings

If you need to get the correct connection strings from Supabase:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Scroll down to **Connection string**
4. Select **Transaction** mode for `DATABASE_URL` (port 6543)
5. Select **Session** mode for `DIRECT_URL` (port 5432)

### 4. Redeploy After Adding Environment Variables

Once you've added all environment variables in Vercel:

1. Go to the **Deployments** tab in Vercel
2. Click the three dots (···) on your latest failed deployment
3. Select **Redeploy**

OR

1. Make a small commit to your repo (even just a comment change)
2. Push to GitHub
3. Vercel will automatically trigger a new deployment

---

## 🔧 Common Issues & Solutions

### Issue: "Cannot find module ... wasm-base64.js"

**Solution**: This is a Prisma 6 + Vercel compatibility issue.

1. In `schema.prisma`, change `engineType` to `"library"`:
   ```prisma
   generator client {
     provider   = "prisma-client-js"
     engineType = "library"
   }
   ```
2. Delete `node_modules` locally and reinstall to ensure a clean lockfile.

### Issue: "Error: P1001: Can't reach database server"

**Solution**: Check that your DATABASE_URL is correct and that your Supabase database is active.

### Issue: "Unknown database 'postgres'"

**Solution**: Verify the database name in your connection string matches your Supabase database.

### Issue: Build still fails after adding env variables

**Solutions**:

1. Check that all 4 environment variables are added for **all environments** (Production, Preview, Development)
2. Verify there are no extra spaces in the environment variable values
3. Try removing and re-adding the variables
4. Ensure your Supabase database is running and accessible

### Issue: Prisma Client generation fails locally

**Solution**:

```bash
# Regenerate Prisma Client
npx prisma generate

# Test database connection
npx prisma db pull
```

---

## 📋 Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables are added to Vercel
- [ ] DATABASE_URL uses port **6543** with `?pgbouncer=true`
- [ ] DIRECT_URL uses port **5432**
- [ ] JWT_SECRET is set (change the default value for production!)
- [ ] .env file is in .gitignore (NOT committed to GitHub)
- [ ] Supabase database is active and accessible
- [ ] You've run `npx prisma generate` locally to test

---

## 🎯 Expected Build Output (Success)

When deployment succeeds, you should see:

```
✓ Running "vercel build"
✓ Running "install" command: `npm install`
✓ Prisma schema loaded from prisma/schema.prisma
✓ Generated Prisma Client
✓ Running "build" command: `next build`
✓ Compiled successfully
```

---

## 🔐 Security Reminder

**IMPORTANT**: Before going to production:

1. Change your `JWT_SECRET` to a strong, random string
2. **NEVER** share your `.env` file or commit it to GitHub
3. Use different credentials for development and production
4. Regularly rotate your database passwords

---

## 📚 Helpful Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/environment-variables)
- [Prisma with Supabase Guide](https://supabase.com/docs/guides/integrations/prisma)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)

---

**Need more help?** Check the Vercel deployment logs for specific error messages.
