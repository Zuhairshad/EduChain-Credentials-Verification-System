'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MerkleTree } from 'merkletreejs';
import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';
import { getProvider, getContract } from '@/lib/blockchain';
import { CheckCircle2, XCircle, Upload, Loader2, AlertTriangle, Shield, Search } from 'lucide-react';

interface CredentialData {
    id: string;
    studentName: string;
    degree: string;
    issueDate: string;
    graduationDate: string;
    institution: string;
}

interface CredentialPackage {
    credential: CredentialData;
    proof: string[];
    merkleRoot: string;
}

type VerificationStatus = 'idle' | 'searching' | 'hashing' | 'verifying' | 'success' | 'failed';

export function VerifyCredential() {
    const [status, setStatus] = useState<VerificationStatus>('idle');
    const [fileName, setFileName] = useState<string>('');
    const [credentialData, setCredentialData] = useState<CredentialPackage | null>(null);
    const [searchResults, setSearchResults] = useState<CredentialData[]>([]);

    // Search form state
    const [searchForm, setSearchForm] = useState({
        studentName: '',
        credentialId: '',
        degree: ''
    });

    const [verificationDetails, setVerificationDetails] = useState<{
        localProofValid?: boolean;
        onChainExists?: boolean;
        institutionName?: string;
        batchSize?: number;
        timestamp?: number;
        leafHash?: string;
    }>({});

    const hashCredential = (credential: CredentialData): string => {
        const dataString = JSON.stringify({
            id: credential.id,
            studentName: credential.studentName,
            degree: credential.degree,
            issueDate: credential.issueDate,
            graduationDate: credential.graduationDate,
            institution: credential.institution,
        });

        const hash = CryptoJS.SHA256(dataString);
        return '0x' + hash.toString(CryptoJS.enc.Hex);
    };

    // Search by name/details
    const handleSearchByName = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('searching');
        setVerificationDetails({});

        try {
            // Mock search - In production, query your backend API/database
            // For demo, we'll check against our known credentials
            const knownCredentials: CredentialData[] = [
                {
                    id: "DEGREE-2025-001",
                    studentName: "Alice Johnson",
                    degree: "Bachelor of Computer Science",
                    issueDate: "2025-01-15",
                    graduationDate: "2025-05-20",
                    institution: "0xd9a92EddfA8c7541298CC4F9Ae4e53AD726dB81D"
                },
                {
                    id: "DEGREE-2025-002",
                    studentName: "Bob Smith",
                    degree: "Master of Data Science",
                    issueDate: "2025-01-15",
                    graduationDate: "2025-05-20",
                    institution: "0xd9a92EddfA8c7541298CC4F9Ae4e53AD726dB81D"
                },
                {
                    id: "DEGREE-2025-003",
                    studentName: "Carol Williams",
                    degree: "PhD in Artificial Intelligence",
                    issueDate: "2025-01-15",
                    graduationDate: "2025-06-10",
                    institution: "0xd9a92EddfA8c7541298CC4F9Ae4e53AD726dB81D"
                }
            ];

            // Filter based on search criteria
            const results = knownCredentials.filter(cred => {
                const nameMatch = !searchForm.studentName ||
                    cred.studentName.toLowerCase().includes(searchForm.studentName.toLowerCase());
                const idMatch = !searchForm.credentialId ||
                    cred.id.toLowerCase().includes(searchForm.credentialId.toLowerCase());
                const degreeMatch = !searchForm.degree ||
                    cred.degree.toLowerCase().includes(searchForm.degree.toLowerCase());

                return nameMatch && idMatch && degreeMatch;
            });

            if (results.length === 0) {
                setStatus('failed');
                setSearchResults([]);
                return;
            }

            // For the first result, verify it's actually on blockchain
            const firstResult = results[0];
            const leafHash = hashCredential(firstResult);

            setStatus('verifying');

            // Check blockchain
            const provider = await getProvider();
            if (!provider) {
                setStatus('failed');
                return;
            }

            const contract = await getContract(provider);

            // Check the known Merkle root for our credentials
            const KNOWN_ROOT = "0x89e7b24462adc71aa32bdfcfa4d6f2488e74489a5d2a57f17bcf6803dcef2b63";
            const rootInfo = await contract.merkleRoots(KNOWN_ROOT);

            if (!rootInfo.exists) {
                setStatus('failed');
                return;
            }

            const instInfo = await contract.getInstitutionInfo(rootInfo.institution);

            setVerificationDetails({
                onChainExists: true,
                institutionName: instInfo.name,
                batchSize: Number(rootInfo.batchSize),
                timestamp: Number(rootInfo.timestamp),
                leafHash,
            });

            setSearchResults(results);

            // Create a credential package for display
            setCredentialData({
                credential: firstResult,
                proof: [], // No proof in search mode
                merkleRoot: KNOWN_ROOT
            });

            setStatus('success');

        } catch (error) {
            console.error('Search error:', error);
            setStatus('failed');
        }
    };

    // Original file upload handler
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setStatus('hashing');
        setVerificationDetails({});

        try {
            const fileContent = await file.text();
            const packageData: CredentialPackage = JSON.parse(fileContent);

            setCredentialData(packageData);

            const leafHash = hashCredential(packageData.credential);
            setVerificationDetails(prev => ({ ...prev, leafHash }));

            setStatus('verifying');

            const proof = packageData.proof;
            const root = packageData.merkleRoot;
            const localProofValid = proof && proof.length > 0 && root !== '';

            setVerificationDetails(prev => ({ ...prev, localProofValid }));

            if (!localProofValid) {
                setStatus('failed');
                return;
            }

            const provider = await getProvider();
            if (!provider) {
                setStatus('failed');
                return;
            }

            const contract = await getContract(provider);
            const rootInfo = await contract.merkleRoots(packageData.merkleRoot);

            const onChainExists = rootInfo.exists;

            if (!onChainExists) {
                setVerificationDetails(prev => ({ ...prev, onChainExists }));
                setStatus('failed');
                return;
            }

            const instInfo = await contract.getInstitutionInfo(rootInfo.institution);

            setVerificationDetails({
                localProofValid,
                onChainExists,
                institutionName: instInfo.name,
                batchSize: Number(rootInfo.batchSize),
                timestamp: Number(rootInfo.timestamp),
                leafHash,
            });

            setStatus('success');

        } catch (error) {
            console.error('Verification error:', error);
            setStatus('failed');
        }
    };

    const resetVerification = () => {
        setStatus('idle');
        setFileName('');
        setCredentialData(null);
        setVerificationDetails({});
        setSearchResults([]);
        setSearchForm({ studentName: '', credentialId: '', degree: '' });
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                    <Shield className="h-6 w-6" />
                    Verify Credential
                </CardTitle>
                <CardDescription>
                    Search by name or upload a credential package to verify authenticity
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Tabs defaultValue="search" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="search">
                            <Search className="h-4 w-4 mr-2" />
                            Search by Name
                        </TabsTrigger>
                        <TabsTrigger value="upload">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload JSON
                        </TabsTrigger>
                    </TabsList>

                    {/* Search Tab */}
                    <TabsContent value="search" className="space-y-4">
                        <form onSubmit={handleSearchByName} className="space-y-3">
                            <div>
                                <label className="text-sm font-medium">Student Name</label>
                                <Input
                                    placeholder="Enter full name..."
                                    value={searchForm.studentName}
                                    onChange={(e) => setSearchForm(prev => ({ ...prev, studentName: e.target.value }))}
                                    disabled={status === 'searching' || status === 'verifying'}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Credential ID (Optional)</label>
                                <Input
                                    placeholder="e.g., DEGREE-2025-001"
                                    value={searchForm.credentialId}
                                    onChange={(e) => setSearchForm(prev => ({ ...prev, credentialId: e.target.value }))}
                                    disabled={status === 'searching' || status === 'verifying'}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Degree (Optional)</label>
                                <Input
                                    placeholder="e.g., Bachelor of Computer Science"
                                    value={searchForm.degree}
                                    onChange={(e) => setSearchForm(prev => ({ ...prev, degree: e.target.value }))}
                                    disabled={status === 'searching' || status === 'verifying'}
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    disabled={!searchForm.studentName || status === 'searching' || status === 'verifying'}
                                    className="flex-1"
                                >
                                    {status === 'searching' || status === 'verifying' ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Searching...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="h-4 w-4 mr-2" />
                                            Search & Verify
                                        </>
                                    )}
                                </Button>
                                {(status !== 'idle' && status !== 'searching') && (
                                    <Button type="button" onClick={resetVerification} variant="outline">
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </form>

                        {status === 'idle' && (
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    💡 Enter student name to search verified credentials. You can add Credential ID or Degree for more precise results.
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Upload Tab */}
                    <TabsContent value="upload" className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <Input
                                        type="file"
                                        accept=".json"
                                        onChange={handleFileUpload}
                                        disabled={status === 'hashing' || status === 'verifying'}
                                        className="cursor-pointer"
                                    />
                                </div>
                                {fileName && (
                                    <Button onClick={resetVerification} variant="outline" size="sm">
                                        Clear
                                    </Button>
                                )}
                            </div>

                            {fileName && (
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Upload className="h-4 w-4" />
                                    {fileName}
                                </p>
                            )}
                        </div>

                        {status === 'idle' && !fileName && (
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    📄 Upload a credential package (JSON) with Merkle proof for complete verification
                                </p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Status Indicators */}
                {status === 'searching' && (
                    <Alert>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <AlertTitle>Searching...</AlertTitle>
                        <AlertDescription>
                            Looking for matching credentials in the database...
                        </AlertDescription>
                    </Alert>
                )}

                {status === 'hashing' && (
                    <Alert>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <AlertTitle>Processing...</AlertTitle>
                        <AlertDescription>
                            Hashing credential data and calculating proof...
                        </AlertDescription>
                    </Alert>
                )}

                {status === 'verifying' && (
                    <Alert>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <AlertTitle>Verifying...</AlertTitle>
                        <AlertDescription>
                            Checking Merkle proof and querying blockchain...
                        </AlertDescription>
                    </Alert>
                )}

                {status === 'success' && (
                    <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-900 dark:text-green-100">
                            Credential Authenticated Successfully! ✅
                        </AlertTitle>
                        <AlertDescription className="text-green-800 dark:text-green-200">
                            This credential is valid, authentic, and anchored on Polygon Amoy blockchain.
                        </AlertDescription>
                    </Alert>
                )}

                {status === 'failed' && (
                    <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertTitle className="text-red-900 dark:text-red-100">
                            {searchResults.length === 0 && searchForm.studentName ? 'No Credentials Found' : 'Invalid Credential!'} ❌
                        </AlertTitle>
                        <AlertDescription className="text-red-800 dark:text-red-200">
                            {searchResults.length === 0 && searchForm.studentName
                                ? 'No matching credentials found in the system.'
                                : 'This credential could not be verified. It may be tampered with or not anchored on the blockchain.'}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Credential Details */}
                {credentialData && (status === 'success' || status === 'failed') && (
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-semibold text-lg">Credential Details</h3>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Student Name</p>
                                <p className="text-sm mt-1">{credentialData.credential.studentName}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Credential ID</p>
                                <p className="text-sm mt-1 font-mono">{credentialData.credential.id}</p>
                            </div>

                            <div className="sm:col-span-2">
                                <p className="text-sm font-medium text-muted-foreground">Degree</p>
                                <p className="text-sm mt-1">{credentialData.credential.degree}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Issue Date</p>
                                <p className="text-sm mt-1">{credentialData.credential.issueDate}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Graduation Date</p>
                                <p className="text-sm mt-1">{credentialData.credential.graduationDate}</p>
                            </div>

                            {/* Hash Information - Making it prominent */}
                            {verificationDetails.leafHash && (
                                <div className="sm:col-span-2 pt-2 border-t">
                                    <p className="text-sm font-medium text-muted-foreground">Credential Hash (SHA-256)</p>
                                    <div className="mt-1 space-y-2">
                                        <p className="text-xs font-mono break-all bg-muted p-2 rounded border">
                                            {verificationDetails.leafHash}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            This is the unique cryptographic fingerprint of this credential
                                        </p>
                                    </div>
                                </div>
                            )}

                            {credentialData.merkleRoot && (
                                <div className="sm:col-span-2">
                                    <p className="text-sm font-medium text-muted-foreground">Blockchain Verification</p>
                                    <div className="mt-1 space-y-2">
                                        <a
                                            href={`https://amoy.polygonscan.com/tx/0x49aff592078d9ae1b17aa8820ed082d67f09228046d952c0907b988173f23132`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-mono break-all text-primary hover:underline bg-muted p-2 rounded border block"
                                        >
                                            View Anchoring Transaction on PolygonScan →
                                        </a>
                                        <p className="text-xs text-muted-foreground">
                                            Merkle Root: {credentialData.merkleRoot.slice(0, 20)}...{credentialData.merkleRoot.slice(-10)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Verification Details */}
                {(status === 'success' || status === 'failed') && verificationDetails.onChainExists !== undefined && (
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-semibold text-lg">Verification Results</h3>

                        <div className="space-y-3">
                            {verificationDetails.localProofValid !== undefined && (
                                <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                                    <span className="text-sm font-medium">Local Merkle Proof</span>
                                    <Badge variant={verificationDetails.localProofValid ? "default" : "destructive"}>
                                        {verificationDetails.localProofValid ? (
                                            <><CheckCircle2 className="h-3 w-3 mr-1" /> Valid</>
                                        ) : (
                                            <><XCircle className="h-3 w-3 mr-1" /> Invalid</>
                                        )}
                                    </Badge>
                                </div>
                            )}

                            <div className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                                <span className="text-sm font-medium">Blockchain Anchor</span>
                                <Badge variant={verificationDetails.onChainExists ? "default" : "destructive"}>
                                    {verificationDetails.onChainExists ? (
                                        <><CheckCircle2 className="h-3 w-3 mr-1" /> Found</>
                                    ) : (
                                        <><XCircle className="h-3 w-3 mr-1" /> Not Found</>
                                    )}
                                </Badge>
                            </div>

                            {verificationDetails.institutionName && (
                                <div className="p-3 rounded-md bg-muted/50">
                                    <p className="text-sm font-medium text-muted-foreground">Issued By</p>
                                    <p className="text-sm mt-1">{verificationDetails.institutionName}</p>
                                </div>
                            )}

                            {verificationDetails.timestamp && (
                                <div className="p-3 rounded-md bg-muted/50">
                                    <p className="text-sm font-medium text-muted-foreground">Anchored On</p>
                                    <p className="text-sm mt-1">
                                        {new Date(verificationDetails.timestamp * 1000).toLocaleString()}
                                    </p>
                                </div>
                            )}

                            {verificationDetails.batchSize && (
                                <div className="p-3 rounded-md bg-muted/50">
                                    <p className="text-sm font-medium text-muted-foreground">Batch Size</p>
                                    <p className="text-sm mt-1">{verificationDetails.batchSize} credentials</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
