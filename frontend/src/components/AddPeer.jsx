import React, { useState } from "react";
import axios from "axios";

function AddPeer({ host, port, macaroon }) {
  const [showAddPeerForm, setShowAddPeerForm] = useState(false);
  const [peerPubkey, setPeerPubkey] = useState("");
  const [peerHost, setPeerHost] = useState("");

  const addPeer = async () => {
    try {
      const options = {
        method: "POST",
        url: `${host}:${port}/v1/peers`,
        data: {
          addr: {
            pubkey: peerPubkey,
            host: peerHost,
          },
          perm: true,
        },
        headers: {
          "grpc-metadata-macaroon": macaroon,
        },
      };

      const response = await axios(options);
      console.log("Add peer response:", response.data);
      alert("Peer added successfully.");
      setShowAddPeerForm(false);
    } catch (error) {
      alert(`Failed to add peer: ${JSON.stringify(error.response?.data)}`);
    }
  };

  return (
    <div>
      <h2>Peering</h2>
      <button onClick={() => setShowAddPeerForm(!showAddPeerForm)}>
        Add Peer
      </button>

      {showAddPeerForm && (
        <div className="add-peer-form">
          <input
            type="text"
            placeholder="Peer Pubkey"
            value={peerPubkey}
            onChange={(e) => setPeerPubkey(e.target.value)}
          />
          <input
            type="text"
            placeholder="Peer Host"
            value={peerHost}
            onChange={(e) => setPeerHost(e.target.value)}
          />
          <button onClick={addPeer}>Add Peer</button>
        </div>
      )}
    </div>
  );
}

export default AddPeer;
