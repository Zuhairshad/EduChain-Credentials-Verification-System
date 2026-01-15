import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import { keccak256 } from "ethers";

async function main() {
    console.log("🎓 Anchoring Credentials for My Test University\n");

    const CONTRACT_ADDRESS = "0x0f5D830bE2bBC465c802Bd7e97A8a14e609Fea77";

    // Get signer (must be the institution address)
    const [signer] = await ethers.getSigners();
    console.log("Institution address:", signer.address);

    // Connect to contract
    const contract = await ethers.getContractAt("CredentialRegistry", CONTRACT_ADDRESS);

    // Check if signer is an institution
    const isInst = await contract.isInstitution(signer.address);
    if (!isInst) {
        console.log("❌ Error: This address is not registered as an institution!");
        console.log("Only institutions can anchor credentials.");
        process.exit(1);
    }

    console.log("✅ Confirmed: Address is a registered institution\n");

    // Sample credentials (in real app, these would come from your database)
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

    console.log(`📚 Creating Merkle tree for ${credentials.length} credentials...\n`);

    // Hash each credential to create Merkle tree leaves
    const leaves = credentials.map(cred => {
        // Create a unique hash for each credential
        const credentialHash = keccak256(
            ethers.toUtf8Bytes(
                JSON.stringify({
                    id: cred.id,
                    studentName: cred.studentName,
                    degree: cred.degree,
                    issueDate: cred.issueDate,
                    graduationDate: cred.graduationDate,
                    institution: signer.address
                })
            )
        );
        return credentialHash;
    });

    // Build Merkle tree
    const merkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });
    const merkleRoot = merkleTree.getHexRoot();

    console.log("Merkle Root:", merkleRoot);
    console.log("Tree Depth:", Math.ceil(Math.log2(leaves.length)));

    // Display sample credential hashes
    console.log("\nSample Credential Hashes:");
    credentials.slice(0, 2).forEach((cred, i) => {
        console.log(`  ${cred.id}: ${leaves[i].slice(0, 20)}...`);
    });

    console.log("\n📝 Anchoring credentials on blockchain...");

    try {
        // Anchor the batch
        const tx = await contract.anchorCredentialBatch(merkleRoot, credentials.length);
        console.log("Transaction hash:", tx.hash);
        console.log("⏳ Waiting for confirmation...");

        const receipt = await tx.wait();
        console.log("✅ Credentials anchored successfully!");
        console.log("Block number:", receipt?.blockNumber);
        console.log("Gas used:", receipt?.gasUsed.toString());

        // Verify the anchor
        console.log("\n🔍 Verifying anchor...");
        const info = await contract.merkleRoots(merkleRoot);
        console.log("Institution:", info.institution);
        console.log("Batch size:", info.batchSize.toString());
        console.log("Timestamp:", new Date(Number(info.timestamp) * 1000).toLocaleString());

        // Display total credentials anchored by this institution
        const instInfo = await contract.getInstitutionInfo(signer.address);
        console.log("\n📊 Institution Statistics:");
        console.log("Total credentials anchored:", instInfo.totalCredentials.toString());

        // Save Merkle proofs for verification (in real app, store in database)
        console.log("\n💾 Merkle Proofs (save these for verification):");
        credentials.forEach((cred, i) => {
            const proof = merkleTree.getHexProof(leaves[i]);
            console.log(`\n  ${cred.id}:`);
            console.log(`    Leaf: ${leaves[i]}`);
            console.log(`    Proof: [${proof.length} hashes]`);
        });

        console.log("\n✨ Complete! Credentials are now anchored on Polygon Amoy.");
        console.log(`\n🔗 View on PolygonScan:`);
        console.log(`   https://amoy.polygonscan.com/tx/${tx.hash}`);

    } catch (error: any) {
        console.error("\n❌ Error anchoring credentials:", error.message);

        if (error.message.includes("Merkle root already anchored")) {
            console.log("\nThis batch has already been anchored.");
            console.log("Create a new batch with different credentials.");
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
