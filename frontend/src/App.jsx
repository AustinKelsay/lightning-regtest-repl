import React, { useState, useEffect } from "react";
import Channels from "./components/Channels";
import AddPeer from "./components/AddPeer";
import OpenChannel from "./components/OpenChannel";
import "./App.css";

function App() {
  const [connectedNode, setConnectedNode] = useState({});
  const [channels, setChannels] = useState([]);
  const [onchainBalance, setOnchainBalance] = useState(0);
  const [lightningBalance, setLightningBalance] = useState(0);

  const loadAll = async function () {
    await loadChannels();
    await loadBalances();
  };

  useEffect(() => {
    loadAll();
  }, [connectedNode]);

  const connect = async () => {
    await window.webln.enable();

    const info = await window.webln.getInfo();

    console.log(info, "infooooo");

    setConnectedNode(info?.node);
    
    // if (!info.methods || !info.methods.includes("walletbalance")) {
    //   alert(
    //     "Your connected WebLN provider is not supported. Please use Alby with a LND node",
    //   );
    //   document.location = "/";
    //   return false;
    // }
    return true;
  };

  const loadChannels = async function () {
    const nodeDetails = await window.webln.request("getnodeinfo", {
      pub_key: connectedNode.pubkey,
    });
    console.log("nodeDetails", nodeDetails);
    const result = await window.webln.request("listchannels");

    const channels = result.channels;
    console.log("channels", channels);
    setChannels(
      channels.sort((a, b) => {
        return b.local_balance - a.local_balance;
      }),
    );
  };

  const loadBalances = async function () {
    await window.webln.enable();
    const channelbalance = await window.webln.request("channelbalance");
    const walletbalance = await window.webln.request("walletbalance");
    const onchain = walletbalance.total_balance;
    const lightning = channelbalance.balance;
    setLightningBalance(lightning);
    setOnchainBalance(onchain);

    console.log({ onchainBalance });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Node Dashboard</h1>
        {connectedNode?.pubkey && <p>Connected to: {connectedNode.alias}</p>}
      </header>
      {/* connect button */}
      {!connectedNode?.pubkey && (
        <button onClick={connect}>Connect to your node</button>
      )}
      {/* connected */}
      {connectedNode?.pubkey && <h2>Connected to {connectedNode?.pubkey}</h2>}
      {/* balances */}
      {connectedNode?.pubkey && (
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
      {connectedNode?.pubkey && <AddPeer />}
      {/* open channel */}
      {connectedNode?.pubkey && <OpenChannel />}
      {/* channels */}
      <Channels channels={channels} />
    </div>
  );
}

export default App;
