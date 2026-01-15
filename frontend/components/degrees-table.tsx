'use client';

import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ExternalLink, Loader2, Search, AlertCircle, Trash2, Eye } from 'lucide-react';
import { getAllStudents, isSupabaseConfigured, updateStudentStatus, supabase } from '@/lib/supabase';
import type { Student } from '@/lib/supabase';

export function DegreesTable() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [viewStudent, setViewStudent] = useState<Student | null>(null);

    const loadStudents = async () => {
        try {
            setLoading(true);
            const data = await getAllStudents();
            setStudents(data);
        } catch (error) {
            console.error('Failed to load students:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
    }, []);

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lgu_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.degree.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'issued':
                return <Badge className="bg-green-600">Issued</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-600">Pending</Badge>;
            case 'revoked':
                return <Badge variant="destructive">Revoked</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleRevoke = async (id: string) => {
        try {
            if (!supabase) return;

            setDeleting(true);

            const { error } = await supabase
                .from('students')
                .update({ status: 'revoked' })
                .eq('id', id);

            if (error) {
                alert(`Failed to revoke: ${error.message}`);
                console.error('Revoke error:', error);
                return;
            }

            // Refresh the list
            await loadStudents();
            setDeleteId(null);
        } catch (error) {
            console.error('Failed to revoke credential:', error);
            alert('An unexpected error occurred while revoking');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Issued Degrees</CardTitle>
                    <CardDescription>
                        Manage all blockchain-verified credentials
                    </CardDescription>
                    <div className="relative mt-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, ID, or degree..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {!isSupabaseConfigured ? (
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                Supabase is not configured. Please follow <strong>SUPABASE_SETUP.md</strong> to set up your database.
                            </AlertDescription>
                        </Alert>
                    ) : loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {searchTerm ? 'No students found matching your search' : 'No degrees issued yet'}
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Student ID</TableHead>
                                        <TableHead>Degree</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Transaction</TableHead>
                                        <TableHead>Issued Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">{student.name}</TableCell>
                                            <TableCell>{student.lgu_email}</TableCell>
                                            <TableCell className="font-mono text-sm">{student.student_id}</TableCell>
                                            <TableCell>{student.degree}</TableCell>
                                            <TableCell>{getStatusBadge(student.status)}</TableCell>
                                            <TableCell>
                                                {student.transaction_hash ? (
                                                    <a
                                                        href={`https://amoy.polygonscan.com/tx/${student.transaction_hash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-blue-600 hover:underline"
                                                    >
                                                        <span className="text-xs font-mono">
                                                            {student.transaction_hash.slice(0, 8)}...
                                                        </span>
                                                        <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {student.issued_at
                                                    ? new Date(student.issued_at).toLocaleDateString()
                                                    : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setViewStudent(student)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                    {student.status === 'issued' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setDeleteId(student.id)}
                                                            className="text-destructive hover:text-destructive/90"
                                                            title="Revoke this credential"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Revoke Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revoke This Credential?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will mark the credential as <strong>revoked</strong> in the database.
                            The blockchain transaction will remain (immutable), but the credential will show as invalid when verified.
                            This action can help prevent misuse but cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteId && handleRevoke(deleteId)}
                            disabled={deleting}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {deleting ? 'Revoking...' : 'Revoke Credential'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* View Credential Details Dialog */}
            <Dialog open={!!viewStudent} onOpenChange={() => setViewStudent(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Credential Details</DialogTitle>
                        <DialogDescription>
                            Complete information for {viewStudent?.student_name || viewStudent?.name}
                        </DialogDescription>
                    </DialogHeader>

                    {viewStudent && (
                        <div className="space-y-6">
                            {/* Personal Information */}
                            <div>
                                <h3 className="font-semibold mb-3">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Student Name:</span>
                                        <p className="font-medium">{viewStudent.student_name || viewStudent.name}</p>
                                    </div>
                                    {viewStudent.father_name && (
                                        <div>
                                            <span className="text-muted-foreground">Father Name:</span>
                                            <p className="font-medium">{viewStudent.father_name}</p>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-muted-foreground">Student ID:</span>
                                        <p className="font-mono">{viewStudent.student_id_number || viewStudent.student_id}</p>
                                    </div>
                                    {viewStudent.cnic && (
                                        <div>
                                            <span className="text-muted-foreground">CNIC:</span>
                                            <p className="font-mono">{viewStudent.cnic}</p>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-muted-foreground">Student Email:</span>
                                        <p>{viewStudent.student_email || viewStudent.lgu_email}</p>
                                    </div>
                                    {viewStudent.personal_email && (
                                        <div>
                                            <span className="text-muted-foreground">Personal Email:</span>
                                            <p>{viewStudent.personal_email}</p>
                                        </div>
                                    )}
                                    {viewStudent.phone_number && (
                                        <div>
                                            <span className="text-muted-foreground">Phone:</span>
                                            <p>{viewStudent.phone_number}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Academic Information */}
                            <div>
                                <h3 className="font-semibold mb-3">Academic Information</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Degree:</span>
                                        <p className="font-medium">{viewStudent.degree_level || viewStudent.degree}</p>
                                    </div>
                                    {viewStudent.department && (
                                        <div>
                                            <span className="text-muted-foreground">Department:</span>
                                            <p>{viewStudent.department}</p>
                                        </div>
                                    )}
                                    {viewStudent.cgpa && (
                                        <div>
                                            <span className="text-muted-foreground">CGPA:</span>
                                            <p>{viewStudent.cgpa} / 4.0</p>
                                        </div>
                                    )}
                                    {viewStudent.internal_grade && (
                                        <div>
                                            <span className="text-muted-foreground">Grade:</span>
                                            <p>{viewStudent.internal_grade}</p>
                                        </div>
                                    )}
                                    {viewStudent.graduation_start_date && (
                                        <div>
                                            <span className="text-muted-foreground">Start Date:</span>
                                            <p>{new Date(viewStudent.graduation_start_date).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                    {viewStudent.graduation_end_date && (
                                        <div>
                                            <span className="text-muted-foreground">End Date:</span>
                                            <p>{new Date(viewStudent.graduation_end_date).toLocaleDateString()}</p>
                                        </div>
                                    )}
                                    {viewStudent.transcript_url && (
                                        <div className="col-span-2">
                                            <span className="text-muted-foreground">Transcript:</span>
                                            <a
                                                href={viewStudent.transcript_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline flex items-center gap-1"
                                            >
                                                View Transcript <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    )}
                                    {viewStudent.final_comment && (
                                        <div className="col-span-2">
                                            <span className="text-muted-foreground">Comments:</span>
                                            <p className="mt-1">{viewStudent.final_comment}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Blockchain Information */}
                            <div>
                                <h3 className="font-semibold mb-3">Blockchain Information</h3>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-muted-foreground">Status:</span>
                                        <div className="mt-1">{getStatusBadge(viewStudent.status)}</div>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground">Merkle Root:</span>
                                        <p className="font-mono text-xs break-all mt-1">{viewStudent.merkle_root}</p>
                                    </div>
                                    {viewStudent.transaction_hash && (
                                        <div>
                                            <span className="text-muted-foreground">Transaction:</span>
                                            <a
                                                href={`https://amoy.polygonscan.com/tx/${viewStudent.transaction_hash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline font-mono text-xs break-all flex items-center gap-1 mt-1"
                                            >
                                                {viewStudent.transaction_hash} <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    )}
                                    {viewStudent.issued_at && (
                                        <div>
                                            <span className="text-muted-foreground">Issued At:</span>
                                            <p className="mt-1">{new Date(viewStudent.issued_at).toLocaleString()}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
