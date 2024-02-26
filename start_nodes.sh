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
sleep 5 # give LND a moment to start

# TODO: Automate wallet creation for lnd1 or create it manually

# Start the second LND node on port 10010 for gRPC and 8081 for REST
lnd --lnddir="$PROJECT_ROOT/lnd2" \
    --configfile="$PROJECT_ROOT/lnd2/lnd.conf" \
    --noseedbackup \
    --rpclisten=localhost:10010 \
    --restlisten=localhost:8081 &  # Set a different port for the REST API
sleep 5 # give LND a moment to start

# TODO: Automate wallet creation for lnd2 or create it manually
