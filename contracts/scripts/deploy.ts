import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Deploying CredentialRegistry to Polygon Amoy...\\n");

    // Get signers
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // Get admin address from environment or use deployer
    const adminAddress = process.env.ADMIN_ADDRESS || deployer.address;
    console.log("Admin address:", adminAddress);

    // Get deployer balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "MATIC\\n");

    if (balance === 0n) {
        console.error("❌ Error: Account has no MATIC. Please get test MATIC from https://faucet.polygon.technology/");
        process.exit(1);
    }

    // Deploy the CredentialRegistry contract
    console.log("📝 Deploying CredentialRegistry implementation...");
    const CredentialRegistry = await ethers.getContractFactory("CredentialRegistry");
    const credentialRegistry = await CredentialRegistry.deploy();

    await credentialRegistry.waitForDeployment();
    const contractAddress = await credentialRegistry.getAddress();

    console.log("✅ CredentialRegistry deployed to:", contractAddress);

    // Initialize the contract
    console.log("\\n🔧 Initializing contract...");
    const tx = await credentialRegistry.initialize(adminAddress);
    await tx.wait();

    console.log("✅ Contract initialized successfully!");

    // Verify the deployment
    console.log("\\n🔍 Verifying deployment...");
    const version = await credentialRegistry.version();
    console.log("Contract version:", version);

    const totalCredentials = await credentialRegistry.totalCredentialsAnchored();
    console.log("Total credentials anchored:", totalCredentials.toString());

    console.log("\\n✨ Deployment complete!");
    console.log("\\n📋 Contract Address:", contractAddress);
    console.log("⚠️  Save this address for your backend configuration!");

    console.log("\\n📌 Next steps:");
    console.log("1. Verify contract on PolygonScan:");
    console.log(`   npx hardhat verify --network polygonAmoy ${contractAddress}`);
    console.log("2. Add institution addresses using addInstitution()");
    console.log("3. Update backend .env with CONTRACT_ADDRESS");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
