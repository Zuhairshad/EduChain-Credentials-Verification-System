EduChain Credentials Verification System
EduChain is a blockchain-based platform for issuing, managing, and verifying academic credentials in a secure, tamper-resistant, and privacy-preserving way.
​

It consists of smart contracts, an institutional web portal, a student-facing app, and a verifier app deployed as a full-stack application.
​

Features
On-chain credential issuance using Solidity smart contracts deployed on an EVM-compatible network.
​

Role-based flows for institutions, students, and verifiers (e.g., universities issue, students manage, employers verify).
​

Web portal for institutions to issue and manage credentials, view dashboards, and access quick actions.
​

Student app to view credentials, share proofs, and manage access to their academic records.
​

Verifier app to verify authenticity of credentials directly against the blockchain.
​

Deployed production build accessible at: https://edu-chain-credentials-verification.vercel.app/
​

Tech Stack
Smart contracts: Polygon Amoy Testnet & Hardhat.
​

Frontend / apps: TypeScript (React/Next.js-based frontends across frontend, student-app, verifier-app, and web-portal).
​

Styling: Tailwind CSS & Shadcn UI.
​

Monorepo Structure
contracts/ – Solidity smart contracts for credential issuance and verification.
​

frontend/ – Shared or main frontend application code (TypeScript-based web UI).
​

student-app/ – Student-facing interface to manage and share credentials.
​

verifier-app/ – Verifier-facing interface to check credential authenticity against the chain.
​

web-portal/ – Institutional portal dashboard (includes credential lists, quick actions, and vault UI).
​

Getting Started
Clone the repository:

bash
git clone https://github.com/Zuhairshad/EduChain-Credentials-Verification-System.git
cd EduChain-Credentials-Verification-System
Install dependencies (example for a pnpm/yarn/npm monorepo – adjust to your setup):

bash
# root install (if using a monorepo tool)
npm install
# or
pnpm install
# or
yarn install
Build and run each app (example commands, update to your actual scripts):

bash
# Web portal
cd web-portal
npm install
npm run dev

# Student app
cd ../student-app
npm install
npm run dev

# Verifier app
cd ../verifier-app
npm install
npm run dev

# Frontend (if used as main shell)
cd ../frontend
npm install
npm run dev
Compile and deploy contracts (example):

bash
cd ../contracts
npm install
npm run compile
npm run deploy
Usage Flow
Institutions log into the web portal to issue credentials to students’ blockchain addresses.
​

Students use the student app to view their credentials and selectively share them with verifiers.
​

Verifiers use the verifier app to input credential identifiers or QR data and validate them against the smart contracts.
​

Deployment
The project is deployed to Vercel, with multiple production deployments recorded in the repository’s Deployments section.
​
You can access the live app at: https://edu-chain-credentials-verification.vercel.app/
​

Roadmap / Ideas
Support for multiple institutions and multi-tenant configuration.

Off-chain storage integration for larger documents with on-chain proofs.

Expanded verification methods (e.g., QR codes, short links, API integrations).
