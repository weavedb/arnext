"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWallet = void 0;
const fs_1 = __importDefault(require("fs"));
const cli_questions_1 = __importDefault(require("./cli-questions"));
const crypter_1 = __importDefault(require("./crypter"));
const utils_1 = require("./utils");
async function getWallet(walletPath, config, debug, colors) {
    let wallet;
    const walletEncr = config.get('wallet');
    if (walletPath) {
        if (typeof walletPath !== 'string') {
            console.log((0, utils_1.parseColor)(colors, 'The wallet must be specified.', 'red'));
            return;
        }
        try {
            wallet = JSON.parse(fs_1.default.readFileSync(walletPath, 'utf8'));
        }
        catch (e) {
            console.log((0, utils_1.parseColor)(colors, 'Invalid wallet path.', 'red'));
            if (debug)
                console.log(e);
            return;
        }
    }
    if (!wallet) {
        if (walletEncr) {
            const res = await cli_questions_1.default.askWalletPassword();
            const crypter = new crypter_1.default(res.password);
            try {
                const decrypted = crypter.decrypt(Buffer.from(walletEncr, 'base64'));
                wallet = JSON.parse(decrypted.toString());
            }
            catch (e) {
                console.log((0, utils_1.parseColor)(colors, 'Invalid password.', 'red'));
                if (debug)
                    console.log(e);
                return;
            }
        }
    }
    if (!wallet) {
        console.log((0, utils_1.parseColor)(colors, 'Save a wallet with `arkb wallet-save file-path.json`.', 'red'));
        return;
    }
    return wallet;
}
exports.getWallet = getWallet;
