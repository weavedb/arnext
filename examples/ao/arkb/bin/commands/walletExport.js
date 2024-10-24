"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const wallet_1 = require("../utils/wallet");
const noColors_1 = __importDefault(require("../options/noColors"));
const utils_1 = require("../utils/utils");
const command = {
    name: 'wallet-export',
    aliases: ['we'],
    description: `Exports a previously saved wallet`,
    options: [noColors_1.default],
    execute: async (args) => {
        const { config, blockweave, debug, colors } = args;
        const wallet = await (0, wallet_1.getWallet)(null, config, debug, colors);
        if (!wallet) {
            console.log((0, utils_1.parseColor)(colors, 'Please set a wallet or run with the --wallet option.', 'red'));
            return;
        }
        try {
            const address = await blockweave.wallets.jwkToAddress(wallet);
            fs_1.default.writeFileSync(`${address}.json`, JSON.stringify(wallet), 'utf8');
            console.log((0, utils_1.parseColor)(colors, `Wallet "${(0, utils_1.parseColor)(colors, `${address}.json`, 'bold')}" exported successfully.`, 'green'));
        }
        catch (e) {
            console.log((0, utils_1.parseColor)(colors, 'Unable to export the wallet file.', 'red'));
            if (debug)
                console.log(e);
        }
    },
};
exports.default = command;
