# EduChain-VC Smart Contracts

Solidity smart contracts for the EduChain-VC decentralized academic verification system on Polygon Amoy Testnet.

## Overview

The `CredentialRegistry` contract is the core of EduChain-VC's blockchain layer. It enables:

- ✅ **Batch Credential Anchoring**: Institutions anchor Merkle roots of credential batches to save gas
- ✅ **Decentralized Verification**: Anyone can verify credentials against on-chain Merkle roots
- ✅ **Revocation Management**: Institutions can revoke credentials with reasons
- ✅ **Institution Whitelisting**: Only authorized institutions can anchor credentials
- ✅ **Upgradeable Design**: UUPS proxy pattern for future improvements

## Architecture

```
CredentialRegistry (UUPS Proxy)
├── Institution Management (Access Control)
├─ Batch Anchoring (Merkle Trees)
├── Credential Revocation
└── Query Functions
```

## Contracts

- **`CredentialRegistry.sol`**: Main registry contract
- **`interfaces/ICredentialRegistry.sol`**: Standard interface

## Installation

```bash
npm install
```

## Compilation

```bash
npm run compile
```

## Testing

```bash
npm test
```

## Deployment

### Local Testing

```bash
npm run deploy:local
```

### Polygon Amoy Testnet

1. Create `.env` file:
```bash
cp .env.example .env
```

2. Fill in your credentials:
```
POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
PRIVATE_KEY=your_deployer_private_key
ADMIN_ADDRESS=your_admin_address
```

3. Get test MATIC from [Polygon Faucet](https://faucet.polygon.technology/)

4. Deploy:
```bash
npm run deploy:amoy
```

5. Verify on PolygonScan:
```bash
npx hardhat verify --network polygonAmoy <CONTRACT_ADDRESS>
```

## Contract Functions

### Admin Functions

- `addInstitution(address institution, string name)`: Add authorized institution
- `removeInstitution(address institution)`: Remove institution

### Institution Functions

- `anchorCredentialBatch(bytes32 merkleRoot, uint256 batchSize)`: Anchor credential batch
- `revokeCredential(bytes32 credentialId, string reason)`: Revoke a credential

### Query Functions (Public)

- `isRevoked(bytes32 credentialId)`: Check if credential is revoked
- `getMerkleRootInfo(bytes32 merkleRoot)`: Get batch anchor information
- `isInstitution(address institution)`: Check if address is authorized
- `getInstitutionInfo(address institution)`: Get institution details
- `batchCheckRevocation(bytes32[] credentialIds)`: Check multiple revocations

## Gas Optimization

- Merkle tree batching reduces gas costs by ~99% vs individual anchoring
- Bitmap-based revocation for efficient storage
- OpenZeppelin's optimized libraries

## Security Features

- Role-based access control (RBAC)
- Reentrancy guards
- Input validation
- Event logging for transparency
- Upgradeable with admin-only authorization

## Network Information

- **Chain**: Polygon Amoy Testnet
- **Chain ID**: 80002
- **RPC**: https://rpc-amoy.polygon.technology/
- **Explorer**: https://amoy.polygonscan.com/
- **Faucet**: https://faucet.polygon.technology/

## Events

```solidity
CredentialBatchAnchored(bytes32 merkleRoot, address institution, uint256 batchSize, uint256 timestamp)
CredentialRevoked(bytes32 credentialId, address institution, string reason, uint256 timestamp)
InstitutionAdded(address institution, string name, uint256 timestamp)
InstitutionRemoved(address institution, uint256 timestamp)
```

## License

MIT License - Built for educational purposes as part of EduChain-VC project.
