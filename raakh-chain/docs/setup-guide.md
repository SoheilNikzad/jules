# ŘǍǍǨȞ Detailed Setup Guide

This guide provides a detailed walkthrough for setting up and running your local ŘǍǍǨȞ lightweight EVM blockchain. It expands on the "Quick Start" section in the main `README.md`.

## Table of Contents
1.  [Prerequisites](#prerequisites)
2.  [Clone Repository](#1-clone-repository)
3.  [Initial Validator Setup & Genesis Configuration](#2-initial-validator-setup--genesis-configuration)
    *   [3.1 Set Base Directory](#31-set-base-directory)
    *   [3.2 Initialize First Validator (V1)](#32-initialize-first-validator-v1)
    *   [3.3 Initialize Second Validator (V2)](#33-initialize-second-validator-v2)
    *   [3.4 Update `genesis.json`](#34-update-genesisjson)
    *   [3.5 Re-initialize Validators with Updated Genesis](#35-re-initialize-validators-with-updated-genesis)
4.  [Configure Static Peer List](#4-configure-static-peer-list)
    *   [4.1 Obtain Enode URL for Validator 1](#41-obtain-enode-url-for-validator-1)
    *   [4.2 Obtain Enode URL for Validator 2](#42-obtain-enode-url-for-validator-2)
    *   [4.3 Update `static-nodes.json`](#43-update-static-nodesjson)
5.  [Start the Blockchain](#5-start-the-blockchain)
    *   [5.1 Start Validator 1](#51-start-validator-1)
    *   [5.2 Start Validator 2](#52-start-validator-2)
6.  [Optional: Start a Regular RPC Node](#6-optional-start-a-regular-rpc-node)
    *   [6.1 Initialize RPC Node Datadir](#61-initialize-rpc-node-datadir)
    *   [6.2 Start RPC Node](#62-start-rpc-node)
7.  [Connecting Metamask](#7-connecting-metamask)
8.  [Deploying Smart Contracts (Hardhat Example)](#8-deploying-smart-contracts-hardhat-example)

---

## Prerequisites

Ensure you have the following installed:
-   **Go Ethereum (`geth`)**: Version 1.10.x or later. Verify with `geth version`.
    -   Installation: [Geth Installation Guide](https://geth.ethereum.org/docs/install-and-build/installing-geth)
-   **Bash compatible shell**: (e.g., Terminal on Linux/macOS, Git Bash or WSL on Windows).
-   **(Optional) Node.js & npm**: For contract deployment using Hardhat.
-   **(Optional) Hardhat**: (`npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers`).

---

## 1. Clone Repository

```bash
git clone <repository_url> # Replace <repository_url> with the actual URL of the raakh-chain repository
cd raakh-chain
```

---

## 2. Initial Validator Setup & Genesis Configuration

This is the most critical part. You will generate cryptographic keys for your validators and embed their addresses into the `genesis.json` file.

### 3.1 Set Base Directory

Choose a location for your blockchain data. All node data will be stored in subdirectories here.
```bash
BASE_DATADIR="./node-data" # Or your preferred path, e.g., /var/lib/raakh-chain
mkdir -p $BASE_DATADIR
echo "Using base data directory: $BASE_DATADIR"
```

### 3.2 Initialize First Validator (V1)

This script creates a data directory for Validator 1 (`${BASE_DATADIR}/validator1`), a password file, and a new Ethereum account (key pair).

```bash
./scripts/init-validator.sh 1 $BASE_DATADIR
```
**Expected Output (snippet):**
```
===================================================================
Initializing Validator 1 for ŘǍǍǨȞ
===================================================================
Data directory:       ./node-data/validator1
...
IMPORTANT: New account created for Validator 1!
Address: 0xYourActualValidator1AddressHere
This address MUST be added to the 'extradata' and 'alloc' sections
of your genesis.json file...
...
Setup for Validator 1 DONE.
===================================================================
```
**Action**: Copy the generated `Address: 0xYourActualValidator1AddressHere`. This is `VALIDATOR_ADDRESS_1`.

### 3.3 Initialize Second Validator (V2)

Repeat for Validator 2.
```bash
./scripts/init-validator.sh 2 $BASE_DATADIR
```
**Expected Output (snippet):**
```
===================================================================
Initializing Validator 2 for ŘǍǍǨȞ
===================================================================
...
Address: 0xYourActualValidator2AddressHere
...
Setup for Validator 2 DONE.
===================================================================
```
**Action**: Copy the generated `Address: 0xYourActualValidator2AddressHere`. This is `VALIDATOR_ADDRESS_2`.

### 3.4 Update `genesis.json`

Open `genesis/genesis.json` with a text editor.

-   **Update `extradata`**:
    The `extradata` field defines the initial signers (validators). It requires addresses *without* the `0x` prefix.
    -   Locate the `extradata` field. It will look something like:
        `"extradata": "0x0000000000000000000000000000000000000000000000000000000000000000AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAفیفیفیفیفیفیفیفیفیفیفیفیفیفیفیفیفیفیفیفی0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"`
    -   Replace `AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` with your `VALIDATOR_ADDRESS_1` (hex characters only, e.g., `YourActualValidator1AddressHere` without `0x`).
    -   Replace `BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB` with your `VALIDATOR_ADDRESS_2` (hex characters only).
    *The total length of `extradata` (excluding the `0x` prefix) must remain the same (64 zeros + 40 chars for V1 + 40 chars for V2 + 130 zeros/vanity = 274 hex chars).*

-   **Update `alloc` section**:
    This section pre-funds accounts. Update the placeholder validator addresses here with their `0x` prefix.
    ```json
    // ...
    "alloc": {
        "0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC": { "balance": "1000000000000000000000000" },
        "0xDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD": { "balance": "1000000000000000000000000" },
        "0xEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE": { "balance": "1000000000000000000000000" },
        "0xYourActualValidator1AddressHere": { "balance": "1000000000000000000000" }, // <-- Update this
        "0xYourActualValidator2AddressHere": { "balance": "1000000000000000000000" }  // <-- Update this
    }
    // ...
    ```
**Action**: Save `genesis/genesis.json`. **This is a critical step. Errors here will prevent the chain from starting correctly.**

### 3.5 Re-initialize Validators with Updated Genesis

The first run of `init-validator.sh` created keystore files. The `geth init` also created initial chaindata based on the *old* genesis. We must re-run `init` using the *updated* `genesis.json` to correctly form the blockchain from block 0. This command removes the old chaindata but preserves the keystore.

```bash
# For Validator 1
rm -rf ${BASE_DATADIR}/validator1/geth ${BASE_DATADIR}/validator1/nodes
./scripts/init-validator.sh 1 $BASE_DATADIR
# Expected: Script confirms initialization.

# For Validator 2
rm -rf ${BASE_DATADIR}/validator2/geth ${BASE_DATADIR}/validator2/nodes
./scripts/init-validator.sh 2 $BASE_DATADIR
# Expected: Script confirms initialization.
```
The `init-validator.sh` script will detect existing accounts and skip creating new ones. It will just perform the `geth init`.

---

## 4. Configure Static Peer List

For a stable private network, nodes need to know how to find each other. `static-nodes.json` lists fixed peers.

### 4.1 Obtain Enode URL for Validator 1

Start Validator 1 temporarily to get its enode URL.
Open a **new terminal window**.
```bash
cd path/to/raakh-chain # Ensure you are in the project root
./scripts/start-node.sh validator 1 $BASE_DATADIR
```
**Expected Output (snippet):**
Look for a line similar to this near the beginning of the Geth logs:
```
INFO [MM-DD|HH:MM:SS.MMM] Started P2P networking self=enode://abcdef1234567890...@127.0.0.1:30303
```
**Action**: Copy the entire `enode://...` URL. This is `ENODE_URL_V1`.
Then, stop the validator with `Ctrl+C` in its terminal.

### 4.2 Obtain Enode URL for Validator 2

Similarly, start Validator 2 in **another new terminal window**.
```bash
cd path/to/raakh-chain
./scripts/start-node.sh validator 2 $BASE_DATADIR
```
**Expected Output (snippet):**
```
INFO [MM-DD|HH:MM:SS.MMM] Started P2P networking self=enode://fedcba0987654321...@127.0.0.1:30304
```
**Action**: Copy this `enode://...` URL. This is `ENODE_URL_V2`.
Stop this validator with `Ctrl+C`.

### 4.3 Update `config/static-nodes.json`

Open `config/static-nodes.json` in a text editor.
Replace the placeholder content with your copied enode URLs:
```json
[
  "enode://abcdef1234567890...@127.0.0.1:30303",
  "enode://fedcba0987654321...@127.0.0.1:30304"
]
```
**Action**: Save `config/static-nodes.json`. Ensure it's valid JSON (comma between entries, no trailing comma if only two).

---

## 5. Start the Blockchain

Now that genesis and static nodes are configured, you can start your validators.

### 5.1 Start Validator 1

In one terminal:
```bash
cd path/to/raakh-chain
./scripts/start-node.sh validator 1 $BASE_DATADIR
```
Geth will start, load the chain, and await peers. If it's the first one, it might start mining after a short delay if it's the sole signer or conditions are met.

### 5.2 Start Validator 2

In a second, separate terminal:
```bash
cd path/to/raakh-chain
./scripts/start-node.sh validator 2 $BASE_DATADIR
```
Once Validator 2 starts and connects to Validator 1 (using `static-nodes.json`), they should form a network. You should see them importing each other's blocks and block production should become regular (every ~1 second). Look for `Successfully sealed new block` or `mined new block` messages.

---

## 6. Optional: Start a Regular RPC Node

A regular (non-validating) node can be used for RPC interactions without burdening validators.

### 6.1 Initialize RPC Node Datadir

This node also needs to be initialized with the `genesis.json`.
```bash
mkdir -p ${BASE_DATADIR}/rpcnode1 # Choose a name like rpcnode1
geth --datadir ${BASE_DATADIR}/rpcnode1 init genesis/genesis.json
```
**Expected Output**: Geth confirmation of successful initialization.

### 6.2 Start RPC Node

In a third, separate terminal:
```bash
cd path/to/raakh-chain
./scripts/start-node.sh node rpcnode1 $BASE_DATADIR
```
This node will connect to the validators (via static nodes or discovery if enabled and static nodes fail) and sync the blockchain. Its RPC port will be different (e.g., `8549` as per `start-node.sh` logic). Check the script's output for its RPC URL.

---

## 7. Connecting Metamask

Follow the instructions in `README.md` or use the parameters from `client/metamask-network.json`:
-   **Network Name**: ŘǍǍǨȞ
-   **New RPC URL**: `http://127.0.0.1:8545` (for V1), `http://127.0.0.1:8547` (for V2), or your RPC node's URL.
-   **Chain ID**: `18181`
-   **Currency Symbol**: `ǨȞǍǍŘ`
-   **Block Explorer URL**: (leave blank)

---

## 8. Deploying Smart Contracts (Hardhat Example)

Refer to `README.md` for setting up Hardhat, configuring `hardhat.config.js`, and running deployment scripts like:
```bash
npx hardhat run deployments/deploy_token.js --network raakh_local
npx hardhat run deployments/deploy_ens.js --network raakh_local
```

---

This concludes the detailed setup. If you encounter issues, double-check:
-   Correctness of addresses in `genesis.json` (no `0x` in extradata, `0x` in alloc).
-   Correctness of enode URLs in `static-nodes.json`.
-   Geth version compatibility.
-   Permissions for data directories and script execution.
-   Firewall rules if running nodes on different machines (ensure P2P ports are open between them).
```
