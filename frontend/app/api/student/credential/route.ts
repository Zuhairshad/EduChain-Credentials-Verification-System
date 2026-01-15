import { NextResponse } from 'next/server';
import { getStudentByEmail } from '@/lib/supabase';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Validate LGU email
        if (!email.endsWith('@cs.lgu.edu.pk')) {
            return NextResponse.json(
                { error: 'Only LGU student emails are allowed' },
                { status: 403 }
            );
        }

        const student = await getStudentByEmail(email);

        if (!student) {
            return NextResponse.json(
                { error: 'No credential found for this email' },
                { status: 404 }
            );
        }

        return NextResponse.json({ student });
    } catch (error: any) {
        console.error('Get credential error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch credential' },
            { status: 500 }
        );
    }
}
