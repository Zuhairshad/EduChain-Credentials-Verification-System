'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
    GraduationCap,
    Award,
    Calendar,
    CheckCircle2,
    ArrowRight,
    ExternalLink,
    ShieldCheck,
    Hash,
    Copy,
    TrendingUp,
    BarChart3
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getStudentCredentials } from '@/lib/supabase';
import { EmptyState } from '@/components/empty-state';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

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
    transaction_hash?: string;
    merkle_root?: string;
}

// Seed data for the visual progression chart
const mockProgressionData = [
    { semester: 'Sem 1', cgpa: 3.1 },
    { semester: 'Sem 2', cgpa: 3.3 },
    { semester: 'Sem 3', cgpa: 3.2 },
    { semester: 'Sem 4', cgpa: 3.5 },
    { semester: 'Sem 5', cgpa: 3.6 },
    { semester: 'Sem 6', cgpa: 3.8 },
    { semester: 'Sem 7', cgpa: 3.9 },
    { semester: 'Sem 8', cgpa: 3.95 },
];

export default function DashboardPage() {
    const { user } = useAuth();
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [credLoading, setCredLoading] = useState(true);

    useEffect(() => {
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
        if (user) loadCredentials();
    }, [user]);

    const latestCredential = credentials[0];
    const totalCredentials = credentials.length;
    const verifiedCount = credentials.filter(c => c.status === 'issued').length;

    if (credLoading) return <DashboardSkeleton />;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
            {/* Page header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Student Dashboard</h1>
                    <div className="flex items-center gap-3">
                        <div className="text-muted-foreground font-medium text-sm flex items-center">
                            <UserAvatar name={latestCredential?.student_name || 'Student'} />
                            <span className="ml-2">
                                {latestCredential
                                    ? `${latestCredential.student_name} — ${latestCredential.student_id_number}`
                                    : user?.email}
                            </span>
                        </div>
                    </div>
                </div>
                <Link href="/vault">
                    <Button variant="default" size="default" className="rounded-xl shadow-md hover:shadow-lg transition-all font-medium">
                        View Digital Vault
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </div>

            {credentials.length === 0 ? (
                <EmptyState />
            ) : (
                <>
                    {/* Stat row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            label="Total Credentials"
                            value={totalCredentials}
                            sub={`${verifiedCount} Verified On-Chain`}
                            icon={<ShieldCheck className="h-4 w-4" />}
                            trend="+1 New"
                        />
                        <StatCard
                            label="Latest Degree"
                            value={latestCredential?.degree_level?.split(' ')[0] || '—'}
                            sub={latestCredential?.department}
                            icon={<Award className="h-4 w-4" />}
                        />
                        <StatCard
                            label="Current CGPA"
                            value={latestCredential?.cgpa ?? '—'}
                            sub={`Grade: ${latestCredential?.internal_grade}`}
                            icon={<TrendingUp className="h-4 w-4" />}
                            trend="+0.15"
                        />
                        <StatCard
                            label="Graduation Year"
                            value={latestCredential ? new Date(latestCredential.graduation_end_date).getFullYear() : '—'}
                            sub="Batch Completion"
                            icon={<Calendar className="h-4 w-4" />}
                        />
                    </div>

                    {/* Main content — custom grid */}
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column: Chart & Credentials */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* Academic Progression Chart */}
                            <Card className="rounded-2xl shadow-sm border bg-card">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                                <BarChart3 className="h-5 w-5 text-primary" />
                                                Academic Progression
                                            </CardTitle>
                                            <CardDescription>CGPA trajectory over 8 semesters</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[250px] w-full mt-2">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={mockProgressionData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorCgpa" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                                <XAxis 
                                                    dataKey="semester" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} 
                                                    dy={10} 
                                                />
                                                <YAxis 
                                                    domain={[2.0, 4.0]} 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} 
                                                    dx={-10} 
                                                />
                                                <Tooltip 
                                                    contentStyle={{ 
                                                        borderRadius: '12px', 
                                                        backgroundColor: 'var(--card)',
                                                        border: '1px solid var(--border)', 
                                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                                                    }}
                                                    itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                                                    labelStyle={{ color: 'var(--muted-foreground)', marginBottom: '4px' }}
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="cgpa" 
                                                    stroke="var(--primary)" 
                                                    strokeWidth={3}
                                                    fillOpacity={1}
                                                    fill="url(#colorCgpa)"
                                                    dot={{ r: 4, strokeWidth: 2, fill: 'var(--background)', stroke: 'var(--primary)' }}
                                                    activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--primary)' }}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold tracking-tight text-foreground">
                                        Recent Credentials
                                    </h2>
                                    <Badge variant="secondary" className="rounded-full px-3">
                                        {totalCredentials} Total
                                    </Badge>
                                </div>

                                <div className="space-y-3">
                                    {credentials.map((cred) => (
                                        <Card key={cred.id} className="rounded-2xl shadow-sm border hover:shadow-md hover:border-sidebar-primary/30 transition-all group overflow-hidden">
                                            <CardContent className="p-0">
                                                <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                                                    <div className="flex gap-4">
                                                        {/* Visual Icon */}
                                                        <div className="bg-muted p-3 rounded-xl flex-shrink-0 group-hover:bg-sidebar-primary/10 transition-colors h-12 w-12 flex items-center justify-center">
                                                            <GraduationCap className="h-6 w-6 text-sidebar-primary" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-3 mb-1">
                                                                <h3 className="font-bold text-base truncate text-foreground">{cred.degree_level}</h3>
                                                                <Badge
                                                                    variant={cred.status === 'issued' ? 'default' : 'destructive'}
                                                                    className="text-[10px] uppercase tracking-wider rounded-full px-2 py-0 h-5"
                                                                >
                                                                    {cred.status === 'issued' ? 'Verified' : 'Revoked'}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground truncate">{cred.department}</p>
                                                            
                                                            <div className="flex items-center gap-4 mt-3 text-sm font-medium">
                                                                <div className="flex flex-col">
                                                                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold">CGPA</span>
                                                                    <span>{cred.cgpa}</span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold">Grade</span>
                                                                    <span>{cred.internal_grade}</span>
                                                                </div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold">Graduated</span>
                                                                    <span>{new Date(cred.graduation_end_date).toLocaleDateString('en-US', { month: 'short', 'year': 'numeric' })}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Link href="/vault" className="flex-shrink-0 md:mt-2">
                                                        <Button variant="outline" size="sm" className="rounded-xl w-full md:w-auto hover:bg-sidebar-primary hover:text-sidebar-primary-foreground">
                                                            View Record
                                                        </Button>
                                                    </Link>
                                                </div>

                                                {/* On-chain footer */}
                                                {cred.transaction_hash && (
                                                    <div className="bg-muted/30 px-5 py-3 border-t flex justify-between items-center text-xs">
                                                        <div className="flex items-center gap-2 text-muted-foreground font-mono">
                                                            <Hash className="h-3 w-3" />
                                                            <span className="truncate max-w-[200px]">{cred.transaction_hash}</span>
                                                        </div>
                                                        <a
                                                            href={`https://amoy.polygonscan.com/tx/${cred.transaction_hash}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-sidebar-primary hover:underline font-medium"
                                                        >
                                                            PolygonScan
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Sidebar Panels */}
                        <div className="space-y-6">
                            {/* Verification status card */}
                            <Card className="rounded-2xl shadow-sm border bg-card overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <ShieldCheck className="h-32 w-32" />
                                </div>
                                <CardHeader className="pb-3 relative z-10">
                                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        Network Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-2 text-sm relative z-10">
                                    <div className="p-4 bg-muted/50 rounded-xl border border-muted flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                                                <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
                                            </div>
                                            <span className="font-semibold text-foreground">Polygon Amoy</span>
                                        </div>
                                        <Badge variant="outline" className="rounded-full bg-background">Active</Badge>
                                    </div>

                                    <div className="flex justify-between items-center p-2">
                                        <span className="text-muted-foreground font-medium">Synced Records</span>
                                        <span className="font-bold">
                                            {verifiedCount}/{totalCredentials} Verified
                                        </span>
                                    </div>
                                    
                                    {latestCredential?.merkle_root && (
                                        <div className="pt-4 border-t border-dashed">
                                            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold block mb-2">Latest Merkle Root</span>
                                            <div className="bg-muted p-2 rounded-lg border">
                                                <p className="font-mono text-xs break-all text-muted-foreground select-all">
                                                    {latestCredential.merkle_root}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Detailed Student Profile Map */}
                            <Card className="rounded-2xl shadow-sm border bg-card">
                                <CardHeader className="pb-4 border-b">
                                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                        Academic Profile
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-0 p-0 text-sm">
                                    <div className="divide-y">
                                        <InfoRow label="Legal Name" value={latestCredential?.student_name} />
                                        <InfoRow label="Student ID" value={latestCredential?.student_id_number} mono />
                                        <InfoRow label="Enrolled Dept" value={latestCredential?.department} />
                                        <InfoRow label="University Email" value={user?.email || ''} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

/* ── Helpers ── */

function UserAvatar({ name }: { name: string }) {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return (
        <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
            {initials}
        </div>
    );
}

function StatCard({ label, value, sub, className, icon, trend }: { label: string; value: string | number; sub?: string; className?: string; icon?: React.ReactNode; trend?: string }) {
    return (
        <Card className={cn("rounded-2xl shadow-sm border transition-shadow hover:shadow-md", className)}>
            <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-sidebar-primary">
                        {icon}
                    </div>
                    {trend && (
                        <Badge variant="secondary" className="rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
                            {trend}
                        </Badge>
                    )}
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
                <p className="text-2xl lg:text-3xl font-black tracking-tight leading-none mb-3 text-foreground">{value}</p>
                {sub && (
                    <div className="flex items-center gap-1.5 mt-auto border-t pt-3">
                        <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                        <p className="text-[11px] font-medium text-muted-foreground">{sub}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function InfoRow({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
    if (!value) return null;
    return (
        <div className="flex justify-between gap-4 p-4 hover:bg-muted/50 transition-colors">
            <span className="text-muted-foreground font-medium flex-shrink-0">{label}</span>
            <span className={`font-semibold text-right truncate text-foreground ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                    <Skeleton className="h-8 w-48 rounded-md" />
                    <Skeleton className="h-4 w-64 rounded-md" />
                </div>
                <Skeleton className="h-10 w-40 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="rounded-2xl"><CardContent className="p-5"><Skeleton className="h-8 w-8 mb-4 rounded-lg" /><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-8 w-16" /></CardContent></Card>
                ))}
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="h-[300px] w-full rounded-2xl" />
                    {[...Array(2)].map((_, i) => (
                        <Card key={i} className="rounded-2xl"><CardContent className="p-5"><Skeleton className="h-20 w-full" /></CardContent></Card>
                    ))}
                </div>
                <div className="space-y-6">
                    <Card className="rounded-2xl"><CardContent className="p-5 space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</CardContent></Card>
                </div>
            </div>
        </div>
    );
}
