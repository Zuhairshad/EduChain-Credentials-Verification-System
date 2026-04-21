'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, RefreshCw, Clock } from 'lucide-react';

interface EmptyStateProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    title = 'No Credentials Yet',
    description = 'Your institution hasn\'t issued any credentials to your account yet. Once they do, your blockchain-verified degrees and certificates will appear here.',
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <Card className="border-dashed border-2 border-primary/20">
            <CardContent className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="relative mb-6">
                    <div className="bg-primary/10 p-6 rounded-2xl">
                        <GraduationCap className="h-12 w-12 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 bg-muted p-1.5 rounded-full">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-muted-foreground max-w-sm mb-6 text-sm leading-relaxed">{description}</p>
                {actionLabel && onAction && (
                    <Button onClick={onAction} variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        {actionLabel}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
