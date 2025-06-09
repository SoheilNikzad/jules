#!/bin/bash
# Script to start a Geth node (validator or regular) for ŘǍǍǨȞ chain
# set -e # Problematic with exec if geth has issues starting that are not script errors

if [ "$#" -ne 3 ]; then
    echo "Usage: $0 <NODE_TYPE> <ID> <BASE_DATADIR>"
    echo "Example (validator): $0 validator 1 ./node-data"
    echo "Example (regular node): $0 node rpcnode1 ./node-data"
    exit 1
fi

NODE_TYPE="$1" # "validator" or "node"
ID="$2"        # e.g., "1", "2" for validators, or a name for regular nodes
BASE_DATADIR="$3"

CHAIN_NAME="ŘǍǍǨȞ"
NETWORK_ID=18181

# Configuration & Ports - Adjust as needed
# These ports are base ports; they might be incremented for multiple instances.
DEFAULT_P2P_BASE_PORT=30303
DEFAULT_RPC_BASE_PORT=8545
DEFAULT_WS_BASE_PORT=8546 # Optional

# Relative path to config directory from scripts directory
CONFIG_DIR_RELPATH="../config"
STATIC_NODES_FILE="${CONFIG_DIR_RELPATH}/static-nodes.json"

# Determine DATADIR and Ports
if [ "${NODE_TYPE}" == "validator" ]; then
    DATADIR="${BASE_DATADIR}/validator${ID}"
    # Assign ports based on validator ID to allow multiple validators on one host
    # Validator 1: 30303, 8545, 8546
    # Validator 2: 30304, 8547, 8548
    # ...and so on
    P2P_PORT=$((DEFAULT_P2P_BASE_PORT + ID - 1))
    RPC_PORT=$((DEFAULT_RPC_BASE_PORT + (ID - 1) * 2)) # Increment RPC by 2 to leave space for WS
    WS_PORT=$((DEFAULT_WS_BASE_PORT + (ID - 1) * 2))
elif [ "${NODE_TYPE}" == "node" ]; then
    DATADIR="${BASE_DATADIR}/node-${ID}"
    # For a generic node, let's use ports distinct from the first two validators
    # E.g., if ID is "rpcnode1", this won't calculate nicely with arithmetic.
    # For simplicity, let's assume generic nodes start after validator 2's port range
    P2P_PORT=$((DEFAULT_P2P_BASE_PORT + 2 + $(echo $ID | sed 's/[^0-9]*//g' | head -c1 | awk '{print $0 + 0}'))) # Basic attempt to get a number from ID
    RPC_PORT=$((DEFAULT_RPC_BASE_PORT + 4 + $(echo $ID | sed 's/[^0-9]*//g' | head -c1 | awk '{print $0 + 0}')))
    WS_PORT=$((DEFAULT_WS_BASE_PORT + 4 + $(echo $ID | sed 's/[^0-9]*//g' | head -c1 | awk '{print $0 + 0}')))
    # Fallback if ID provides no number for offset
    [ "$P2P_PORT" -eq "$((DEFAULT_P2P_BASE_PORT + 2))" ] && P2P_PORT=$((DEFAULT_P2P_BASE_PORT + 10))
    [ "$RPC_PORT" -eq "$((DEFAULT_RPC_BASE_PORT + 4))" ] && RPC_PORT=$((DEFAULT_RPC_BASE_PORT + 10))
    [ "$WS_PORT" -eq "$((DEFAULT_WS_BASE_PORT + 4))" ] && WS_PORT=$((DEFAULT_WS_BASE_PORT + 10))

else
    echo "ERROR: Invalid NODE_TYPE. Must be 'validator' or 'node'."
    exit 1
fi

echo "==================================================================="
echo "Starting ${CHAIN_NAME} ${NODE_TYPE} (ID: ${ID})"
echo "==================================================================="
echo "Data directory:       ${DATADIR}"
echo "Network ID:           ${NETWORK_ID}"
echo "P2P Port:             ${P2P_PORT}"
echo "HTTP RPC Port:        ${RPC_PORT}"
echo "WebSocket Port:       ${WS_PORT} (if enabled)"
echo "Static Nodes:         ${STATIC_NODES_FILE}"
echo "-------------------------------------------------------------------"

if [ ! -d "${DATADIR}" ]; then
    echo "ERROR: Data directory ${DATADIR} does not exist."
    echo "Please initialize the node first (e.g., using init-validator.sh for validators)."
    exit 1
