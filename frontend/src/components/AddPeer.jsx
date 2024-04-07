import React, { useState } from "react";
import axios from "axios";

function AddPeer({ host, port, macaroon }) {
  const [showAddPeerForm, setShowAddPeerForm] = useState(false);
  const [peerPubkey, setPeerPubkey] = useState("");
  const [peerHost, setPeerHost] = useState("");
  const [isPermanent, setIsPermanent] = useState(false);

  const addPeer = async () => {
    try {
      const response = await axios.post(
        `${host}:${port}/v1/peers`,
        {
          addr: {
            pubkey: peerPubkey,
            host: peerHost,
          },
          perm: true,
        },
        {
          headers: {
            "grpc-metadata-macaroon": macaroon,
          },
        }
      );

      console.log("Add peer response:", response.data);
      // Handle the response and update the state if needed
      setShowAddPeerForm(false);
    } catch (error) {
      console.error("Error adding peer:", error);
      alert("Failed to add peer");
    }
  };

  return (
    <div>
      <button onClick={() => setShowAddPeerForm(true)}>Add Peer</button>

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
          <label>
            <input
              type="checkbox"
              checked={isPermanent}
              onChange={(e) => setIsPermanent(e.target.checked)}
            />
            Permanent Connection
          </label>
          <button onClick={addPeer}>Add Peer</button>
        </div>
      )}
    </div>
  );
}

export default AddPeer;