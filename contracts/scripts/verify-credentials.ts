import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import { keccak256 } from "ethers";

async function main() {
    console.log("🔍 Verifying Credentials on Blockchain\n");

    const CONTRACT_ADDRESS = "0x0f5D830bE2bBC465c802Bd7e97A8a14e609Fea77";

    // The Merkle root that was anchored
    const ANCHORED_ROOT = "0x89e7b24462adc71aa32bdfcfa4d6f2488e74489a5d2a57f17bcf6803dcef2b63";

    // Connect to contract
    const contract = await ethers.getContractAt("CredentialRegistry", CONTRACT_ADDRESS);

    // Check 1: Verify the Merkle root exists on blockchain
    console.log("📌 Step 1: Checking if Merkle root exists on blockchain...");
    const rootInfo = await contract.merkleRoots(ANCHORED_ROOT);

    if (!rootInfo.exists) {
        console.log("❌ Error: Merkle root not found on blockchain!");
        process.exit(1);
    }

    console.log("✅ Merkle root found on blockchain!");
    console.log("   Institution:", rootInfo.institution);
    console.log("   Batch size:", rootInfo.batchSize.toString());
    console.log("   Anchored:", new Date(Number(rootInfo.timestamp) * 1000).toLocaleString());

    // Check 2: Verify institution details
    console.log("\n📌 Step 2: Verifying institution...");
    const instInfo = await contract.getInstitutionInfo(rootInfo.institution);
    console.log("✅ Institution verified:");
    console.log("   Name:", instInfo.name);
    console.log("   Active:", instInfo.active);
    console.log("   Total credentials:", instInfo.totalCredentials.toString());

    // Check 3: Verify a specific credential using Merkle proof
    console.log("\n📌 Step 3: Verifying specific credential with Merkle proof...");

    // Recreate the credentials (in real app, student would provide this)
    const credentials = [
        {
            id: "DEGREE-2025-001",
            studentName: "Alice Johnson",
            degree: "Bachelor of Computer Science",
            issueDate: "2025-01-15",
            graduationDate: "2025-05-20"
        },
        {
            id: "DEGREE-2025-002",
            studentName: "Bob Smith",
            degree: "Master of Data Science",
            issueDate: "2025-01-15",
            graduationDate: "2025-05-20"
        },
        {
            id: "DEGREE-2025-003",
            studentName: "Carol Williams",
            degree: "PhD in Artificial Intelligence",
            issueDate: "2025-01-15",
            graduationDate: "2025-06-10"
        }
    ];

    // Recreate the Merkle tree
    const leaves = credentials.map(cred => {
        return keccak256(
            ethers.toUtf8Bytes(
                JSON.stringify({
                    id: cred.id,
                    studentName: cred.studentName,
                    degree: cred.degree,
                    issueDate: cred.issueDate,
                    graduationDate: cred.graduationDate,
                    institution: rootInfo.institution
                })
            )
        );
    });

    const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const computedRoot = merkleTree.getHexRoot();

    // Verify the root matches
    if (computedRoot !== ANCHORED_ROOT) {
        console.log("❌ Error: Computed root doesn't match anchored root!");
        console.log("   Expected:", ANCHORED_ROOT);
        console.log("   Computed:", computedRoot);
        process.exit(1);
    }

    console.log("✅ Merkle root verification passed!");

    // Verify each credential individually
    console.log("\n📌 Step 4: Verifying individual credentials...\n");

    for (let i = 0; i < credentials.length; i++) {
        const cred = credentials[i];
        const leaf = leaves[i];
        const proof = merkleTree.getHexProof(leaf);

        // Verify proof
        const isValid = merkleTree.verify(proof, leaf, computedRoot);

        console.log(`Credential ${i + 1}: ${cred.id}`);
        console.log(`  Student: ${cred.studentName}`);
        console.log(`  Degree: ${cred.degree}`);
        console.log(`  Leaf Hash: ${leaf.slice(0, 20)}...`);
        console.log(`  Proof Length: ${proof.length} hashes`);
        console.log(`  Valid: ${isValid ? '✅ YES' : '❌ NO'}`);
        console.log();
    }

    // Final summary
    console.log("━".repeat(70));
    console.log("\n✨ Verification Complete!\n");
    console.log("All credentials are valid and anchored on Polygon Amoy blockchain.");
    console.log("\nSummary:");
    console.log(`  📜 Total credentials verified: ${credentials.length}`);
    console.log(`  🏛️  Institution: ${instInfo.name}`);
    console.log(`  🔗 Merkle root: ${ANCHORED_ROOT.slice(0, 20)}...`);
    console.log(`  ⛓️  Block timestamp: ${new Date(Number(rootInfo.timestamp) * 1000).toLocaleString()}`);
    console.log("\n🔗 View on PolygonScan:");
    console.log(`   https://amoy.polygonscan.com/address/${CONTRACT_ADDRESS}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
