import { ExactAvmScheme as ServerScheme } from '@x402/avm/exact/server';
import { ExactAvmScheme as ClientScheme } from '@x402/avm/exact/client';
console.log('x402 AVM server export: ExactAvmScheme =', typeof ServerScheme);
console.log('x402 AVM client export: ExactAvmScheme =', typeof ClientScheme);
if (typeof ServerScheme !== 'function' || typeof ClientScheme !== 'function') process.exit(1);
console.log('x402 AVM exports are correct for @x402/avm 2.24.0.');
