# ŘǍǍǨȞ Lightweight EVM Chain

Welcome to ŘǍǍǨȞ (pronounced "Raakh"), a lightweight, EVM-compatible Proof-of-Authority (PoA) blockchain designed for personal development, testing, and experimentation. It aims to provide a minimal-resource footprint alternative to public testnets or running a full Ethereum mainnet node.

## 🎯 Purpose and Use Case

ŘǍǍǨȞ is for developers and enthusiasts who need a controllable, fast, and efficient EVM environment. Key use cases include:
-   Developing and testing smart contracts.
-   Interacting with a live blockchain without the instability of public testnets.
-   Learning about blockchain internals and PoA consensus.
-   Running a personal blockchain sandbox on modest hardware (e.g., a laptop).

## ✨ Features

-   **EVM Compatible**: Supports standard Ethereum tooling and smart contracts.
-   **Geth-Based**: Built using Go Ethereum, the official Go implementation.
-   **Proof-of-Authority (Clique)**: Fast consensus mechanism with a 1-second block time.
-   **Lightweight**: Designed to run with less than 20% CPU, <500MB RAM, and <5GB disk.
-   **Metamask Integration**: Easily add ŘǍǍǨȞ as a custom network to Metamask.
-   **JSON-RPC Access**: Full RPC endpoint for development and interaction (default: `http://127.0.0.1:8545`).
-   **Pre-funded Genesis Accounts**: Includes developer accounts with pre-funded ǨȞǍǍŘ.
-   **Sample Contracts**: Comes with an example ERC20 token (`SampleToken.sol`) and a basic ENS-like name registry (`ENSBasic.sol`).
-   **Configurable**: Chain ID (18181), Currency Symbol (ǨȞǍǍŘ).

## 📁 Repository Structure

```
raakh-chain/
├── README.md                      # This guide
├── .env.example                   # Environment variable examples (if any)
├── config/
│   └── static-nodes.json         # Static peer list for Geth
├── contracts/
│   └── SampleToken.sol           # Example ERC20 token
│   └── ENSBasic.sol              # Simple name registry
├── client/
│   └── metamask-network.json     # Parameters for adding to Metamask
├── deployments/
│   └── deploy_token.js           # Hardhat script to deploy SampleToken
│   └── deploy_ens.js             # Hardhat script to deploy ENSBasic
├── docs/
│   └── setup-guide.md            # Detailed step-by-step setup instructions
├── genesis/
│   └── genesis.json              # The genesis block configuration
│   └── alloc.json                # (Reference) Pre-funded accounts (part of genesis.json)
├── scripts/
│   └── init-validator.sh         # Initializes a validator node's data and keys
│   └── start-node.sh             # Starts a validator or regular node
│   └── connect-metamask.json     # (Reference) Metamask connection details
└── LICENSE                        # Project license
```

## 🛠 Prerequisites

