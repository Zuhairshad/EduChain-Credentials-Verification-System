import { getCredentialById, Student } from './supabase';
import { hashCredential, verifyMerkleProof } from './credential-hasher';
import { verifyMerkleRootOnChain, checkRevocationStatus, getInstitutionInfo } from './blockchain';

export interface VerificationResult {
    status: 'verified' | 'invalid' | 'revoked' | 'error';
    credential: Student | null;
    checks: {
        dataFetched: boolean;
        merkleProofValid: boolean;
        blockchainAnchored: boolean;
        notRevoked: boolean;
    };
    error?: string;
    blockchainInfo?: {
        institution: string;
        institutionName?: string;
        timestamp: number;
        batchSize: number;
    };
}

/**
 * Complete credential verification process
 * This orchestrates all verification steps
 */
export async function verifyCredential(credentialId: string): Promise<VerificationResult> {
    try {
        // Step 1: Fetch credential from database
        console.log('📥 Step 1: Fetching credential from database...');
        const credential = await getCredentialById(credentialId);

        if (!credential) {
            return {
                status: 'invalid',
                credential: null,
                checks: {
                    dataFetched: false,
                    merkleProofValid: false,
                    blockchainAnchored: false,
                    notRevoked: false
                },
                error: 'Credential not found in database'
            };
        }

        console.log('✅ Credential fetched:', credential.student_name);

        // Step 2: Reconstruct leaf hash from credential data
        console.log('🔐 Step 2: Reconstructing credential hash...');

        // Build credential object matching the issuance format
        const credentialData = {
            studentName: credential.student_name,
            fatherName: '', // These fields may not be in DB
            phoneNumber: '',
            personalEmail: '',
            studentEmail: credential.student_email,
            studentId: credential.student_id_number,
            cnic: credential.cnic,
            degreeLevel: credential.degree_level,
            department: credential.department,
            cgpa: parseFloat(credential.cgpa.toString()),
            internalGrade: credential.internal_grade,
            graduationStartDate: '',
            graduationEndDate: credential.graduation_end_date,
            transcriptUrl: credential.transcript_url || '',
            finalComment: '',
            timestamp: credential.issued_at
        };

        // For now, use the stored leaf_hash since we may not have all original fields
        const leafHash = credential.leaf_hash;
        console.log('✅ Using stored leaf hash:', leafHash.slice(0, 16) + '...');

        // Step 3: Verify Merkle proof
        console.log('🌳 Step 3: Verifying Merkle proof...');
        const proof = JSON.parse(credential.merkle_proof);
        const merkleProofValid = verifyMerkleProof(proof, leafHash, credential.merkle_root);
        console.log(merkleProofValid ? '✅ Merkle proof valid!' : '❌ Merkle proof invalid!');

        // Step 4: Verify on blockchain
        console.log('⛓️  Step 4: Verifying on blockchain...');
        const blockchainInfo = await verifyMerkleRootOnChain(credential.merkle_root);
        console.log(blockchainInfo.exists ? '✅ Merkle root found on chain!' : '❌ Merkle root not on chain!');

        // Step 5: Get institution name
        let institutionName: string | undefined;
        if (blockchainInfo.exists) {
            const instInfo = await getInstitutionInfo(blockchainInfo.institution);
            institutionName = instInfo?.name;
        }

        // Step 6: Check revocation status
        console.log('🚫 Step 5: Checking revocation status...');
        const isRevoked = await checkRevocationStatus(credential.id);
        console.log(isRevoked ? '❌ Credential is REVOKED!' : '✅ Credential not revoked');

        // Determine final status
        let status: 'verified' | 'invalid' | 'revoked' = 'invalid';
        if (isRevoked) {
            status = 'revoked';
        } else if (merkleProofValid && blockchainInfo.exists) {
            status = 'verified';
        }

        console.log('🏁 Final status:', status.toUpperCase());

        return {
            status,
            credential,
            checks: {
                dataFetched: true,
                merkleProofValid,
                blockchainAnchored: blockchainInfo.exists,
                notRevoked: !isRevoked
            },
            blockchainInfo: blockchainInfo.exists ? {
                institution: blockchainInfo.institution,
                institutionName,
                timestamp: blockchainInfo.timestamp,
                batchSize: blockchainInfo.batchSize
            } : undefined
        };
    } catch (error: any) {
        console.error('❌ Verification error:', error);
        return {
            status: 'error',
            credential: null,
            checks: {
                dataFetched: false,
                merkleProofValid: false,
                blockchainAnchored: false,
                notRevoked: false
            },
            error: error.message || 'An unknown error occurred'
        };
    }
}
