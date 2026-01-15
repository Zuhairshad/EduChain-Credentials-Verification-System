# LGU Student Portal - Environment Setup

## Required Environment Variables

Create a `.env.local` file in the `/web-portal` directory with the following:

```bash
# Supabase Configuration (same as issuer portal)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Verifier App URL (for QR codes - optional, defaults to localhost:3002)
NEXT_PUBLIC_VERIFIER_URL=http://localhost:3002
```

## Setup Instructions

1. Copy your Supabase URL and Anon Key from the issuer portal's `.env.local`
2. Create `.env.local` in `/web-portal` directory
3. Paste the values
4. Restart the dev server

## Running the Portal

```bash
cd web-portal
npm run dev
```

The student portal will run on **http://localhost:3000**

Or specify a different port:
```bash
npm run dev -- -p 3001
```

## Student Login

Students log in with:
- Email: Their LGU email (`@cs.lgu.edu.pk`)
- Password: Set in Supabase Auth

Create student accounts in Supabase:
1. Go to **Authentication** → **Users**
2. Click **Add user**
3. Enter student's LGU email
4. Set password
5. Enable "Auto Confirm User"
6. Save

## Features

- 🔐 Secure authentication with Supabase
- 📜 View digital credential card
- 🔗 Generate shareable verification link
- 📱 Display QR code for scanning
- 💾 Download blockchain proof (JSON)
- 🌓 Light/Dark mode toggle
- ⛓️ Direct links to PolygonScan transactions
