# BharatSahay x402 payment fix

This version fixes the browser-side Pera/x402 transaction-group handling.

## What was fixed

1. Uses `ALGORAND_TESTNET_CAIP2` directly from `@x402/avm` on both client and server.
2. The Pera signer now normalizes Uint8Array/base64 wallet responses.
3. The complete x402 Algorand atomic group is returned:
   - signed transaction(s) at the requested indexes
   - original unsigned transaction(s) at the other indexes
4. Added response-header logging so `PAYMENT-ERROR` and `PAYMENT-RESPONSE` are visible in the browser console.
5. Backend `/api/health` now checks whether the receiver wallet is opted in to TestNet USDC ASA 10458941.
6. Backend prints a clear warning at startup if the receiver is not opted in.

## Important

The receiver wallet must be opted in to TestNet USDC ASA `10458941`. If the backend prints:

`Receiver USDC opted-in: NO`

opt the receiver address in Pera Wallet before testing.

The normal x402 flow is:

402 -> build payment group -> Pera signs -> retry with PAYMENT-SIGNATURE -> facilitator verify -> settle -> 200.
