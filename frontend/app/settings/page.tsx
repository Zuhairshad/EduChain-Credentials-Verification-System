import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">
                    System configuration and preferences
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Contract Configuration</CardTitle>
                    <CardDescription>
                        Blockchain contract details (read-only)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm font-medium">Contract Address</p>
                        <p className="text-sm text-muted-foreground font-mono mt-1">
                            0x0f5D830bE2bBC465c802Bd7e97A8a14e609Fea77
                        </p>
                    </div>
                    <div>
                        <p className="text-sm font-medium">Network</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Polygon Amoy (Chain ID: 80002)
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
