// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';

/// @title Contract for trading and leasing NFTs.
contract NftMarketplace is ReentrancyGuard {
  using Counters for Counters.Counter;
  /// @notice Keeping track of trading activity
  Counters.Counter private _marketItemIds;
  Counters.Counter private _marketItemsSold;
  Counters.Counter private _marketItemsDeleted;
  /// @notice Keeping track of leasing activity
  Counters.Counter private _leaseItemIds;
  Counters.Counter private _leaseItemsFilled;

  address payable owner;
  /// @notice listingFee is fixed to 0.005 of native token in full units (e.g. ether). It is transferred to the owner
  /// address during fillLease() to only take payments when a lease is filled.
  /// @dev The listingFee could be set dynamically with a function only callable by the ownder address.
  /// The listingFee could also be set to be transferred during createLeaseItem() to collect the fee whenever an ad lease item is created
  uint256 listingFee = 0.005 ether;

  /// @notice Set deployer address to owner
  constructor() {
    owner = payable(msg.sender);
  }

  receive() external payable {} // to support receiving ETH by default

  fallback() external payable {}

  /// @notice returns the listing fee
  function getListingFee() public view returns (uint256) {
    return listingFee;
  }

  ///
  /// @dev Trading related functionality
  ///
  struct MarketItem {
    uint256 itemId;
    address nftContract;
    uint256 tokenId;
    address payable seller;
    address payable owner;
    uint256 price;
    bool sold;
    bool canceled;
  }

  mapping(uint256 => MarketItem) private idToMarketItem;

  event MarketItemCreated(
    uint256 indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    address seller,
    address owner,
    uint256 price,
    bool sold,
    bool canceled
  );

  /// @notice Creates a market item from a minted NFT contract ERC721
  /// @param nftContract address of the ERC721 contract to be traded on this marketplace
  /// @param tokenId id of NFT from the ERC721 contract
  /// @param price amount in native token base units (e.g. wei)
  function createMarketItem(
    address nftContract,
    uint256 tokenId,
    uint256 price
  ) public payable nonReentrant {
    require(price > 0, 'Price must be at least 1 wei');
    require(msg.value == listingFee, 'Price must be equal to listing price');
    _marketItemIds.increment();
    uint256 itemId = _marketItemIds.current();

    idToMarketItem[itemId] = MarketItem(
      itemId,
      nftContract,
      tokenId,
      payable(msg.sender),
      payable(address(0)),
      price,
      false,
      false
    );

    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

    emit MarketItemCreated(itemId, nftContract, tokenId, msg.sender, address(0), price, false, false);
  }

  /// @notice Settles a trade for a market item at the set price
  /// @param nftContract address of the ERC721 contract to be traded on this marketplace
  /// @param itemId the id of the market item in the marketplace
  function createMarketSale(address nftContract, uint256 itemId) public payable nonReentrant {
    uint256 price = idToMarketItem[itemId].price;
    uint256 tokenId = idToMarketItem[itemId].tokenId;

    require(msg.value == price, 'Please submit the asking price in order to complete the purchase');

    idToMarketItem[itemId].seller.transfer(msg.value);
    IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
    idToMarketItem[itemId].owner = payable(msg.sender);
    idToMarketItem[itemId].sold = true;
    _marketItemsSold.increment();
    payable(owner).transfer(listingFee);
  }

  /// @notice Closes an open market item from the marketplace and transfers back to the seller address
  /// @param nftContract address of the ERC721 contract to be traded on this marketplace
  /// @param itemId the id of the market item in the marketplace
  function withdrawMarketItem(address nftContract, uint256 itemId) public payable nonReentrant {
    uint256 tokenId = idToMarketItem[itemId].tokenId;
    require(msg.sender == idToMarketItem[itemId].seller, 'The item can only be withdrawn by the seller address');

    IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
    idToMarketItem[itemId].owner = payable(msg.sender);
    idToMarketItem[itemId].sold = false;
    idToMarketItem[itemId].canceled = true;
  }

  /// @notice Returns all market items
  function fetchMarketItems() public view returns (MarketItem[] memory) {
    uint256 itemCount = _marketItemIds.current();
    uint256 unsoldItemCount = _marketItemIds.current() - _marketItemsSold.current();
    uint256 currentIndex = 0;

    MarketItem[] memory items = new MarketItem[](unsoldItemCount);
    for (uint256 i = 0; i < itemCount; i++) {
      if (idToMarketItem[i + 1].owner == address(0)) {
        uint256 currentId = idToMarketItem[i + 1].itemId;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /// @notice Returns item by tokenId
  /// @param tokenId id of NFT from the ERC721 contract
  function fetchMarketItemByTokenId(uint256 tokenId) public view returns (MarketItem[] memory) {
    uint256 totalItemCount = _marketItemIds.current();
    uint256 itemCount = 0;
    uint256 currentIndex = 0;

    for (uint256 i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].tokenId == tokenId && !idToMarketItem[i + 1].canceled && !idToMarketItem[i + 1].sold) {
        itemCount += 1;
      }
    }
    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint256 i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].tokenId == tokenId && !idToMarketItem[i + 1].canceled && !idToMarketItem[i + 1].sold) {
        uint256 currentId = idToMarketItem[i + 1].itemId;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /// @notice Returns all items where the sender address is the owner.
  /// @dev This can also be filtered from all items (i.e. with fetchAllMarketItems()) on the frontend.
  function fetchMyMarketItems() public view returns (MarketItem[] memory) {
    uint256 totalItemCount = _marketItemIds.current();
    uint256 itemCount = 0;
    uint256 currentIndex = 0;

    for (uint256 i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender) {
        itemCount += 1;
      }
    }
    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint256 i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].owner == msg.sender) {
        uint256 currentId = idToMarketItem[i + 1].itemId;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /// @notice Returns all market items where the sender address is the seller.
  /// @dev This can also be filtered from all items (i.e. with fetchAllMarketItems()) on the frontend.
  function fetchCreatedItems() public view returns (MarketItem[] memory) {
    uint256 totalItemCount = _marketItemIds.current();
    uint256 itemCount = 0;
    uint256 currentIndex = 0;

    for (uint256 i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        itemCount += 1;
      }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint256 i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        uint256 currentId = idToMarketItem[i + 1].itemId;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /// @notice Returns all items.
  function fetchAllMarketItems() public view returns (MarketItem[] memory) {
    uint256 totalItemCount = _marketItemIds.current();
    uint256 currentIndex = 0;

    MarketItem[] memory items = new MarketItem[](totalItemCount);
    for (uint256 i = 0; i < totalItemCount; i++) {
      uint256 currentId = idToMarketItem[i + 1].itemId;
      MarketItem storage currentItem = idToMarketItem[currentId];
      items[currentIndex] = currentItem;
      currentIndex += 1;
    }
    return items;
  }

  ///
  /// @dev Leasing related functionality
  ///

  /// @param nftContract address of the ERC721 contract to be traded on this marketplace
  /// @param interest defined in the same unit as principal
  /// @param leaseStartTimestamp timestamp of the lease start
  /// @param duration duration of the lease in seconds
  struct LeaseItem {
    uint256 itemId;
    address nftContract;
    uint256 tokenId;
    address payable borrower;
    address payable lender;
    uint256 principal;
    uint256 interest;
    uint256 repaymentAmount;
    uint256 leaseStartTimestamp;
    uint256 duration;
    bool active;
    bool repaid;
    bool defaulted;
  }

  mapping(uint256 => LeaseItem) private idToLeaseItem;

  event LeaseItemCreated(
    uint256 indexed itemId,
    address indexed nftContract,
    uint256 indexed tokenId,
    address borrower,
    address lender,
    uint256 principal,
    uint256 interest,
    uint256 repaymentAmount,
    uint256 leaseStartTimestamp,
    uint256 duration,
    bool active,
    bool repaid,
    bool defaulted
  );

  /// @notice Creates a lease item from a minted NFT contract ERC721
  /// @param nftContract address of the ERC721 contract to be traded on this marketplace
  /// @param tokenId id of NFT from the ERC721 contract
  /// @param principal pricinpal amount in native token in base units (e.g. wei)
  /// @param duration duration of the lease in seconds
  /// @param interest interest of the lease in base units (e.g. wei)
  function createLeaseItem(
    address nftContract,
    uint256 tokenId,
    uint256 principal,
    uint256 duration,
    uint256 interest
  ) public payable nonReentrant {
    require(principal > 0, 'Principal must be at least 1 wei');
    /// @notice The principal is the listing fee to be paid upfront to create the item.
    require(msg.value == listingFee, 'Principal must be equal to listing price');
    require(interest >= 0, 'Interest must be at least 0');
    require(duration > 0, 'Duration must be at least 1 second');
    _leaseItemIds.increment();
    uint256 itemId = _leaseItemIds.current();
    uint256 repaymentAmount = principal + interest;

    idToLeaseItem[itemId] = LeaseItem(
      itemId,
      nftContract,
      tokenId,
      payable(msg.sender),
      payable(address(0)),
      principal,
      interest,
      repaymentAmount,
      0,
      duration,
      false,
      false,
      false
    );

    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

    emit LeaseItemCreated(
      itemId,
      nftContract,
      tokenId,
      msg.sender,
      address(0),
      principal,
      interest,
      repaymentAmount,
      0,
      duration,
      false,
      false,
      false
    );
  }

  /// @notice The collateral token remains in the marketplace contract
  /// @param itemId the id of the lease item in the marketplace
  function fillLease(uint256 itemId) public payable nonReentrant {
    uint256 principal = idToLeaseItem[itemId].principal;

    require(msg.value == principal, 'Please submit the principal amount in order to the fill lease item');

    idToLeaseItem[itemId].borrower.transfer(msg.value);
    idToLeaseItem[itemId].lender = payable(msg.sender);
    idToLeaseItem[itemId].active = true;
    idToLeaseItem[itemId].leaseStartTimestamp = block.timestamp;
    _leaseItemsFilled.increment();
    /// @notice transfer the listingFee to the owner address
    payable(owner).transfer(listingFee);
  }

  /// @notice Repays the lease amount and transfers the collateral back to the borrower address
  /// @param nftContract address of the ERC721 contract to be traded on this marketplace
  /// @param itemId the id of the lease item in the marketplace
  function repayLease(address nftContract, uint256 itemId) public payable nonReentrant {
    uint256 repaymentAmount = idToLeaseItem[itemId].repaymentAmount;
    uint256 tokenId = idToLeaseItem[itemId].tokenId;
    address borrower = idToLeaseItem[itemId].borrower;
    require(msg.value == repaymentAmount, 'Please submit the repayment amount in order to repay the lease');

    /// @notice Any address can repay the lease, but the ERC721 collateral is sent
    /// back to the recorded borrower address.
    idToLeaseItem[itemId].lender.transfer(msg.value);
    IERC721(nftContract).transferFrom(address(this), borrower, tokenId);
    idToLeaseItem[itemId].active = false;
    idToLeaseItem[itemId].repaid = true;
  }

  /// @notice Defaults lease after leaseExpirationTimestamp is passed and transfers
  /// the collateral to the lender address.
  /// @param nftContract address of the ERC721 contract to be traded on this marketplace
  /// @param itemId the id of the lease item in the marketplace
  function defaultLease(address nftContract, uint256 itemId) public payable nonReentrant {
    bool active = idToLeaseItem[itemId].active;
    uint256 duration = idToLeaseItem[itemId].duration;
    uint256 leaseStartTimestamp = idToLeaseItem[itemId].leaseStartTimestamp;
    uint256 tokenId = idToLeaseItem[itemId].tokenId;
    address lender = idToLeaseItem[itemId].lender;
    uint256 leaseExpirationTimestamp = leaseStartTimestamp + duration;

    require(active == true, 'Can only default active lease');
    require(block.timestamp > leaseExpirationTimestamp, 'Lease can only default after it has expired');

    /// @notice Any address can default the lease, but the ERC721 collateral is sent
    /// to the recorded lender address.
    idToLeaseItem[itemId].lender.transfer(msg.value);
    IERC721(nftContract).transferFrom(address(this), lender, tokenId);
    idToLeaseItem[itemId].active = false;
    idToLeaseItem[itemId].defaulted = true;
  }

  /// @notice Returns all lease items.
  function fetchAllLeaseItems() public view returns (LeaseItem[] memory) {
    uint256 totalItemCount = _leaseItemIds.current();
    uint256 currentIndex = 0;

    LeaseItem[] memory items = new LeaseItem[](totalItemCount);
    for (uint256 i = 0; i < totalItemCount; i++) {
      uint256 currentId = idToLeaseItem[i + 1].itemId;
      LeaseItem storage currentItem = idToLeaseItem[currentId];
      items[currentIndex] = currentItem;
      currentIndex += 1;
    }
    return items;
  }

  /// @notice Returns all lease items which are not fulfilled.
  function fetchUnfilledLeaseItems() public view returns (LeaseItem[] memory) {
    uint256 itemCount = _leaseItemIds.current();
    uint256 unfilledItemCount = _leaseItemIds.current() - _leaseItemsFilled.current();
    uint256 currentIndex = 0;

    LeaseItem[] memory items = new LeaseItem[](unfilledItemCount);
    for (uint256 i = 0; i < itemCount; i++) {
      if (idToLeaseItem[i + 1].lender == address(0)) {
        uint256 currentId = idToLeaseItem[i + 1].itemId;
        LeaseItem storage currentItem = idToLeaseItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /// @notice Returns all lease items where the sender address is the lender.
  /// @dev This can also be filtered from all items (i.e. with fetchAllLeaseItems()) on the frontend.
  function fetchLeaseItemsWhereIAmLender() public view returns (LeaseItem[] memory) {
    uint256 totalItemCount = _leaseItemIds.current();
    uint256 itemCount = 0;
    uint256 currentIndex = 0;

    for (uint256 i = 0; i < totalItemCount; i++) {
      if (idToLeaseItem[i + 1].lender == msg.sender) {
        itemCount += 1;
      }
    }
    LeaseItem[] memory items = new LeaseItem[](itemCount);
    for (uint256 i = 0; i < totalItemCount; i++) {
      if (idToLeaseItem[i + 1].lender == msg.sender) {
        uint256 currentId = idToLeaseItem[i + 1].itemId;
        LeaseItem storage currentItem = idToLeaseItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }

  /// @notice Returns all lease items where the sender address is the borrower.
  /// @dev This can also be filtered from all lease items (i.e. with fetchAllLeaseItems()) on the frontend.
  function fetchLeaseItemsWhereIAmBorrower() public view returns (LeaseItem[] memory) {
    uint256 totalItemCount = _leaseItemIds.current();
    uint256 itemCount = 0;
    uint256 currentIndex = 0;

    for (uint256 i = 0; i < totalItemCount; i++) {
      if (idToLeaseItem[i + 1].borrower == msg.sender) {
        itemCount += 1;
      }
    }

    LeaseItem[] memory items = new LeaseItem[](itemCount);
    for (uint256 i = 0; i < totalItemCount; i++) {
      if (idToLeaseItem[i + 1].borrower == msg.sender) {
        uint256 currentId = idToLeaseItem[i + 1].itemId;
        LeaseItem storage currentItem = idToLeaseItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }
}
