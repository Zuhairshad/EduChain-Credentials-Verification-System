import { ComprehensiveIssueForm } from '@/components/comprehensive-issue-form';

export default function IssuePage() {
    return (
        <div className="p-8 space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Issue New Credential</h1>
                <p className="text-muted-foreground mt-1">
                    Create a blockchain-verified academic credential
                </p>
            </div>

            <ComprehensiveIssueForm />
        </div>
    );
}
