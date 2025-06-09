#!/bin/bash
set -e # Exit on error

# Script to initialize a Geth validator node for ŘǍǍǨȞ chain

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <VALIDATOR_ID> <BASE_DATADIR>"
    echo "Example: $0 1 ./node-data"
    exit 1
fi

VALIDATOR_ID="$1"
BASE_DATADIR="$2"
CHAIN_NAME="ŘǍǍǨȞ"

DATADIR="${BASE_DATADIR}/validator${VALIDATOR_ID}"
KEYSTORE_DIR="${DATADIR}/keystore"
PASSWORD_FILE="${DATADIR}/password.txt"
GENESIS_FILE_PATH="$(dirname "$0")/../genesis/genesis.json" # Correct relative path

DEFAULT_PASSWORD="raftburi-king-cobra-admin-danger-password-!@#$"

echo "==================================================================="
echo "Initializing Validator ${VALIDATOR_ID} for ${CHAIN_NAME}"
echo "==================================================================="
echo "Data directory:       ${DATADIR}"
echo "Keystore directory:   ${KEYSTORE_DIR}"
echo "Password file:        ${PASSWORD_FILE}"
echo "Genesis file:         ${GENESIS_FILE_PATH}"
echo "-------------------------------------------------------------------"

# Create directories
mkdir -p "${DATADIR}"
mkdir -p "${KEYSTORE_DIR}"
echo "Created data and keystore directories."

# Create password file
if [ ! -f "${PASSWORD_FILE}" ]; then
    echo "${DEFAULT_PASSWORD}" > "${PASSWORD_FILE}"
    echo "Created password file: ${PASSWORD_FILE}"
else
    echo "Password file ${PASSWORD_FILE} already exists."
fi
chmod 600 "${PASSWORD_FILE}" # Secure password file

# Check for existing accounts and create if none exist
ACCOUNT_ADDRESS=""
if [ -z "$(ls -A ${KEYSTORE_DIR})" ]; then
    echo "No accounts found. Creating a new account for Validator ${VALIDATOR_ID}..."
    # The output format of `geth account new` can vary.
    # This attempts to capture the address.
    OUTPUT=$(geth --datadir "${DATADIR}" account new --password "${PASSWORD_FILE}")
    # Try to extract address: Public address of the key:   0x<address>
    ACCOUNT_ADDRESS=$(echo "${OUTPUT}" | grep -i "Public address of the key:" | awk '{print $NF}')
    # Alternative extraction if the above fails: Address: {<address>}
    if [ -z "$ACCOUNT_ADDRESS" ]; then
        ACCOUNT_ADDRESS=$(echo "${OUTPUT}" | grep -i "Address:" | awk -F '[{}]' '{print $2}')
    fi

    if [ -n "${ACCOUNT_ADDRESS}" ]; then
        # Geth might return {address}, remove curly braces if present
        ACCOUNT_ADDRESS=$(echo "${ACCOUNT_ADDRESS}" | tr -d '{}')
        # Ensure it has 0x prefix
        if [[ ! "$ACCOUNT_ADDRESS" == 0x* ]]; then
            ACCOUNT_ADDRESS="0x${ACCOUNT_ADDRESS}"
        fi
        echo "-------------------------------------------------------------------"
        echo "IMPORTANT: New account created for Validator ${VALIDATOR_ID}!"
        echo "Address: ${ACCOUNT_ADDRESS}"
        echo "This address MUST be added to the 'extradata' and 'alloc' sections"
        echo "of your genesis.json file BEFORE initializing other nodes or if re-initializing."
        echo "-------------------------------------------------------------------"
    else
        echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
        echo "ERROR: Could not automatically extract the account address."
        echo "Please check the output above. You may need to find it manually in ${KEYSTORE_DIR}"
        echo "The key file is usually named like UTC--<timestamp>--<address>"
        echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
        # List files as a fallback
        ls -l "${KEYSTORE_DIR}"
    fi
else
    echo "Existing account(s) found in ${KEYSTORE_DIR}. Using the first one found for info."
    # List accounts and try to get the address of the first one
    FIRST_KEY_FILE=$(ls -t ${KEYSTORE_DIR}/* | head -1)
    if [ -n "${FIRST_KEY_FILE}" ]; then
        # Address is usually the last part of the filename after '--'
        ACCOUNT_ADDRESS="0x$(basename ${FIRST_KEY_FILE} | awk -F '--' '{print $NF}')"
        echo "Using existing account: ${ACCOUNT_ADDRESS} (derived from filename ${FIRST_KEY_FILE})"
    else
        echo "Could not determine address from existing key files."
    fi
fi

# Initialize Geth with the genesis file
echo "Initializing Geth with genesis file: ${GENESIS_FILE_PATH}..."
geth --datadir "${DATADIR}" init "${GENESIS_FILE_PATH}"
echo "Geth initialization complete for Validator ${VALIDATOR_ID}."
echo "-------------------------------------------------------------------"
echo "Validator ${VALIDATOR_ID} account address: ${ACCOUNT_ADDRESS}"
echo "Nodekey for this validator is located at: ${DATADIR}/geth/nodekey"
echo "The enode URL will be available once the node is started."
echo "You will need this enode URL for static-nodes.json for other peers."
echo "==================================================================="
echo "Setup for Validator ${VALIDATOR_ID} DONE."
echo "IF THIS IS THE FIRST TIME, UPDATE YOUR genesis.json NOW with the address(es)!"
echo "==================================================================="

# Store the address for potential later use by other scripts (e.g. to update static-nodes.json)
if [ -n "${ACCOUNT_ADDRESS}" ]; then
  echo "${ACCOUNT_ADDRESS}" > "${DATADIR}/account.address"
fi
