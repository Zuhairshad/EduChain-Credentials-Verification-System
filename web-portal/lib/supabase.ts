import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export const isSupabaseConfigured = !!supabase;

// Get student credential by email (single - for backward compatibility)
export async function getStudentCredential(email: string) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('student_email', email)
        .single();

    if (error) throw error;
    return data;
}

// Get all credentials for a student
export async function getStudentCredentials(email: string) {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('student_email', email)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}
