## ArNext + AO Example App

The demo uses [a simple lua contract](./contracts/lua/arnext.lua) on an AO process.

To deploy your own process with the contract, run the following.

```bash
cd contracts && npm install && node scripts/deploy.js WALLET_JWK_PATH
```

Create a `.env.local` file in the app root directory, with the returned process id from the previous command.

```bash
NEXT_PUBLIC_PID=8ILQE2ZWywJXQBJLwJw5KJgj_c6cFL7UPeJb7Lnfcw0
```

Once you deploy the app on Arweave, you can also include the app transaction id when deploying to Vercel, and every page on Vercel will show a link to the conterpart page on Arweave in the footer.

```bash
NEXT_PUBLIC_PID=8ILQE2ZWywJXQBJLwJw5KJgj_c6cFL7UPeJb7Lnfcw0
NEXT_PUBLIC_TXID=pnZ34u3byeagp93CCKZtnedhBMPStBMNZO1ieD7a2eg
```
To access these environment variables on Vercel, you need to import them from the Vercel web dashboard.
