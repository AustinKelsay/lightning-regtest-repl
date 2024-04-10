// imports the useState hook from React and the axios library
import React, { useState } from "react";
import axios from "axios";

function LightningWallet({ host, port, macaroon, lightningBalance }) {
  // useState allows us to store and update the state of different peices of data in the component
  const [receiveShowing, setReceiveShowing] = useState(false); // For toggling the receive form
  const [sendShowing, setSendShowing] = useState(false); // For toggling the send form
  const [invoice, setInvoice] = useState(""); // For storing the invoice to be paid
  const [amount, setAmount] = useState(""); // For storing the amount when creating an invoice

  // Function to create an invoice
  const createInvoice = async () => {};

  // Function to pay an invoice
  const payInvoice = async () => {};

  return (
    <div>
      {/* Display the lightning balance */}
      <div className="balance">
        <h3>Lightning balance</h3>
        <p>{lightningBalance} sats</p>
      </div>

      {/* Buttons to toggle the receive and send forms */}
      <div>
        <button onClick={() => setReceiveShowing(!receiveShowing)}>
          Receive
        </button>
        <button onClick={() => setSendShowing(!sendShowing)}>Send</button>
      </div>

      {/* Render the receive form if receiveShowing is true */}
      {receiveShowing && (
        <div className="invoice-form">
          <input
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={createInvoice}>Create Invoice</button>
        </div>
      )}

      {/* Render the send form if sendShowing is true */}
      {sendShowing && (
        <div className="invoice-form">
          <input
            type="text"
            placeholder="Invoice"
            value={invoice}
            onChange={(e) => setInvoice(e.target.value)}
          />
          <button onClick={payInvoice}>Pay Invoice</button>
        </div>
      )}
    </div>
  );
}

export default LightningWallet;
