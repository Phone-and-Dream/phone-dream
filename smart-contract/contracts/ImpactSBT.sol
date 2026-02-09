// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ImpactSBT
 * @dev Soulbound Token (ERC-5192) for A Phone and A Dream impact verification
 * 
 * This contract implements non-transferable tokens that serve as permanent
 * proof of device donations. Each token is permanently bound to the minter's
 * address and cannot be transferred.
 * 
 * Network: Avalanche C-Chain (Testnet: Fuji, Mainnet: C-Chain)
 * Standard: ERC-721 + ERC-5192 (Minimal Soulbound NFTs)
 * 
 * V2 Changes:
 * - Users mint their own badges (no onlyOwner restriction)
 * - Minting fee of ~$2 AVAX to cover platform costs
 * - Separate functions for donor and recipient mints
 * - Added funding_type to track physical vs impact pool devices
 */

// ERC-5192 Interface for Soulbound Tokens
interface IERC5192 {
    event Locked(uint256 tokenId);
    event Unlocked(uint256 tokenId);
    function locked(uint256 tokenId) external view returns (bool);
}

contract ImpactSBT is ERC721URIStorage, Ownable, IERC5192, ReentrancyGuard {
    using Strings for uint256;

    uint256 private _tokenIdCounter;

    // Minting fee (~$2 in AVAX, adjustable by owner)
    uint256 public mintFee = 0.01 ether;

    // Platform treasury to receive fees
    address public feeRecipient;
    address private authorizedAddress;

    // Funding types
    enum FundingType {
        PhysicalDevice,
        ImpactPool
    }

    // Minter types
    enum MinterType {
        Donor,
        Recipient
    }

    // Metadata for each impact badge
    struct ImpactData {
        string deviceId;
        string deviceType;
        FundingType fundingType;
        MinterType minterType;
        string donorId;
        string recipientId;
        string recipientCareer;
        string country;
        uint256 handoverTimestamp;
        uint256 mintTimestamp;
    }

    // Mapping from token ID to impact data
    mapping(uint256 => ImpactData) public impactData;

    // Track mints per device per userId to prevent duplicates
    mapping(bytes32 => bool) public hasUserMinted;

    mapping(bytes32 => bool) public allowedToMint;

    // Platform name
    string public constant PLATFORM = "A Phone and A Dream";

    // Events
    event ImpactBadgeMinted(
        uint256 indexed tokenId,
        address indexed minter,
        MinterType minterType,
        string deviceId,
        FundingType fundingType
    );

    error AlreadyAllowedToMint();
    error CannotTransferSoulboundNFT();
    error FailedToWithdrawFees();
    error InvalidFeeRecipient();
    error InvalidTokenId(uint256 tokenId);
    error NotAllowedToMint();
    error NoFeesToWithdraw();
    error OnlyAuthorizedAddressCanCallThis();
    error SendRequiredAmount();
    error UserAlreadyAllowedToMint();
    error UserAlreadyMinted();
    error WalletAlreadyHasImpactSBT();

    event FeeRecipientUpdated(address oldRecipient, address newRecipient);
    event FeesWithdrawn(address indexed recipient, uint256 amount);
    event UserAllowedToMint(string message);
    event MintFeeUpdated(uint256 oldFee, uint256 newFee);

    constructor(
        address _feeRecipient,
        address _authorizedAddress
    ) ERC721("A Phone and A Dream Impact Badge", "IMPACT") Ownable(msg.sender) {
        if (_feeRecipient == address(0)) revert InvalidFeeRecipient();
        feeRecipient = _feeRecipient;
        authorizedAddress = _authorizedAddress;
    }

    /**
     * @dev Mints a new Impact Badge for a donor
     * @param deviceId Unique device identifier from backend
     * @param deviceType Type of device (Laptop, Phone, etc.)
     * @param fundingType Whether physical device or impact pool funded
     * @param recipientId Off-chain recipient identifier
     * @param recipientCareer Recipient's career at time of handover
     * @param country country of impact
     * @param handoverTimestamp When the device was handed over
     * @return tokenId The ID of the newly minted token
     */
    function mintDonorBadge(
        string memory metadataURI,
        string memory deviceId,
        string memory deviceType,
        FundingType fundingType,
        string memory donorId,
        string memory recipientId,
        string memory recipientCareer,
        string memory country,
        uint256 handoverTimestamp
    ) external payable nonReentrant returns (uint256) {
        if (msg.value < mintFee) revert SendRequiredAmount();

        // Check if this user already minted for this device
        bytes32 userIdMintKey = keccak256(abi.encodePacked(deviceId, recipientId));

        if (!allowedToMint[userIdMintKey]) revert NotAllowedToMint();

        if (hasUserMinted[userIdMintKey]) revert UserAlreadyMinted();

        uint256 tokenId = _mintBadge(
            deviceId,
            deviceType,
            fundingType,
            MinterType.Donor,
            donorId,
            recipientId,
            recipientCareer,
            country,
            handoverTimestamp
        );

        hasUserMinted[userIdMintKey] = true;

        _setTokenURI(tokenId, metadataURI);

        // Transfer fee to recipient
        _transferFee();

        return tokenId;
    }

    /**
     * @dev Mints a new Impact Badge for a recipient
     */
    function mintRecipientBadge(
        string memory metadataURI,
        string memory deviceId,
        string memory deviceType,
        FundingType fundingType,
        string memory donorId,
        string memory recipientId,
        string memory recipientCareer,
        string memory country,
        uint256 handoverTimestamp
    ) external payable nonReentrant returns (uint256) {
        if (msg.value < mintFee) revert SendRequiredAmount();

        // Check if this user already minted for this device
        bytes32 userIdMintKey = keccak256(abi.encodePacked(deviceId, recipientId));

        if (hasUserMinted[userIdMintKey]) revert UserAlreadyMinted();

        uint256 tokenId = _mintBadge(
            deviceId,
            deviceType,
            fundingType,
            MinterType.Recipient,
            donorId,
            recipientId,
            recipientCareer,
            country,
            handoverTimestamp
        );

        hasUserMinted[userIdMintKey] = true;

        _setTokenURI(tokenId, metadataURI);

        // Transfer fee to recipient
        _transferFee();

        return tokenId;
    }

    /**
     * @dev Internal function to mint badge
     */
    function _mintBadge(
        string memory deviceId,
        string memory deviceType,
        FundingType fundingType,
        MinterType minterType,
        string memory donorId,
        string memory recipientId,
        string memory recipientCareer,
        string memory country,
        uint256 handoverTimestamp
    ) internal returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        // Store impact data
        impactData[tokenId] = ImpactData({
            deviceId: deviceId,
            deviceType: deviceType,
            fundingType: fundingType,
            minterType: minterType,
            donorId: donorId,
            recipientId: recipientId,
            recipientCareer: recipientCareer,
            country: country,
            handoverTimestamp: handoverTimestamp,
            mintTimestamp: block.timestamp
        });

        // Mint to the caller (soulbound to them)
        _safeMint(msg.sender, tokenId);

        // Emit ERC-5192 Locked event (token is soulbound from mint)
        emit Locked(tokenId);

        emit ImpactBadgeMinted(
            tokenId,
            msg.sender,
            minterType,
            deviceId,
            fundingType
        );

        return tokenId;
    }

    function allowUserToMint(
        string memory deviceId,
        string memory userId
    ) external onlyAuthorizedAddress {
        bytes32 userIdMintKey = keccak256(abi.encodePacked(deviceId, userId));

        if (hasUserMinted[userIdMintKey]) revert UserAlreadyMinted();
        if (allowedToMint[userIdMintKey]) revert UserAlreadyAllowedToMint();

        allowedToMint[userIdMintKey] = true;

        emit UserAllowedToMint("user has been allowed to mint");
    }

    /**
     * @dev Transfer collected fees to fee recipient
     */
    function _transferFee() internal {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            (bool success, ) = payable(feeRecipient).call{value: balance}("");
            require(success, "Fee transfer failed");
        }
    }

    /**
     * @dev Owner can update mint fee
     */
    function setMintFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = mintFee;
        mintFee = newFee;
        emit MintFeeUpdated(oldFee, newFee);
    }

    /**
     * @dev Owner can update fee recipient
     */
    function setFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient != address(0)) revert InvalidFeeRecipient();

        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;

        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }

    /**
     * @dev Withdraw any stuck funds (emergency only)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance == 0) revert NoFeesToWithdraw();

        (bool success, ) = payable(feeRecipient).call{value: balance}("");
        if (!success) revert FailedToWithdrawFees();

        emit FeesWithdrawn(feeRecipient, balance);
    }

    /**
     * @dev Check if a user has already minted for a specific device
     */
    function hasUserMintedForDevice(
        string memory deviceId,
        string memory userId
    ) external view returns (bool) {
        bytes32 mintKey = keccak256(abi.encodePacked(deviceId, userId));
        return hasUserMinted[mintKey];
    }

    /**
     * @dev Check if a user has already minted for a specific device
     */
    function hasUserBeenAllowedToMint(
        string memory deviceId,
        string memory userId
    ) external view returns (bool) {
        bytes32 mintKey = keccak256(abi.encodePacked(deviceId, userId));
        return allowedToMint[mintKey];
    }

    /**
     * @dev Override transferFrom to prevent transfers (soulbound)
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);

        // Allow mint (from == 0) and burn (to == 0)
        if (from != address(0) && to != address(0)) {
            revert CannotTransferSoulboundNFT();
        }

        return super._update(to, tokenId, auth);
    }

    modifier onlyAuthorizedAddress() {
        if (msg.sender != authorizedAddress)
            revert OnlyAuthorizedAddressCanCallThis();
        _;
    }

    /**
     * @dev Returns impact data for a token
     */
    function getImpactData(
        uint256 tokenId
    ) external view returns (ImpactData memory) {
        if (ownerOf(tokenId) != address(0)) revert InvalidTokenId(tokenId);
        return impactData[tokenId];
    }

    function locked(uint256 tokenId) external view override returns (bool) {}
}
