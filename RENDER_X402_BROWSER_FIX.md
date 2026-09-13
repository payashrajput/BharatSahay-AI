# Render browser-build fix

This version keeps the x402/Algorand server implementation unchanged and adds a
Vite browser-only shim for `@algorandfoundation/xhd-wallet-api`.

Why:
- `@x402/avm/exact/client` 2.24.0 pulls Algokit utilities into the frontend graph.
- Algokit's optional HD-wallet module imports Node's `crypto`.
- Vite therefore fails with `createHash is not exported by __vite-browser-external`.
- BharatSahay uses Pera Wallet for browser signing, so the HD-wallet implementation
  is not needed by the frontend.

Added:
- `vite.config.js`
- `src/shims/xhd-wallet-api.js`

Do not install a `crypto` polyfill.

Render:
Build Command: `npm install && npm run build`
Start Command: `npm run server`
Root Directory: repository root (`.` or blank)

After pushing this version to GitHub, use Render's "Clear build cache & deploy".
