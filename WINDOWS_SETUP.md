# BharatSahay x402 — Windows Local Run

## Requirements
- Windows 10/11
- Node.js LTS (Node 20+ recommended)
- npm (installed with Node.js)
- Pera Wallet browser extension/app if you want to test the payment flow
- Algorand TestNet funds/USDC for a real x402 payment

## Easiest setup
1. Extract this ZIP.
2. Open the extracted `BharatSahay_X402` folder.
3. Double-click `INSTALL_WINDOWS.bat`.
4. When setup finishes, double-click `RUN_WINDOWS.bat`.
5. Open **http://localhost:5173**.

The backend runs on port **4021** and the frontend on port **5173**.

## If Windows blocks the BAT file
Open PowerShell in the project folder and run:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\INSTALL_WINDOWS.bat
.\RUN_WINDOWS.bat
```

Or use Command Prompt:

```cmd
INSTALL_WINDOWS.bat
RUN_WINDOWS.bat
```

## Manual commands
```cmd
npm install
npm run check:x402
npm run server
```

Open a second terminal:
```cmd
npm run dev
```

## Important x402 configuration
`server/.env` contains the receiver address used by the x402 server:

```env
AVM_ADDRESS=...
FACILITATOR_URL=https://facilitator.goplausible.xyz
PORT=4021
FRONTEND_ORIGIN=http://localhost:5173
```

If you use a different receiver, replace `AVM_ADDRESS` with a valid Algorand TestNet address.

## Production-style local test
Build the React app:
```cmd
npm run build
npm start
```

Then open:
**http://localhost:4021**

## Troubleshooting

### `npm` or `node` is not recognized
Install Node.js LTS from the official Node.js website, restart the terminal, and run:
```cmd
node --version
npm --version
```

### Port 4021 is already in use
Stop the old Node process, or change `PORT` in `server/.env` and make the frontend API URL match.

### `Failed to fetch`
Make sure the backend terminal is running and check:
**http://localhost:4021/api/health**

Then make sure the frontend is using:
```env
VITE_API_BASE_URL=http://localhost:4021
```

### Pera Wallet / payment does not work
The normal UI can run without completing a payment. A real x402 payment requires:
- Pera Wallet connected to Algorand TestNet
- payer TestNet USDC
- valid receiver address in `server/.env`
- facilitator reachable at the configured URL

Never put a private key or mnemonic in `.env` or frontend code.

## What was changed for Windows
- Removed the macOS-only Rollup/esbuild dev dependencies.
- Removed the existing `node_modules` folder from the ZIP; Windows will install its correct native packages.
- Removed the existing `dist` folder so the build is produced on your Windows machine.
- Removed the stale lockfile so npm can create a Windows-compatible lockfile.
- Added one-click Windows setup and run scripts.
