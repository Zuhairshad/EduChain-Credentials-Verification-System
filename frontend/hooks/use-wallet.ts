'use client';

import { useState, useEffect } from 'react';
import { connectWallet } from '@/lib/blockchain';

export function useWallet() {
    const [account, setAccount] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        // Check if already connected
        if (window.ethereum) {
            window.ethereum
                .request({ method: 'eth_accounts' })
                .then((accounts: string[]) => {
                    if (accounts.length > 0) {
                        setAccount(accounts[0]);
                    }
                });

            // Listen for account changes
            const handleAccountsChanged = (accounts: string[]) => {
                if (accounts.length === 0) {
                    setAccount(null);
                } else {
                    setAccount(accounts[0]);
                }
            };

            window.ethereum.on('accountsChanged', handleAccountsChanged);

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            };
        }
    }, []);

    const connect = async () => {
        setIsConnecting(true);
        const connectedAccount = await connectWallet();
        if (connectedAccount) {
            setAccount(connectedAccount);
        }
        setIsConnecting(false);
    };

    const disconnect = () => {
        setAccount(null);
    };

    return {
        account,
        isConnecting,
        connect,
        disconnect,
        isConnected: !!account,
    };
}
