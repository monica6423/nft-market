// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

/// @title Contract (non-fungible ERC721).
contract Nft is ERC721URIStorage {
  using Counters for Counters.Counter;
  Counters.Counter private _itemIds;
  /// @notice Marketplace contract address
  address marketAddress;

  /// @notice The marketplace address is set during contract creation and cannot be updated later.
  /// In order to migrate to a new version, a new (NFT) contract will need to be created alongside
  /// a new marketplace contract.
  /// @param _marketAddress Marketplace contract address
  constructor(address _marketAddress) ERC721('NFT Token', 'NFT') {
    /// @notice The marketplace address is set
    marketAddress = _marketAddress;
  }

  /// @param tokenURI The URI (e.g. IPFS) for the item metadata
  function createToken(string memory tokenURI) public returns (uint256) {
    _itemIds.increment();
    uint256 newItemId = _itemIds.current();

    _mint(msg.sender, newItemId);
    _setTokenURI(newItemId, tokenURI);
    setApprovalForAll(marketAddress, true);
    return newItemId;
  }

  /// @notice Returns the total supply
  function totalSupply() external view returns (uint256) {
    uint256 itemCount = _itemIds.current();
    return itemCount;
  }
}
