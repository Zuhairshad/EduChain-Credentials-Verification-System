import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CredentialRegistryModule = buildModule("CredentialRegistryModule", (m) => {
    // Get admin address from parameters or use deployer
    const adminAddress = m.getParameter("adminAddress", process.env.ADMIN_ADDRESS);

    // Deploy the CredentialRegistry contract
    const credentialRegistry = m.contract("CredentialRegistry", [], {});

    // Initialize the contract with admin address
    m.call(credentialRegistry, "initialize", [adminAddress]);

    return { credentialRegistry };
});

export default CredentialRegistryModule;
