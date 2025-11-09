07:43:23.506 Running build in Washington, D.C., USA (East) – iad1
07:43:23.509 Build machine configuration: 2 cores, 8 GB
07:43:23.948 Cloning github.com/thrifts-za/protenders-platform (Branch: migration-v2, Commit: 5b732cf)
07:43:25.458 Cloning completed: 1.510s
07:43:26.796 Restored build cache from previous deployment (7gnk1amTHwEaGaG7QfVPt1wWehS5)
07:43:27.668 Running "vercel build"
07:43:28.060 Vercel CLI 48.8.2
07:43:28.436 Installing dependencies...
07:43:31.577 
07:43:31.577 added 63 packages in 3s
07:43:31.577 
07:43:31.577 258 packages are looking for funding
07:43:31.578   run `npm fund` for details
07:43:31.611 Detected Next.js version: 15.5.6
07:43:31.612 Running "npm run build"
07:43:31.730 
07:43:31.730 > protenders-next@0.1.0 build
07:43:31.731 > next build
07:43:31.731 
07:43:32.536    ▲ Next.js 15.5.6
07:43:32.537    - Experiments (use with caution):
07:43:32.537      · optimizePackageImports
07:43:32.538 
07:43:32.627    Creating an optimized production build ...
07:44:02.519  ⚠ Compiled with warnings in 3.8s
07:44:02.519 
07:44:02.519 ./node_modules/@prisma/client/runtime/wasm-engine-edge.js
07:44:02.519 A Node.js API is used (setImmediate at line: 11) which is not supported in the Edge Runtime.
07:44:02.519 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
07:44:02.519 
07:44:02.519 Import trace for requested module:
07:44:02.519 ./node_modules/@prisma/client/runtime/wasm-engine-edge.js
07:44:02.519 ./node_modules/.prisma/client/wasm.js
07:44:02.520 ./node_modules/.prisma/client/default.js
07:44:02.520 ./node_modules/@prisma/client/default.js
07:44:02.520 ./src/lib/prisma.ts
07:44:02.520 ./src/auth.config.ts
07:44:02.520 ./src/auth.ts
07:44:02.520 
07:44:02.520 ./node_modules/bcryptjs/index.js
07:44:02.520 A Node.js module is loaded ('crypto' at line 32) which is not supported in the Edge Runtime.
07:44:02.520 Learn More: https://nextjs.org/docs/messages/node-module-in-edge-runtime
07:44:02.520 
07:44:02.520 Import trace for requested module:
07:44:02.520 ./node_modules/bcryptjs/index.js
07:44:02.520 ./src/auth.config.ts
07:44:02.520 ./src/auth.ts
07:44:02.520 
07:44:02.520 ./node_modules/bcryptjs/index.js
07:44:02.520 A Node.js API is used (process.nextTick at line: 337) which is not supported in the Edge Runtime.
07:44:02.520 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
07:44:02.521 
07:44:02.521 Import trace for requested module:
07:44:02.521 ./node_modules/bcryptjs/index.js
07:44:02.521 ./src/auth.config.ts
07:44:02.521 ./src/auth.ts
07:44:02.521 
07:44:02.521 ./node_modules/bcryptjs/index.js
07:44:02.521 A Node.js API is used (setImmediate at line: 338) which is not supported in the Edge Runtime.
07:44:02.521 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
07:44:02.521 
07:44:02.521 Import trace for requested module:
07:44:02.521 ./node_modules/bcryptjs/index.js
07:44:02.521 ./src/auth.config.ts
07:44:02.521 ./src/auth.ts
07:44:02.521 
07:44:02.521 ./node_modules/bcryptjs/index.js
07:44:02.521 A Node.js API is used (setImmediate at line: 339) which is not supported in the Edge Runtime.
07:44:02.521 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
07:44:02.521 
07:44:02.522 Import trace for requested module:
07:44:02.522 ./node_modules/bcryptjs/index.js
07:44:02.522 ./src/auth.config.ts
07:44:02.522 ./src/auth.ts
07:44:02.522 
07:44:02.522 ./node_modules/bcryptjs/index.js
07:44:02.522 A Node.js API is used (process.nextTick at line: 340) which is not supported in the Edge Runtime.
07:44:02.522 Learn more: https://nextjs.org/docs/api-reference/edge-runtime
07:44:02.522 
07:44:02.522 Import trace for requested module:
07:44:02.522 ./node_modules/bcryptjs/index.js
07:44:02.522 ./src/auth.config.ts
07:44:02.522 ./src/auth.ts
07:44:02.522 
07:44:15.520  ✓ Compiled successfully in 39.5s
07:44:15.525    Linting and checking validity of types ...
07:44:34.135 Failed to compile.
07:44:34.135 
07:44:34.136 ./scripts/backfill-detailed-category-only.ts:269:17
07:44:34.136 Type error: Object literal may only specify known properties, and 'detailedCategory' does not exist in type '(Without<OCDSReleaseUpdateInput, OCDSReleaseUncheckedUpdateInput> & OCDSReleaseUncheckedUpdateInput) | (Without<...> & OCDSReleaseUpdateInput)'.
07:44:34.136 
07:44:34.136 [0m [90m 267 |[39m               }[33m,[39m
07:44:34.136  [90m 268 |[39m               data[33m:[39m {
07:44:34.136 [31m[1m>[22m[39m[90m 269 |[39m                 detailedCategory[33m:[39m category[33m,[39m
07:44:34.136  [90m     |[39m                 [31m[1m^[22m[39m
07:44:34.136  [90m 270 |[39m               }[33m,[39m
07:44:34.136  [90m 271 |[39m             })[33m;[39m
07:44:34.137  [90m 272 |[39m           }[0m
07:44:34.175 Next.js build worker exited with code: 1 and signal: null
07:44:34.196 Error: Command "npm run build" exited with 1