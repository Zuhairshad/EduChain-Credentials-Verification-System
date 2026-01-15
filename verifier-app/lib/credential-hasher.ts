import CryptoJS from 'crypto-js';
import { MerkleTree } from 'merkletreejs';

/**
 * CRITICAL: This MUST match the Student App hashing logic exactly
 * Location in Student App: frontend/lib/credential-hasher.ts
 */

/**
 * Hash credential data to create a leaf hash
 * Uses SHA-256 with deterministic JSON stringification
 */
export function hashCredential(credential: {
    id?: string;
    studentName: string;
    degree?: string;
    issueDate?: string;
    institution?: string;
    [key: string]: any;
}): string {
    // Create deterministic string from credential (sorted keys)
    const credentialString = JSON.stringify(credential, Object.keys(credential).sort());

    // Hash with SHA-256
    const hash = CryptoJS.SHA256(credentialString);

    // Return as hex string with 0x prefix
    return '0x' + hash.toString(CryptoJS.enc.Hex);
}

/**
 * Create Merkle tree from credential hashes
 */
export function createMerkleTree(leafHashes: string[]): MerkleTree {
    // Remove 0x prefix for MerkleTree library
    const leaves = leafHashes.map(hash => Buffer.from(hash.slice(2), 'hex'));

    return new MerkleTree(leaves, CryptoJS.SHA256, {
        sortPairs: true,
        hashLeaves: false // Already hashed
    });
}

/**
 * Generate Merkle proof for a specific leaf
 */
export function generateProof(tree: MerkleTree, leafHash: string): string[] {
    const leaf = Buffer.from(leafHash.slice(2), 'hex');
    const proof = tree.getProof(leaf);

    return proof.map(item => '0x' + item.data.toString('hex'));
}

/**
 * Get Merkle root from tree
 */
export function getMerkleRoot(tree: MerkleTree): string {
    return '0x' + tree.getRoot().toString('hex');
}

/**
 * Verify a Merkle proof
 * This is the CRITICAL function for credential verification
 */
export function verifyMerkleProof(
    proof: string[],
    leafHash: string,
    root: string
): boolean {
    try {
        const leaf = Buffer.from(leafHash.slice(2), 'hex');
        const proofBuffers = proof.map(p => ({
            data: Buffer.from(p.slice(2), 'hex'),
            position: 'left' as const
        }));
        const rootBuffer = Buffer.from(root.slice(2), 'hex');

        const tree = new MerkleTree([], CryptoJS.SHA256, { sortPairs: true });
        return tree.verify(proofBuffers, leaf, rootBuffer);
    } catch (error) {
        console.error('Merkle proof verification failed:', error);
        return false;
    }
}
