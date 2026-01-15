import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// EXACT MATCH of Student App interface
export interface Student {
    id: string;
    student_name: string;
    student_id_number: string;
    student_email: string;
    cnic: string;
    degree_level: string;
    department: string;
    cgpa: number;
    internal_grade: string;
    graduation_end_date: string;
    status: string;
    transaction_hash: string;
    merkle_root: string;
    merkle_proof: string;
    leaf_hash: string;
    transcript_url?: string;
    issued_at: string;
}

export async function getCredentialById(id: string): Promise<Student | null> {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}
