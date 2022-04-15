// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";


contract HereBeforeToken is ERC721Enumerable, Ownable {
    using SafeMath for uint256;

    string private baseURI = "https://herebefore100k.azurewebsites.net/api/token/";
    string private _contractURI = "https://herebefore100k.azurewebsites.net/api/contract/";

    bool public mintActive = false;
    uint64 private countTokens = 50001;
    uint256 public price = 0.02 ether;
    uint256 public specialPrice = 0.1 ether;
    address artist;
    address dev;

    mapping(uint256 => uint256) updatedValues;

    constructor(address _artist, address _dev) ERC721("Here Before 100K", "HB100K") {
        artist = _artist;
        dev = _dev;
    }

    function mint(uint numberOfTokens) public payable {
        require(mintActive, "Mint is not active.");
        require(tx.origin == msg.sender, "You can't call the contract from another contract.");
        require(numberOfTokens > 0 && numberOfTokens <= 10, "Number of tokens is out of range.");
        require(numberOfTokens <= countTokens, "There are no so many tokens.");
        require(msg.value >= price.mul(numberOfTokens), "Not enough eth.");

        for (uint i = 0; i < numberOfTokens; i++) {
            uint256 randTokenId = _updateUsedTokendIds(_getRandomNumber(countTokens - 1, 0));
            _safeMint(msg.sender, randTokenId);
        }
    }

    function mintSpecial(uint256 specialTokenId) public payable {
        require(mintActive == true, "Mint is not active.");
        require(tx.origin == msg.sender, "You can't call the contract from another contract.");
        require(msg.value >= specialPrice, "Not enough eth");
        require(!_exists(specialTokenId), "Token with this number already exists.");
        require(specialTokenId >= 50000 && specialTokenId <= 100000, "Number is out of range.");
        
        require(specialTokenId != 55555 
            && specialTokenId != 62871
            && specialTokenId != 66666
            && specialTokenId != 69969
            && specialTokenId != 77777
            && specialTokenId != 88888
            && specialTokenId != 99999
            && specialTokenId != 100000, "This number is reserved for random minting.");

        _updateUsedTokendIds(specialTokenId);
        _safeMint(msg.sender, specialTokenId);
    }


    function _updateUsedTokendIds(uint256 specialTokenId) private returns (uint256) {
        uint256 tokenId = specialTokenId;

        if (updatedValues[specialTokenId] != 0) 
            tokenId = updatedValues[specialTokenId];

        if (updatedValues[countTokens] != 0)
            updatedValues[specialTokenId] = updatedValues[countTokens];
        else 
            updatedValues[specialTokenId] = countTokens;

        countTokens -= 1;
        return (tokenId + 50000);
    }

    function _getRandomNumber(uint64 maxNumber, uint nounce) private view returns (uint256) {
        uint256 random = uint256(
            keccak256(
                abi.encodePacked(
                    maxNumber,
                    blockhash(block.number - 1),
                    block.coinbase,
                    block.difficulty,
                    msg.sender,
                    nounce
                )
            )
        );

        return random % maxNumber;
    }

    function setBaseURI(string memory _newBaseURI) external onlyOwner() {
        baseURI = _newBaseURI;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function contractURI() public view returns (string memory) {
        return _contractURI;
    }
    
    function setContractURI(string memory _newURI) external onlyOwner() {
        _contractURI = _newURI;
    }

    function setMintActive(bool _mintActive) public onlyOwner {
        mintActive = _mintActive;
    }

    function setNewPrice(uint256 newPrice) public onlyOwner {
        price = newPrice;
    }

    function setNewSpecialtyPrice(uint256 newPrice) public onlyOwner {
        specialPrice = newPrice;
    }

    function reward(uint rewardId) public onlyOwner {
        uint64 totalMinted = 50001 - countTokens;
        uint mintRequirement = 0;
        uint rewardAmount = 0 ether;
        uint winners = 0;

        if(rewardId == 1) {
            mintRequirement = 100;
            rewardAmount = 1 ether;
            winners = 1;
        } else if(rewardId == 2) {
            mintRequirement = 500;
            rewardAmount = 2 ether;
            winners = 1;
        } else if(rewardId == 3) {
            mintRequirement = 1000;
            rewardAmount = 3 ether;
            winners = 1;
        } else if(rewardId == 4) {
            mintRequirement = 500;
            rewardAmount = 3 ether;
            winners = 2;
        } else if(rewardId == 5) {
            mintRequirement = 10000;
            rewardAmount = 4 ether;
            winners = 2;
        } else if(rewardId == 6) {
            mintRequirement = 30000;
            rewardAmount = 5 ether;
            winners = 2;
        } else if(rewardId == 7) {
            mintRequirement = 50000;
            rewardAmount = 1 ether;
            winners = 10;
        }

        require(totalMinted >= mintRequirement, 'Not enough tokens minted yet.');
        for(uint i = 0; i < winners; i++) {
            uint randomTokenId = tokenByIndex(_getRandomNumber(totalMinted, i));
            address tokenOwner = ownerOf(randomTokenId);
            payable(tokenOwner).transfer(rewardAmount);
        }
        if(rewardId == 7) {
            uint randomTokenId = tokenByIndex(_getRandomNumber(totalMinted, 100));
            address tokenOwner = ownerOf(randomTokenId);
            payable(tokenOwner).transfer(10 ether);
        }
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        uint256 artistCut = balance.div(100).mul(9);
        uint256 devCut = balance.div(100).mul(5);
        payable(artist).transfer(artistCut);
        payable(dev).transfer(devCut);

        balance = balance - artistCut - devCut;
        payable(msg.sender).transfer(balance);
    }
}