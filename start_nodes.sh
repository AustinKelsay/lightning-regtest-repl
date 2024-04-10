#!/bin/bash

# Set the project root directory
PROJECT_ROOT="/home/runner/lightning-regtest-repl"

# Set the Bitcoin data directory
BITCOIN_DATA="$PROJECT_ROOT/.bitcoin"

# Set the wallet password for LND nodes
WALLET_PASSWORD="wallet_pass"

# Function to start bitcoind
start_bitcoind() {
  # Ensure the Bitcoin data directory exists
  mkdir -p "$BITCOIN_DATA"

  # Start bitcoind in the background with specified bitcoin.conf and data directory
  bitcoind -printtoconsole -debug -conf="$PROJECT_ROOT/bitcoin.conf" -datadir="$BITCOIN_DATA" &

  # Give bitcoind some time to start
  sleep 10
}

# Function to start an LND node
start_lnd_node() {
  local lnd_dir=$1
  local listen_port=$2
  local rpc_port=$3
  local rest_port=$4

  # Start the LND node with the specified configuration
  lnd --lnddir="$lnd_dir" --configfile="$lnd_dir/lnd.conf" --noseedbackup \
      --listen=localhost:$listen_port \
      --rpclisten=localhost:$rpc_port \
      --restlisten=localhost:$rest_port &

  # Give LND a moment to start
  sleep 10
}

# Function to initialize or unlock the LND wallet and get a new address
initialize_or_unlock_lnd_wallet() {
  local lnd_dir=$1
  local rpc_port=$2
  local wallet_password=$3

  local tlscertpath="${lnd_dir}/tls.cert"
  local macaroonpath="${lnd_dir}/data/chain/bitcoin/regtest/admin.macaroon"

  # Unlock the wallet using the password provided via stdin
  echo $wallet_password | lncli --rpcserver=localhost:${rpc_port} --tlscertpath=${tlscertpath} --macaroonpath=${macaroonpath} unlock --stdin

  # Generate a new onchain address for the LND node
  lncli --rpcserver=localhost:${rpc_port} --tlscertpath=${tlscertpath} --macaroonpath=${macaroonpath} newaddress p2wkh | jq -r .address
}

# Function to log the onchain balance of an LND node
log_ln_node_onchain_balance() {
  local lnd_dir=$1
  local rpc_port=$2

  local tlscertpath="${lnd_dir}/tls.cert"
  local macaroonpath="${lnd_dir}/data/chain/bitcoin/regtest/admin.macaroon"

  # Get the onchain balance
  local balance_info=$(lncli --rpcserver=localhost:${rpc_port} --tlscertpath=${tlscertpath} --macaroonpath=${macaroonpath} walletbalance)

  echo "Balance for node at port ${rpc_port}: $balance_info"
}

# Function to write the connection details and identity pubkey of an LND node to connection_info.md
write_lnd_node_connection_details() {
  local lnd_dir=$1
  local rpc_port=$2
  local rest_port=$3
  local gossip_port=$4

  local tlscertpath="${lnd_dir}/tls.cert"
  local macaroonpath="${lnd_dir}/data/chain/bitcoin/regtest/admin.macaroon"

  # Get the IP address
  local ip_address=$(hostname -I | awk '{print $1}')

  # Bake a new admin macaroon with all permissions
  local macaroon_file="${lnd_dir}/data/chain/bitcoin/regtest/admin.macaroon"
  lncli --rpcserver=localhost:${rpc_port} --tlscertpath=${tlscertpath} --macaroonpath=${macaroonpath} \
    bakemacaroon \
    --save_to="${macaroon_file}" \
    info:read invoices:write message:read message:write onchain:read peers:read peers:write signer:generate signer:read offchain:read offchain:write

  # Encode the macaroon in hex format
  local macaroon_hex=$(xxd -ps -c 1000 "${macaroon_file}")

  # Get the identity pubkey of the LND node
  local identity_pubkey=$(lncli --rpcserver=localhost:${rpc_port} --tlscertpath=${tlscertpath} --macaroonpath=${macaroonpath} getinfo | jq -r .identity_pubkey)

  # Write the connection details and identity pubkey to connection_info.md with line breaks
  {
    echo "Connection details for LND node at ${lnd_dir}:"
    echo ""
    echo "REST port: ${rest_port}"
    echo ""
    echo "Peering port: ${gossip_port}"
    echo ""
    echo "Hex-encoded macaroon:"
    echo "${macaroon_hex}"
    echo ""
    echo "Identity Pubkey: ${identity_pubkey}"
    echo ""
    echo "---"
    echo ""
  } >> connection_info.md
}

# Start bitcoind
start_bitcoind

# Start the first LND node on port 10009 and 8080 for REST
start_lnd_node "$PROJECT_ROOT/lnd1" 9735 10009 8080

# Start the second LND node on port 10010 and 8099 for REST
start_lnd_node "$PROJECT_ROOT/lnd2" 9736 10010 8099

# Initialize or unlock wallet and generate onchain address for the first LND node
lnd1_address=$(initialize_or_unlock_lnd_wallet "$PROJECT_ROOT/lnd1" 10009 "$WALLET_PASSWORD")

echo "LND1 Address: $lnd1_address"

# Initialize or unlock wallet and generate onchain address for the second LND node 
lnd2_address=$(initialize_or_unlock_lnd_wallet "$PROJECT_ROOT/lnd2" 10010 "$WALLET_PASSWORD")

echo "LND2 Address: $lnd2_address"

# Mine 100 bitcoins to each LND node
# In regtest mode, mined coins are mature after 100 additional blocks
# so we'll generate 101 blocks to ensure at least 1 confirmation for the funding transaction.
bitcoin-cli -datadir="$BITCOIN_DATA" -rpcport=18443 -rpcuser=plebdev -rpcpassword=pass generatetoaddress 101 "$lnd1_address"

bitcoin-cli -datadir="$BITCOIN_DATA" -rpcport=18443 -rpcuser=plebdev -rpcpassword=pass generatetoaddress 101 "$lnd2_address"

sleep 10

echo "Funding completed."

# Log the onchain balance for each node
log_ln_node_onchain_balance "$PROJECT_ROOT/lnd1" 10009
log_ln_node_onchain_balance "$PROJECT_ROOT/lnd2" 10010

# Write the connection details and identity pubkey for each LND node to connection_info.md
write_lnd_node_connection_details "$PROJECT_ROOT/lnd1" 10009 8080 9735
write_lnd_node_connection_details "$PROJECT_ROOT/lnd2" 10010 8099 9736

# Keep the script running to perform regular checks or operations
while true; do
  # Mine a single block to the first LND node's address every 30 seconds
  bitcoin-cli -datadir="$BITCOIN_DATA" -rpcport=18443 -rpcuser=plebdev -rpcpassword=pass generatetoaddress 1 "$lnd1_address"

  echo "Mined a block at $(date)"

  sleep 10 # Sleep for 10 seconds
done
