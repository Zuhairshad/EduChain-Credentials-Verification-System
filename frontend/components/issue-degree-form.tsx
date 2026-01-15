'use client';

import { isSupabaseConfigured } from '@/lib/supabase';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface IssueDegreeFormProps {
    onSuccess?: () => void;
}

export function IssueDegreeForm({ onSuccess }: IssueDegreeFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        lguEmail: '',
        studentId: '',
        degree: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<{
        transactionHash: string;
        merkleRoot: string;
        credentialId: string;
    } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/issue-degree', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to issue degree');
            }

            setSuccessData({
                transactionHash: result.transactionHash,
                merkleRoot: result.merkleRoot,
                credentialId: result.credentialId,
            });

            // Reset form
            setFormData({
                name: '',
                lguEmail: '',
                studentId: '',
                degree: '',
            });

            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Issue New Degree</CardTitle>
                    <CardDescription>
                        Create a blockchain-verified credential for a graduate
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Student Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Muhammad Ali Khan"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="lguEmail">LGU Email</Label>
                            <Input
                                id="lguEmail"
                                type="email"
                                placeholder="e.g., student@lgu.edu.pk"
                                value={formData.lguEmail}
                                onChange={(e) => setFormData({ ...formData, lguEmail: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="studentId">Student ID</Label>
                            <Input
                                id="studentId"
                                placeholder="e.g., LGU-2025-001"
                                value={formData.studentId}
                                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="degree">Degree Title</Label>
                            <Input
                                id="degree"
                                placeholder="e.g., Bachelor of Science in Computer Science"
                                value={formData.degree}
                                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                                required
                            />
                        </div>

                        {!isSupabaseConfigured && (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Please configure Supabase first. See <strong>SUPABASE_SETUP.md</strong> for instructions.
                                </AlertDescription>
                            </Alert>
                        )}

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            disabled={isSubmitting || !isSupabaseConfigured}
                            className="w-full"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Anchoring to Blockchain...
                                </>
                            ) : (
                                'Issue Degree'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Success Modal */}
            <Dialog open={!!successData} onOpenChange={() => setSuccessData(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-5 w-5" />
                            Degree Issued Successfully
                        </DialogTitle>
                        <DialogDescription>
                            The credential has been anchored to Polygon blockchain
                        </DialogDescription>
                    </DialogHeader>

                    {successData && (
                        <div className="space-y-4 pt-4">
                            <div>
                                <p className="text-sm font-semibold mb-1">Credential ID</p>
                                <p className="text-sm font-mono bg-muted p-2 rounded">
                                    {successData.credentialId}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-semibold mb-1">Merkle Root (Batch ID)</p>
                                <p className="text-sm font-mono bg-muted p-2 rounded break-all">
                                    {successData.merkleRoot}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-semibold mb-1">Transaction Hash</p>
                                <a
                                    href={`https://amoy.polygonscan.com/tx/${successData.transactionHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm font-mono bg-muted p-2 rounded hover:bg-muted/80 transition-colors text-blue-600"
                                >
                                    <span className="break-all">{successData.transactionHash}</span>
                                    <ExternalLink className="h-4 w-4 flex-shrink-0" />
                                </a>
                            </div>

                            <Button
                                onClick={() => setSuccessData(null)}
                                className="w-full"
                            >
                                Issue Another Degree
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
