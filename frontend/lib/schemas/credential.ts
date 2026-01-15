import { z } from 'zod';

export const credentialSchema = z.object({
    // Personal Information
    studentName: z.string()
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name is too long'),

    fatherName: z.string()
        .min(3, 'Father name must be at least 3 characters')
        .max(100, 'Name is too long'),

    phoneNumber: z.string()
        .regex(/^03\d{9}$/, 'Phone must be 11 digits starting with 03 (e.g., 03201234567)'),

    personalEmail: z.string()
        .email('Invalid email address')
        .refine(email => !email.endsWith('@cs.lgu.edu.pk'), 'Use student email for LGU address'),

    studentEmail: z.string()
        .regex(
            /^(fa|sp)-\d{4}-(bscs|bsse|bsit)-\d{3}@cs\.lgu\.edu\.pk$/,
            'Format: fa-YYYY-dept-NNN@cs.lgu.edu.pk (dept: bscs/bsse/bsit)'
        ),

    studentId: z.string()
        .regex(
            /^(fa|sp)-\d{4}-(bscs|bsse|bsit)-\d{3}$/,
            'Format: fa-YYYY-dept-NNN or sp-YYYY-dept-NNN (dept: bscs/bsse/bsit)'
        ),

    cnic: z.string()
        .regex(/^\d{13}$/, 'CNIC must be exactly 13 digits'),

    // Academic Information
    degreeLevel: z.enum(['Bachelors', 'Masters']),

    department: z.enum(['Computer Science', 'Software Engineering', 'IT']),

    cgpa: z.number()
        .min(0.0, 'CGPA must be at least 0.0')
        .max(4.0, 'CGPA cannot exceed 4.0'),

    internalGrade: z.string()
        .min(1, 'Internal grade is required')
        .max(10, 'Grade is too long'),

    graduationStartDate: z.date(),

    graduationEndDate: z.date(),

    transcriptUrl: z.string()
        .url('Invalid transcript URL')
        .optional()
        .or(z.literal('')),

    finalComment: z.string()
        .max(500, 'Comment is too long')
        .optional(),
}).refine(data => data.graduationEndDate > data.graduationStartDate, {
    message: 'End date must be after start date',
    path: ['graduationEndDate'],
});

export type CredentialFormData = z.infer<typeof credentialSchema>;
