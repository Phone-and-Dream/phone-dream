// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ImpactSBT
 * @dev Soulbound Token (ERC-5192) for A Phone and A Dream impact verification
 * 
 * This contract implements non-transferable tokens that serve as permanent
 * proof of device donations. Each token is permanently bound to the recipient's
 * address and cannot be transferred.
 * 
 * Network: Avalanche C-Chain
 * Standard: ERC-721 + ERC-5192 (Minimal Soulbound NFTs)
 */

// ERC-5192 Interface for Soulbound Tokens
interface IERC5192 {
    /// @notice Emitted when the locking status is changed to locked.
    /// @dev If a token is minted and the status is locked, this event should be emitted.
    /// @param tokenId The identifier for a token.
    event Locked(uint256 tokenId);

    /// @notice Emitted when the locking status is changed to unlocked.
    /// @dev If a token is minted and the status is unlocked, this event should be emitted.
    /// @param tokenId The identifier for a token.
    event Unlocked(uint256 tokenId);

    /// @notice Returns the locking status of an Soulbound Token
    /// @dev SBTs assigned to zero address are considered invalid, and queries
    /// about them do throw.
    /// @param tokenId The identifier for an SBT.
    function locked(uint256 tokenId) external view returns (bool);
}

contract ImpactSBT is ERC721, Ownable, IERC5192 {
    using Strings for uint256;

    uint256 private _tokenIdCounter;

    // Metadata for each impact badge
    struct ImpactData {
        string donorId;
        string recipientId;
        string deviceType;
        string condition;
        string donationId;
        string region;
        uint256 timestamp;
        address donorAddress;
        address recipientAddress;
    }

    // Mapping from token ID to impact data
    mapping(uint256 => ImpactData) public impactData;

    // Platform name
    string public constant PLATFORM = "A Phone and A Dream";

    // Events
    event ImpactBadgeMinted(
        uint256 indexed tokenId,
        address indexed donor,
        address indexed recipient,
        string donationId
    );

    constructor() ERC721("A Phone and A Dream Impact Badge", "IMPACT") Ownable(msg.sender) {}

    /**
     * @dev Mints a new Impact Badge (Soulbound Token)
     * @param donor Address of the donor
     * @param recipient Address of the recipient
     * @param donorId Off-chain donor identifier
     * @param recipientId Off-chain recipient identifier
     * @param deviceType Type of device donated
     * @param condition Condition of the device (new/used/refurbished)
     * @param donationId Off-chain donation identifier
     * @param region Geographic region of impact
     * @return tokenId The ID of the newly minted token
     */
    function mintImpactBadge(
        address donor,
        address recipient,
        string memory donorId,
        string memory recipientId,
        string memory deviceType,
        string memory condition,
        string memory donationId,
        string memory region
    ) external onlyOwner returns (uint256) {
        require(recipient != address(0), "Invalid recipient address");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        // Store impact data
        impactData[tokenId] = ImpactData({
            donorId: donorId,
            recipientId: recipientId,
            deviceType: deviceType,
            condition: condition,
            donationId: donationId,
            region: region,
            timestamp: block.timestamp,
            donorAddress: donor,
            recipientAddress: recipient
        });

        // Mint to recipient (the token is bound to them)
        _mint(recipient, tokenId);

        // Emit ERC-5192 Locked event (token is soulbound from mint)
        emit Locked(tokenId);
        
        emit ImpactBadgeMinted(tokenId, donor, recipient, donationId);

        return tokenId;
    }

    /**
     * @dev ERC-5192: Returns true for all tokens (always locked/soulbound)
     */
    function locked(uint256 tokenId) external view override returns (bool) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return true; // Always locked (soulbound)
    }

    /**
     * @dev Override transferFrom to prevent transfers (soulbound)
     */
    function transferFrom(address, address, uint256) public pure override(ERC721) {
        revert("ImpactSBT: Soulbound tokens cannot be transferred");
    }

    /**
     * @dev Override safeTransferFrom to prevent transfers (soulbound)
     */
    function safeTransferFrom(address, address, uint256, bytes memory) public pure override(ERC721) {
        revert("ImpactSBT: Soulbound tokens cannot be transferred");
    }

    /**
     * @dev Override approve to prevent approvals (soulbound)
     */
    function approve(address, uint256) public pure override(ERC721) {
        revert("ImpactSBT: Soulbound tokens cannot be approved");
    }

    /**
     * @dev Override setApprovalForAll to prevent approvals (soulbound)
     */
    function setApprovalForAll(address, bool) public pure override(ERC721) {
        revert("ImpactSBT: Soulbound tokens cannot be approved");
    }

    /**
     * @dev Returns the token URI with on-chain JSON metadata
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");

        ImpactData memory data = impactData[tokenId];

        // Generate SVG image
        string memory svg = generateSVG(tokenId, data);
        string memory svgBase64 = Base64.encode(bytes(svg));

        // Generate JSON metadata
        string memory json = string(
            abi.encodePacked(
                '{"name":"Impact Badge #',
                tokenId.toString(),
                '","description":"Soulbound proof of device donation on ',
                PLATFORM,
                '","image":"data:image/svg+xml;base64,',
                svgBase64,
                '","attributes":[',
                '{"trait_type":"Device Type","value":"',
                data.deviceType,
                '"},',
                '{"trait_type":"Condition","value":"',
                data.condition,
                '"},',
                '{"trait_type":"Region","value":"',
                data.region,
                '"},',
                '{"trait_type":"Impact Type","value":"Device Donation"},',
                '{"display_type":"date","trait_type":"Timestamp","value":',
                data.timestamp.toString(),
                '}',
                '],"properties":{"soulbound":true,"platform":"',
                PLATFORM,
                '"}}'
            )
        );

        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(bytes(json))
            )
        );
    }

    /**
     * @dev Generates an SVG badge image
     */
    function generateSVG(uint256 tokenId, ImpactData memory data) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500">',
                '<defs>',
                '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
                '<stop offset="0%" style="stop-color:#E84142"/>',
                '<stop offset="100%" style="stop-color:#8B1E3F"/>',
                '</linearGradient>',
                '</defs>',
                '<rect width="400" height="500" rx="20" fill="url(#bg)"/>',
                '<text x="200" y="60" text-anchor="middle" fill="white" font-size="16" font-weight="bold">IMPACT BADGE #',
                tokenId.toString(),
                '</text>',
                '<text x="200" y="100" text-anchor="middle" fill="white" font-size="12" opacity="0.8">SOULBOUND TOKEN</text>',
                '<circle cx="200" cy="200" r="70" fill="white" opacity="0.1"/>',
                '<text x="200" y="210" text-anchor="middle" font-size="48">',
                getDeviceEmoji(data.deviceType),
                '</text>',
                '<text x="200" y="300" text-anchor="middle" fill="white" font-size="18" font-weight="bold">',
                data.deviceType,
                '</text>',
                '<text x="200" y="330" text-anchor="middle" fill="white" font-size="14" opacity="0.9">',
                data.condition,
                '</text>',
                '<text x="200" y="380" text-anchor="middle" fill="white" font-size="12" opacity="0.7">',
                data.region,
                '</text>',
                '<text x="200" y="460" text-anchor="middle" fill="white" font-size="10" opacity="0.6">A Phone and A Dream</text>',
                '<text x="200" y="480" text-anchor="middle" fill="white" font-size="8" opacity="0.4">Avalanche C-Chain</text>',
                '</svg>'
            )
        );
    }

    /**
     * @dev Returns an emoji based on device type
     */
    function getDeviceEmoji(string memory deviceType) internal pure returns (string memory) {
        bytes32 deviceHash = keccak256(bytes(deviceType));
        
        // Simple matching - default to laptop emoji
        if (deviceHash == keccak256(bytes("iPhone")) || 
            deviceHash == keccak256(bytes("Phone")) ||
            deviceHash == keccak256(bytes("Smartphone"))) {
            return unicode"📱";
        }
        if (deviceHash == keccak256(bytes("iPad")) || 
            deviceHash == keccak256(bytes("Tablet"))) {
            return unicode"📱";
        }
        if (deviceHash == keccak256(bytes("PC")) || 
            deviceHash == keccak256(bytes("Desktop"))) {
            return unicode"🖥️";
        }
        
        return unicode"💻"; // Default laptop
    }

    /**
     * @dev Returns the total number of tokens minted
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @dev Returns impact data for a token
     */
    function getImpactData(uint256 tokenId) external view returns (ImpactData memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return impactData[tokenId];
    }

    /**
     * @dev ERC-165 interface detection
     */
    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return 
            interfaceId == type(IERC5192).interfaceId ||
            super.supportsInterface(interfaceId);
    }
}
