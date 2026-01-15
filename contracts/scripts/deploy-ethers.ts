import hre from "hardhat";

async function main() {
    console.log("🚀 Deploying CredentialRegistry to Polygon Amoy...\\n");

    // Get wallet clients (viem API)
    const walletClients = await hre.network.provider.request({
        method: "eth_accounts",
    }) as string[];

    if (!walletClients || walletClients.length === 0) {
        console.error("❌ No accounts found. Please check your PRIVATE_KEY in .env");
        process.exit(1);
    }

    const deployerAddress = walletClients[0];
    console.log("Deploying with account:", deployerAddress);

    // Get admin address from environment or use deployer
    const adminAddress = (process.env.ADMIN_ADDRESS || deployerAddress) as `0x${string}`;
    console.log("Admin address:", adminAddress);

    // Check balance
    const balance = await hre.network.provider.request({
        method: "eth_getBalance",
        params: [deployerAddress, "latest"],
    });

    console.log("Account balance:", parseInt(balance as string, 16) / 1e18, "MATIC\\n");

    if (balance === "0x0") {
        console.error("❌ Error: Account has no MATIC. Please get test MATIC from https://faucet.polygon.technology/");
        process.exit(1);
    }

    // Deploy the contract using artifacts
    console.log("📝 Deploying CredentialRegistry...");

    const CredentialRegistry = await hre.artifacts.readArtifact("CredentialRegistry");

    // Deploy using low-level provider
    const deployTx = await hre.network.provider.request({
        method: "eth_sendTransaction",
        params: [{
            from: deployerAddress,
            data: CredentialRegistry.bytecode,
            gas: "0x" + (5000000).toString(16),
        }],
    });

    console.log("Deploy transaction:", deployTx);

    // Wait for deployment
    let receipt = null;
    while (!receipt) {
        try {
            receipt = await hre.network.provider.request({
                method: "eth_getTransactionReceipt",
                params: [deployTx],
            });
            if (!receipt) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (e) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    const contractAddress = (receipt as any).contractAddress;
    console.log("✅ CredentialRegistry deployed to:", contractAddress);

    console.log("\\n✨ Deployment complete!");
    console.log("\\n📋 Contract Address:", contractAddress);
    console.log("⚠️  Save this address for your backend configuration!");

    console.log("\\n📌 Next steps:");
    console.log("1. Initialize the contract with:");
    console.log(`   npx hardhat run scripts/initialize.ts --network polygonAmoy`);
    console.log("2. Verify contract on PolygonScan:");
    console.log(`   npx hardhat verify --network polygonAmoy ${contractAddress}`);
    console.log("3. Add institution addresses using addInstitution()");
    console.log("4. Update backend .env with CONTRACT_ADDRESS");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
