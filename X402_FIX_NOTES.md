# BharatSahay x402 fix

The installed @x402/avm 2.24.0 package exports `ExactAvmScheme` from the exact client/server subpaths. It does not export `registerExactAvmScheme`, `ExactAvmServer`, or `ExactAvmClient`.

Server:
- `import { ExactAvmScheme } from '@x402/avm/exact/server'`
- `resourceServer.register(ALGORAND_TESTNET_CAIP2, new ExactAvmScheme())`

Client:
- `import { ExactAvmScheme } from '@x402/avm/exact/client'`
- `client.register(ALGORAND_TESTNET_CAIP2, new ExactAvmScheme(signer))`

This matches the exports observed from the installed package.
