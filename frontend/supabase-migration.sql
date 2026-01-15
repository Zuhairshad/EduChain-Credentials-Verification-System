-- Update students table with new LGU-specific fields
ALTER TABLE students 
-- Remove old fields that don't match new structure
DROP COLUMN IF EXISTS major,
DROP COLUMN IF EXISTS national_id,
DROP COLUMN IF EXISTS graduation_date,

-- Add new personal information fields
ADD COLUMN IF NOT EXISTS student_name TEXT,
ADD COLUMN IF NOT EXISTS father_name TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS personal_email TEXT,
ADD COLUMN IF NOT EXISTS student_email TEXT,
ADD COLUMN IF NOT EXISTS student_id_number TEXT,
ADD COLUMN IF NOT EXISTS cnic TEXT,

-- Add new academic information fields
ADD COLUMN IF NOT EXISTS degree_level TEXT,
ADD COLUMN IF NOT EXISTS cgpa NUMERIC(3,2) CHECK (cgpa >= 0.0 AND cgpa <= 4.0),
ADD COLUMN IF NOT EXISTS internal_grade TEXT,
ADD COLUMN IF NOT EXISTS graduation_start_date DATE,
ADD COLUMN IF NOT EXISTS graduation_end_date DATE,
ADD COLUMN IF NOT EXISTS transcript_url TEXT,
ADD COLUMN IF NOT EXISTS final_comment TEXT;

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id_number);
CREATE INDEX IF NOT EXISTS idx_students_student_email ON students(student_email);
CREATE INDEX IF NOT EXISTS idx_students_cnic ON students(cnic);
CREATE INDEX IF NOT EXISTS idx_students_phone ON students(phone_number);

-- Add comments for clarity
COMMENT ON COLUMN students.student_name IS 'Full name of the student';
COMMENT ON COLUMN students.father_name IS 'Father''s full name';
COMMENT ON COLUMN students.phone_number IS 'Phone number format: 03XXXXXXXXX';
COMMENT ON COLUMN students.personal_email IS 'Personal email (non-LGU)';
COMMENT ON COLUMN students.student_email IS 'LGU email format: fa/sp-YYYY-dept-NNN@cs.lgu.edu.pk';
COMMENT ON COLUMN students.student_id_number IS 'Student ID format: fa/sp-YYYY-dept-NNN';
COMMENT ON COLUMN students.cnic IS 'National CNIC (13 digits)';
COMMENT ON COLUMN students.degree_level IS 'Bachelors or Masters';
COMMENT ON COLUMN students.department IS 'Computer Science, Software Engineering, or IT';
COMMENT ON COLUMN students.cgpa IS 'CGPA on 4.0 scale';
COMMENT ON COLUMN students.internal_grade IS 'Internal grade (A, B+, etc.)';
COMMENT ON COLUMN students.transcript_url IS 'Cloudinary URL for transcript file';
COMMENT ON COLUMN students.final_comment IS 'Optional final comments';
