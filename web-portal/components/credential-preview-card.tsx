'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GraduationCap, Calendar, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface CredentialPreviewCardProps {
    id: string;
    degree_level: string;
    department: string;
    cgpa: number;
    internal_grade: string;
    graduation_end_date: string;
    status: string;
}

export function CredentialPreviewCard({
    id,
    degree_level,
    department,
    cgpa,
    internal_grade,
    graduation_end_date,
    status,
}: CredentialPreviewCardProps) {
    return (
        <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-2">
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
                        <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant={status === 'issued' ? 'default' : 'destructive'}>
                        {status === 'issued' ? 'Verified' : 'Revoked'}
                    </Badge>
                </div>

                <h3 className="text-xl font-bold mb-1">{degree_level}</h3>
                <p className="text-sm text-muted-foreground mb-4">{department}</p>

                <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm">
                        <Award className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">{cgpa}</span>
                        <span className="text-muted-foreground ml-1">({internal_grade})</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(graduation_end_date).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                        })}
                    </div>
                </div>

                <Link href="/vault">
                    <Button variant="ghost" className="w-full group-hover:bg-primary/10">
                        View Details
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
