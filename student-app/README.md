# LGU Student Mobile App

React Native mobile app for students to access their blockchain-verified credentials.

## Features

- 🔐 Login with LGU email + CNIC password
- 📜 View complete credential details
- 📱 Generate QR code for verification
- 🔗 Share verification link
- ⛓️ View blockchain proof
- 🌓 Clean, native iOS/Android design

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

3. **Add Supabase credentials:**
   Edit `.env` and add your Supabase URL and Anon Key (same as web portals)

4. **Run the app:**
   ```bash
   # iOS
   npm run ios

   # Android
   npm run android

   # Web (for testing)
   npm run web
   ```

## Environment Variables

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
EXPO_PUBLIC_VERIFIER_URL=http://localhost:3002
```

## Screens

- **Login** - Email/password authentication
- **Home** - Credential card with all details
- **QR Code** - Full-screen QR for verification
- **Profile** - Settings and sign out

## Tech Stack

- Expo / React Native
- Supabase (Authentication + Database)
- React Navigation
- TypeScript

## Login Credentials

- **Email:** Student's LGU email (`@cs.lgu.edu.pk`)
- **Password:** Student's CNIC

Students are auto-created when credentials are issued from the issuer portal.

## Testing

Use the same student accounts created in the web portal. Any student with an issued credential can login to the mobile app.

## Build for Production

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```
