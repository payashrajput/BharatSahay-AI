# BharatSahay x402 + Pera fix

The previous browser error was:

    client.fetch is not a function

This version fixes the frontend payment flow by:

1. Using `registerExactAvmScheme(client, { signer })` for the Algorand x402 client.
2. Adapting Pera Wallet's `signTransaction()` to the x402 `ClientAvmSigner` interface.
3. Using `@x402/fetch` + `wrapFetchWithPayment()` for the actual HTTP 402 payment/retry flow.
4. Adding `@x402/fetch@2.24.0` to `package.json`.

## Run

From the project root:

```powershell
npm install
npm run check:x402
npm run server
```

Check:

```text
http://localhost:4021/api/health
```

Make sure `payToConfigured` is `true`.

In a second terminal:

```powershell
npm run dev
```

Open:

```text
http://localhost:5173
```

Connect Pera on Algorand TestNet, then use the premium payment button.

## Important

`server/.env` must contain your PUBLIC Algorand TestNet receiver address:

```env
AVM_ADDRESS=YOUR_PUBLIC_TESTNET_ALGORAND_ADDRESS
```

Never put a seed phrase or private key in `server/.env`.

The payer wallet needs TestNet USDC for the $0.01 payment and enough TestNet ALGO for Algorand transaction fees.
