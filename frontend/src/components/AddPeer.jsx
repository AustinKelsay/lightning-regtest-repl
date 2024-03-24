import React, { useState } from "react";
import "./components.css";

function AddPeer() {
  const [showForm, setShowForm] = useState(false);
  const [pubkey, setPubkey] = useState("");
  const [host, setHost] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await window.webln.request("connectpeer", { addr: { pubkey, host } });
      setSuccessMessage("Peer connection is successful");
    } catch (error) {
      setSuccessMessage("Error: " + error.message);
    }
    setShowForm(false);
  };

  return (
    <div>
      <button onClick={() => setShowForm(!showForm)}>Add peer</button>
      {showForm && (
        <form onSubmit={handleSubmit}>
          <label>Pubkey:</label>
          <input
            type="text"
            value={pubkey}
            onChange={(e) => setPubkey(e.target.value)}
          />
          <label>Host:</label>
          <input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
          />
          <button type="submit">Submit</button>
        </form>
      )}
      {successMessage && <div>{successMessage}</div>}
    </div>
  );
}

export default AddPeer;
