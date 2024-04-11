// Import the necessary dependencies
// - React: The core React library
// - useState: A hook from React that allows functional components to have state
// - axios: A library for making HTTP requests
import React, { useState } from "react";
import axios from "axios";

// Define the LightningWallet functional component
// It receives props: host, port, macaroon, and lightningBalance
function LightningWallet({ host, port, macaroon, lightningBalance }) {
  // Use the useState hook to manage the component's state
  // - receiveShowing: A boolean indicating whether the receive form is visible (default: false)
  // - sendShowing: A boolean indicating whether the send form is visible (default: false)
  // - invoice: A string to store the invoice to be paid (default: empty string)
  // - amount: A string to store the amount when creating an invoice (default: empty string)
  const [receiveShowing, setReceiveShowing] = useState(false);
  const [sendShowing, setSendShowing] = useState(false);
  const [invoice, setInvoice] = useState("");
  const [amount, setAmount] = useState("");

  // Function to create an invoice
  // https://lightning.engineering/api-docs/api/lnd/lightning/add-invoice
  const createInvoice = async () => {
    // Implement the logic to create an invoice here
    // You can use the `host`, `port`, `macaroon`, and `amount` variables
    // to make an HTTP request to your Lightning node's API
    // and handle the response accordingly
  };

  // Function to pay an invoice
  // https://lightning.engineering/api-docs/api/lnd/lightning/send-payment-sync
  const payInvoice = async () => {
    // Implement the logic to pay an invoice here
    // You can use the `host`, `port`, `macaroon`, and `invoice` variables
    // to make an HTTP request to your Lightning node's API
    // and handle the response accordingly
  };

  // The component's render method
  // It returns the JSX that defines the structure and appearance of the component
  return (
    <div>
      {/* Display the lightning balance */}
      <div className="balance">
        <h3>Lightning balance</h3>
        <p>{lightningBalance} sats</p>
      </div>

      {/* Buttons to toggle the receive and send forms */}
      {/* When clicked, they update the respective state variables */}
      <div>
        <button onClick={() => setReceiveShowing(!receiveShowing)}>
          Receive
        </button>
        <button onClick={() => setSendShowing(!sendShowing)}>Send</button>
      </div>

      {/* Render the receive form if receiveShowing is true */}
      {/* It displays an input field for the amount and a button to create an invoice */}
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
      {/* It displays an input field for the invoice and a button to pay the invoice */}
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

// Export the LightningWallet component as the default export
// This allows other files to import and use this component
export default LightningWallet;
