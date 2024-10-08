"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const noColors_1 = __importDefault(require("../options/noColors"));
const utils_1 = require("../utils/utils");
const command = {
    name: 'wallet-forget',
    aliases: ['wf'],
    options: [noColors_1.default],
    description: `Removes a previously saved wallet`,
    execute: async (args) => {
        const { config, debug, colors } = args;
        try {
            config.delete('wallet');
        }
        catch (e) {
            console.log((0, utils_1.parseColor)(colors, 'Unable to forget the wallet.', 'red'));
            if (debug)
                console.log(e);
        }
    },
};
exports.default = command;
