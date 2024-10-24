"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const status_1 = require("../lib/status");
const gateway_1 = __importDefault(require("../options/gateway"));
const timeout_1 = __importDefault(require("../options/timeout"));
const debug_1 = __importDefault(require("../options/debug"));
const help_1 = __importDefault(require("../options/help"));
const noColors_1 = __importDefault(require("../options/noColors"));
const utils_1 = require("../utils/utils");
const command = {
    name: 'status',
    aliases: ['s'],
    description: 'Check the status of a transaction ID',
    options: [gateway_1.default, timeout_1.default, debug_1.default, help_1.default, noColors_1.default],
    args: ['txid'],
    usage: ['am2NyCEGnxXBqhUGKL8cAv6wbkGKVtgIcdtv9g9QKG1'],
    execute: async (args) => {
        const { commandValues, blockweave, debug, colors } = args;
        if (!commandValues || !commandValues.length) {
            console.log((0, utils_1.parseColor)(colors, 'Error: Missing transaction ID', 'redBright'));
            return;
        }
        const txid = commandValues[0];
        const arweaveUri = blockweave.config.url;
        try {
            const res = await (0, status_1.status)(txid, blockweave);
            console.log('🚀 ~ file: status.ts ~ line 20 ~ .then ~ res', res);
            let responseStatus = '';
            switch (res.status) {
                case 200:
                    responseStatus = (0, utils_1.parseColor)(colors, '200 - Accepted', 'green');
                    break;
                case 202:
                    responseStatus = (0, utils_1.parseColor)(colors, '202 - Pending', 'yellow');
                    break;
                case 400:
                    responseStatus = (0, utils_1.parseColor)(colors, `400 - ${res.errorMessage}`, 'red');
                    break;
                case 404:
                    responseStatus = (0, utils_1.parseColor)(colors, `404 - Not Found`, 'red');
                    break;
                default:
                    responseStatus = (0, utils_1.parseColor)(colors, `${res.status} - ${res.errorMessage}`, 'red');
                    break;
            }
            console.log(`Trasaction ID: ${(0, utils_1.parseColor)(colors, txid, 'blue')}

Status: ${responseStatus}`);
            if (res.status === 200) {
                console.log(` - Block: ${(0, utils_1.parseColor)(colors, res.blockHeight, 'cyan')}
 - Block hash: ${(0, utils_1.parseColor)(colors, res.blockHash, 'cyan')}
 - Confirmations: ${(0, utils_1.parseColor)(colors, res.confirmations, 'cyan')}

Transaction URL: ${(0, utils_1.parseColor)(colors, `${arweaveUri}/${txid}`, 'cyan')}
Block URL: ${(0, utils_1.parseColor)(colors, `${arweaveUri}/block/hash/${res.blockHash}`, 'cyan')}

Transaction explorer URL: ${(0, utils_1.parseColor)(colors, `https://viewblock.io/arweave/tx/${txid}`, 'cyan')}
Block explorer URL: ${(0, utils_1.parseColor)(colors, `https://viewblock.io/arweave/block/${res.blockHeight}`, 'cyan')}`);
            }
        }
        catch (e) {
            console.log((0, utils_1.parseColor)(colors, `Unable to reach ${blockweave.config.url} - ${e.message}`, 'red'));
            if (debug)
                console.log(e);
        }
    },
};
exports.default = command;
