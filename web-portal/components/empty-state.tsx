'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileQuestion, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({
    title = 'No Credentials Found',
    description = 'You don\'t have any issued credentials yet. Once your institution issues credentials, they will appear here.',
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="bg-muted p-6 rounded-full mb-6">
                    <FileQuestion className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground max-w-md mb-6">{description}</p>
                {actionLabel && onAction && (
                    <Button onClick={onAction} variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {actionLabel}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
