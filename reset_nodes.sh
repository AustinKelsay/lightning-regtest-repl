#!/bin/bash

# Set the project root directory
PROJECT_ROOT="/home/runner/lightning-regtest-repl"

# Set the Bitcoin data directory
BITCOIN_DATA="$PROJECT_ROOT/.bitcoin"

# Function to check if a process is running on a specified port
is_process_running() {
  local port=$1
  if nc -z localhost $port; then
    return 0 # Process is running
  else
    return 1 # Process is not running
  fi
}

# Function to safely stop bitcoind and remove the regtest directory
stop_bitcoind() {
  echo "Stopping bitcoind..."
  bitcoin-cli -datadir="$BITCOIN_DATA" -rpcport=18443 -rpcuser=plebdev -rpcpassword=pass stop
  sleep 5 # Wait a bit to ensure bitcoind stops gracefully

  # Remove the regtest directory to start from block 0
  local regtest_dir="${BITCOIN_DATA}/regtest"
  if [ -d "$regtest_dir" ]; then
    echo "Removing regtest directory..."
    rm -rf "$regtest_dir"
  fi
}

# Function to safely stop LND and clean up its data while preserving certain files
stop_and_cleanup_lnd() {
  local lnd_dir=$1
  local rpc_port=$2
  local lnd_conf="${lnd_dir}/lnd.conf"
  local tlscertpath="${lnd_dir}/tls.cert"
  local macaroonpath="${lnd_dir}/data/chain/bitcoin/regtest/admin.macaroon"

  if is_process_running $rpc_port; then
    echo "Stopping LND node at port ${rpc_port}..."
    lncli --rpcserver=localhost:${rpc_port} --tlscertpath=${tlscertpath} --macaroonpath=${macaroonpath} stop
    sleep 5 # Wait a bit to ensure LND stops gracefully
  else
    echo "LND node at port ${rpc_port} is not running."
  fi

  # Backup tls.cert, tls.key, and lnd.conf
  local backup_dir="${lnd_dir}_backup"
  mkdir -p "$backup_dir"
  cp "$lnd_conf" "$tlscertpath" "${tlscertpath%.*}.key" "$backup_dir"

  # Remove the LND data directory
  rm -rf "$lnd_dir"

  # Restore tls.cert, tls.key, and lnd.conf
  mkdir -p "$lnd_dir"
  cp "$backup_dir"/* "$lnd_dir"
  rm -rf "$backup_dir"
}

# Delete connection_info.md if it exists
if [ -f "connection_info.md" ]; then
  echo "Deleting connection_info.md..."
  rm "connection_info.md"
fi

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