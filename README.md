# EduChain — Academic Credentials Verification System

EduChain is a blockchain-based platform for issuing, managing, and verifying academic credentials in a secure, tamper-resistant, and privacy-preserving manner.  
It replaces fragile, centralized verification processes with transparent, trustless, and verifiable on-chain credentials.

The system is implemented as a full-stack application consisting of smart contracts, an institutional web portal, a student-facing app, and a verifier app—each designed for a specific role in the academic credential lifecycle.

**Live Demo:**  
https://edu-chain-credentials-verification.vercel.app/

---

## Overview

EduChain enables educational institutions to issue credentials directly to the blockchain, allows students to manage and selectively share their academic records, and empowers employers or third parties to verify authenticity without relying on intermediaries.

The platform ensures:
- Credential authenticity
- Tamper resistance
- User-controlled data sharing
- Public verifiability with privacy preservation

---

## Features

- **On-chain Credential Issuance**  
  Academic credentials are issued using Solidity smart contracts deployed on an EVM-compatible blockchain.

- **Role-Based Access & Flows**  
  - **Institutions:** Issue and manage credentials via a dedicated web portal  
  - **Students:** View, manage, and share credentials through a student app  
  - **Verifiers:** Validate credentials directly against the blockchain using a verifier app  

- **Institutional Web Portal**  
  Dashboard for credential issuance, credential lists, quick actions, and institutional vault management.

- **Student Application**  
  Interface for students to view credentials, manage access, and share verifiable proofs.

- **Verifier Application**  
  Simple verification interface to validate credential authenticity against deployed smart contracts.

- **Production Deployment**  
  Fully deployed and accessible via Vercel with multiple production builds.

---

## Tech Stack

### Smart Contracts
- Solidity  
- Hardhat  
- Polygon Amoy Testnet (EVM-compatible)

### Frontend / Applications
- TypeScript  
- React / Next.js  
- Tailwind CSS  
- shadcn/ui  

---

## Monorepo Structure

contracts/ # Solidity smart contracts for credential issuance & verification
frontend/ # Shared or main frontend application
student-app/ # Student-facing credential management app
verifier-app/ # Verifier-facing credential validation app
web-portal/ # Institutional dashboard and management portal


---

## Getting Started

### Clone the Repository
```bash
git clone https://github.com/Zuhairshad/EduChain-Credentials-Verification-System.git
cd EduChain-Credentials-Verification-System
Install Dependencies
(Adjust based on your package manager)

npm install
# or
pnpm install
# or
yarn install
Running the Applications
Web Portal
cd web-portal
npm install
npm run dev
Student App
cd ../student-app
npm install
npm run dev
Verifier App
cd ../verifier-app
npm install
npm run dev
Frontend (if used as main shell)
cd ../frontend
npm install
npm run dev
Smart Contracts
Compile & Deploy
cd contracts
npm install
npm run compile
npm run deploy
Contracts are deployed on the Polygon Amoy Testnet.

Usage Flow
Institutions log into the web portal and issue academic credentials to students’ blockchain addresses.

Students access the student app to view credentials and selectively share them with third parties.

Verifiers use the verifier app to validate credentials using identifiers or shared proof data, verified directly on-chain.

Deployment
The project is deployed on Vercel, with multiple production deployments recorded in the repository’s Deployments section.

Live Application:
https://edu-chain-credentials-verification.vercel.app/

Roadmap / Future Enhancements
Multi-institution and multi-tenant support

Off-chain storage for large documents with on-chain cryptographic proofs

Expanded verification methods (QR codes, short links, APIs)

Improved privacy controls and selective disclosure mechanisms
