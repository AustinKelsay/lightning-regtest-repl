import React, { useState, useEffect } from "react";
import axios from "axios";
import Channels from "./components/Channels";
import AddPeer from "./components/AddPeer";
import LightningWallet from "./components/LightningWallet";
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

  const loadAll = async function () {
    await getInfo();
    await loadChannels();
    await loadChannelBalances();
    await loadOnchainBalance();
  };

  const connect = async () => {
    try {
      const response = await axios.get(`${host}:${port}/v1/getinfo`, {
        headers: {
          "grpc-metadata-macaroon": macaroon,
        }
      });

      console.log("connect response", response.data);

      if (response.data) {
        setConnectedNode(response.data);
        setShowConnectForm(false);
        await loadAll();
      } else {
        alert("Failed to connect to the node");
      }
    } catch (error) {
      alert(`Failed to connect to the node: ${JSON.stringify(error.response?.data)}`);
    }
  };

  const getInfo = async function () {
    try {
      const options = {
        method: "GET",
        url: `${host}:${port}/v1/getinfo`,
        headers: {
          "grpc-metadata-macaroon": macaroon,
        },
      };

      const response = await axios(options);
      console.log("getinfo", response.data);

      if (response.data) {
        setConnectedNode(response.data);
      }
    } catch (error) {
      alert(`Failed to get info: ${JSON.stringify(error.response?.data)}`);
    }
  };

  const loadChannels = async function () {
    try {
      const options = {
        method: "GET",
        url: `${host}:${port}/v1/channels`,
        headers: {
          "grpc-metadata-macaroon": macaroon,
        },
      };

      const response = await axios(options);
      console.log("load channels", response.data);

      if (response.data?.channels.length > 0) {
        setChannels(response.data.channels);
      }
    } catch (error) {
      alert(`Failed to load channels: ${JSON.stringify(error.response?.data)}`);
    }
  };

  const loadChannelBalances = async function () {
    try {
      const options = {
        method: "GET",
        url: `${host}:${port}/v1/balance/channels`,
        headers: {
          "grpc-metadata-macaroon": macaroon,
        },
      };

      const response = await axios(options);
      console.log("load channel balance", response.data);

      if (response.data?.local_balance) {
        setLightningBalance(response.data.local_balance?.sat);
      }
    } catch (error) {
      alert(`Failed to load channel balances: ${JSON.stringify(error.response?.data)}`);
    }
  };

  const loadOnchainBalance = async function () {
    try {
      const options = {
        method: "GET",
        url: `${host}:${port}/v1/balance/blockchain`,
        headers: {
          "grpc-metadata-macaroon": macaroon,
        },
      };

      const response = await axios(options);

      if (response.data) {
        setOnchainBalance(response.data.total_balance);
      }
    } catch (error) {
      alert(`Failed to load onchain balance: ${JSON.stringify(error.response?.data)}`);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {connectedNode?.identity_pubkey ? <p>Connected to: {connectedNode.alias}</p> : <p>Not connected</p>}
      </header>

      {/* Refresh button */}
      {connectedNode?.identity_pubkey && (
        <>
          <button className="refresh-button" onClick={loadAll}>
            Refresh
          </button>

          <p className="block-height">Block Height: {connectedNode.block_height}</p>
        </>
      )}

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
      {connectedNode?.identity_pubkey && <h2>Connected to {connectedNode?.identity_pubkey}</h2>}

      {/* balance */}
      {connectedNode?.identity_pubkey && (
        <div className="balances">
          <div className="balance">
            <h3>Onchain balance</h3>
            <p>{onchainBalance} sats</p>
          </div>
        </div>
      )}

      {/* Lightning Wallet */}
      {connectedNode?.identity_pubkey && <LightningWallet host={host} port={port} macaroon={macaroon} lightningBalance={lightningBalance} />}

      {/* add peer */}
      {connectedNode?.identity_pubkey && <AddPeer host={host} port={port} macaroon={macaroon} />}

      {/* channels */}
      {connectedNode?.identity_pubkey &&
        <Channels
          channels={channels}
          host={host}
          port={port}
          macaroon={macaroon}
          loadChannels={loadChannels}
        />
      }
    </div>
  );
}

export default App;