import { HTTPFacilitatorClient } from '@x402/core/server';

const url = process.env.FACILITATOR_URL || 'https://facilitator.goplausible.xyz';
const f = new HTTPFacilitatorClient({ url });
console.log('Checking facilitator:', url);
try {
  const supported = await f.supported();
  console.log(JSON.stringify(supported, null, 2));
} catch (e) {
  console.error('Facilitator check failed:', e?.message || e);
  process.exitCode = 1;
}
