# BharatSahay — x402 + Algorand TestNet

BharatSahay is now wired for the management-mandated **Agentic Solutions: Powered by x402** track.

## What is implemented

- **x402 v2** payment flow on a real protected API route.
- **Algorand TestNet / AVM** network using the official CAIP-2 identifier.
- **GoPlausible hosted facilitator** at `https://facilitator.goplausible.xyz`.
- **`@x402/avm` + `@x402/core` + `@x402/express`** dependencies in `package.json`.
- **Pera Wallet** connection on Algorand TestNet.
- Premium BharatSahay AI insight protected by a **$0.01 TestNet USDC** x402 payment.
- On successful settlement, the UI reads the `X-PAYMENT-RESPONSE` / `payment-response` receipt and links to LoRA TestNet explorer.

## Architecture

`BharatSahay React UI → x402 client → Express resource server → GoPlausible Facilitator → Algorand TestNet`

The first unpaid request receives `402 Payment Required`. The x402 client then builds the AVM payment payload, Pera signs the transaction group, and the resource server sends the payment proof to GoPlausible for verification/settlement before returning the premium insight.

## Run locally

### 1. Install

```bash
npm install
```

### 2. Configure receiver

Copy `server/.env.example` to `server/.env` and set:

```env
AVM_ADDRESS=YOUR_ALGORAND_TESTNET_RECEIVER_ADDRESS
FACILITATOR_URL=https://facilitator.goplausible.xyz
PORT=4021
FRONTEND_ORIGIN=http://localhost:5173
```

Copy `.env.example` to `.env` if you want to override the API URL.

### 3. Start backend

```bash
npm run server
```

### 4. Start frontend in another terminal

```bash
npm run dev
```

Open the Vite URL, connect **Pera Wallet on TestNet**, and use the x402 premium-insight card.

## TestNet funding checklist

The payer wallet needs TestNet USDC and the receiver account must be ready to receive the TestNet USDC asset. Use the LoRA TestNet tools and Circle TestNet USDC faucet as appropriate.

**Never commit private keys or mnemonics.** This browser flow signs with the user's wallet; no private key is stored by BharatSahay.

## Judge demo flow

1. Show BharatSahay scheme results.
2. Click **Connect TestNet Wallet**.
3. Click **Pay $0.01 & unlock insight**.
4. Show the Pera signing request.
5. Approve it.
6. Show the premium insight appearing only after x402 succeeds.
7. Click **View Algorand TestNet transaction** and show the LoRA transaction.
8. In code, show `@x402/avm`, `ALGORAND_TESTNET_CAIP2`, `facilitator.goplausible.xyz`, and the protected `/api/paid-scheme-insight` route.

## Important

This repository contains the integration code, but a real on-chain transaction requires a funded TestNet payer wallet and a configured TestNet receiver address. Do not fake a transaction hash or put a private key into the frontend.


## x402 clean install
If you see `does not provide an export named registerExactAvmScheme`, run `.\FIX_X402.ps1` (or `powershell -ExecutionPolicy Bypass -File .\FIX_X402.ps1`). This removes stale `node_modules` and `package-lock.json`, installs the pinned x402 2.24.0 packages, and verifies the exports.


## x402 compatibility fix
The project uses `ExactAvmScheme` from `@x402/avm/exact/server` and `@x402/avm/exact/client`, which matches the exports in `@x402/avm@2.24.0`.
