// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ICredentialRegistry
 * @notice Interface for the EduChain-VC Credential Registry
 * @dev Standard interface for credential anchoring and verification
 */
interface ICredentialRegistry {
    /// @notice Emitted when a batch of credentials is anchored
    event CredentialBatchAnchored(
        bytes32 indexed merkleRoot,
        address indexed institution,
        uint256 batchSize,
        uint256 timestamp
    );

    /// @notice Emitted when a credential is revoked
    event CredentialRevoked(
        bytes32 indexed credentialId,
        address indexed institution,
        string reason,
        uint256 timestamp
    );

    /// @notice Emitted when an institution is added
    event InstitutionAdded(
        address indexed institution,
        string name,
        uint256 timestamp
    );

    /// @notice Emitted when an institution is removed
    event InstitutionRemoved(
        address indexed institution,
        uint256 timestamp
    );

    /**
     * @notice Anchor a batch of credentials using Merkle root
     * @param merkleRoot The root hash of the Merkle tree containing credential IDs
     * @param batchSize Number of credentials in the batch
     */
    function anchorCredentialBatch(bytes32 merkleRoot, uint256 batchSize) external;

    /**
     * @notice Revoke a specific credential
     * @param credentialId The unique identifier of the credential to revoke
     * @param reason The reason for revocation
     */
    function revokeCredential(bytes32 credentialId, string calldata reason) external;

    /**
     * @notice Check if a credential has been revoked
     * @param credentialId The unique identifier of the credential
     * @return bool True if the credential is revoked, false otherwise
     */
    function isRevoked(bytes32 credentialId) external view returns (bool);

    /**
     * @notice Get information about a Merkle root anchor
     * @param merkleRoot The Merkle root to query
     * @return institution Address of the institution that anchored the batch
     * @return batchSize Number of credentials in the batch
     * @return timestamp When the batch was anchored
     */
    function getMerkleRootInfo(bytes32 merkleRoot) 
        external 
        view 
        returns (
            address institution,
            uint256 batchSize,
            uint256 timestamp
        );

    /**
     * @notice Check if an address is an authorized institution
     * @param institution The address to check
     * @return bool True if the address is an authorized institution
     */
    function isInstitution(address institution) external view returns (bool);
}
