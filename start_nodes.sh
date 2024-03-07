#!/bin/bash

PROJECT_ROOT="/home/runner/lightning-regtest-repl"
BITCOIN_DATA="$PROJECT_ROOT/.bitcoin"
WALLET_PASSWORD="wallet_pass"

# Ensure the Bitcoin data directory exists
mkdir -p "$BITCOIN_DATA"

# Start bitcoind in the background with specified bitcoin.conf and data directory
bitcoind -printtoconsole -debug -conf="$PROJECT_ROOT/bitcoin.conf" -datadir="$BITCOIN_DATA"

# Give bitcoind some time to start
sleep 10

# Start the first LND node on port 10009
lnd --lnddir="$PROJECT_ROOT/lnd1" --configfile="$PROJECT_ROOT/lnd1/lnd.conf" --noseedbackup --rpclisten=localhost:10009 &
sleep 10 # give LND a moment to start

# TODO: Automate wallet creation for lnd1 or create it manually

# Start the second LND node on port 10010 for gRPC and 8081 for REST
lnd --lnddir="$PROJECT_ROOT/lnd2" \
    --configfile="$PROJECT_ROOT/lnd2/lnd.conf" \
    --noseedbackup \
    --rpclisten=localhost:10010 \
    --restlisten=localhost:8081 &  # Set a different port for the REST API
sleep 10 # give LND a moment to start

# Function to initialize or unlock the LND wallet and get a new address
initialize_or_unlock_lnd_wallet() {
    local lnd_dir=$1
    local rpc_port=$2
    local tlscertpath="${lnd_dir}/tls.cert"
    local macaroonpath="${lnd_dir}/data/chain/bitcoin/regtest/admin.macaroon"
    local wallet_password=$3

    # Unlock the wallet using the password provided via stdin
    echo $wallet_password | lncli --rpcserver=localhost:${rpc_port} \
                                  --tlscertpath=${tlscertpath} \
                                  --macaroonpath=${macaroonpath} \
                                  unlock --stdin

    # Generate a new onchain address for the LND node
    lncli --rpcserver=localhost:${rpc_port} \
          --tlscertpath=${tlscertpath} \
          --macaroonpath=${macaroonpath} \
          newaddress p2wkh | jq -r .address
}

# Function to mine bitcoins to a specific address using bitcoind
mine_to_address() {
    local address=$1
    local amount=$2

    # Mine the specified amount of bitcoins to the given address
    bitcoin-cli -datadir="$BITCOIN_DATA" -rpcport=18443 -rpcuser=plebdev -rpcpassword=pass generatetoaddress $amount "$address"
}

log_ln_node_oncahin_balance() {
    local lnd_dir=$1
    local rpc_port=$2
    local tlscertpath="${lnd_dir}/tls.cert"
    local macaroonpath="${lnd_dir}/data/chain/bitcoin/regtest/admin.macaroon"

    # Get the onchain balance
    local balance_info=$(lncli --rpcserver=localhost:${rpc_port} \
                                --tlscertpath=${tlscertpath} \
                                --macaroonpath=${macaroonpath} \
                                walletbalance)

    echo "Balance for node at port ${rpc_port}: $balance_info"
}

# Initialize or unlock wallets and generate onchain addresses for each LND node
lnd1_address=$(initialize_or_unlock_lnd_wallet "$PROJECT_ROOT/lnd1" 10009 "$WALLET_PASSWORD")
lnd2_address=$(initialize_or_unlock_lnd_wallet "$PROJECT_ROOT/lnd2" 10010 "$WALLET_PASSWORD")

echo "LND1 Address: $lnd1_address"
echo "LND2 Address: $lnd2_address"

# Mine 100 bitcoins to each LND node
mine_to_address "$lnd1_address" 100
mine_to_address "$lnd2_address" 100

# Typically, in regtest mode, mined coins are mature after 100 additional blocks
# so we'll generate 101 blocks to ensure at least 1 confirmation for the funding transactions.
bitcoin-cli -datadir="$BITCOIN_DATA" -rpcport=18443 -rpcuser=plebdev -rpcpassword=pass generatetoaddress 101 "$lnd1_address"
sleep 5

echo "Funding completed."

# Log the onchain balance for each node
log_ln_node_oncahin_balance "$PROJECT_ROOT/lnd1" 10009
log_ln_node_oncahin_balance "$PROJECT_ROOT/lnd2" 10010

