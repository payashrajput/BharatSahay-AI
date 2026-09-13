import dotenv from 'dotenv';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import algosdk from 'algosdk';

import { HTTPFacilitatorClient } from '@x402/core/server';
import { paymentMiddleware, x402ResourceServer } from '@x402/express';
import { ExactAvmScheme } from '@x402/avm/exact/server';
import {
  ALGORAND_TESTNET_CAIP2,
  USDC_TESTNET_ASA_ID
} from '@x402/avm';

// Load server/.env first, then fallback to root .env
dotenv.config({
  path: new URL('./.env', import.meta.url)
});
dotenv.config({
  path: new URL('../.env', import.meta.url)
});

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT || 4021);
const PAY_TO = (
  process.env.AVM_ADDRESS ||
  process.env.PAY_TO_ADDRESS ||
  process.env.WALLET_ADDRESS ||
  ''
).trim();
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'https://facilitator.goplausible.xyz';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const STRICT_PAYTO_CHECK = process.env.STRICT_PAYTO_CHECK !== 'false';

// Helper to detect placeholder or zero address
const ALGORAND_ZERO_ADDRESS = algosdk.encodeAddress(new Uint8Array(32));
const isZeroAddress = (addr) => !addr || addr === ALGORAND_ZERO_ADDRESS;
const isPayToValid = Boolean(
  PAY_TO &&
  !isZeroAddress(PAY_TO) &&
  algosdk.isValidAddress(PAY_TO)
);

// GoPlausible's Algorand TestNet x402 route format.
// The facilitator returns this full CAIP-2 value in payment requirements.
// Use the SDK's canonical TestNet CAIP-2 identifier so the resource
// server and ExactAvmScheme can never drift apart.
// GoPlausible hosted facilitator currently advertises the full Algorand
// TestNet genesis-hash CAIP-2 identifier. Keep this exact value on both
// resource server and browser client so the facilitator accepts the route.
const ALGORAND_TESTNET = 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';

// Startup assertion for payTo receiver address
if (!isPayToValid) {
  const errorBanner = [
    '=================================================================',
    '❌ ERROR: x402 Algorand receiver address is not configured or invalid!',
    `   Value received: ${PAY_TO ? `"${PAY_TO}"` : '(none)'}`,
    '   Please configure a valid 58-character Algorand TestNet address:',
    '     • In server/.env: AVM_ADDRESS=<your_testnet_address>',
    '     • Or env vars: AVM_ADDRESS, PAY_TO_ADDRESS, WALLET_ADDRESS',
    '================================================================='
  ].join('\n');

  if (STRICT_PAYTO_CHECK) {
    console.error('\n' + errorBanner + '\n');
    process.exit(1);
  } else {
    console.warn('\n' + errorBanner + '\n');
  }
}

app.use(
  cors({
    origin: FRONTEND_ORIGIN
      .split(',')
      .map((origin) => origin.trim()),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'PAYMENT-SIGNATURE',
      'payment-signature',
      'X-PAYMENT',
      'x-payment',
      'Access-Control-Expose-Headers',
      'access-control-expose-headers',
      'PAYMENT-REQUIRED',
      'payment-required',
      'PAYMENT-RESPONSE',
      'payment-response',
      'X-PAYMENT-RESPONSE',
      'x-payment-response',
      'PAYMENT-ERROR',
      'payment-error'
    ],
    exposedHeaders: [
      'PAYMENT-REQUIRED',
      'PAYMENT-RESPONSE',
      'X-PAYMENT-RESPONSE',
      'PAYMENT-ERROR'
    ]
  })
);

app.use(express.json());

const facilitatorClient = new HTTPFacilitatorClient({
  url: FACILITATOR_URL
});

// Comprehensive tracing for facilitator calls
const origVerify = facilitatorClient.verify.bind(facilitatorClient);
facilitatorClient.verify = async (paymentPayload, paymentRequirements) => {
  console.log('\n[Facilitator] >>> /verify called');
  console.log('[Facilitator] Verify Requirements:', JSON.stringify(paymentRequirements, null, 2));
  try {
    const result = await origVerify(paymentPayload, paymentRequirements);
    console.log('[Facilitator] <<< /verify result:', JSON.stringify(result, null, 2));
    return result;
  } catch (err) {
    console.error('[Facilitator] ❌ /verify failed:', err?.message || err);
    if (err?.status) console.error('[Facilitator] Status:', err.status);
    if (err?.data) console.error('[Facilitator] Data:', JSON.stringify(err.data, null, 2));
    throw err;
  }
};

