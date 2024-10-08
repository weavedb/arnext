"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cli_color_1 = __importDefault(require("cli-color"));
const clear_1 = __importDefault(require("clear"));
const figlet_1 = __importDefault(require("figlet"));
const path_1 = __importDefault(require("path"));
const clui_1 = __importDefault(require("clui"));
const noColors_1 = __importDefault(require("../options/noColors"));
const utils_1 = require("../utils/utils");
const command = {
    name: 'help',
    aliases: ['h'],
    description: 'Show usage help for a command',
    options: [noColors_1.default],
    execute: async (args) => {
        (0, clear_1.default)();
        const { commands, options, colors } = args;
        console.log((0, utils_1.parseColor)(colors, figlet_1.default.textSync('ARKB', 'Whimsy'), 'yellow'));
        console.log(`Usage: arkb ${(0, utils_1.parseColor)(colors, '[options]', 'cyan')} ${(0, utils_1.parseColor)(colors, '[command]', 'green')}\n`);
        const Line = clui_1.default.Line;
        new Line()
            .column('Options', 40, colors !== false ? [cli_color_1.default.cyan] : undefined)
            .column('Description', 20, colors !== false ? [cli_color_1.default.blackBright] : undefined)
            .fill()
            .output();
        const opts = Array.from(options)
            .filter(([key, opt]) => key !== opt.alias)
            .map(([key, opt]) => {
            const alias = opt.alias ? ` -${opt.alias}` : '';
            const arg = opt.arg ? (0, utils_1.parseColor)(colors, ` <${opt.arg}>`, 'blackBright') : '';
            return [`--${opt.name + alias + arg}`, opt.description];
        });
        for (let i = 0, j = opts.length; i < j; i++) {
            new Line().column(opts[i][0], 40).column(opts[i][1], 50).fill().output();
        }
        const cmds = Array.from(commands)
            .filter(([key, cmd]) => !cmd.aliases || !cmd.aliases.includes(key))
            .map(([key, cmd]) => {
            const aliases = cmd.aliases && cmd.aliases.length > 0 ? ` (${cmd.aliases.join(', ')})` : '';
            let arg = '';
            if (cmd.args && cmd.args.length > 0) {
                for (const a of cmd.args) {
                    arg += (0, utils_1.parseColor)(colors, ` <${a}>`, 'blackBright');
                }
            }
            return [cmd.name + aliases + arg, cmd.description];
        });
        console.log('');
        new Line()
            .column('Commands (alias)', 40, colors !== false ? [cli_color_1.default.green] : undefined)
            .column('Description', 20, colors !== false ? [cli_color_1.default.blackBright] : undefined)
            .fill()
            .output();
        for (let i = 0, j = cmds.length; i < j; i++) {
            new Line().column(cmds[i][0], 40).column(cmds[i][1], 60).fill().output();
        }
        console.log((0, utils_1.parseColor)(colors, '\nExamples', 'magenta'));
        console.log('Without a saved wallet:');
        console.log(`  arkb deploy folder${path_1.default.sep}path${path_1.default.sep} --wallet path${path_1.default.sep}to${path_1.default.sep}my${path_1.default.sep}wallet.json`);
        console.log('\nSaving a wallet:');
        console.log(`  arkb wallet-save path${path_1.default.sep}to${path_1.default.sep}wallet.json`);
        console.log(`  arkb deploy folder${path_1.default.sep}path`);
        console.log('\nCustom index file:');
        console.log(`  arkb deploy folder${path_1.default.sep}path --index custom.html`);
        console.log('\nUsing Bundles:');
        console.log('  arkb deploy folder --use-bundler https://node2.bundlr.network');
    },
};
exports.default = command;
