'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getInstitutionInfo, getTotalInstitutions, type InstitutionInfo } from '@/lib/blockchain';

// Test address from contract deployment
const TEST_INSTITUTION_ADDRESS = '0xd9a92EddfA8c7541298CC4F9Ae4e53AD726dB81D';

export function InstitutionList() {
    const [institutions, setInstitutions] = useState<InstitutionInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        async function fetchInstitutions() {
            setLoading(true);

            // Fetch total first
            const totalCount = await getTotalInstitutions();
            setTotal(totalCount);

            // Fetch the test institution we registered
            const info = await getInstitutionInfo(TEST_INSTITUTION_ADDRESS);
            if (info) {
                setInstitutions([info]);
            }

            setLoading(false);
        }

        fetchInstitutions();
    }, []);

    const formatDate = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) * 1000);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl">Registered Institutions</CardTitle>
                <CardDescription>
                    Total institutions on EduChain-VC: <strong>{total}</strong>
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <p className="text-muted-foreground">Loading institutions...</p>
                    </div>
                ) : institutions.length === 0 ? (
                    <div className="flex justify-center py-8">
                        <p className="text-muted-foreground">No institutions registered yet</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Institution Name</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Credentials</TableHead>
                                <TableHead>Registered</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {institutions.map((institution) => (
                                <TableRow key={institution.address}>
                                    <TableCell className="font-semibold">{institution.name}</TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {formatAddress(institution.address)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={institution.active ? 'default' : 'secondary'}>
                                            {institution.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {institution.totalCredentials.toString()}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDate(institution.registeredDate)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
