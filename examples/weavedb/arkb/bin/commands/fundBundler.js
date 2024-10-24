"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wallet_1 = require("../utils/wallet");
const wallet_2 = __importDefault(require("../options/wallet"));
const debug_1 = __importDefault(require("../options/debug"));
const help_1 = __importDefault(require("../options/help"));
const timeout_1 = __importDefault(require("../options/timeout"));
const useBundler_1 = __importDefault(require("../options/useBundler"));
const noColors_1 = __importDefault(require("../options/noColors"));
const utils_1 = require("../utils/utils");
const command = {
    name: 'fund-bundler',
    description: 'Fund your bundler account',
    args: ['amount'],
    usage: ['0.3'],
    options: [wallet_2.default, debug_1.default, help_1.default, timeout_1.default, useBundler_1.default, noColors_1.default],
    execute: async (args) => {
        const { walletPath, bundler, debug, config, blockweave, commandValues, useBundler, colors } = args;
        // Check if we have received a command value
        if (!commandValues || !commandValues.length) {
            console.log((0, utils_1.parseColor)(colors, 'You forgot to set the amount.', 'red'));
            return;
        }
        const amount = commandValues[0];
        const wallet = await (0, wallet_1.getWallet)(walletPath, config, debug, colors);
        if (!wallet) {
            return;
        }
        if (!useBundler) {
            console.log((0, utils_1.parseColor)(colors, 'Please set bundler address', 'red'));
            return;
        }
        // Get the bundler address and make a non-data transaction to the address
        let bundlerAddress;
        try {
            const res = await bundler.get('/info');
            bundlerAddress = res.data.address || res.data.addresses.arweave;
        }
        catch (e) {
            console.log((0, utils_1.parseColor)(colors, 'Error getting bundler address, see more info with the --debug option.', 'red'));
            if (debug)
                console.log(e);
            process.exit(1);
        }
        // Fund the bundler address
        try {
            // const addy = await blockweave.wallets.jwkToAddress(wallet);
            const tx = await blockweave.createTransaction({
                target: bundlerAddress,
                quantity: blockweave.ar.arToWinston(amount.toString()),
            }, wallet);
            tx.reward = parseInt(tx.reward, 10).toString();
            await blockweave.transactions.sign(tx, wallet);
            await blockweave.transactions.post(tx);
            console.log((0, utils_1.parseColor)(colors, `Bundler funded with ${amount.toString()} AR, transaction ID: ${tx.id}`, 'cyan'));
        }
        catch (e) {
            console.log((0, utils_1.parseColor)(colors, 'Error funding bundler address, see more info with the --debug option.', 'red'));
            if (debug)
                console.log(e);
        }
    },
};
exports.default = command;
