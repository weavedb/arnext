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
const useBundler_1 = __importDefault(require("../options/useBundler"));
const noColors_1 = __importDefault(require("../options/noColors"));
const bundler_1 = __importDefault(require("../utils/bundler"));
const utils_1 = require("../utils/utils");
const command = {
    name: 'balance',
    aliases: ['b'],
    description: 'Get the current balance of your wallet',
    options: [gateway_1.default, timeout_1.default, wallet_2.default, debug_1.default, help_1.default, useBundler_1.default, noColors_1.default],
    execute: async (args) => {
        const { walletPath, config, debug, blockweave, useBundler, bundler, colors } = args;
        const wallet = await (0, wallet_1.getWallet)(walletPath, config, debug, colors);
        if (!wallet) {
            console.log((0, utils_1.parseColor)(colors, 'Please set a wallet or run with the --wallet option.', 'red'));
            return;
        }
        let addy;
        try {
            addy = await blockweave.wallets.jwkToAddress(wallet);
        }
        catch (e) {
            console.log((0, utils_1.parseColor)(colors, 'Unable to decrypt wallet address.', 'red'));
            if (debug)
                console.log(e);
        }
        if (useBundler) {
            try {
                const bal = await bundler_1.default.getAddressBalance(bundler, addy);
                console.log(`${(0, utils_1.parseColor)(colors, addy, 'cyan')} has a bundler balance of ${(0, utils_1.parseColor)(colors, `AR ${blockweave.ar.winstonToAr(bal.toString(), { formatted: true, decimals: 12, trim: true })}`, 'yellow')}`);
            }
            catch (e) {
                console.log((0, utils_1.parseColor)(colors, 'Unable to retrieve bundler balance.', 'red'));
                if (debug)
                    console.log(e);
            }
            return;
        }
        try {
            const bal = await blockweave.wallets.getBalance(addy);
            console.log(`${(0, utils_1.parseColor)(colors, addy, 'cyan')} has a balance of ${(0, utils_1.parseColor)(colors, `AR ${blockweave.ar.winstonToAr(bal, { formatted: true, decimals: 12, trim: true })}`, 'yellow')}`);
        }
        catch (e) {
            console.log((0, utils_1.parseColor)(colors, 'Unable to retrieve wallet balance', 'red'));
            if (debug)
                console.log(e);
        }
    },
};
exports.default = command;
