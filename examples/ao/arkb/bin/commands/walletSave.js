"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const cli_questions_1 = __importDefault(require("../utils/cli-questions"));
const crypter_1 = __importDefault(require("../utils/crypter"));
const noColors_1 = __importDefault(require("../options/noColors"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("../utils/utils");
const command = {
    name: 'wallet-save',
    aliases: ['ws'],
    description: `Saves a wallet, removes the need of the --wallet option`,
    args: ['wallet_path'],
    usage: [`folder${path_1.default.sep}keyfile.json`],
    options: [noColors_1.default],
    execute: async (args) => {
        const { commandValues, config, debug, colors } = args;
        if (!commandValues || !commandValues.length) {
            console.log((0, utils_1.parseColor)(colors, 'Wallet path is required.', 'redBright'));
            return;
        }
        const walletPath = commandValues[0];
        try {
            const wallet = fs_1.default.readFileSync(walletPath, 'utf8');
            const res = await cli_questions_1.default.askWalletPassword('Set a password for your wallet');
            const crypter = new crypter_1.default(res.password);
            const encWallet = crypter.encrypt(Buffer.from(wallet)).toString('base64');
            config.set('wallet', encWallet);
            console.log((0, utils_1.parseColor)(colors, 'Wallet saved!', 'green'));
        }
        catch (e) {
            console.log((0, utils_1.parseColor)(colors, 'Invalid wallet file.', 'red'));
            if (debug)
                console.log(e);
        }
    },
};
exports.default = command;
