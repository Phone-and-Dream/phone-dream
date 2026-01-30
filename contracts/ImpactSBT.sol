// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
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

contract ImpactSBT is ERC721, Ownable, IERC5192, ReentrancyGuard {
    using Strings for uint256;

    uint256 private _tokenIdCounter;

    // Minting fee (~$2 in AVAX, adjustable by owner)
    uint256 public mintFee = 0.01 ether;
    
    // Platform treasury to receive fees
    address public feeRecipient;

    // Funding types
    enum FundingType { PhysicalDevice, ImpactPool }
    
    // Minter types
    enum MinterType { Donor, Recipient }

    // Metadata for each impact badge
    struct ImpactData {
        string deviceId;
        string deviceType;
        FundingType fundingType;
        MinterType minterType;
        string donorId;
        string recipientId;
        string recipientCareer;
        string region;
        uint256 handoverTimestamp;
        uint256 mintTimestamp;
    }

    // Mapping from token ID to impact data
    mapping(uint256 => ImpactData) public impactData;
    
    // Track mints per device per user to prevent duplicates
    mapping(bytes32 => bool) public hasMinted;

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
    
    event MintFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address oldRecipient, address newRecipient);
    event FeesWithdrawn(address indexed recipient, uint256 amount);

    constructor(address _feeRecipient) ERC721("A Phone and A Dream Impact Badge", "IMPACT") Ownable(msg.sender) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Mints a new Impact Badge for a donor
     * @param deviceId Unique device identifier from backend
     * @param deviceType Type of device (Laptop, Phone, etc.)
     * @param fundingType Whether physical device or impact pool funded
     * @param recipientId Off-chain recipient identifier
     * @param recipientCareer Recipient's career at time of handover
     * @param region Geographic region of impact
     * @param handoverTimestamp When the device was handed over
     * @return tokenId The ID of the newly minted token
     */
    function mintDonorBadge(
        string memory deviceId,
        string memory deviceType,
        FundingType fundingType,
        string memory donorId,
        string memory recipientId,
        string memory recipientCareer,
        string memory region,
        uint256 handoverTimestamp
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= mintFee, "Insufficient mint fee");
        
        // Check if this user already minted for this device
        bytes32 mintKey = keccak256(abi.encodePacked(deviceId, msg.sender));
        require(!hasMinted[mintKey], "Already minted for this device");
        
        uint256 tokenId = _mintBadge(
            deviceId,
            deviceType,
            fundingType,
            MinterType.Donor,
            donorId,
            recipientId,
            recipientCareer,
            region,
            handoverTimestamp
        );
        
        hasMinted[mintKey] = true;
        
        // Transfer fee to recipient
        _transferFee();
        
        return tokenId;
    }

    /**
     * @dev Mints a new Impact Badge for a recipient
     */
    function mintRecipientBadge(
        string memory deviceId,
        string memory deviceType,
        FundingType fundingType,
        string memory donorId,
        string memory recipientId,
        string memory recipientCareer,
        string memory region,
        uint256 handoverTimestamp
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= mintFee, "Insufficient mint fee");
        
        // Check if this user already minted for this device
        bytes32 mintKey = keccak256(abi.encodePacked(deviceId, msg.sender));
        require(!hasMinted[mintKey], "Already minted for this device");
        
        uint256 tokenId = _mintBadge(
            deviceId,
            deviceType,
            fundingType,
            MinterType.Recipient,
            donorId,
            recipientId,
            recipientCareer,
            region,
            handoverTimestamp
        );
        
        hasMinted[mintKey] = true;
        
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
        string memory region,
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
            region: region,
            handoverTimestamp: handoverTimestamp,
            mintTimestamp: block.timestamp
        });

        // Mint to the caller (soulbound to them)
        _mint(msg.sender, tokenId);

        // Emit ERC-5192 Locked event (token is soulbound from mint)
        emit Locked(tokenId);
        
        emit ImpactBadgeMinted(tokenId, msg.sender, minterType, deviceId, fundingType);

        return tokenId;
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
        require(newRecipient != address(0), "Invalid recipient");
        address oldRecipient = feeRecipient;
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(oldRecipient, newRecipient);
    }

    /**
     * @dev Withdraw any stuck funds (emergency only)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        (bool success, ) = payable(feeRecipient).call{value: balance}("");
        require(success, "Withdrawal failed");
        emit FeesWithdrawn(feeRecipient, balance);
    }

    /**
     * @dev Check if a user has already minted for a specific device
     */
    function hasUserMintedForDevice(string memory deviceId, address user) external view returns (bool) {
        bytes32 mintKey = keccak256(abi.encodePacked(deviceId, user));
        return hasMinted[mintKey];
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
        string memory fundingTypeStr = data.fundingType == FundingType.ImpactPool ? "Impact Pool" : "Physical Device";
        string memory minterTypeStr = data.minterType == MinterType.Donor ? "Donor" : "Recipient";

        string memory json = string(
            abi.encodePacked(
                '{"name":"Impact Badge #',
                tokenId.toString(),
                '","description":"Soulbound proof of device impact on ',
                PLATFORM,
                '","image":"data:image/svg+xml;base64,',
                svgBase64,
                '","attributes":[',
                '{"trait_type":"Device Type","value":"',
                data.deviceType,
                '"},',
                '{"trait_type":"Funding Type","value":"',
                fundingTypeStr,
                '"},',
                '{"trait_type":"Minter Type","value":"',
                minterTypeStr,
                '"},',
                '{"trait_type":"Recipient Career","value":"',
                data.recipientCareer,
                '"},',
                '{"trait_type":"Region","value":"',
                data.region,
                '"},',
                '{"display_type":"date","trait_type":"Handover Date","value":',
                data.handoverTimestamp.toString(),
                '},',
                '{"display_type":"date","trait_type":"Mint Date","value":',
                data.mintTimestamp.toString(),
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
        string memory fundingLabel = data.fundingType == FundingType.ImpactPool 
            ? "Powered by Community" 
            : "Direct Donation";
        
        string memory minterLabel = data.minterType == MinterType.Donor 
            ? "DONOR BADGE" 
            : "RECIPIENT BADGE";

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
                '<text x="200" y="50" text-anchor="middle" fill="white" font-size="14" font-weight="bold">IMPACT BADGE #',
                tokenId.toString(),
                '</text>',
                '<text x="200" y="75" text-anchor="middle" fill="white" font-size="10" opacity="0.8">',
                minterLabel,
                '</text>',
                '<circle cx="200" cy="180" r="70" fill="white" opacity="0.1"/>',
                '<text x="200" y="195" text-anchor="middle" font-size="48">',
                getDeviceEmoji(data.deviceType),
                '</text>',
                '<text x="200" y="280" text-anchor="middle" fill="white" font-size="18" font-weight="bold">',
                data.deviceType,
                '</text>',
                '<text x="200" y="310" text-anchor="middle" fill="white" font-size="12" opacity="0.9">',
                fundingLabel,
                '</text>',
                '<text x="200" y="350" text-anchor="middle" fill="white" font-size="11" opacity="0.8">Career: ',
                data.recipientCareer,
                '</text>',
                '<text x="200" y="380" text-anchor="middle" fill="white" font-size="10" opacity="0.7">',
                data.region,
                '</text>',
                '<text x="200" y="460" text-anchor="middle" fill="white" font-size="10" opacity="0.6">A Phone and A Dream</text>',
                '<text x="200" y="480" text-anchor="middle" fill="white" font-size="8" opacity="0.4">Avalanche C-Chain | Soulbound</text>',
                '</svg>'
            )
        );
    }

    /**
     * @dev Returns an emoji based on device type
     */
    function getDeviceEmoji(string memory deviceType) internal pure returns (string memory) {
        bytes32 deviceHash = keccak256(bytes(deviceType));
        
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
