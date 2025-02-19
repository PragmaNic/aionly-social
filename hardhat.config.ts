import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

// Create network config only if deployment keys are present
const networks: any = {};

// Add Base Sepolia configuration only if private key exists
if (process.env.HARDHAT_NETWORK === 'base-sepolia' && !process.env.BASE_SEPOLIA_PRIVATE_KEY) {
  throw new Error("BASE_SEPOLIA_PRIVATE_KEY required for base-sepolia network");
}

// Configure Base Sepolia network
networks["base-sepolia"] = {
  url: process.env.BASE_SEPOLIA_URL || "https://sepolia.base.org",
  accounts: process.env.BASE_SEPOLIA_PRIVATE_KEY ? [process.env.BASE_SEPOLIA_PRIVATE_KEY] : [],
  chainId: 84532
};

// Optional warning for missing Basescan API key
if (process.env.HARDHAT_NETWORK === 'base-sepolia' && !process.env.BASESCAN_API_KEY) {
  console.warn("Warning: BASESCAN_API_KEY not set in environment");
}

const config: HardhatUserConfig = {
  // Solidity compiler configuration
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },

  networks,

  // Etherscan configuration for contract verification
  etherscan: {
    apiKey: {
      "base-sepolia": process.env.BASESCAN_API_KEY || ""
    },
    customChains: [
      {
        network: "base-sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      }
    ]
  },

  // Project structure paths
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },

  // Gas reporter configuration
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true
  }
};

export default config;