"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils/utils");
const command = {
    name: 'version',
    aliases: ['v'],
    description: 'Show the current arkb version number',
    execute: async (_) => {
        const version = (0, utils_1.getPackageVersion)();
        console.log(`v${version}`);
    },
};
exports.default = command;
