import { expect } from "chai";
import { ethers } from "hardhat";
import { CredentialRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("CredentialRegistry - Basic Tests", function () {
    let credentialRegistry: CredentialRegistry;
    let admin: SignerWithAddress;

    beforeEach(async function () {
        [admin] = await ethers.getSigners();
        const CredentialRegistryFactory = await ethers.getContractFactory("CredentialRegistry");
        credentialRegistry = await CredentialRegistryFactory.deploy();
        await credentialRegistry.waitForDeployment();
    });

    it("Should deploy successfully", async function () {
        const address = await credentialRegistry.getAddress();
        expect(address).to.properAddress;
    });

    it("Should have correct version", async function () {
        expect(await credentialRegistry.version()).to.equal("1.0.0");
    });

    it("Should start with zero credentials", async function () {
        expect(await credentialRegistry.totalCredentialsAnchored()).to.equal(0);
    });

    it("Should start with zero institutions", async function () {
        expect(await credentialRegistry.totalInstitutions()).to.equal(0);
    });

    it("Should not allow initialization due to UUPS pattern", async function () {
        await expect(
            credentialRegistry.initialize(admin.address)
        ).to.be.revertedWithCustomError(credentialRegistry, "InvalidInitialization");
    });
});
