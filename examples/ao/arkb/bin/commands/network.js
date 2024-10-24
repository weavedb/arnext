"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const console_1 = require("console");
const utils_1 = require("../utils/utils");
const gateway_1 = __importDefault(require("../options/gateway"));
const timeout_1 = __importDefault(require("../options/timeout"));
const debug_1 = __importDefault(require("../options/debug"));
const help_1 = __importDefault(require("../options/help"));
const noColors_1 = __importDefault(require("../options/noColors"));
const command = {
    name: 'network',
    aliases: ['n'],
    description: 'Get the current network info',
    options: [gateway_1.default, timeout_1.default, debug_1.default, help_1.default, noColors_1.default],
    execute: async (args) => {
        const { blockweave, colors } = args;
        try {
            const net = await blockweave.network.getInfo();
            console.log((0, utils_1.parseColor)(colors, `Network Details for ${blockweave.config.url}\n`, 'green'));
            Object.keys(net).forEach((key) => {
                const value = net[key];
                console.log(`${(0, utils_1.parseColor)(colors, (0, utils_1.snakeCaseToTitleCase)(key), 'yellow')}: ${(0, utils_1.parseColor)(colors, isNaN(value) ? value : (0, utils_1.numbersForHumans)(value), 'cyan')}`);
            });
        }
        catch (err) {
            console.log((0, utils_1.parseColor)(colors, `Unable to reach ${blockweave.config.url} - ${err.message}`, 'red'));
            if (console_1.debug)
                console.log(err);
        }
    },
};
exports.default = command;
