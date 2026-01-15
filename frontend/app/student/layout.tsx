import { StudentAuthProvider } from '@/lib/student-auth-context';

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <StudentAuthProvider>
            {children}
        </StudentAuthProvider>
    );
}
