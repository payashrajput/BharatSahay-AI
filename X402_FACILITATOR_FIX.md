# BharatSahay x402 Windows - Facilitator compatibility fix

## What was fixed
The hosted GoPlausible facilitator currently advertises Algorand TestNet using:
`algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=`

The previous build used the truncated CAIP-2 identifier from the newer SDK constant:
`algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDe`

That caused startup error:
`Facilitator does not support scheme "exact" on network ...`

The server and browser client now use the same full identifier expected by the hosted facilitator.

## Run
1. Delete `node_modules` if it exists.
2. Run `npm install`
3. Run `npm run server`
4. In another terminal run `npm run dev`
5. Open `http://localhost:5173`

Optional:
`npm run check:facilitator`

## Payment
The first 402 is expected. After Pera signing, the client retries with the signed x402 payment payload. The backend then calls the facilitator for verification and settlement.

Do not put private keys or seed phrases in `.env`.
