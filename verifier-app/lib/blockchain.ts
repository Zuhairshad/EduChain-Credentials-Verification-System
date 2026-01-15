import { ethers } from 'ethers';
import contractABI from './contract-abi.json';

const CONTRACT_ADDRESS = process.env.EXPO_PUBLIC_CONTRACT_ADDRESS || '';
const RPC_URL = process.env.EXPO_PUBLIC_POLYGON_RPC || 'https://rpc-amoy.polygon.technology';

/**
 * Get blockchain provider for Polygon Amoy testnet
 */
export function getProvider(): ethers.JsonRpcProvider {
    return new ethers.JsonRpcProvider(RPC_URL);
}

/**
 * Get smart contract instance
 */
export function getContract(provider: ethers.JsonRpcProvider): ethers.Contract {
    return new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
}

/**
 * Verify if a Merkle root exists on the blockchain
 * Returns institution info if exists
 */
export async function verifyMerkleRootOnChain(merkleRoot: string): Promise<{
    exists: boolean;
    institution: string;
    batchSize: number;
    timestamp: number;
}> {
    try {
        const provider = getProvider();
        const contract = getContract(provider);

        // Query the smart contract
        const [institution, batchSize, timestamp] = await contract.getMerkleRootInfo(merkleRoot);

        return {
            exists: true,
            institution,
            batchSize: Number(batchSize),
            timestamp: Number(timestamp)
        };
    } catch (error) {
        // Merkle root doesn't exist on chain
        console.log('Merkle root not found on blockchain:', error);
        return {
            exists: false,
            institution: '',
            batchSize: 0,
            timestamp: 0
        };
    }
}

/**
 * Check if a credential has been revoked
 * @param credentialId - The credential UUID
 */
export async function checkRevocationStatus(credentialId: string): Promise<boolean> {
    try {
        const provider = getProvider();
        const contract = getContract(provider);

        // Hash the credential ID to get the on-chain identifier
        const credentialHash = ethers.keccak256(ethers.toUtf8Bytes(credentialId));

        // Check revocation status
        const isRevoked = await contract.isRevoked(credentialHash);
        return isRevoked;
    } catch (error) {
        console.error('Error checking revocation status:', error);
        // If we can't check, assume not revoked (fail open for network issues)
        return false;
    }
}

/**
 * Get institution information from blockchain
 */
export async function getInstitutionInfo(institutionAddress: string): Promise<{
    name: string;
    active: boolean;
    registeredDate: number;
    totalCredentials: number;
} | null> {
    try {
        const provider = getProvider();
        const contract = getContract(provider);

        const [name, active, registeredDate, totalCredentials] =
            await contract.getInstitutionInfo(institutionAddress);

        return {
            name,
            active,
            registeredDate: Number(registeredDate),
            totalCredentials: Number(totalCredentials)
        };
    } catch (error) {
        console.error('Error fetching institution info:', error);
        return null;
    }
}