const origSettle = facilitatorClient.settle.bind(facilitatorClient);
facilitatorClient.settle = async (paymentPayload, paymentRequirements) => {
  console.log('\n[Facilitator] >>> /settle called');
  console.log('[Facilitator] Settle Requirements:', JSON.stringify(paymentRequirements, null, 2));
  try {
    const result = await origSettle(paymentPayload, paymentRequirements);
    console.log('[Facilitator] <<< /settle result:', JSON.stringify(result, null, 2));
    return result;
  } catch (err) {
    console.error('[Facilitator] ❌ /settle failed:', err?.message || err);
    if (err?.status) console.error('[Facilitator] Status:', err.status);
    if (err?.data) console.error('[Facilitator] Data:', JSON.stringify(err.data, null, 2));
    throw err;
  }
};

const resourceServer = new x402ResourceServer(facilitatorClient);

resourceServer.register(
  ALGORAND_TESTNET,
  new ExactAvmScheme()
);

// Algod client for direct on-chain verification fallback
const ALGOD_TESTNET_URL = process.env.ALGOD_URL || 'https://testnet-api.algonode.cloud';
const algodClient = new algosdk.Algodv2('', ALGOD_TESTNET_URL, 443);

async function getReceiverAssetStatus() {
  if (!isPayToValid) {
    return { checked: false, optedIn: false, error: 'invalid_receiver' };
  }
  try {
    const account = await algodClient.accountInformation(PAY_TO).do();
    const asset = String(USDC_TESTNET_ASA_ID);
    const holding = (account.assets || []).find(
      (item) => String(item['asset-id']) === asset
    );
    return {
      checked: true,
      optedIn: Boolean(holding),
      balance: holding?.amount ?? null
    };
  } catch (error) {
    return {
      checked: false,
      optedIn: null,
      error: error?.message || String(error)
    };
  }
}

resourceServer.onVerifyFailure((context) => {
  console.error('[ResourceServer] ❌ onVerifyFailure:', {
    error: context.error?.message || context.error,
    payer: context.error?.payer,
    invalidReason: context.error?.invalidReason
  });
});

resourceServer.onAfterSettle((context) => {
  console.log('[ResourceServer] ✅ onAfterSettle succeeded:', {
    transaction: context.result?.transaction,
    payer: context.result?.payer,
    network: context.result?.network
  });
});

resourceServer.onSettleFailure(async (context) => {
  console.error('[ResourceServer] ❌ onSettleFailure triggered:', {
    errorReason: context.error?.errorReason,
    errorMessage: context.error?.errorMessage,
    transaction: context.error?.transaction,
    payer: context.error?.payer,
    network: context.error?.network
  });

  const txId = context.error?.transaction;
  if (txId) {
    console.log(`[ResourceServer] Checking Algorand TestNet for txId: ${txId}...`);
    try {
      // Check if transaction has confirmed on-chain (wait up to 5 rounds)
      const confirmed = await algosdk.waitForConfirmation(algodClient, txId, 5);
      const confirmedRound = confirmed['confirmed-round'];
      console.log(`[ResourceServer] 🚀 Transaction ${txId} confirmed on Algorand TestNet (round ${confirmedRound})! Recovering settlement.`);
      return {
        recovered: true,
        result: {
          success: true,
          transaction: txId,
          network: context.requirements?.network || ALGORAND_TESTNET,
          payer: context.error?.payer
        }
      };
    } catch (algodErr) {
      console.error(`[ResourceServer] On-chain confirmation check failed for ${txId}:`, algodErr.message);
    }
  }
});

