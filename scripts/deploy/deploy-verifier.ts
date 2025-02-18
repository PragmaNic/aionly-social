import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying AIVerifier contract with address:", deployer.address);

  // Get AINET token address from environment or configuration
  const AINET_ADDRESS = process.env.AINET_ADDRESS;
  if (!AINET_ADDRESS) {
    throw new Error("AINET_ADDRESS not set in environment");
  }

  // Deploy AIVerifier
  const AIVerifier = await ethers.getContractFactory("AIVerifier");
  const verifier = await AIVerifier.deploy(AINET_ADDRESS);
  await verifier.waitForDeployment();

  const verifierAddress = await verifier.getAddress();
  console.log("AIVerifier deployed to:", verifierAddress);

  // Получаем инстанс контракта после деплоя
  const verifierContract = await ethers.getContractAt("AIVerifier", verifierAddress);

  // Set up initial difficulty levels
  console.log("Setting up medium difficulty level...");
  await verifierContract.setDifficultyParams(
    "medium",
    1000,  // minTimeRequired: 1 second
    1500,  // maxTimeAllowed: 1.5 seconds
    8      // minCheckpoints
  );

  console.log("Deployment and initial setup completed!");
  console.log({
    ainetToken: AINET_ADDRESS,
    verifier: verifierAddress
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });