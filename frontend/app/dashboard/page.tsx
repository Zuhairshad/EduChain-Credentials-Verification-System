'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    AlertCircle,
    Loader2,
    TrendingUp,
    TrendingDown,
    Clock,
    Target,
    Award,
    BarChart3,
} from 'lucide-react';
import { getAllStudents, isSupabaseConfigured } from '@/lib/supabase';
import type { Student } from '@/lib/supabase';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            if (!isSupabaseConfigured) {
                setLoading(false);
                return;
            }

            try {
                const data = await getAllStudents();
                setStudents(data.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                ));
            } catch (error) {
                console.error('Failed to load data:', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    if (!isSupabaseConfigured) {
        return (
            <div className="p-8">
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Please configure Supabase. See <strong>SUPABASE_SETUP.md</strong>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    // Calculate stats
    const stats = {
        total: students.length,
        issued: students.filter(s => s.status === 'issued').length,
        revoked: students.filter(s => s.status === 'revoked').length,
    };

    const todayCount = students.filter(s => {
        const today = new Date();
        const created = new Date(s.created_at);
        return created.toDateString() === today.toDateString();
    }).length;

    const last7Days = students.filter(s => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(s.created_at) >= weekAgo;
    }).length;

    // Chart data - last 30 days
    const chartData: { date: string; total: number }[] = [];
    let cumulative = 0;
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const dayCount = students.filter(s => {
            const created = new Date(s.created_at);
            return created.toDateString() === date.toDateString();
        }).length;

        cumulative += dayCount;
        chartData.push({
            date: dateStr,
            total: cumulative,
        });
    }

    const avgPerDay = stats.total > 0 ? (stats.total / 30).toFixed(1) : '0';
    const successRate = stats.total > 0 ? ((stats.issued / stats.total) * 100).toFixed(1) : '0';

    return (
        <div className="p-8 space-y-6">
            {/* Top Section - Chart + Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Main Chart */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Total Credentials</CardTitle>
                                <CardDescription>Cumulative issuance over 30 days</CardDescription>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold">{stats.total}</div>
                                <p className="text-xs text-muted-foreground">
                                    +{todayCount} today
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                                />
                                <YAxis
                                    tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--background)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '6px',
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke="var(--primary)"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Top Stats */}
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Active Credentials
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.issued}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Success Rate: {successRate}%
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Revoked Total
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.revoked}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Invalidated credentials
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs">Avg Per Day</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgPerDay}</div>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                            <TrendingUp className="h-3 w-3" />
                            <span>30d avg</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs">Last 7 Days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{last7Days}</div>
                        <div className="text-xs text-muted-foreground">This week</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs">Success Rate</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{successRate}%</div>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                            <TrendingUp className="h-3 w-3" />
                            <span>High</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs">Peak Day</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Math.max(...chartData.map(d => {
                                const prev = chartData[chartData.indexOf(d) - 1];
                                return d.total - (prev?.total || 0);
                            }))}
                        </div>
                        <div className="text-xs text-muted-foreground">Max issued</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs">Departments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Set(students.map(s => s.department)).size}
                        </div>
                        <div className="text-xs text-muted-foreground">Active depts</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription className="text-xs">Today</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{todayCount}</div>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                            <TrendingUp className="h-3 w-3" />
                            <span>Active</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Latest credential transactions</CardDescription>
                        </div>
                        <Badge variant="secondary">Showing: {Math.min(students.length, 10)}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead>Degree</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Transaction</TableHead>
                                <TableHead className="text-right">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.slice(0, 10).length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No credentials issued yet
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.slice(0, 10).map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell className="font-mono text-xs">{student.student_id}</TableCell>
                                        <TableCell>{student.degree}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                student.status === 'issued' ? 'default' :
                                                    student.status === 'revoked' ? 'destructive' :
                                                        'secondary'
                                            }>
                                                {student.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {student.transaction_hash ? (
                                                <a
                                                    href={`https://amoy.polygonscan.com/tx/${student.transaction_hash}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline font-mono text-xs"
                                                >
                                                    {student.transaction_hash.slice(0, 8)}...
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground">
                                            {format(new Date(student.created_at), 'MMM d, h:mm a')}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