-   **Go Ethereum (`geth`)**: Version 1.10.x or later. Installation instructions: [Geth Downloads](https://geth.ethereum.org/docs/install-and-build/installing-geth)
-   **Bash compatible shell**: For running scripts (Linux, macOS, or WSL on Windows).
-   **(Optional) Node.js & npm**: If you plan to deploy contracts using the provided Hardhat scripts. (LTS version recommended).
-   **(Optional) Hardhat**: If using the deployment scripts (`npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox` or `npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers`).

## 🚀 Quick Start & Setup

This guide outlines the critical steps. For more details, see `docs/setup-guide.md`.

**IMPORTANT**: Steps 2 and 3 involve manual updates to configuration files based on generated data. This is crucial for the chain to start correctly with your new validators.

**1. Clone Repository**
```bash
git clone <repository_url> # Replace with the actual URL
cd raakh-chain
```

**2. Initialize Validators & Create Genesis File (Critical Manual Step)**

This step generates validator keys and requires you to update `genesis.json` with these new keys. Then, re-initialize with the updated genesis.

   a. **Set up Base Directory**:
      ```bash
      BASE_DATADIR="./node-data" # Or your preferred location
      mkdir -p $BASE_DATADIR
      ```

   b. **Initialize First Validator (V1)**:
      ```bash
      ./scripts/init-validator.sh 1 $BASE_DATADIR
      ```
      Carefully note the **Public address** output (e.g., `0xAddressV1`). This is `VALIDATOR_ADDRESS_1`.

   c. **Initialize Second Validator (V2)**:
      ```bash
      ./scripts/init-validator.sh 2 $BASE_DATADIR
      ```
      Carefully note the **Public address** output (e.g., `0xAddressV2`). This is `VALIDATOR_ADDRESS_2`.

   d. **Update `genesis/genesis.json`**:
      Open `genesis/genesis.json` in a text editor.
      -   **`extradata` field**: Replace the placeholder addresses:
          -   Find `AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` and replace it with `AddressV1` (without the `0x` prefix).
          -   Find `BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB` and replace it with `AddressV2` (without the `0x` prefix).
          *Example `extradata` before*: `"0x0000...0000AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAفیفیفیفیفیفیفیفیفیفیفیفیفیفیفیفیفیفیفیفی0000...00"`
          *Example `extradata` after*: `"0x0000...0000<AddressV1_no_0x><AddressV2_no_0x>0000...00"`
      -   **`alloc` section**: Update addresses for pre-funded validator accounts:
          -   Replace `0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` with `0xAddressV1`.
          -   Replace `0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB` with `0xAddressV2`.
          *(Ensure other dev accounts `0xCCCCCCCC...` etc. remain if desired).*
      Save the `genesis.json` file.

   e. **Re-initialize Validators with Updated Genesis**:
      The first `init` created basic files. Now we re-init with the correct validator set in genesis.
      ```bash
      # Clear previous geth chain data (but not keystore) for validator 1
      rm -rf ${BASE_DATADIR}/validator1/geth ${BASE_DATADIR}/validator1/nodes
      ./scripts/init-validator.sh 1 $BASE_DATADIR

      # Clear previous geth chain data for validator 2
      rm -rf ${BASE_DATADIR}/validator2/geth ${BASE_DATADIR}/validator2/nodes
      ./scripts/init-validator.sh 2 $BASE_DATADIR
      ```
      *(The `init-validator.sh` script is safe to re-run; it won't create new keys if they exist).*

**3. Configure Static Nodes (Critical Manual Step)**

   a. **Start Validator 1 to get its enode URL**:
      Open a new terminal.
      ```bash
      ./scripts/start-node.sh validator 1 $BASE_DATADIR
      ```
      Look for a log line early in the output like `INFO [timestamp] Started P2P networking self=enode://<enode_id_v1>@127.0.0.1:30303`. Copy this full enode URL.
      Press `Ctrl+C` to stop it for now.

   b. **Start Validator 2 to get its enode URL**:
      Open another new terminal.
      ```bash
      ./scripts/start-node.sh validator 2 $BASE_DATADIR
      ```
      Look for its enode URL (e.g., `enode://<enode_id_v2>@127.0.0.1:30304`). Copy it.
      Press `Ctrl+C` to stop it.

   c. **Update `config/static-nodes.json`**:
      Open `config/static-nodes.json`. Replace the placeholder enode URLs with the actual ones you copied:
      ```json
      [
        "enode://<enode_id_v1>@127.0.0.1:30303",
        "enode://<enode_id_v2>@127.0.0.1:30304"
      ]
      ```
      Save the file.

**4. Start the Blockchain**

   a. **Start Validator 1**:
      In one terminal:
      ```bash
      ./scripts/start-node.sh validator 1 $BASE_DATADIR
      ```
      It will start mining if it's the only one or part of the active set.

   b. **Start Validator 2**:
      In a second terminal:
      ```bash
      ./scripts/start-node.sh validator 2 $BASE_DATADIR
      ```
      You should see them connect and start producing blocks (approx. every 1 second).

**5. (Optional) Start a Regular RPC Node**

   a. **Initialize Datadir for RPC Node**:
      ```bash
      mkdir -p ${BASE_DATADIR}/rpcnode1
      geth --datadir ${BASE_DATADIR}/rpcnode1 init genesis/genesis.json
      ```
   b. **Start RPC Node**:
      In a third terminal:
      ```bash
      ./scripts/start-node.sh node rpcnode1 $BASE_DATADIR
      ```
      This node will sync with the validators. Its RPC will be on a different port (e.g., 8549, check script output).

## 🦊 Connecting Metamask

Use the details from `client/metamask-network.json` or manually configure:
-   **Network Name**: ŘǍǍǨȞ
-   **New RPC URL**: `http://127.0.0.1:8545` (This is for Validator 1 by default. Use Validator 2's RPC port `http://127.0.0.1:8547` or your RPC node's port if you started one).
-   **Chain ID**: `18181` (Hex: `0x4705`)
-   **Currency Symbol**: `ǨȞǍǍŘ`
-   **Block Explorer URL**: (leave blank)

Your pre-funded developer accounts (e.g., `0xCCCCCCCC...`) should show a balance.

## 📜 Deploying Smart Contracts (Example with Hardhat)

1.  **Setup Hardhat Project**:
    If you have Node.js/npm:
    ```bash
    # In the raakh-chain directory
    npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox # For newer Hardhat
    # Or for older Hardhat: npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers
    npx hardhat # Select "Create a basic sample project" or "Create an empty hardhat.config.js"
    ```

2.  **Configure `hardhat.config.js`**:
    Add or modify your `hardhat.config.js` to include the ŘǍǍǨȞ network:
    ```javascript
    require("@nomicfoundation/hardhat-toolbox"); // Or "@nomiclabs/hardhat-ethers" for older versions

    module.exports = {
      solidity: "0.8.20", // Or your contract's version
      networks: {
        raakh_local: {
          url: "http://127.0.0.1:8545", // RPC URL of your running ŘǍǍǨȞ node
          chainId: 18181,
          accounts: [
            // Optional: Add private keys of your pre-funded dev accounts from genesis.json
            // '0xYOUR_PRIVATE_KEY_FOR_0xCCCCCCCCCCCC...'
          ]
        }
      }
    };
    ```

3.  **Run Deployment Scripts**:
    The example deployment scripts are in the `deployments/` directory.
    ```bash
    npx hardhat run deployments/deploy_token.js --network raakh_local
    npx hardhat run deployments/deploy_ens.js --network raakh_local
    ```
    The contract addresses will be printed to the console.

## 🔩 Interacting with the Chain

-   **Metamask**: Send ǨȞǍǍŘ, interact with deployed contracts.
-   **`curl`**: For JSON-RPC calls:
    ```bash
    curl -X POST -H "Content-Type: application/json" --data       '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'       http://127.0.0.1:8545
    ```
-   **Web3 Libraries**: Use `ethers.js` or `web3.js` in your applications, configured with the RPC URL.

## ⚖️ License

This project is released under the [MIT License](./LICENSE). (You'll need to create a LICENSE file, e.g., with standard MIT text).
```
