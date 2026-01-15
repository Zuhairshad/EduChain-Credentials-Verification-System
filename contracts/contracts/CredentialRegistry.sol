// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "./interfaces/ICredentialRegistry.sol";

/**
 * @title CredentialRegistry
 * @notice Main registry contract for EduChain-VC credential anchoring and verification
 * @dev Implements upgradeable pattern with UUPS proxy for future improvements
 */
contract CredentialRegistry is 
    Initializable,
    AccessControlUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    ICredentialRegistry
{
    /// @notice Role identifier for authorized institutions
    bytes32 public constant INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE");

    /// @notice Role identifier for admin functions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /// @notice Struct to store Merkle root information
    struct MerkleRootInfo {
        address institution;      // Institution that anchored this batch
        uint256 batchSize;        // Number of credentials in batch
        uint256 timestamp;        // When the batch was anchored
        bool exists;              // Flag to check if root exists
    }

    /// @notice Struct to store institution information
    struct InstitutionInfo {
        string name;              // Institution name
        bool active;              // Whether institution is active
        uint256 registeredDate;   // Registration timestamp
        uint256 totalCredentials; // Total credentials issued
    }

    /// @notice Mapping of Merkle roots to their information
    mapping(bytes32 => MerkleRootInfo) public merkleRoots;

    /// @notice Mapping of credential IDs to revocation status
    mapping(bytes32 => bool) public revokedCredentials;

    /// @notice Mapping of credential IDs to revocation timestamp
    mapping(bytes32 => uint256) public revocationTimestamps;

    /// @notice Mapping of institution addresses to their information
    mapping(address => InstitutionInfo) public institutions;

    /// @notice Total number of credentials anchored
    uint256 public totalCredentialsAnchored;

    /// @notice Total number of active institutions
    uint256 public totalInstitutions;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize the contract
     * @param admin Address to be granted admin role
     */
    function initialize(address admin) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();

        require(admin != address(0), "Admin cannot be zero address");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
    }

    /**
     * @notice Add a new institution
     * @param institution Address of the institution
     * @param name Name of the institution
     */
    function addInstitution(address institution, string calldata name) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(institution != address(0), "Institution cannot be zero address");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(!hasRole(INSTITUTION_ROLE, institution), "Institution already exists");

        _grantRole(INSTITUTION_ROLE, institution);
        
        institutions[institution] = InstitutionInfo({
            name: name,
            active: true,
            registeredDate: block.timestamp,
            totalCredentials: 0
        });

        totalInstitutions++;

        emit InstitutionAdded(institution, name, block.timestamp);
    }

    /**
     * @notice Remove an institution
     * @param institution Address of the institution to remove
     */
    function removeInstitution(address institution) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(hasRole(INSTITUTION_ROLE, institution), "Institution does not exist");

        _revokeRole(INSTITUTION_ROLE, institution);
        institutions[institution].active = false;
        
        if (totalInstitutions > 0) {
            totalInstitutions--;
        }

        emit InstitutionRemoved(institution, block.timestamp);
    }

    /**
     * @notice Anchor a batch of credentials using Merkle root
     * @param merkleRoot The root hash of the Merkle tree
     * @param batchSize Number of credentials in the batch
     */
    function anchorCredentialBatch(bytes32 merkleRoot, uint256 batchSize)
        external
        override
        onlyRole(INSTITUTION_ROLE)
        nonReentrant
    {
        require(merkleRoot != bytes32(0), "Merkle root cannot be zero");
        require(batchSize > 0, "Batch size must be greater than zero");
        require(!merkleRoots[merkleRoot].exists, "Merkle root already anchored");

        merkleRoots[merkleRoot] = MerkleRootInfo({
            institution: msg.sender,
            batchSize: batchSize,
            timestamp: block.timestamp,
            exists: true
        });

        institutions[msg.sender].totalCredentials += batchSize;
        totalCredentialsAnchored += batchSize;

        emit CredentialBatchAnchored(merkleRoot, msg.sender, batchSize, block.timestamp);
    }

    /**
     * @notice Revoke a specific credential
     * @param credentialId The unique identifier of the credential
     * @param reason The reason for revocation
     */
    function revokeCredential(bytes32 credentialId, string calldata reason)
        external
        override
        onlyRole(INSTITUTION_ROLE)
    {
        require(credentialId != bytes32(0), "Credential ID cannot be zero");
        require(!revokedCredentials[credentialId], "Credential already revoked");
        require(bytes(reason).length > 0, "Reason cannot be empty");

        revokedCredentials[credentialId] = true;
        revocationTimestamps[credentialId] = block.timestamp;

        emit CredentialRevoked(credentialId, msg.sender, reason, block.timestamp);
    }

    /**
     * @notice Check if a credential has been revoked
     * @param credentialId The unique identifier of the credential
     * @return bool True if revoked, false otherwise
     */
    function isRevoked(bytes32 credentialId) 
        external 
        view 
        override 
        returns (bool) 
    {
        return revokedCredentials[credentialId];
    }

    /**
     * @notice Get information about a Merkle root
     * @param merkleRoot The Merkle root to query
     * @return institution Address of the institution
     * @return batchSize Number of credentials in the batch
     * @return timestamp When the batch was anchored
     */
    function getMerkleRootInfo(bytes32 merkleRoot)
        external
        view
        override
        returns (
            address institution,
            uint256 batchSize,
            uint256 timestamp
        )
    {
        MerkleRootInfo memory info = merkleRoots[merkleRoot];
        require(info.exists, "Merkle root does not exist");
        
        return (info.institution, info.batchSize, info.timestamp);
    }

    /**
     * @notice Check if an address is an authorized institution
     * @param institution The address to check
     * @return bool True if authorized, false otherwise
     */
    function isInstitution(address institution) 
        external 
        view 
        override 
        returns (bool) 
    {
        return hasRole(INSTITUTION_ROLE, institution);
    }

    /**
     * @notice Get institution information
     * @param institution The address of the institution
     * @return name Institution name
     * @return active Whether the institution is active
     * @return registeredDate Registration timestamp
     * @return totalCredentials Total credentials issued
     */
    function getInstitutionInfo(address institution)
        external
        view
        returns (
            string memory name,
            bool active,
            uint256 registeredDate,
            uint256 totalCredentials
        )
    {
        InstitutionInfo memory info = institutions[institution];
        return (info.name, info.active, info.registeredDate, info.totalCredentials);
    }

    /**
     * @notice Batch check revocation status for multiple credentials
     * @param credentialIds Array of credential IDs to check
     * @return statuses Array of revocation statuses (true if revoked)
     */
    function batchCheckRevocation(bytes32[] calldata credentialIds)
        external
        view
        returns (bool[] memory statuses)
    {
        statuses = new bool[](credentialIds.length);
        for (uint256 i = 0; i < credentialIds.length; i++) {
            statuses[i] = revokedCredentials[credentialIds[i]];
        }
        return statuses;
    }

    /**
     * @notice Get revocation timestamp for a credential
     * @param credentialId The credential ID to query
     * @return timestamp The revocation timestamp (0 if not revoked)
     */
    function getRevocationTimestamp(bytes32 credentialId)
        external
        view
        returns (uint256)
    {
        return revocationTimestamps[credentialId];
    }

    /**
     * @notice Required override for UUPS upgrades
     * @param newImplementation Address of the new implementation
     */
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(ADMIN_ROLE)
    {}

    /**
     * @notice Get contract version
     * @return version Version string
     */
    function version() external pure returns (string memory) {
        return "1.0.0";
    }
}
