import { createClient } from '@supabase/supabase-js';

// TypeScript interface for student records
export interface Student {
    id: string;
    name: string;
    lgu_email: string;
    degree: string;
    student_id: string;
    merkle_proof: string;
    merkle_root: string;
    leaf_hash: string;
    transaction_hash: string | null;
    status: 'pending' | 'issued' | 'revoked';
    issued_at: string | null;
    created_at: string;

    // New comprehensive fields
    major?: string;
    gpa?: number;
    graduation_date?: string;
    national_id?: string;
    department?: string;
}

// Supabase client singleton
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Create client for client-side operations (will be null if not configured)
export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Server-side client with service role key (for API routes)
export function getServiceSupabase() {
    const serviceKey = process.env.SUPABASE_SERVICE_KEY!;
    return createClient(supabaseUrl, serviceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

// Database helper functions
export async function insertStudent(student: Omit<Student, 'id' | 'created_at'>) {
    if (!supabase) throw new Error('Supabase is not configured. Please add credentials to .env.local');

    const { data, error } = await supabase
        .from('students')
        .insert([student])
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getStudentByEmail(email: string) {
    if (!supabase) throw new Error('Supabase is not configured. Please add credentials to .env.local');

    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('lgu_email', email)
        .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
}

export async function getAllStudents() {
    if (!supabase) throw new Error('Supabase is not configured. Please add credentials to .env.local');

    const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function updateStudentStatus(
    id: string,
    status: 'pending' | 'issued' | 'revoked'
) {
    if (!supabase) throw new Error('Supabase is not configured. Please add credentials to .env.local');

    const { data, error } = await supabase
        .from('students')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data;
}
