import { ethers, upgrades } from "hardhat";

async function main() {
    console.log("🚀 Deploying CredentialRegistry with UUPS Proxy...\\n");

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

    // Deploy the CredentialRegistry contract through UUPS proxy
    console.log("📝 Deploying CredentialRegistry with UUPS Proxy...");
    const CredentialRegistry = await ethers.getContractFactory("CredentialRegistry");

    console.log("Deploying proxy...");
    const proxy = await upgrades.deployProxy(
        CredentialRegistry,
        [adminAddress],
        { kind: "uups" }
    );

    console.log("Waiting for deployment...");
    await proxy.waitForDeployment();
    const proxyAddress = await proxy.getAddress();

    console.log("✅ CredentialRegistry Proxy deployed to:", proxyAddress);

    // Verify the deployment
    console.log("\\n🔍 Verifying deployment...");
    const version = await proxy.version();
    console.log("Contract version:", version);

    const totalCredentials = await proxy.totalCredentialsAnchored();
    console.log("Total credentials anchored:", totalCredentials.toString());

    // Check admin role
    const ADMIN_ROLE = await proxy.ADMIN_ROLE();
    const hasAdminRole = await proxy.hasRole(ADMIN_ROLE, adminAddress);
    console.log("Admin has ADMIN_ROLE:", hasAdminRole);

    const totalInstitutions = await proxy.totalInstitutions();
    console.log("Total institutions:", totalInstitutions.toString());

    console.log("\\n✨ Deployment complete!");
    console.log("\\n📋 Proxy Contract Address:", proxyAddress);
    console.log("⚠️  Save this address for your backend configuration!");

    console.log("\\n📌 Next steps:");
    console.log("1. Update add-institution script with new address:");
    console.log(`   CONTRACT_ADDRESS="${proxyAddress}"`);
    console.log("2. Run: npx hardhat run scripts/add-institution.ts --network polygonAmoy");
    console.log("\\n🔗 View on PolygonScan:");
    console.log(`   https://amoy.polygonscan.com/address/${proxyAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
