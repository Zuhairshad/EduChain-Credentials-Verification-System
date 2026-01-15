import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { insertStudent, getStudentByEmail } from '@/lib/supabase';
import { hashCredential, createMerkleTree, generateProof, getMerkleRoot } from '@/lib/credential-hasher';
import contractABI from '@/lib/contract-abi.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY!;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            studentName,
            fatherName,
            phoneNumber,
            personalEmail,
            studentEmail,
            studentId,
            cnic,
            degreeLevel,
            department,
            cgpa,
            internalGrade,
            graduationStartDate,
            graduationEndDate,
            transcriptUrl,
            finalComment,
        } = body;

        // Validate required fields
        if (!studentName || !fatherName || !phoneNumber || !personalEmail || !studentEmail || !studentId || !cnic) {
            return NextResponse.json(
                { error: 'All personal information fields are required' },
                { status: 400 }
            );
        }

        if (!degreeLevel || !department || cgpa === undefined || !internalGrade || !graduationStartDate || !graduationEndDate) {
            return NextResponse.json(
                { error: 'All academic information fields are required' },
                { status: 400 }
            );
        }

        // Check if student already exists by email
        const existing = await getStudentByEmail(studentEmail);
        if (existing) {
            return NextResponse.json(
                { error: 'A credential for this student email already exists' },
                { status: 400 }
            );
        }

        // Create comprehensive credential object for hashing
        const credential = {
            studentName,
            fatherName,
            phoneNumber,
            personalEmail,
            studentEmail,
            studentId,
            cnic,
            degreeLevel,
            department,
            cgpa: parseFloat(cgpa.toFixed(2)),
            internalGrade,
            graduationStartDate,
            graduationEndDate,
            transcriptUrl: transcriptUrl || '',
            finalComment: finalComment || '',
            timestamp: new Date().toISOString(),
        };

        // Hash the credential
        const leafHash = hashCredential(credential);

        // Create Merkle tree (single leaf for now)
        const tree = createMerkleTree([leafHash]);
        const proof = generateProof(tree, leafHash);
        const merkleRoot = getMerkleRoot(tree);

        // Connect to blockchain and anchor
        const provider = new ethers.JsonRpcProvider(
            `https://rpc-amoy.polygon.technology`
        );
        const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

        // Anchor the Merkle root
        const tx = await contract.anchorCredentialBatch(merkleRoot, 1, {
            gasLimit: 500000,
        });

        const receipt = await tx.wait();

        // Save to database with all new fields
        const studentRecord = await insertStudent({
            // Legacy fields for backward compatibility
            name: studentName,
            lgu_email: studentEmail,
            degree: degreeLevel,
            student_id: studentId,

            // Blockchain fields
            merkle_proof: JSON.stringify(proof),
            merkle_root: merkleRoot,
            leaf_hash: leafHash,
            transaction_hash: receipt.hash,
            status: 'issued',
            issued_at: new Date().toISOString(),

            // New comprehensive fields
            student_name: studentName,
            father_name: fatherName,
            phone_number: phoneNumber,
            personal_email: personalEmail,
            student_email: studentEmail,
            student_id_number: studentId,
            cnic: cnic,
            degree_level: degreeLevel,
            department: department,
            cgpa: parseFloat(cgpa.toFixed(2)),
            internal_grade: internalGrade,
            graduation_start_date: graduationStartDate,
            graduation_end_date: graduationEndDate,
            transcript_url: transcriptUrl || null,
            final_comment: finalComment || null,
        });

        // Auto-create student login account
        // This allows students to immediately access the student portal
        try {
            const { createClient } = await import('@supabase/supabase-js');
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
            const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

            if (supabaseUrl && supabaseServiceKey) {
                const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                });

                // Create auth account with CNIC as password
                const { error: authError } = await supabaseAdmin.auth.admin.createUser({
                    email: studentEmail,
                    password: cnic, // Use CNIC as default password
                    email_confirm: true, // Auto-confirm, skip email verification
                    user_metadata: {
                        student_id: studentId,
                        student_name: studentName,
                    }
                });

                if (authError) {
                    console.warn('Failed to create student auth account:', authError.message);
                    // Continue anyway - credential still issued successfully
                }
            }
        } catch (authCreationError) {
            console.warn('Error creating student account:', authCreationError);
            // Non-critical error - credential was still issued
        }

        return NextResponse.json({
            success: true,
            transactionHash: receipt.hash,
            merkleRoot,
            student: studentRecord,
            studentLoginCreated: true,
            defaultPassword: cnic, // Return this so admin knows what to tell student
        });
    } catch (error: any) {
        console.error('Issue credential error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to issue credential' },
            { status: 500 }
        );
    }
}
