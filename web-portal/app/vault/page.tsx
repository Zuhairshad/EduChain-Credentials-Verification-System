'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    GraduationCap,
    Share2,
    QrCode,
    Download,
    ExternalLink,
    LogOut,
    Loader2,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/lib/auth-context';
import { getStudentCredentials } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Credential {
    id: string;
    student_name: string;
    father_name?: string;
    phone_number?: string;
    personal_email?: string;
    student_email?: string;
    student_id_number: string;
    cnic?: string;
    degree_level: string;
    department: string;
    cgpa: number;
    internal_grade: string;
    graduation_start_date?: string;
    graduation_end_date: string;
    status: string;
    transaction_hash: string;
    merkle_root: string;
    merkle_proof: string;
    transcript_url?: string;
    final_comment?: string;
}

export default function VaultPage() {
    const { user, logout } = useAuth();
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadCredentials() {
            if (!user?.email) return;

            try {
                const data = await getStudentCredentials(user.email);
                setCredentials(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load credentials');
            } finally {
                setLoading(false);
            }
        }

        loadCredentials();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error || credentials.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error || 'No credentials found for your account'}
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Digital Vault</h1>
                        <p className="text-sm text-muted-foreground">
                            {user?.email} • {credentials.length} credential{credentials.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Button variant="ghost" size="sm" onClick={logout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </div>

            {/* Credentials */}
            <div className="max-w-4xl mx-auto">
                {credentials.length === 1 ? (
                    <CredentialCard credential={credentials[0]} />
                ) : (
                    <Tabs defaultValue="0" className="w-full">
                        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(credentials.length, 4)}, 1fr)` }}>
                            {credentials.map((cred, index) => (
                                <TabsTrigger key={cred.id} value={index.toString()}>
                                    {cred.degree_level.split(' ')[0]} {index === 0 && '(Latest)'}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {credentials.map((credential, index) => (
                            <TabsContent key={credential.id} value={index.toString()}>
                                <CredentialCard credential={credential} />
                            </TabsContent>
                        ))}
                    </Tabs>
                )}

                {/* Pride Message */}
                <div className="text-center text-sm text-muted-foreground mt-6">
                    <p>Your achievements are permanently recorded on the blockchain</p>
                    <p className="mt-1">Polygon Amoy Testnet • Immutable • Verifiable</p>
                </div>
            </div>
        </div>
    );
}

function CredentialCard({ credential }: { credential: Credential }) {
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [qrDialogOpen, setQrDialogOpen] = useState(false);

    const verificationUrl = `${process.env.NEXT_PUBLIC_VERIFIER_URL || 'http://localhost:3002'}/verify?id=${credential.id}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(verificationUrl);
        toast.success('Link copied to clipboard!');
    };

    const handleDownloadProof = () => {
        const proof = {
            credential_id: credential.id,
            student_name: credential.student_name,
            student_id: credential.student_id_number,
            degree: credential.degree_level,
            department: credential.department,
            cgpa: credential.cgpa,
            graduation_date: credential.graduation_end_date,
            merkle_root: credential.merkle_root,
            merkle_proof: JSON.parse(credential.merkle_proof),
            transaction_hash: credential.transaction_hash,
            blockchain_network: 'Polygon Amoy Testnet',
            status: credential.status,
        };

        const blob = new Blob([JSON.stringify(proof, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${credential.student_name.replace(/ /g, '_')}_proof.json`;
        a.click();
        toast.success('Proof downloaded successfully!');
    };

    return (
        <Card className="border-2 hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">
            <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <GraduationCap className="h-8 w-8" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">{credential.degree_level}</CardTitle>
                            <CardDescription className="text-base">
                                {credential.department}
                            </CardDescription>
                        </div>
                    </div>
                    <Badge
                        variant={credential.status === 'issued' ? 'default' : 'destructive'}
                        className="text-sm"
                    >
                        {credential.status === 'issued' ? (
                            <><CheckCircle2 className="h-3 w-3 mr-1" /> Verified</>
                        ) : (
                            'Revoked'
                        )}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Personal Information */}
                <div>
                    <h3 className="font-semibold text-lg mb-3">Personal Information</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Student Name</p>
                            <p className="font-medium">{credential.student_name}</p>
                        </div>
                        {credential.father_name && (
                            <div>
                                <p className="text-sm text-muted-foreground">Father's Name</p>
                                <p className="font-medium">{credential.father_name}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-muted-foreground">Student ID</p>
                            <p className="font-medium font-mono">{credential.student_id_number}</p>
                        </div>
                        {credential.cnic && (
                            <div>
                                <p className="text-sm text-muted-foreground">CNIC</p>
                                <p className="font-medium font-mono">{credential.cnic}</p>
                            </div>
                        )}
                        {credential.phone_number && (
                            <div>
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <p className="font-medium">{credential.phone_number}</p>
                            </div>
                        )}
                        {credential.personal_email && (
                            <div>
                                <p className="text-sm text-muted-foreground">Personal Email</p>
                                <p className="font-medium text-xs">{credential.personal_email}</p>
                            </div>
                        )}
                        {credential.student_email && (
                            <div>
                                <p className="text-sm text-muted-foreground">Student Email</p>
                                <p className="font-medium text-xs">{credential.student_email}</p>
                            </div>
                        )}
                    </div>
                </div>

                <Separator />

                {/* Academic Information */}
                <div>
                    <h3 className="font-semibold text-lg mb-3">Academic Details</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">CGPA</p>
                            <p className="font-medium">{credential.cgpa}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Internal Grade</p>
                            <p className="font-medium">{credential.internal_grade}</p>
                        </div>
                        {credential.graduation_start_date && (
                            <div>
                                <p className="text-sm text-muted-foreground">Start Date</p>
                                <p className="font-medium">{new Date(credential.graduation_start_date).toLocaleDateString()}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-muted-foreground">Graduation Date</p>
                            <p className="font-medium">{new Date(credential.graduation_end_date).toLocaleDateString()}</p>
                        </div>
                    </div>
                    {credential.final_comment && (
                        <div className="mt-4">
                            <p className="text-sm text-muted-foreground">Comments</p>
                            <p className="font-medium italic text-sm mt-1">{credential.final_comment}</p>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Action Buttons */}
                <div className="grid md:grid-cols-3 gap-3">
                    <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                <Share2 className="h-4 w-4 mr-2" />
                                Share Link
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Shareable Verification Link</DialogTitle>
                                <DialogDescription>
                                    Share this link with employers or institutions to verify your credential
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="p-3 bg-muted rounded-lg font-mono text-sm break-all">
                                    {verificationUrl}
                                </div>
                                <Button onClick={handleCopyLink} className="w-full">
                                    Copy Link
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                <QrCode className="h-4 w-4 mr-2" />
                                Show QR Code
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>QR Code</DialogTitle>
                                <DialogDescription>
                                    Scan this code to verify the credential
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-center p-6 bg-white rounded-lg">
                                <QRCodeSVG value={verificationUrl} size={256} level="H" />
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button variant="outline" onClick={handleDownloadProof} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Proof
                    </Button>
                </div>

                <Separator />

                {/* Blockchain Details */}
                <div className="space-y-3">
                    <h3 className="font-semibold">Blockchain Proof</h3>
                    <div className="space-y-2">
                        <div>
                            <p className="text-sm text-muted-foreground">Merkle Root</p>
                            <p className="font-mono text-sm break-all">{credential.merkle_root}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Transaction Hash</p>
                            <a
                                href={`https://amoy.polygonscan.com/tx/${credential.transaction_hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-sm text-primary hover:underline flex items-center gap-1 break-all"
                            >
                                {credential.transaction_hash}
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </a>
                        </div>
                        {credential.transcript_url && (
                            <div>
                                <p className="text-sm text-muted-foreground">Transcript</p>
                                <a
                                    href={credential.transcript_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                    View Transcript
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
