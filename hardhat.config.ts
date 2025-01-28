import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

// Убедитесь что эти переменные заданы в .env файле
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0000000000000000000000000000000000000000000000000000000000000000";
const BASE_GOERLI_RPC = process.env.BASE_GOERLI_RPC || "https://goerli.base.org";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    baseGoerli: {
      url: BASE_GOERLI_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 84531,
    }
  }
};

export default config;