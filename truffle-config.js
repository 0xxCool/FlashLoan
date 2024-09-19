require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    bsc: {
      provider: () => new HDWalletProvider(process.env.PRIVATE_KEY, process.env.RPC_URL),
      network_id: 56,
      gasPrice: 20000000000, // 20 Gwei
      timeoutBlocks: 200,
    },
    bscTestnet: {
      provider: () => new HDWalletProvider(process.env.PRIVATE_KEY, process.env.RPC_TEST_URL),
      network_id: 97,
      gasPrice: 10000000000, // 10 Gwei
      timeoutBlocks: 200,
    }
  },
  compilers: {
    solc: {
      version: "0.8.0"
    }
  }
};
