# Verifier App

Mobile application for verifying student academic credentials using blockchain technology.

## Features

- 📷 QR Code scanning for instant verification
- 🔐 Cryptographic proof validation (SHA-256 + Merkle trees)
- ⛓️ Blockchain verification on Polygon Amoy
- 📝 Verification history
- ✅ Real-time revocation checking

## Tech Stack

- **Framework**: Expo SDK 54
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Blockchain**: Polygon Amoy Testnet
- **Cryptography**: SHA-256, Merkle Trees (MerkleTreeJS)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   EXPO_PUBLIC_CONTRACT_ADDRESS=0x0f5D830bE2bBC465c802Bd7e97A8a14e609Fea77
   EXPO_PUBLIC_POLYGON_RPC=https://rpc-amoy.polygon.technology
   EXPO_PUBLIC_POLYGON_CHAIN_ID=80002
   ```

3. **Run the app**:
   ```bash
   npm start
   ```

   Then scan the QR code with Expo Go app on your phone, or run:
   - `npm run ios` for iOS simulator
   - `npm run android` for Android emulator

## Usage

1. **Scan QR Code**: Open the app and point camera at student's credential QR code
2. **Manual Entry**: Alternatively, tap "Enter URL Manually" to paste verification link
3. **View Results**: See verification status and credential details
4. **History**: Access past verifications from History tab

## Verification Process

The app performs the following checks:

1. ✓ **Data Fetch**: Retrieves credential from Supabase database
2. ✓ **Merkle Proof**: Verifies cryptographic proof matches the data
3. ✓ **Blockchain Anchor**: Confirms Merkle root exists on Polygon chain
4. ✓ **Revocation Check**: Ensures credential hasn't been revoked

## Security

- Read-only database access (Supabase RLS)
- Local cryptographic verification
- No sensitive data storage
- Blockchain as source of truth

## Compatibility

This app is 100% compatible with credentials issued by:
- LGU Issuer Portal (frontend)
- Student Mobile App (student-app)

All use identical cryptographic algorithms (SHA-256 + Merkle Trees).

## Support

For issues or questions, contact: support@lgu.edu.pk
