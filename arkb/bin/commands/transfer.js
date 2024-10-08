"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wallet_1 = require("../utils/wallet");
const gateway_1 = __importDefault(require("../options/gateway"));
const timeout_1 = __importDefault(require("../options/timeout"));
const wallet_2 = __importDefault(require("../options/wallet"));
const debug_1 = __importDefault(require("../options/debug"));
const help_1 = __importDefault(require("../options/help"));
const noColors_1 = __importDefault(require("../options/noColors"));
const utils_1 = require("../utils/utils");
const transfer_1 = __importDefault(require("../lib/transfer"));
const command = {
    name: 'transfer',
    description: 'Send funds to an Arweave wallet',
    options: [gateway_1.default, timeout_1.default, wallet_2.default, debug_1.default, help_1.default, noColors_1.default],
    args: ['address', 'amount'],
    usage: ['am2NyCEGnxXBqhUGKL8cAv6wbkGKVtgIcdtv9g9QKG1 0.01'],
    execute: async (args) => {
        const { commandValues, walletPath, feeMultiplier, blockweave, config, debug, colors } = args;
        try {
            const target = commandValues[0].toString();
            const amount = +commandValues[1];
            // Get the wallet
            const wallet = await (0, wallet_1.getWallet)(walletPath, config, debug, colors);
            if (!wallet) {
                console.log((0, utils_1.parseColor)(colors, 'Please save a wallet or run with the --wallet option.', 'red'));
                return;
            }
            // Check if the target address is valid
            if (!(0, utils_1.isValidWalletAddress)(target)) {
                console.log((0, utils_1.parseColor)(colors, 'Invalid target wallet address', 'redBright'));
                return;
            }
            // Check if the amount is a positive number
            if (isNaN(amount) || amount <= 0) {
                console.log((0, utils_1.parseColor)(colors, 'Invalid amount', 'redBright'));
                return;
            }
            // Check if the wallet has enough balance
            const addy = await blockweave.wallets.jwkToAddress(wallet);
            const bal = await blockweave.wallets.getBalance(addy);
            if (+bal < amount) {
                console.log((0, utils_1.parseColor)(colors, 'Insufficient balance', 'redBright'));
                return;
            }
            const transfer = new transfer_1.default(wallet, blockweave);
            const txid = await transfer.execute(target, amount.toString(), feeMultiplier);
            console.log((0, utils_1.parseColor)(colors, `Transfer successful! Transaction ID: ${txid}`, 'greenBright'));
        }
        catch (error) {
            console.log((0, utils_1.parseColor)(colors, 'Unable to send funds.', 'redBright'));
            if (debug)
                console.log(error);
        }
    },
};
exports.default = command;
