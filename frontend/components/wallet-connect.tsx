'use client';

import { useWallet } from '@/hooks/use-wallet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function WalletConnect() {
    const { account, isConnecting, connect, isConnected } = useWallet();

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className="flex items-center gap-3">
            {isConnected ? (
                <>
                    <Badge variant="outline" className="px-4 py-2 text-sm font-mono">
                        {formatAddress(account!)}
                    </Badge>
                    <Badge variant="default" className="px-3 py-1.5">
                        Connected
                    </Badge>
                </>
            ) : (
                <Button
                    onClick={connect}
                    disabled={isConnecting}
                    size="lg"
                    className="font-semibold"
                >
                    {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
                </Button>
            )}
        </div>
    );
}
