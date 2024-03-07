#!/bin/bash

PROJECT_ROOT="/home/runner/lightning-regtest-repl"
BITCOIN_DATA="$PROJECT_ROOT/.bitcoin"

# Function to check if LND is running
is_lnd_running() {
    local rpc_port=$1
    if nc -z localhost ${rpc_port}; then
        return 0 # LND is running
    else
        return 1 # LND is not running
    fi
}

# Function to safely stop bitcoind
stop_bitcoind() {
    echo "Stopping bitcoind..."
    bitcoin-cli -datadir="$BITCOIN_DATA" -rpcport=18443 -rpcuser=plebdev -rpcpassword=pass stop
    sleep 5 # Wait a bit to ensure bitcoind stops gracefully
}

# Function to safely stop LND and clean up its data while preserving certain files
stop_and_cleanup_lnd() {
    local lnd_dir=$1
    local rpc_port=$2
    local lnd_conf="${lnd_dir}/lnd.conf"
    local macaroonpath="${lnd_dir}/data/chain/bitcoin/regtest/admin.macaroon"

    if is_lnd_running $rpc_port; then
        echo "Stopping LND node at port ${rpc_port}..."
        lncli --rpcserver=localhost:${rpc_port} \
              --tlscertpath=${tlscertpath} \
              --macaroonpath=${macaroonpath} \
              stop
        sleep 5 # Wait a bit to ensure LND stops gracefully
    else
        echo "LND node at port ${rpc_port} is not running."
    fi

    # Backup tls.cert, tls.key, and lnd.conf
    local backup_dir="${lnd_dir}_backup"
    mkdir -p "$backup_dir"
    cp "$lnd_conf" "$backup_dir"

    # Remove the LND data directory
    rm -rf "$lnd_dir"

    # Restore tls.cert, tls.key, and lnd.conf
    mkdir -p "$lnd_dir"
    cp "$backup_dir/"* "$lnd_dir"
    rm -rf "$backup_dir"
}

# Stop bitcoind and LND nodes and clean up
stop_bitcoind
stop_and_cleanup_lnd "$PROJECT_ROOT/lnd1" 10009
stop_and_cleanup_lnd "$PROJECT_ROOT/lnd2" 10010

# Clean up the Bitcoin data directory
echo "Cleaning up Bitcoin data directory..."
rm -rf "$BITCOIN_DATA"

# Re-create the necessary directory for a fresh start
mkdir -p "$BITCOIN_DATA"

echo "Reset completed."