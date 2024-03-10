const hre = require('hardhat')

async function main() {
  const NftMarketplace = await hre.ethers.getContractFactory('NftMarketplace');
  const nftMarketplace = await NftMarketplace.deploy();
  await nftMarketplace.deployed();
  console.log('NftMarketplace deployed to:', nftMarketplace.address);

  const Nft = await hre.ethers.getContractFactory('Nft');
  const nft = await Nft.deploy(nftMarketplace.address);
  await nft.deployed();
  console.log('Nft deployed to:', nft.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
