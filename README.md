# Fork this Repl in order to run (top right corner)

## [Link to Slides](https://tinyurl.com/bbb-plebdevs)


### To complete the project add these two functions into LightningWallet.jsx:

createInvoice
```javascript
const createInvoice = async () => {
  try {
    // Define the request options
    const options = {
      method: "POST",
      url: `${host}:${port}/v1/invoices`,
      data: {
        value: amount,
      },
      headers: {
        "grpc-metadata-macaroon": macaroon,
      },
    };

    // Make the API request to create an invoice
    const response = await axios(options);

    // Display the created invoice's payment request in an alert
    alert(`Invoice created successfully\n\n${response.data.payment_request}`);

    // Reset the form state
    setReceiveShowing(false);
    setAmount("");
  } catch (error) {
    alert(`Failed to create invoice: ${JSON.stringify(error.response?.data)}`);
  }
};
```
payInvoice
```javascript
const payInvoice = async () => {
  try {
    // Define the request options
    const options = {
      method: "POST",
      url: `${host}:${port}/v1/channels/transactions`,
      data: {
        payment_request: invoice,
      },
      headers: {
        "grpc-metadata-macaroon": macaroon,
      },
    };

    // Make the API request to pay the invoice
    const response = await axios(options);

    // Display the payment preimage in an alert
    alert(`Invoice paid successfully\n\npayment preimage: ${response.data.payment_preimage}`);

    // Reset the form state
    setSendShowing(false);
    setInvoice("");
  } catch (error) {
    alert(`Failed to pay invoice: ${JSON.stringify(error.response?.data)}`);
  }
};
```