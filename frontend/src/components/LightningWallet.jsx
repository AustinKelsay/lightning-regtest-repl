import React, { useState } from "react";
import axios from "axios";

function LightningWallet({ host, port, macaroon, lightningBalance }) {
  const [receiveShowing, setReceiveShowing] = useState(false); // For toggling the receive form
  const [sendShowing, setSendShowing] = useState(false); // For toggling the send form
  const [invoice, setInvoice] = useState(""); // For paying an invoice
  const [amount, setAmount] = useState(""); // For creating an invoice
  const [memo, setMemo] = useState(""); // Optional memo for the invoice

  const createInvoice = async () => {
    try {
      const response = await axios.post(
        `${host}:${port}/v1/invoices`,
        {
          value: amount,
          memo: memo,
        },
        {
          headers: {
            "grpc-metadata-macaroon": macaroon,
          },
        },
      );

      console.log("Create invoice response:", response.data);
      alert(`Invoice created successfully\n\n${response.data.payment_request}`);
      setReceiveShowing(false);
      setAmount("");
      setMemo("");
    } catch (error) {
      console.error("Error creating invoice:", error);
      const errorMessage = error.response?.data?.error || error.message;
      alert(`Failed to create invoice: ${errorMessage}`);
    }
  };

  const payInvoice = async () => {
    try {
      const response = await axios.post(
        `${host}:${port}/v1/channels/transactions`,
        {
          payment_request: invoice,
        },
        {
          headers: {
            "grpc-metadata-macaroon": macaroon,
          },
        },
      );

      console.log("Pay invoice response:", response.data);
      alert(
        `Invoice paid successfully\n\npayment preimage: ${response.data.payment_preimage}`,
      );
      setSendShowing(false);
      setInvoice("");
    } catch (error) {
      console.error("Error paying invoice:", error);
      const errorMessage = error.response?.data?.error || error.message;
      alert(`Failed to pay invoice: ${errorMessage}`);
    }
  };

  return (
    <div>
      <div className="balance">
        <h3>Lightning balance</h3>
        <p>{lightningBalance} sats</p>
      </div>
      <div>
        <button onClick={() => setReceiveShowing(!receiveShowing)}>
          Receive
        </button>
        <button onClick={() => setSendShowing(!sendShowing)}>Send</button>
      </div>

      {receiveShowing && (
        <div className="invoice-form">
          <input
            type="text"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            type="text"
            placeholder="Memo (Optional)"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
          <button onClick={createInvoice}>Create Invoice</button>
        </div>
      )}
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
