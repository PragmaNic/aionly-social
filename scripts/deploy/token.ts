// scripts/deploy/token.ts
import { ethers } from "hardhat";
import { BASE_SEPOLIA_CONFIG } from '../config';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log(`Deploying AINET to ${process.env.HARDHAT_NETWORK}...`);
  
  // Load configuration
  const config = BASE_SEPOLIA_CONFIG;
  
  // Validate network
  if (process.env.HARDHAT_NETWORK !== config.network) {
    throw new Error(`Invalid network. Expected ${config.network}, got ${process.env.HARDHAT_NETWORK}`);
  }

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying with account: ${deployer.address}`);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Account balance: ${ethers.formatEther(balance)} ETH`);
  
  if (balance === BigInt(0)) {
    throw new Error('Deployer account has no balance');
  }

  // Deploy AINET
  console.log('Deploying AINET token...');
  const AINETFactory = await ethers.getContractFactory("AINET");
  const ainet = await AINETFactory.deploy();
  await ainet.waitForDeployment();
  
  const contractAddress = await ainet.getAddress();
  console.log(`AINET deployed to: ${contractAddress}`);

  // The pools are already set up in the constructor
  console.log('Pools are initialized in constructor');

  // Get pool info for verification
  const poolIds = [
    ethers.keccak256(ethers.toUtf8Bytes("community")),
    ethers.keccak256(ethers.toUtf8Bytes("development")),
    ethers.keccak256(ethers.toUtf8Bytes("liquidity")),
    ethers.keccak256(ethers.toUtf8Bytes("founder")),
    ethers.keccak256(ethers.toUtf8Bytes("human"))
  ];

  console.log('\nVerifying pool setup:');
  for (const poolId of poolIds) {
    const poolInfo = await ainet.getPoolInfo(poolId);
    console.log(`Pool ${poolId}:`);
    console.log(`- Total Amount: ${ethers.formatEther(poolInfo[0])} AINET`);
    console.log(`- Released Amount: ${ethers.formatEther(poolInfo[1])} AINET`);
    console.log(`- Remaining Amount: ${ethers.formatEther(poolInfo[2])} AINET`);
    console.log(`- Active: ${poolInfo[3]}\n`);
  }

  // Pause the contract for safety if configured
  if (config.initialPause) {
    console.log('Pausing contract for safety...');
    const tx = await ainet.pause();
    await tx.wait();
    console.log('Contract paused');
  }

  // Verify contract
  if (process.env.BASESCAN_API_KEY) {
    console.log('Starting contract verification...');
    try {
      const hre = await import('hardhat');
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log('Contract verified successfully');
    } catch (error) {
      console.error('Verification error:', error);
    }
  }

  console.log('\nDeployment Summary:');
  console.log('-------------------');
  console.log(`Network: ${config.network}`);
  console.log(`Contract: ${contractAddress}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log('Status: Complete');
  
  return { contractAddress, config };
}

// For automatic execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { main as deployToken };