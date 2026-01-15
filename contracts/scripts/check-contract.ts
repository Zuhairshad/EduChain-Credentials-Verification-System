import { ethers } from "hardhat";

async function main() {
    const contract = await ethers.getContractAt(
        "CredentialRegistry",
        "0x0f5D830bE2bBC465c802Bd7e97A8a14e609Fea77"
    );

    console.log("Checking contract at:", "0x0f5D830bE2bBC465c802Bd7e97A8a14e609Fea77");

    const total = await contract.totalInstitutions();
    console.log("Total institutions:", total.toString());

    const info = await contract.getInstitutionInfo("0xd9a92EddfA8c7541298CC4F9Ae4e53AD726dB81D");
    console.log("\nInstitution info:");
    console.log("  Name:", info[0]);
    console.log("  Active:", info[1]);
    console.log("  Registered Date:", new Date(Number(info[2]) * 1000).toLocaleString());
    console.log("  Total Credentials:", info[3].toString());
}

main().catch(console.error);
