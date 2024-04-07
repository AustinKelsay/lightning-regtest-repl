import React, { useState, useEffect } from "react";
import axios from "axios";
import Channels from "./components/Channels";
import AddPeer from "./components/AddPeer";
import "./App.css";

function App() {
  const [connectedNode, setConnectedNode] = useState({});
  const [channels, setChannels] = useState([]);
  const [onchainBalance, setOnchainBalance] = useState(0);
  const [lightningBalance, setLightningBalance] = useState(0);
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [macaroon, setMacaroon] = useState("");
  const [showOpenChannelForm, setShowOpenChannelForm] = useState(false);
  const [nodePubkey, setNodePubkey] = useState("");
  const [localFundingAmount, setLocalFundingAmount] = useState(0);
  const [privateChannel, setPrivateChannel] = useState(false);

  const loadAll = async function () {
    await loadChannels();
    await loadChannelBalances();
    await loadOnchainBalance();
  };

  useEffect(() => {
    if (connectedNode?.identity_pubkey) {
      loadAll();
    }
  }, [connectedNode]);

  const connect = async () => {
    try {
      const response = await axios.get(`${host}:${port}/v1/getinfo`, {
        headers: {
          "grpc-metadata-macaroon": macaroon,
        },
      });

      console.log("yoooo", response.data);

      if (response.data) {
        setConnectedNode(response.data);
        setShowConnectForm(false);
      } else {
        alert("Failed to connect to the node");
      }
    } catch (error) {
      console.error("Error connecting to the node:", error);
      alert("Failed to connect to the node");
    }
  };

  const loadChannels = async function () {
    try {
      const response = await axios.get(`${host}:${port}/v1/channels`, {
        headers: {
          "grpc-metadata-macaroon": macaroon,
        },
      });

      console.log("load channels", response.data);

      if (response.data?.channels.length > 0) {
        setChannels(response.data.channels);
      }
    } catch (error) {
      console.error("Error loading channel balances:", error);
    }
  };

  const loadChannelBalances = async function () {
    try {
      const response = await axios.get(`${host}:${port}/v1/balance/channels`, {
        headers: {
          "grpc-metadata-macaroon": macaroon,
        },
      });

      console.log("load channel balance", response.data);

      if (response.data?.local_balance) {
        setLightningBalance(response.data.local_balance?.sat);
      }
    } catch (error) {
      console.error("Error loading channel balances:", error);
    }
  };

  const loadOnchainBalance = async function () {
    try {
      const response = await axios.get(
        `${host}:${port}/v1/balance/blockchain`,
        {
          headers: {
            "grpc-metadata-macaroon": macaroon,
          },
        },
      );

      if (response.data) {
        setOnchainBalance(response.data.total_balance);
      }
    } catch (error) {
      console.error("Error loading onchain balance:", error);
    }
  };

  function hexToBase64(hexstring) {
    return window.btoa(
      hexstring
        .match(/\w{2}/g)
        .map(function (a) {
          return String.fromCharCode(parseInt(a, 16));
        })
        .join(""),
    );
  }

  const openChannel = async () => {
    try {
      const response = await axios.post(
        `${host}:${port}/v1/channels/stream`,
        {
          node_pubkey: hexToBase64(nodePubkey),
          local_funding_amount: localFundingAmount,
          private: privateChannel,
        },
        {
          headers: {
            "grpc-metadata-macaroon": macaroon,
          },
        },
      );

      console.log("Open channel response:", response.data);
      // Handle the response and update the channels state if needed
      setShowOpenChannelForm(false);
    } catch (error) {
      console.error("Error opening channel:", error);
      alert("Failed to open channel");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Node Dashboard</h1>
        {connectedNode?.identity_pubkey && (
          <p>Connected to: {connectedNode.alias}</p>
        )}
      </header>

      {/* connect button */}
      {!connectedNode?.identity_pubkey && (
        <button onClick={() => setShowConnectForm(true)}>
          Connect to your node
        </button>
      )}

      {/* connect form */}
      {showConnectForm && (
        <div className="connect-form">
          <input
            type="text"
            placeholder="Host"
            value={host}
            onChange={(e) => setHost(e.target.value)}
          />
          <input
            type="text"
            placeholder="Port"
            value={port}
            onChange={(e) => setPort(e.target.value)}
          />
          <input
            placeholder="Macaroon"
            value={macaroon}
            onChange={(e) => setMacaroon(e.target.value)}
          />
          <button onClick={connect}>Connect</button>
        </div>
      )}

      {/* connected */}
      {connectedNode?.identity_pubkey && (
        <h2>Connected to {connectedNode?.identity_pubkey}</h2>
      )}

      {/* balances */}
      {connectedNode?.identity_pubkey && (
        <div className="balances">
          <div className="balance">
            <h3>Onchain balance</h3>
            <p>{onchainBalance} sats</p>
          </div>
          <div className="balance">
            <h3>Lightning balance</h3>
            <p>{lightningBalance} sats</p>
          </div>
        </div>
      )}

      {/* add peer */}
      {connectedNode?.identity_pubkey && (
        <AddPeer host={host} port={port} macaroon={macaroon} />
      )}

      {/* open channel */}
      {connectedNode?.identity_pubkey && (
        <button onClick={() => setShowOpenChannelForm(true)}>
          Open Channel
        </button>
      )}

      {/* open channel form */}
      {showOpenChannelForm && (
        <div className="open-channel-form">
          <input
            type="text"
            placeholder="Node Pubkey"
            value={nodePubkey}
            onChange={(e) => setNodePubkey(e.target.value)}
          />
          <input
            type="number"
            placeholder="Local Funding Amount (sats)"
            value={localFundingAmount}
            onChange={(e) => setLocalFundingAmount(e.target.value)}
          />
          <label>
            <input
              type="checkbox"
              checked={privateChannel}
              onChange={(e) => setPrivateChannel(e.target.checked)}
            />
            Private Channel
          </label>
          <button onClick={openChannel}>Open Channel</button>
        </div>
      )}

      {/* channels */}
      <Channels channels={channels} />
    </div>
  );
}

export default App;