const paidRoutes = {
  'GET /api/paid-scheme-insight': {
    accepts: {
      scheme: 'exact',
      network: ALGORAND_TESTNET,
      payTo: PAY_TO,
      price: {
        asset: String(USDC_TESTNET_ASA_ID),
        amount: '10000',
        extra: {
          name: 'USDC',
          decimals: 6
        }
      },
      maxTimeoutSeconds: 300
    },
    settlementFailedResponseBody: async (_req, failure) => {
      console.log('[x402] Generating settlement failure body for client:', {
        errorReason: failure.errorReason,
        errorMessage: failure.errorMessage,
        transaction: failure.transaction
      });
      return {
        contentType: 'application/json',
        body: {
          ok: false,
          error: 'settlement_failed',
          errorReason: failure.errorReason || 'Settlement failed',
          errorMessage: failure.errorMessage || failure.errorReason,
          transaction: failure.transaction || '',
          payer: failure.payer || ''
        }
      };
    },
    description: 'BharatSahay premium AI scheme insight',
    mimeType: 'application/json'
  }
};

app.get('/api/health', async (_req, res) => {
  const receiverAsset = await getReceiverAssetStatus();
  res.json({
    ok: true,
    service: 'BharatSahay x402 Resource Server',
    network: ALGORAND_TESTNET,
    facilitator: FACILITATOR_URL,
    payToConfigured: isPayToValid,
    payTo: isPayToValid ? PAY_TO : null,
    asset: String(USDC_TESTNET_ASA_ID),
    price: '$0.01',
    receiverUsdcOptedIn: receiverAsset.optedIn,
    receiverUsdcBalance: receiverAsset.balance,
    receiverUsdcCheckError: receiverAsset.error || null
  });
});

// Guard route against missing payTo before paymentMiddleware
app.get('/api/paid-scheme-insight', (req, res, next) => {
  if (!isPayToValid) {
    return res.status(503).json({
      ok: false,
      error: 'pay_to_not_configured',
      message: 'Server payment receiver address (AVM_ADDRESS) is not configured or invalid. Check server/.env.'
    });
  }
  const hasSig = Boolean(req.header('payment-signature') || req.header('x-payment'));
  console.log(`[x402] GET /api/paid-scheme-insight | Has payment header: ${hasSig}`);
  next();
});

app.use(paymentMiddleware(paidRoutes, resourceServer));

app.get('/api/paid-scheme-insight', (_req, res) => {
  res.json({
    ok: true,
    unlocked: true,
    title: 'Premium AI Scheme Insight',
    insight:
      'Based on the profile, prioritize education and skill-development schemes first. Before applying, verify the current official eligibility rules and required documents.',
    recommendations: [
      'Check eligibility before applying',
      'Keep Aadhaar and required documents ready',
      'Verify the latest government scheme guidelines',
      'Prefer official government portals for applications'
    ],
    poweredBy: 'BharatSahay AI + x402 + Algorand Testnet',
    payment: 'Settled through GoPlausible Facilitator'
  });
});

const distPath = path.join(__dirname, '..', 'dist');

app.use(express.static(distPath));

app.get(/^(?!\/api)/, (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, async () => {
  const receiverAsset = await getReceiverAssetStatus();
  console.log(
    `Receiver USDC opted-in: ${receiverAsset.optedIn === true ? 'YES' : receiverAsset.optedIn === false ? 'NO' : 'UNKNOWN'}`
  );
  if (receiverAsset.optedIn === false) {
    console.error(
      `IMPORTANT: ${PAY_TO} is NOT opted in to TestNet USDC ASA ${USDC_TESTNET_ASA_ID}.`
    );
    console.error(
      'Opt the receiver wallet into TestNet USDC before testing x402 payments.'
    );
  }
  console.log('\n');
  console.log('==============================================');
  console.log('🇮🇳 BharatSahay x402 Server');
  console.log('==============================================');
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Frontend: ${FRONTEND_ORIGIN}`);
  console.log(`Facilitator: ${FACILITATOR_URL}`);
  console.log(`Network: ${ALGORAND_TESTNET}`);
  console.log(`Pay-to address: ${PAY_TO || 'NOT CONFIGURED'}`);
  console.log(`Pay-to valid: ${isPayToValid}`);
  console.log(`USDC Asset ID: ${USDC_TESTNET_ASA_ID}`);
  console.log('Premium endpoint: /api/paid-scheme-insight');
  console.log('Price: $0.01 TestNet USDC');
  console.log('==============================================\n');
});
