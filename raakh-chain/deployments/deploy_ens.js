// deployments/deploy_ens.js

// This script assumes it's run within a Hardhat environment.
// Command to run (from the root of the Hardhat project, typically `raakh-chain`):
// npx hardhat run deployments/deploy_ens.js --network <your_network_name_for_raakh>
// Ensure your hardhat.config.js defines the network for ŘǍǍǨȞ.

async function main() {
  // Get the deployer account
  const [deployer] = await ethers.getSigners();

  console.log("Deploying ENSBasic with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Get the contract factory for ENSBasic
  const ENSBasicFactory = await ethers.getContractFactory("ENSBasic");

  // Deploy the contract
  console.log("Deploying ENSBasic...");
  const ensBasic = await ENSBasicFactory.deploy(); // Constructor takes no arguments

  // Wait for the contract to be deployed
  await ensBasic.deployed();

  console.log("ENSBasic deployed to:", ensBasic.address);
  console.log("Transaction hash:", ensBasic.deployTransaction.hash);
  console.log("The contract owner will be the deployer:", deployer.address);

  // You can add further actions here, like saving the address to a file.
  // For example, saving the address:
  /*
  const fs = require('fs');
  const path = require('path');
  const contractsDir = path.join(__dirname, "..", "client", "deployed-contracts"); // Example path
  if (!fs.existsSync(contractsDir)){
      fs.mkdirSync(contractsDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(contractsDir, "ens-basic-address.json"),
    JSON.stringify({ ENSBasic: ensBasic.address }, undefined, 2)
  );
  console.log(`ENSBasic address saved to ${path.join(contractsDir, "ens-basic-address.json")}`);
  */
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
