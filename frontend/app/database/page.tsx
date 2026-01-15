import { DegreesTable } from '@/components/degrees-table';

export default function DatabasePage() {
    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Student Database</h1>
                <p className="text-muted-foreground mt-1">
                    Manage all issued credentials
                </p>
            </div>

            <DegreesTable />
        </div>
    );
}
