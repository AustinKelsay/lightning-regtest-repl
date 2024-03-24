import React, { useState } from "react";
import "./components.css";

function OpenChannel() {
  const [showForm, setShowForm] = useState(false);
  const [pubkey, setPubkey] = useState("");
  const [localAmount, setLocalAmount] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedPubkey = hexToBase64(pubkey);
    try {
      const channelRequest = await window.webln.request("openchannel", {
        node_pubkey: formattedPubkey,
        local_funding_amount: localAmount,
      });

      console.log("channelRequest", channelRequest);

      setSuccessMessage("Channel opened successfully");
    } catch (error) {
      setSuccessMessage("Error: " + error.message);
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

  return (
    <div>
      <button onClick={() => setShowForm(!showForm)}>Open Channel</button>
      {showForm && (
        <form onSubmit={handleSubmit}>
          <label>Node Pubkey:</label>
          <input
            type="text"
            value={pubkey}
            onChange={(e) => setPubkey(e.target.value)}
          />
          <label>Local Funding Amount:</label>
          <input
            type="text"
            value={localAmount}
            onChange={(e) => setLocalAmount(e.target.value)}
          />
          <button type="submit">Submit</button>
        </form>
      )}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
    </div>
  );
}

export default OpenChannel;
