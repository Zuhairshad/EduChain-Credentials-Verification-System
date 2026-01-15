# LGU Issuer Portal - Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: `lgu-credentials` (or your choice)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you (e.g., Singapore, Mumbai)
5. Click "Create new project" (takes ~2 minutes)

## Step 2: Create Students Table

1. In your Supabase project, click "SQL Editor" in the left sidebar
2. Click "New Query"
3. Paste this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  lgu_email TEXT UNIQUE NOT NULL,
  degree TEXT NOT NULL,
  student_id TEXT UNIQUE NOT NULL,
  merkle_proof JSONB,
  merkle_root TEXT,
  leaf_hash TEXT,
  transaction_hash TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'issued', 'revoked')),
  issued_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index on email for fast lookups
CREATE INDEX idx_students_email ON students(lgu_email);
CREATE INDEX idx_students_student_id ON students(student_id);
```

4. Click "Run" (or press F5)
5. You should see "Success. No rows returned"

## Step 3: Get API Credentials

1. Click on the "Settings" icon (gear) in the left sidebar
2. Click "API" in the settings menu
3. Copy these values:

### Project URL
```
https://xxxxxxxxxxxxx.supabase.co
```
Copy the full URL

### Anon (public) Key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
This is a long string starting with `eyJ`

### Service Role Key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
⚠️ **WARNING**: Keep this secret! Never commit to Git!

## Step 4: Configure Environment Variables

1. In your frontend directory, create a file called `.env.local`:

```bash
cd "/Users/shad/FYP PROJECTO MEOW MEOW/frontend"
touch .env.local
```

2. Open `.env.local` and paste:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here

# Admin Wallet (for blockchain anchoring)
ADMIN_PRIVATE_KEY=your-admin-wallet-private-key

# Blockchain Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0f5D830bE2bBC465c802Bd7e97A8a14e609Fea77
NEXT_PUBLIC_POLYGON_AMOY_CHAIN_ID=80002
```

3. Replace:
   - `your-project-url-here` → Your Supabase Project URL
   - `your-anon-key-here` → Your Anon Key
   - `your-service-key-here` → Your Service Role Key
   - `your-admin-wallet-private-key` → Your MetaMask private key for the institution wallet

### Getting Your Admin Private Key

1. Open MetaMask
2. Click on the account you use for LGU (0xd9a92E...726dB81D)
3. Click the three dots → "Account Details"
4. Click "Show private key"
5. Enter your MetaMask password
6. Copy the private key (starts with `0x`)

⚠️ **SECURITY**: Never share this key or commit it to Git!

## Step 5: Test the Connection

1. Make sure your dev server is running:
```bash
npm run dev
```

2. Visit `http://localhost:3000`
3. You should see the LGU Portal with:
   - ✅ Maroon header with gold accents
   - ✅ "Issue New Degree" form
   - ✅ "Issued Degrees" table (empty initially)

## Step 6: Issue Your First Degree

1. Fill in the form:
   - **Student Name**: Test Student
   - **LGU Email**: test@lgu.edu.pk
   - **Student ID**: LGU-2025-TEST-001
   - **Degree Title**: Bachelor of Science in Computer Science

2. Click "Issue Degree"

3. What happens:
   - Form hashes the credential (SHA-256)
   - Creates a Merkle tree
   - Anchors the root to Polygon blockchain
   - Saves to Supabase with proof
   - Shows success modal with transaction hash

4. Click the transaction hash link → Opens PolygonScan

5. The degree should appear in the table below!

## Step 7: Test the Mobile API

Open a new terminal and test the API:

```bash
curl "http://localhost:3000/api/student-credentials?email=test@lgu.edu.pk"
```

You should get JSON response with:
- Credential data
- Merkle proof
- Transaction hash
- Verification URL

## Troubleshooting

### Error: "Failed to fetch"
- Check if dev server is running
- Check browser console for errors
- Verify `.env.local` has correct values

### Error: "relation public.students does not exist"
- You didn't run the SQL to create the table
- Go back to Step 2

### Error: "Invalid API key"
- Wrong Supabase keys in `.env.local`
- Make sure you copied the full keys
- Restart dev server after changing `.env.local`

### Transaction fails
- Check you have MATIC in your admin wallet
- Get free testnet MATIC: https://faucet.polygon.technology/

## Security Checklist

- [ ] `.env.local` is in `.gitignore`
- [ ] Never commit private keys to GitHub
- [ ] Service role key is only in `.env.local`
- [ ] Admin private key is secret

## Next Steps

1. ✅ Portal is ready to use!
2. Issue real degrees for graduates
3. Share mobile API endpoint with mobile app developers: `GET /api/student-credentials?email={email}`
4. (Optional) Add authentication for admin access
5. (Optional) Deploy to Vercel for production

---

**Need help?** Check the console for detailed error messages.
