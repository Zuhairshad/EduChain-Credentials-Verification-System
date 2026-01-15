import { ethers, BrowserProvider, Contract } from 'ethers';
import contractABI from './contract-abi.json';

// Polygon Amoy Testnet Configuration
export const POLYGON_AMOY_CHAIN_ID = '0x13882'; // 80002 in hex
export const CONTRACT_ADDRESS = '0x0f5D830bE2bBC465c802Bd7e97A8a14e609Fea77';

export const POLYGON_AMOY_CONFIG = {
    chainId: POLYGON_AMOY_CHAIN_ID,
    chainName: 'Polygon Amoy Testnet',
    nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
    },
    rpcUrls: ['https://rpc-amoy.polygon.technology/'],
    blockExplorerUrls: ['https://amoy.polygonscan.com/'],
};

export async function getProvider(): Promise<BrowserProvider | null> {
    if (typeof window === 'undefined' || !window.ethereum) {
        return null;
    }
    return new BrowserProvider(window.ethereum);
}

export async function getContract(signerOrProvider: any): Promise<Contract> {
    return new Contract(CONTRACT_ADDRESS, contractABI, signerOrProvider);
}

export async function switchToPolygonAmoy(): Promise<boolean> {
    if (!window.ethereum) return false;

    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: POLYGON_AMOY_CHAIN_ID }],
        });
        return true;
    } catch (switchError: any) {
        // Chain not added to MetaMask
        if (switchError.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [POLYGON_AMOY_CONFIG],
                });
                return true;
            } catch (addError) {
                console.error('Error adding Polygon Amoy:', addError);
                return false;
            }
        }
        console.error('Error switching network:', switchError);
        return false;
    }
}

export async function connectWallet(): Promise<string | null> {
    if (!window.ethereum) {
        alert('Please install MetaMask!');
        return null;
    }

    try {
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });

        // Switch to Polygon Amoy after connection
        await switchToPolygonAmoy();

        return accounts[0];
    } catch (error) {
        console.error('Error connecting wallet:', error);
        return null;
    }
}

export type InstitutionInfo = {
    name: string;
    active: boolean;
    registeredDate: bigint;
    totalCredentials: bigint;
    address: string;
};

export async function getInstitutionInfo(
    address: string
): Promise<InstitutionInfo | null> {
    try {
        const provider = await getProvider();
        if (!provider) return null;

        const contract = await getContract(provider);
        const info = await contract.getInstitutionInfo(address);

        return {
            name: info[0],
            active: info[1],
            registeredDate: info[2],
            totalCredentials: info[3],
            address,
        };
    } catch (error) {
        console.error('Error fetching institution:', error);
        return null;
    }
}

export async function getTotalInstitutions(): Promise<number> {
    try {
        const provider = await getProvider();
        if (!provider) return 0;

        const contract = await getContract(provider);
        const total = await contract.totalInstitutions();
        return Number(total);
    } catch (error) {
        console.error('Error fetching total institutions:', error);
        return 0;
    }
}