fi

# Common Geth options
GETH_OPTS=(
    "--datadir" "${DATADIR}"
    "--networkid" "${NETWORK_ID}"
    "--port" "${P2P_PORT}"
    "--http"
    "--http.addr" "0.0.0.0"
    "--http.port" "${RPC_PORT}"
    "--http.api" "eth,net,web3,personal,clique"
    "--http.corsdomain" "*"
    "--ws" # Enable WebSocket by default as per original request context (optional)
    "--ws.addr" "0.0.0.0"
    "--ws.port" "${WS_PORT}"
    "--ws.api" "eth,net,web3,personal,clique"
    "--ws.origins" "*"
    "--syncmode" "full"       # Snap is default on new geth, full is also fine
    "--gcmode" "full"          # For pruning, as archive is not needed
    "--cache" "128"            # Keep low for resource saving
    # "--txlookuplimit" "0"    # Saves disk/memory, but limits old tx lookup by hash. Consider if needed.
    "--verbosity" "3"          # Log level (3=info)
    "--maxpeers" "25"
    "--nodiscover"             # Recommended for small private networks with static nodes
    "--identity" "${CHAIN_NAME}-${NODE_TYPE}-${ID}"
)

# Add static nodes if the file exists and is not empty
if [ -s "${STATIC_NODES_FILE}" ]; then
    GETH_OPTS+=("--staticnodes" "${STATIC_NODES_FILE}")
    echo "Using static nodes file: ${STATIC_NODES_FILE}"
else
    # If static-nodes.json is not present or empty, Geth will try discovery or rely on bootnodes (if configured).
    # For a private chain, static nodes are highly recommended.
    # We might want to use --bootnodes if static-nodes.json is not ready,
    # but that requires knowing enode URLs.
    echo "WARNING: Static nodes file ${STATIC_NODES_FILE} not found or empty."
    echo "Node will attempt discovery or use compiled-in bootnodes (if any)."
    echo "For a stable private network, ensure static-nodes.json is configured."
fi


# Validator-specific options
if [ "${NODE_TYPE}" == "validator" ]; then
    ACCOUNT_ADDRESS_FILE="${DATADIR}/account.address"
    PASSWORD_FILE="${DATADIR}/password.txt"

    if [ ! -f "${ACCOUNT_ADDRESS_FILE}" ]; then
        echo "ERROR: Account address file ${ACCOUNT_ADDRESS_FILE} not found for validator ${ID}."
        echo "Please ensure the validator was initialized correctly and the address file exists."
        exit 1
    fi
    if [ ! -f "${PASSWORD_FILE}" ]; then
        echo "ERROR: Password file ${PASSWORD_FILE} not found for validator ${ID}."
        exit 1
    fi

    ACCOUNT_ADDRESS=$(cat "${ACCOUNT_ADDRESS_FILE}")
    if [ -z "${ACCOUNT_ADDRESS}" ]; then
        echo "ERROR: Could not read account address for validator ${ID} from ${ACCOUNT_ADDRESS_FILE}."
        exit 1
    fi
    echo "Validator Account:    ${ACCOUNT_ADDRESS}"
    echo "Unlocking account and starting mining..."

    GETH_OPTS+=(
        "--mine"
        "--miner.threads" "1"
        "--unlock" "${ACCOUNT_ADDRESS}"
        "--password" "${PASSWORD_FILE}"
        "--miner.gasprice" "0" # Or a low value, e.g., "1000000000"
        "--miner.etherbase" "${ACCOUNT_ADDRESS}"
        "--allow-insecure-unlock" # Needed for script-based unlocking with --password
    )
fi

echo "-------------------------------------------------------------------"
echo "Starting Geth with the following command:"
# Print the command in a readable way
COMMAND_STRING="geth"
for OPT in "${GETH_OPTS[@]}"; do
  COMMAND_STRING+=" \"${OPT}\""
done
echo "${COMMAND_STRING}"
echo "-------------------------------------------------------------------"
echo "${NODE_TYPE} (ID: ${ID}) RPC endpoint will be: http://127.0.0.1:${RPC_PORT}"
echo "To stop the node, press Ctrl+C."
echo "Node logs will follow:"

# Execute Geth
# The exec command replaces the current shell process with the Geth process.
exec geth "${GETH_OPTS[@]}"

# If exec fails or Geth exits, this part might be reached if not for set -e
echo "Geth process finished."
