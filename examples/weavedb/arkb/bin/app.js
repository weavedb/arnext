#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const minimist_1 = __importDefault(require("minimist"));
const conf_1 = __importDefault(require("conf"));
const commands_1 = __importDefault(require("./commands"));
const utils_1 = require("./utils/utils");
const argv = (0, minimist_1.default)(process.argv.slice(2));
const config = new conf_1.default();
const debug = !!argv.debug;
const blockweave = (0, utils_1.setArweaveInstance)(argv, debug);
const cliCommands = new commands_1.default();
cliCommands
    .cliTask({
    argv,
    config,
    debug,
    blockweave,
})
    .then(() => {
    process.exit(0);
})
    .catch((e) => {
    if (debug)
        console.log(e);
    process.exit(1);
});
