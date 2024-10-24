"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const community_js_1 = __importDefault(require("community-js"));
const utils_1 = require("../utils/utils");
const arbundles_1 = require("arbundles");
const buffer_1 = require("blockweave/dist/utils/buffer");
class Transfer {
    wallet;
    blockweave;
    community;
    constructor(wallet, blockweave) {
        this.wallet = wallet;
        this.blockweave = blockweave;
        try {
            // @ts-ignore
            this.community = new community_js_1.default(blockweave, wallet);
            // tslint:disable-next-line: no-empty
        }
        catch (e) { }
    }
    async execute(target, amount, feeMultiplier = 1) {
        const tx = await this.blockweave.createTransaction({
            target,
            quantity: this.blockweave.ar.arToWinston(amount),
        }, this.wallet);
        tx.addTag('User-Agent', `arkb`);
        tx.addTag('User-Agent-Version', (0, utils_1.getPackageVersion)());
        tx.addTag('Type', 'transfer');
        await this.blockweave.transactions.sign(tx, this.wallet);
        if (feeMultiplier && feeMultiplier > 1) {
            tx.reward = parseInt((feeMultiplier * +tx.reward).toString(), 10).toString();
        }
        try {
            await this.community.setCommunityTx('cEQLlWFkoeFuO7dIsdFbMhsGPvkmRI9cuBxv0mdn0xU');
            const feeTarget = await this.community.selectWeightedHolder();
            if ((await this.blockweave.wallets.jwkToAddress(this.wallet)) !== feeTarget) {
                const quantity = parseInt((+tx.reward * 0.1).toString(), 10).toString();
                if (feeTarget.length) {
                    const feeTx = await this.blockweave.createTransaction({
                        target: feeTarget,
                        quantity,
                    }, this.wallet);
                    feeTx.addTag('Action', 'Transfer');
                    feeTx.addTag('Message', `Transferred AR to ${target}`);
                    feeTx.addTag('Service', 'arkb');
                    feeTx.addTag('App-Name', 'arkb');
                    feeTx.addTag('App-Version', (0, utils_1.getPackageVersion)());
                    await feeTx.signAndPost(this.wallet, undefined, 0);
                }
            }
            // tslint:disable-next-line: no-empty
        }
        catch { }
        const txid = tx.id;
        await tx.post(0);
        return txid;
    }
    async withdrawBundler(bundler, amount) {
        const addy = await this.blockweave.wallets.jwkToAddress(this.wallet);
        const response = await bundler.get(`/account/withdrawals?address=${addy}`);
        const nonce = response.data;
        const data = {
            publicKey: addy,
            currency: 'arweave',
            amount,
            nonce,
            signature: undefined,
        };
        const hash = await (0, arbundles_1.deepHash)([
            (0, buffer_1.stringToBuffer)(data.currency),
            (0, buffer_1.stringToBuffer)(data.amount.toString()),
            (0, buffer_1.stringToBuffer)(data.nonce.toString()),
        ]);
        data.signature = await this.blockweave.crypto.sign(this.wallet, hash);
        await bundler.post('/account/withdraw', data);
        return addy;
    }
}
exports.default = Transfer;
