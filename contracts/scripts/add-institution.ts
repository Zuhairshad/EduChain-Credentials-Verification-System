import { ethers } from "hardhat";

async function main() {
    console.log("🏛️  Adding Institution to CredentialRegistry...\\n");

    // Deployed contract address on Polygon Amoy
    const CONTRACT_ADDRESS = "0x0f5D830bE2bBC465c802Bd7e97A8a14e609Fea77";

    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log("Using account:", deployer.address);

    // Connect to deployed contract
    const credentialRegistry = await ethers.getContractAt(
        "CredentialRegistry",
        CONTRACT_ADDRESS
    );

    console.log("Connected to CredentialRegistry at:", CONTRACT_ADDRESS);

    // Check contract state
    console.log("\\n📊 Checking contract state...");

    try {
        const version = await credentialRegistry.version();
        console.log("Contract version:", version);
    } catch (error) {
        console.log("⚠️  Could not read version - contract might not be initialized");
    }

    // Check if deployer has ADMIN_ROLE
    const ADMIN_ROLE = await credentialRegistry.ADMIN_ROLE();
    const hasAdminRole = await credentialRegistry.hasRole(ADMIN_ROLE, deployer.address);

    console.log("\\n🔐 Admin Role Check:");
    console.log("ADMIN_ROLE:", ADMIN_ROLE);
    console.log("Deployer has ADMIN role:", hasAdminRole);

    if (!hasAdminRole) {
        console.log("\\n⚠️  WARNING: Current account does not have ADMIN role!");
        console.log("\\nAttempting to initialize contract...");

        try {
            const initTx = await credentialRegistry.initialize(deployer.address);
            console.log("Initialization transaction:", initTx.hash);
            await initTx.wait();
            console.log("✅ Contract initialized successfully!");
        } catch (error: any) {
            console.log("❌ Initialization failed:", error.message);
            console.log("\\nThis is expected for UUPS upgradeable contracts.");
            console.log("The contract needs to be deployed through a proxy for proper initialization.");
            console.log("\\nExiting...");
            process.exit(1);
        }
    }

    // Check current institutions count
    const totalInstitutions = await credentialRegistry.totalInstitutions();
    console.log("\\nCurrent total institutions:", totalInstitutions.toString());

    // Institution details
    const institutionAddress = deployer.address; // Using deployer as test institution
    const institutionName = "My Test University";

    console.log("\\n🎓 Adding Institution:");
    console.log("Address:", institutionAddress);
    console.log("Name:", institutionName);

    // Check if institution already exists
    const isAlreadyInstitution = await credentialRegistry.isInstitution(institutionAddress);

    if (isAlreadyInstitution) {
        console.log("\\n⚠️  This address is already registered as an institution!");

        const info = await credentialRegistry.getInstitutionInfo(institutionAddress);
        console.log("\\nExisting Institution Info:");
        console.log("  Name:", info.name);
        console.log("  Active:", info.active);
        console.log("  Registered:", new Date(Number(info.registeredDate) * 1000).toLocaleString());
        console.log("  Total Credentials:", info.totalCredentials.toString());

        process.exit(0);
    }

    // Add institution
    console.log("\\n📝 Sending transaction...");

    try {
        const tx = await credentialRegistry.addInstitution(institutionAddress, institutionName);
        console.log("\\n✅ Transaction submitted!");
        console.log("Transaction hash:", tx.hash);
        console.log("\\n⏳ Waiting for confirmation...");

        const receipt = await tx.wait();
        console.log("✅ Transaction confirmed in block:", receipt?.blockNumber);

        // Verify the addition
        console.log("\\n🔍 Verifying institution was added...");
        const info = await credentialRegistry.getInstitutionInfo(institutionAddress);

        console.log("\\n✨ Institution Added Successfully!");
        console.log("  Name:", info.name);
        console.log("  Active:", info.active);
        console.log("  Registered:", new Date(Number(info.registeredDate) * 1000).toLocaleString());
        console.log("  Total Credentials:", info.totalCredentials.toString());

        const newTotal = await credentialRegistry.totalInstitutions();
        console.log("\\nNew total institutions:", newTotal.toString());

        console.log("\\n📋 Transaction Details:");
        console.log("  Hash:", tx.hash);
        console.log("  Block:", receipt?.blockNumber);
        console.log("  Gas Used:", receipt?.gasUsed.toString());
        console.log("\\n🔗 View on PolygonScan:");
        console.log(`  https://amoy.polygonscan.com/tx/${tx.hash}`);

    } catch (error: any) {
        console.error("\\n❌ Error adding institution:", error.message);

        if (error.message.includes("Institution already exists")) {
            console.log("This address is already registered as an institution.");
        } else if (error.message.includes("AccessControlUnauthorizedAccount")) {
            console.log("Current account does not have ADMIN role.");
        } else {
            console.log("\\nFull error:", error);
        }

        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
