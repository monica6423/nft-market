require('dotenv').config();
require('@nomiclabs/hardhat-ethers');
// require('@nomiclabs/hardhat-waffle')
console.log(process.env.WEB3_API_URL);
console.log(`0x${process.env.WEB3_PRIVATE_KEY}`);

module.exports = {
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545/',
    },
    // Example of a network configuration
    // PROVIDER_KEY is the provider API KEY (e.g. Alchemy or Infura)
    // PRIVATE_KEY is the private key of the account to use for deployments
    // rinkeby: {
    //   url: `https://rinkeby.infura.io/v3/${process.env.PROVIDER_KEY}`,
    //   accounts: [process.env.PRIVATE_KEY]
    // }
    // goerli: {
    //   url: process.env.PROVIDER_URL,
    //   accounts: [`0x${process.env.PRIVATE_KEY}`],
    // },
    polygon_testnet: {
      url: process.env.PROVIDER_URL,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
  },
  solidity: '0.8.4',
  paths: {
    artifacts: './src/artifacts',
  },
};
