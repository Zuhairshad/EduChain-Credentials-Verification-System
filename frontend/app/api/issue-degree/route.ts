import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { hashCredential, createMerkleTree, generateProof, getMerkleRoot } from '@/lib/credential-hasher';
import { ethers } from 'ethers';
import contractABI from '@/lib/contract-abi.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const RPC_URL = 'https://rpc-amoy.polygon.technology/';
const INSTITUTION_ADDRESS = '0xd9a92EddfA8c7541298CC4F9Ae4e53AD726dB81D'; // LGU institution address

export async function POST(request: NextRequest) {
    try {
        const { name, lguEmail, studentId, degree } = await request.json();

        // Validate input
        if (!name || !lguEmail || !studentId || !degree) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Check if student already exists
        const supabase = getServiceSupabase();
        const { data: existing } = await supabase
            .from('students')
            .select('*')
            .eq('lgu_email', lguEmail)
            .single();

        if (existing) {
            return NextResponse.json(
                { error: 'Student with this email already exists' },
                { status: 409 }
            );
        }

        // Create credential object
        const credential = {
            id: studentId,
            studentName: name,
            degree: degree,
            issueDate: new Date().toISOString().split('T')[0],
            institution: INSTITUTION_ADDRESS,
        };

        // Hash the credential
        const leafHash = hashCredential(credential);

        // For single credential, create a Merkle tree with just this leaf
        // In production, you might batch multiple credentials
        const tree = createMerkleTree([leafHash]);
        const merkleRoot = getMerkleRoot(tree);
        const proof = generateProof(tree, leafHash);

        // Anchor to blockchain
        const provider = new ethers.JsonRpcProvider(RPC_URL);

        // Get the private key from environment (admin wallet)
        const privateKey = process.env.ADMIN_PRIVATE_KEY;
        if (!privateKey) {
            throw new Error('Admin private key not configured');
        }

        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

        // Anchor the Merkle root
        const tx = await contract.anchorCredentialBatch(merkleRoot, 1, {
            gasLimit: 500000,
        });

        await tx.wait();

        // Save to database
        const { data: student, error: dbError } = await supabase
            .from('students')
            .insert([
                {
                    name,
                    lgu_email: lguEmail,
                    student_id: studentId,
                    degree,
                    merkle_proof: proof,
                    merkle_root: merkleRoot,
                    leaf_hash: leafHash,
                    transaction_hash: tx.hash,
                    status: 'issued',
                    issued_at: new Date().toISOString(),
                },
            ])
            .select()
            .single();

        if (dbError) {
            console.error('Database error:', dbError);
            throw new Error('Failed to save to database');
        }

        return NextResponse.json({
            success: true,
            credentialId: student.id,
            transactionHash: tx.hash,
            merkleRoot: merkleRoot,
            leafHash: leafHash,
        });
    } catch (error) {
        console.error('Error issuing degree:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to issue degree' },
            { status: 500 }
        );
    }
}
