import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import axios from 'axios';
import { Item, ItemMetadata, ItemWithMetadata } from '../types';
import { IPFS_BASE_URL } from '../constants';
import { extractIpfsHashFromUrl } from '../utils';
import { nftAddress, marketplaceAddress } from '../config';

import NFT from '../abi/Nft.json';
import Market from '../abi/NftMarketplace.json';

const tokenContract = new ethers.Contract(nftAddress, NFT.abi /*, provider*/);
const marketContract = new ethers.Contract(marketplaceAddress, Market.abi /*, signer*/);

const web3Modal = new Web3Modal();

export const useProviderOrSigner = async () => {
  const connection = await web3Modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);

  const signer = provider.getSigner();

  return { provider, signer };
};

export const fetchItemMetadata = async (
  tokenContract: ethers.Contract,
  provider: ethers.providers.Provider,
  tokenId: string
) => {
  const tokenUri = await tokenContract.connect(provider).tokenURI(tokenId);
  const { data }: { data: ItemMetadata } = await axios.get(`${IPFS_BASE_URL}/${extractIpfsHashFromUrl(tokenUri)}`);

  return {
    ...data,
    image: `${IPFS_BASE_URL}/${extractIpfsHashFromUrl(data.image)}`,
  };
};

export const formatItemData = (item: Item, ipfsMetadata: ItemMetadata) => ({
  tokenId: item.tokenId.toString(),
  owner: item.owner,
  ...(item.nftContract ? { nftContract: item.nftContract } : {}),
  ...(item.seller ? { seller: item.seller } : {}),
  ...(item.sold ? { sold: item.sold } : {}),
  ...(item.canceled ? { canceled: item.canceled } : {}),
  ...(item.price ? { price: ethers.utils.formatUnits(item.price.toString(), 'ether') } : {}),
  ...(item.itemId ? { itemId: item.itemId.toString() } : {}),
  ...ipfsMetadata,
});

export const mintNFT = async (ipfsMetadataUrl: string, signer: ethers.Signer) => {
  const contract = tokenContract.connect(signer);
  const transaction = await contract.createToken(ipfsMetadataUrl);
  const tx = await transaction.wait();
  console.log('mint tx: ', tx);
  return tx;
};

export const getAllNFTs = async (provider: ethers.providers.BaseProvider, signer?: ethers.Signer) => {
  const totalSupply = await tokenContract.connect(provider).totalSupply();
  const marketItems = await getAllMarketItems(provider, signer);

  const items = await Promise.all(
    Array.from({ length: totalSupply.toNumber() }, (_, i) => `${i + 1}`).map(async (tokenId) => {
      const owner: string = await tokenContract.connect(provider).ownerOf(tokenId);

      // Fetch market item if the current owner address is the marketplace address
      if (owner === marketplaceAddress) {
        const marketItem = marketItems.find((marketItem) => marketItem.tokenId === tokenId);

        return marketItem;
      }

      const ipfsMetadata = await fetchItemMetadata(tokenContract, provider, tokenId);

      const item = {
        tokenId,
        owner,
      };
      return formatItemData(item, ipfsMetadata);
    })
  );

  return items;
};

export const getNFTByTokenId = async (
  tokenId: string,
  provider: ethers.providers.BaseProvider,
  signer?: ethers.Signer
) => {
  const owner: string = await tokenContract.connect(provider).ownerOf(tokenId);

  // Fetch market item if the current owner address is the marketplace address
  if (owner === marketplaceAddress) {
    const items = await getMarketItemByTokenId(tokenId, provider, signer);
    return items[0];
  }

  const ipfsMetadata = await fetchItemMetadata(tokenContract, provider, tokenId);
  console.log('ipfsMetadata', ipfsMetadata);
  const item = {
    tokenId,
    owner,
  };
  return formatItemData(item, ipfsMetadata);
};

export const getAllMarketItems = async (provider: ethers.providers.BaseProvider, signer?: ethers.Signer) => {
  const data = await marketContract.connect(signer || provider).fetchAllMarketItems();

  const items = await Promise.all(
    data.map(async (item: any) => {
      const ipfsMetadata = await fetchItemMetadata(tokenContract, provider, item.tokenId);

      return formatItemData(item, ipfsMetadata);
    })
  );
  return items;
};

export const getMarketItemByTokenId = async (
  tokenId: string,
  provider: ethers.providers.BaseProvider,
  signer?: ethers.Signer
) => {
  const data = await marketContract.connect(signer || provider).fetchMarketItemByTokenId(tokenId);

  const items = await Promise.all(
    data.map(async (item: any) => {
      const ipfsMetadata = await fetchItemMetadata(tokenContract, provider, item.tokenId);

      return formatItemData(item, ipfsMetadata);
    })
  );
  return items;
};

export const buyItem = async (itemId: string, price: string, signer: ethers.Signer) => {
  const priceBn = ethers.utils.parseUnits(price, 'ether');
  const transaction = await marketContract
    .connect(signer)
    .createMarketSale(nftAddress, itemId, { value: priceBn });
  await transaction.wait();
};

export const withdrawItem = async (itemId: string, signer: ethers.Signer) => {
  const transaction = await marketContract.connect(signer).withdrawMarketItem(nftAddress, itemId);
  await transaction.wait();
};

export const sellItem = async (tokenId: string, price: string, signer: ethers.Signer) => {
  const priceBn = ethers.utils.parseUnits(price, 'ether');

  const contract = marketContract.connect(signer);
  const listingFee = await contract.getListingFee();
  const transaction = await contract.createMarketItem(nftAddress, tokenId, priceBn, {
    value: listingFee,
  });
  await transaction.wait();
};
