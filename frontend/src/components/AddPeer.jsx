import React, { useState } from "react";
import axios from "axios";

function AddPeer({ host, port, macaroon }) {
  const [showAddPeerForm, setShowAddPeerForm] = useState(false);
  const [peerPubkey, setPeerPubkey] = useState("");
  const [peerHost, setPeerHost] = useState("");

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
        },
      );

      console.log("Add peer response:", response.data);
      alert("Peer added successfully."); // Optionally, show success message
      setShowAddPeerForm(false); // Hide form on success
    } catch (error) {
      console.error("Error adding peer:", error);
      // Display a detailed error message
      let errorMessage = "Failed to add peer.";
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage += ` Error: ${error.response.data.error}`;
      } else if (error.message) {
        errorMessage += ` Error: ${error.message}`;
      }
      alert(errorMessage);
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
