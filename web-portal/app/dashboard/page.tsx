'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    GraduationCap,
    Award,
    Calendar,
    CheckCircle2,
    ArrowRight,
    Download,
    Share2,
    LogOut,
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/lib/auth-context';
import { getStudentCredentials } from '@/lib/supabase';
import { CredentialStatCard } from '@/components/credential-stat-card';
import { CredentialPreviewCard } from '@/components/credential-preview-card';
import { EmptyState } from '@/components/empty-state';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Credential {
    id: string;
    student_name: string;
    student_id_number: string;
    degree_level: string;
    department: string;
    cgpa: number;
    internal_grade: string;
    graduation_end_date: string;
    status: string;
}

export default function DashboardPage() {
    const { user, logout, loading } = useAuth();
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [credLoading, setCredLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!loading && !user) {
            router.push('/login');
            return;
        }

        async function loadCredentials() {
            if (!user?.email) return;

            try {
                const data = await getStudentCredentials(user.email);
                setCredentials(data);
            } catch (error) {
                console.error('Failed to load credentials:', error);
            } finally {
                setCredLoading(false);
            }
        }

        if (user) {
            loadCredentials();
        }
    }, [user, loading, router]);

    const latestCredential = credentials[0];
    const totalCredentials = credentials.length;
    const verifiedCount = credentials.filter(c => c.status === 'issued').length;

    if (loading || credLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-lg">
                        <GraduationCap className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Welcome Back!</h1>
                        <p className="text-muted-foreground">{user?.email}</p>
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

            <div className="max-w-7xl mx-auto space-y-8">
                {credentials.length === 0 ? (
                    <EmptyState />
                ) : (
                    <>
                        {/* Stats Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <CredentialStatCard
                                title="Total Credentials"
                                value={totalCredentials}
                                icon={GraduationCap}
                                description={`${verifiedCount} verified`}
                            />
                            <CredentialStatCard
                                title="Latest Degree"
                                value={latestCredential?.degree_level.split(' ')[0] || 'N/A'}
                                icon={Award}
                                description={latestCredential?.department}
                            />
                            <CredentialStatCard
                                title="CGPA"
                                value={latestCredential?.cgpa || 'N/A'}
                                icon={CheckCircle2}
                                description={latestCredential?.internal_grade}
                            />
                            <CredentialStatCard
                                title="Graduation"
                                value={
                                    latestCredential
                                        ? new Date(latestCredential.graduation_end_date).getFullYear()
                                        : 'N/A'
                                }
                                icon={Calendar}
                                description="Year"
                            />
                        </div>

                        {/* Credentials and Quick Actions - Side by Side */}
                        <div className="grid lg:grid-cols-4 gap-6">
                            {/* Quick Actions - Left Column (1 column) */}
                            <div className="lg:col-span-1">
                                <Card className="p-6 bg-primary/5 border-primary/20 h-full">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="bg-primary/10 p-2 rounded-lg">
                                            <Share2 className="h-5 w-5 text-primary" />
                                        </div>
                                        <h3 className="font-semibold text-lg">Quick Actions</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <Link href="/vault">
                                            <Button variant="default" className="w-full">
                                                <GraduationCap className="h-4 w-4 mr-2" />
                                                View All
                                            </Button>
                                        </Link>
                                        <Link href="/vault">
                                            <Button variant="default" className="w-full">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download
                                            </Button>
                                        </Link>
                                        <Link href="/vault">
                                            <Button variant="default" className="w-full">
                                                <Share2 className="h-4 w-4 mr-2" />
                                                Share
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>
                            </div>

                            {/* Recent Credentials - Right Column (3 columns) */}
                            <div className="lg:col-span-3">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold">Your Credentials</h2>
                                    <p className="text-muted-foreground">
                                        Blockchain-verified academic achievements
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {credentials.slice(0, 3).map((credential) => (
                                        <CredentialPreviewCard key={credential.id} {...credential} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="text-center text-sm text-muted-foreground">
                            <p>Your achievements are permanently recorded on the blockchain</p>
                            <p className="mt-1">Polygon Amoy Testnet • Immutable • Verifiable</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-14 w-14 rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>
                    <Skeleton className="h-10 w-24" />
                </div>

                {/* Stats Skeleton */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="p-6">
                            <Skeleton className="h-4 w-24 mb-4" />
                            <Skeleton className="h-8 w-16" />
                        </Card>
                    ))}
                </div>

                {/* Credentials Skeleton */}
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i} className="p-6">
                                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                                <Skeleton className="h-6 w-32 mb-2" />
                                <Skeleton className="h-4 w-full mb-4" />
                                <Skeleton className="h-10 w-full" />
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
