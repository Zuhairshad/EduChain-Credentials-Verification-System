# Auto-Creation of Student Accounts - Setup Guide

## What Changed

When you issue a credential in the issuer portal, the system now **automatically creates a student login account** for the student portal!

## How It Works

### 1. You Issue a Credential
Fill out the credential form with student information including:
- Student Email: `fa-2022-bscs-001@cs.lgu.edu.pk`
- CNIC: `1234567890123`
- Other details...

### 2. System Auto-Creates Login
Behind the scenes, the API:
- ✅ Saves credential to database
- ✅ Anchors to blockchain
- ✅ **Creates Supabase Auth account**
  - Email: `fa-2022-bscs-001@cs.lgu.edu.pk`
  - Password: `1234567890123` (their CNIC)

### 3. Student Can Login Immediately
Tell the student:
- **Portal**: http://localhost:3001 (or your deployed URL)
- **Email**: Their LGU email
- **Password**: Their CNIC (13 digits)

---

## Required Environment Variable

Add to `/frontend/.env.local`:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Where to Find It:
1. Go to Supabase Dashboard
2. Settings → API
3. Copy the **service_role** key (NOT the anon key)
4. Paste in `.env.local`

⚠️ **IMPORTANT**: The service role key is SECRET - never commit it to git!

---

## For Students

**Default Login Credentials:**
- Email: Your LGU email (`@cs.lgu.edu.pk`)
- Password: Your CNIC (13 digits, no dashes)

Example:
- Email: `fa-2022-bscs-001@cs.lgu.edu.pk`
- Password: `1234567890123`

Students can change their password after first login if desired.

---

## No Manual Work Required!

❌ **Before**: Manually create 5000 student accounts
✅ **Now**: Automatic! Just issue credentials, students can login

Perfect for scale! 🚀
