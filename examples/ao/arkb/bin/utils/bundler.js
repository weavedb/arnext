"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const signing_1 = require("arbundles/src/signing");
const file_1 = require("arbundles/file");
class Bundler {
    signer;
    blockweave;
    constructor(wallet, blockweave) {
        this.signer = new signing_1.ArweaveSigner(wallet);
        this.blockweave = blockweave;
    }
    async createItem(data, tags = []) {
        const item = await (0, file_1.createData)(data, this.signer, {
            tags,
        });
        await item.sign(this.signer);
        return item;
    }
    async bundleAndSign(txs) {
        return (0, file_1.bundleAndSignData)(txs, this.signer);
    }
    async post(tx, bundler) {
        return tx.sendToBundler(bundler);
    }
    static async getAddressBalance(bundler, address) {
        const res = await bundler.get(`/account/balance?address=${address}`);
        return res.data.balance || 0;
    }
}
exports.default = Bundler;
