import { ethers } from "hardhat";

async function main() {
    console.log("🏛️  Removing old institution and adding Lahore Garrison University...\n");

    const CONTRACT_ADDRESS = "0x0f5D830bE2bBC465c802Bd7e97A8a14e609Fea77";
    const INSTITUTION_ADDRESS = "0xd9a92EddfA8c7541298CC4F9Ae4e53AD726dB81D";

    const [admin] = await ethers.getSigners();
    console.log("Admin address:", admin.address);

    const contract = await ethers.getContractAt("CredentialRegistry", CONTRACT_ADDRESS);

    // Check admin role
    const ADMIN_ROLE = await contract.ADMIN_ROLE();
    const hasAdminRole = await contract.hasRole(ADMIN_ROLE, admin.address);

    if (!hasAdminRole) {
        console.log("❌ Error: Current account does not have ADMIN role!");
        process.exit(1);
    }

    console.log("✅ Confirmed: Account has ADMIN role\n");

    // Remove old institution
    console.log("📝 Removing old institution...");
    try {
        const removeTx = await contract.removeInstitution(INSTITUTION_ADDRESS);
        await removeTx.wait();
        console.log("✅ Old institution removed");
    } catch (error: any) {
        console.log("Note:", error.message);
    }

    // Add new institution with updated name
    console.log("\n📝 Adding Lahore Garrison University...");
    const addTx = await contract.addInstitution(
        INSTITUTION_ADDRESS,
        "Lahore Garrison University"
    );

    console.log("Transaction hash:", addTx.hash);
    await addTx.wait();

    // Verify
    const info = await contract.getInstitutionInfo(INSTITUTION_ADDRESS);
    console.log("\n✨ Institution updated successfully!");
    console.log("  Name:", info.name);
    console.log("  Active:", info.active);
    console.log("  Address:", INSTITUTION_ADDRESS);

    console.log("\n🔗 View on PolygonScan:");
    console.log(`   https://amoy.polygonscan.com/tx/${addTx.hash}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
