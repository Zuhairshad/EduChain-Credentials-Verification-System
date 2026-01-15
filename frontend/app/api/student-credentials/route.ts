import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { error: 'Email parameter is required' },
                { status: 400 }
            );
        }

        // Get student from database
        const supabase = getServiceSupabase();
        const { data: student, error } = await supabase
            .from('students')
            .select('*')
            .eq('lgu_email', email)
            .single();

        if (error || !student) {
            return NextResponse.json(
                { error: 'Credential not found for this email' },
                { status: 404 }
            );
        }

        // Format response for mobile app
        const response = {
            credential: {
                id: student.student_id,
                studentName: student.name,
                degree: student.degree,
                issueDate: student.issued_at ? new Date(student.issued_at).toISOString().split('T')[0] : '',
                institution: '0xd9a92EddfA8c7541298CC4F9Ae4e53AD726dB81D', // LGU address
            },
            proof: student.merkle_proof || [],
            merkleRoot: student.merkle_root || '',
            leafHash: student.leaf_hash || '',
            transactionHash: student.transaction_hash || '',
            status: student.status,
            verificationUrl: student.transaction_hash
                ? `https://amoy.polygonscan.com/tx/${student.transaction_hash}`
                : null,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching credentials:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
