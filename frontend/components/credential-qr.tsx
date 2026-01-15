'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface CredentialQRProps {
    credentialId: string;
    studentName: string;
}

export function CredentialQR({ credentialId, studentName }: CredentialQRProps) {
    const verificationUrl = `${window.location.origin}/verify/${credentialId}`;

    const downloadQR = () => {
        const svg = document.getElementById('credential-qr');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');

            const downloadLink = document.createElement('a');
            downloadLink.download = `${studentName.replace(/ /g, '_')}_QR.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Verification QR Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-center p-4 bg-white rounded-lg">
                    <QRCodeSVG
                        id="credential-qr"
                        value={verificationUrl}
                        size={200}
                        level="H"
                        includeMargin
                    />
                </div>
                <Button
                    variant="outline"
                    className="w-full"
                    onClick={downloadQR}
                >
                    <Download className="mr-2 h-4 w-4" />
                    Download QR Code
                </Button>
            </CardContent>
        </Card>
    );
}
