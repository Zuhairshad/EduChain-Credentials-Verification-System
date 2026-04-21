'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Loader2,
    GraduationCap,
    Share2,
    QrCode,
    Download,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    ShieldCheck,
    Link as LinkIcon,
    Copy,
    Landmark
} from 'lucide-react';
import { StudentHeader } from '@/components/student-header';
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
    const { user } = useAuth();
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
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">Retrieving digital records...</p>
                </div>
            </div>
        );
    }

    if (error || credentials.length === 0) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <StudentHeader title="Digital Vault" subtitle="Your cryptographic academic records" />
                <div className="min-h-[50vh] flex items-center justify-center">
                    <Alert variant="destructive" className="max-w-md bg-destructive/5 border-destructive/20 rounded-2xl">
                        <AlertCircle className="h-5 w-5" />
                        <AlertDescription className="ml-2 font-medium">
                            {error || 'No digital credentials found for your account at this time.'}
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Minimalist Header */}
            <div className="relative overflow-hidden bg-card rounded-2xl border shadow-sm p-6 md:p-8">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-sidebar-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-sidebar-primary/10 flex items-center justify-center text-sidebar-primary ring-1 ring-sidebar-primary/10">
                            <Landmark className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-1">Digital Vault</h1>
                            <p className="text-muted-foreground text-sm max-w-xl">
                                Your academic credentials, anchored to the Polygon blockchain. Immutable and instantly verifiable.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {credentials.length === 1 ? (
                <div className="max-w-5xl mx-auto">
                    <CredentialCard credential={credentials[0]} />
                </div>
            ) : (
                <Tabs defaultValue="0" className="w-full max-w-5xl mx-auto">
                    <div className="flex justify-center mb-8">
                        <TabsList className="bg-muted p-1.5 h-auto rounded-2xl shadow-inner border border-border/50">
                            {credentials.map((cred, index) => (
                                <TabsTrigger 
                                    key={cred.id} 
                                    value={index.toString()} 
                                    className="px-6 py-2.5 rounded-xl text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                                >
                                    <GraduationCap className="h-4 w-4 mr-2" />
                                    {cred.degree_level.split(' ')[0]}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>
                    {credentials.map((credential, index) => (
                        <TabsContent key={credential.id} value={index.toString()} className="mt-0 focus-visible:outline-none">
                            <CredentialCard credential={credential} />
                        </TabsContent>
                    ))}
                </Tabs>
            )}
        </div>
    );
}

function CredentialCard({ credential }: { credential: Credential }) {
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [qrDialogOpen, setQrDialogOpen] = useState(false);

    const verificationUrl = `${process.env.NEXT_PUBLIC_VERIFIER_URL || 'http://localhost:3002'}/verify?id=${credential.id}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(verificationUrl);
        toast.success('Secure link copied to clipboard!');
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
        a.download = `${credential.student_name.replace(/ /g, '_')}_Academic_Proof.json`;
        a.click();
        toast.success('Cryptographic proof downloaded successfully!');
    };

    return (
        <Card className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border bg-card rounded-2xl group">
            {/* Minimal Header Strip */}
            <div className="h-1.5 w-full bg-sidebar-primary/80" />

            <CardHeader className="pb-6 pt-8 px-8 md:px-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] transform group-hover:scale-105 transition-all duration-500 pointer-events-none">
                    <ShieldCheck className="h-40 w-40" />
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="bg-muted p-3 rounded-xl border flex-shrink-0">
                            <GraduationCap className="h-8 w-8 text-sidebar-primary" />
                        </div>
                        <div>
                            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-sidebar-primary mb-1">
                                Verified Credential
                            </CardDescription>
                            <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight mb-1 text-foreground">
                                {credential.degree_level}
                            </CardTitle>
                            <p className="text-base font-medium text-muted-foreground">{credential.department}</p>
                        </div>
                    </div>
                    <Badge
                        variant={credential.status === 'issued' ? 'secondary' : 'destructive'}
                        className="text-xs font-semibold px-4 py-1.5 rounded-full flex items-center gap-1.5 self-start"
                    >
                        {credential.status === 'issued' ? (
                            <><CheckCircle2 className="h-3.5 w-3.5" /> Verified</>
                        ) : 'Revoked'}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="px-8 md:px-10 pb-10 space-y-8 relative z-10">
                {/* Structural Grid */}
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                    
                    {/* Left: Identity Details */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b pb-4">
                            <div className="h-6 w-1.5 bg-sidebar-primary rounded-full"></div>
                            <h3 className="font-bold text-sm uppercase tracking-widest text-foreground">Identity Information</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <InfoField label="Legal Name" value={credential.student_name} highlight />
                            <div className="grid grid-cols-2 gap-4">
                                <InfoField label="Student ID" value={credential.student_id_number} mono />
                                {credential.cnic && <InfoField label="National ID" value={credential.cnic} mono />}
                            </div>
                            {credential.student_email && <InfoField label="LGU Email Address" value={credential.student_email} />}
                        </div>
                    </div>

                    {/* Right: Academic Achievement */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 border-b pb-3">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-foreground">Academic Standing</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-muted/30 rounded-xl p-4 border flex flex-col justify-center">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Final CGPA</p>
                                <p className="text-3xl font-bold text-foreground">{credential.cgpa}</p>
                            </div>
                            <div className="bg-muted/30 rounded-xl p-4 border flex flex-col justify-center">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Letter Grade</p>
                                <p className="text-3xl font-bold text-foreground">{credential.internal_grade}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 bg-card rounded-2xl p-5 border shadow-sm text-sm">
                             <div>
                                <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mb-1">Commencement</p>
                                <p className="font-semibold text-foreground">
                                    {credential.graduation_start_date ? new Date(credential.graduation_start_date).toLocaleDateString(undefined, {year: 'numeric', month: 'short'}) : 'N/A'}
                                </p>
                             </div>
                             <div>
                                <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mb-1">Date of Issue</p>
                                <p className="font-semibold text-foreground">
                                    {new Date(credential.graduation_end_date).toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'})}
                                </p>
                             </div>
                        </div>
                    </div>
                </div>

                <Separator className="my-8 opacity-60" />

                {/* Blockchain Proof Section */}
                <div className="bg-muted lg:bg-background lg:border rounded-3xl p-6 md:p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-background border shadow-sm flex items-center justify-center">
                            <LinkIcon className="h-5 w-5 text-sidebar-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-foreground">Cryptographic Integrity</h3>
                            <p className="text-sm text-muted-foreground">Secured via zero-knowledge proofs and Merkle trees</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 bg-background lg:bg-muted/30 p-5 rounded-2xl border">
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-sidebar-primary uppercase tracking-[0.1em]">Merkle Root Hash</p>
                            <div className="bg-muted border rounded-xl p-3 font-mono text-xs text-foreground break-all select-all shadow-inner">
                                {credential.merkle_root}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-sidebar-primary/80 uppercase tracking-[0.1em]">On-Chain Transaction</p>
                            <div className="bg-muted border rounded-xl p-3 flex items-center justify-between gap-4 overflow-hidden shadow-inner group/tx">
                                <a
                                    href={`https://amoy.polygonscan.com/tx/${credential.transaction_hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-xs text-foreground group-hover/tx:text-sidebar-primary transition-colors truncate flex-1"
                                >
                                    {credential.transaction_hash}
                                </a>
                                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover/tx:text-sidebar-primary" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 pt-4 justify-start">
                    <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="h-12 px-6 rounded-xl font-bold border-2 hover:bg-muted text-sm shadow-sm transition-all">
                                <Share2 className="mr-2 h-4 w-4" />
                                Share Link
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl">Share Verification Link</DialogTitle>
                                <DialogDescription>
                                    Provide this link to employers or institutions to instantly cryptographic verify your degree.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex items-center space-x-2 bg-muted p-2 rounded-xl border mt-4">
                                <div className="grid flex-1 gap-2 overflow-hidden px-2">
                                    <p className="text-xs font-mono truncate text-foreground/80">{verificationUrl}</p>
                                </div>
                                <Button size="sm" variant="default" onClick={handleCopyLink} className="rounded-lg px-4 shadow-sm">
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="h-12 px-6 rounded-xl font-bold border-2 hover:bg-muted text-sm shadow-sm transition-all">
                                <QrCode className="mr-2 h-4 w-4" />
                                Display QR
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xs rounded-3xl border-none shadow-2xl p-8">
                            <DialogHeader>
                                <DialogTitle className="sr-only">Verification QR Code</DialogTitle>
                            </DialogHeader>
                            <div className="flex flex-col items-center justify-center space-y-6">
                                <div className="p-3 bg-muted rounded-2xl">
                                    <QrCode className="h-8 w-8 text-foreground" />
                                </div>
                                <div className="text-center space-y-2">
                                    <h3 className="font-bold text-xl">Verification QR</h3>
                                    <p className="text-sm font-medium text-muted-foreground">Scan with the Verifier App</p>
                                </div>
                                <div className="p-4 bg-white rounded-2xl shadow-sm border">
                                    <QRCodeSVG value={verificationUrl} size={180} level="H" />
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button onClick={handleDownloadProof} variant="default" className="h-12 px-6 rounded-xl font-bold shadow-md hover:shadow-lg transition-all text-sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download Cryptographic Proof
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function InfoField({ label, value, mono, highlight }: { label: string; value: string; mono?: boolean; highlight?: boolean }) {
    return (
        <div className={`p-3.5 rounded-xl border ${highlight ? 'bg-background border-sidebar-primary/10' : 'bg-muted/20 border-transparent'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${highlight ? 'text-sidebar-primary' : 'text-muted-foreground'}`}>{label}</p>
            <p className={`font-semibold text-foreground ${mono ? 'font-mono text-xs' : 'text-sm'}`}>{value}</p>
        </div>
    );
}
