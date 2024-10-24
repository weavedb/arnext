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
const transfer_1 = __importDefault(require("../lib/transfer"));
const utils_1 = require("../utils/utils");
const command = {
    name: 'withdraw-bundler',
    description: 'Withdraw from your bundler balance',
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
        // amount in ar
        const amnt = commandValues[0];
        const amount = parseInt(blockweave.ar.arToWinston(amnt), 10);
        const wallet = await (0, wallet_1.getWallet)(walletPath, config, debug, colors);
        if (!wallet) {
            return;
        }
        if (!useBundler) {
            console.log((0, utils_1.parseColor)(colors, 'Please set bundler address', 'red'));
            return;
        }
        // Initiate withdrawal
        try {
            const transfer = new transfer_1.default(wallet, blockweave);
            const addy = await transfer.withdrawBundler(bundler, amount);
            if (!addy) {
                console.log((0, utils_1.parseColor)(colors, 'Error withdrawing to wallet', 'red'));
                return;
            }
            // Success response
            console.log(`${(0, utils_1.parseColor)(colors, addy, 'cyan')} has been funded with ${(0, utils_1.parseColor)(colors, `AR ${amnt} from bundler.`)}`, 'yellow');
        }
        catch (e) {
            console.log((0, utils_1.parseColor)(colors, 'Error withdrawing to wallet', 'red'));
            if (debug)
                console.log(e);
            return;
        }
    },
};
exports.default = command;
