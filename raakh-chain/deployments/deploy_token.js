// deployments/deploy_token.js

// This script assumes it's run within a Hardhat environment.
// Command to run (from the root of the Hardhat project, typically `raakh-chain`):
// npx hardhat run deployments/deploy_token.js --network <your_network_name_for_raakh>
// Ensure your hardhat.config.js defines the network for ŘǍǍǨȞ.

async function main() {
  // Get the deployer account
  const [deployer] = await ethers.getSigners();

  console.log("Deploying SampleToken with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Define token parameters
  const tokenName = "Sample Token";
  const tokenSymbol = "STK";
  const tokenDecimals = 18;
  // Initial supply (e.g., 1 million tokens) in human-readable format
  const humanReadableInitialSupply = "1000000";
  // Convert human-readable supply to the smallest unit (like wei)
  const initialSupplyInSmallestUnit = ethers.utils.parseUnits(humanReadableInitialSupply, tokenDecimals);

  // Get the contract factory
  const SampleTokenFactory = await ethers.getContractFactory("SampleToken");

  // Deploy the contract
  console.log(`Deploying SampleToken (${tokenName}, ${tokenSymbol}, ${tokenDecimals} decimals, Initial Supply: ${humanReadableInitialSupply} ${tokenSymbol})...`);
  const sampleToken = await SampleTokenFactory.deploy(
    tokenName,
    tokenSymbol,
    tokenDecimals,
    initialSupplyInSmallestUnit // Pass the already decimal-adjusted value
  );

  // Wait for the contract to be deployed
  await sampleToken.deployed();

  console.log("SampleToken deployed to:", sampleToken.address);
  console.log("Transaction hash:", sampleToken.deployTransaction.hash);

  // You can add further actions here, like verifying on a block explorer if applicable,
  // or saving the address to a file.
  // For example, saving the address:
  /*
  const fs = require('fs');
  const path = require('path');
  const contractsDir = path.join(__dirname, "..", "client", "deployed-contracts"); // Example path
  if (!fs.existsSync(contractsDir)){
      fs.mkdirSync(contractsDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(contractsDir, "sample-token-address.json"),
    JSON.stringify({ SampleToken: sampleToken.address }, undefined, 2)
  );
  console.log(`SampleToken address saved to ${path.join(contractsDir, "sample-token-address.json")}`);
  */
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
