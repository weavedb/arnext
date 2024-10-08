"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const spdx_license_ids_1 = __importDefault(require("spdx-license-ids"));
const fuse_js_1 = __importDefault(require("fuse.js"));
const url_1 = require("url");
const api_1 = __importDefault(require("arweave/node/lib/api"));
const tags_1 = __importDefault(require("./lib/tags"));
const utils_1 = require("./utils/utils");
class CliCommands {
    options = new Map();
    commands = new Map();
    bundler;
    constructor() {
        // Commands
        const commandFiles = fs_1.default.readdirSync(path_1.default.join(__dirname, 'commands')).filter((file) => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path_1.default.join(__dirname, 'commands', file);
            const { default: comm } = require(filePath);
            this.commands.set(comm.name, comm);
            this.addAliases(comm);
        }
        // Options
        const optionFiles = fs_1.default.readdirSync(path_1.default.join(__dirname, 'options')).filter((file) => file.endsWith('.js'));
        for (const file of optionFiles) {
            const filePath = path_1.default.join(__dirname, 'options', file);
            const { default: opt } = require(filePath);
            this.options.set(opt.name, opt);
        }
    }
    async cliTask(partialArgs) {
        let command = partialArgs.argv._[0];
        const commandValues = partialArgs.argv._.slice(1);
        if (!command) {
            command = 'help';
        }
        const tags = new tags_1.default();
        const tagNames = partialArgs.argv['tag-name'];
        const tagValues = partialArgs.argv['tag-value'];
        if (tagNames && tagValues) {
            const isArrayTagNames = Array.isArray(tagNames);
            const isArrayTagValues = Array.isArray(tagValues);
            if (isArrayTagNames && isArrayTagValues) {
                for (let i = 0; i < tagNames.length; i++) {
                    const name = tagNames[i]?.toString();
                    const value = tagValues[i]?.toString();
                    if (name && value) {
                        tags.addTag(name, value);
                    }
                }
            }
            else {
                tags.addTag(Array.isArray(tagNames) ? tagNames[0].toString() : tagNames.toString(), Array.isArray(tagValues) ? tagValues[0].toString() : tagValues.toString());
            }
        }
        // Get the options aliases and set the option value to the alias value
        for (const option of this.options.values()) {
            if (option.alias) {
                const alias = partialArgs.argv[option.alias];
                if (alias) {
                    partialArgs.argv[option.name] = alias;
                }
            }
        }
        let feeMultiplier = 1;
        if (partialArgs.argv['fee-multiplier']) {
            try {
                const feeArgv = parseFloat(partialArgs.argv['fee-multiplier']);
                if (feeArgv > 1) {
                    feeMultiplier = feeArgv;
                }
                // tslint:disable-next-line: no-empty
            }
            catch { }
        }
        let useBundler = partialArgs.argv['use-bundler'];
        const colors = partialArgs.argv.colors;
        if (useBundler) {
            let parsed;
            if (typeof useBundler === 'boolean' && useBundler === true) {
                // reassign useBundler arg for all instances that use it
                partialArgs.argv['use-bundler'] = 'https://node2.bundlr.network';
                useBundler = 'https://node2.bundlr.network';
            }
            try {
                parsed = new url_1.URL(useBundler);
            }
            catch (e) {
                console.log((0, utils_1.parseColor)(colors, '[--use-bundler] Invalid url format', 'red'));
                if (partialArgs.debug)
                    console.log(e);
                process.exit(1);
            }
            this.bundler = new api_1.default({ ...parsed, host: parsed.hostname });
        }
        if (useBundler && feeMultiplier > 1) {
            console.log((0, utils_1.parseColor)(colors, '\nFee multiplier is ignored when using the bundler', 'yellow'));
            feeMultiplier = 1;
        }
        let license = '';
        if (partialArgs.argv.license) {
            license = partialArgs.argv.license;
            if (!spdx_license_ids_1.default.includes(license)) {
                // help the user
                const fuse = new fuse_js_1.default(spdx_license_ids_1.default);
                const spdxCandidates = fuse.search(license);
                console.log((0, utils_1.parseColor)(colors, `\n"${license}" is not a valid spdx license identifier`, 'red'));
                if (spdxCandidates.length > 0) {
                    console.log((0, utils_1.parseColor)(colors, 'Did you mean?', 'yellow'));
                    spdxCandidates.slice(0, 5).map((cand) => console.log((0, utils_1.parseColor)(colors, ` ${cand.item}`, 'blue')));
                }
                else {
                    console.log((0, utils_1.parseColor)(colors, `A list of valid spdx identifiers can be found at https://spdx.org/licenses/`, 'yellow'));
                }
                process.exit(1);
            }
        }
        const contentType = partialArgs.argv['content-type'];
        const args = {
            argv: partialArgs.argv,
            blockweave: partialArgs.blockweave,
            debug: partialArgs.debug,
            config: partialArgs.config,
            walletPath: partialArgs.argv.wallet,
            command,
            commandValues,
            tags,
            feeMultiplier,
            useBundler,
            bundle: partialArgs.argv.bundle,
            license,
            index: partialArgs.argv.index,
            autoConfirm: partialArgs.argv['auto-confirm'],
            commands: this.commands,
            options: this.options,
            bundler: this.bundler,
            colors: partialArgs.argv.colors,
            contentType,
        };
        if (this.commands.has(command)) {
            const commandObj = this.commands.get(command);
            if (commandObj && typeof commandObj.execute === 'function' && !this.showHelp(commandObj, command, args)) {
                await commandObj.execute(args);
            }
        }
        else {
            console.log((0, utils_1.parseColor)(colors, `\nCommand not found: ${command}`, 'red'));
        }
    }
    addAliases(commOrOpt) {
        if (commOrOpt.aliases && commOrOpt.aliases.length > 0) {
            for (const alias of commOrOpt.aliases) {
                this.commands.set(alias, commOrOpt);
            }
        }
        else if (commOrOpt.alias) {
            this.options.set(commOrOpt.alias, commOrOpt);
        }
    }
    showHelp(commandObj, command, partialArgs) {
        if (commandObj.name === 'help' || !partialArgs.argv.help) {
            return false;
        }
        const colors = partialArgs.argv.colors;
        console.log((0, utils_1.parseColor)(colors, `\nExample usage of ${(0, utils_1.parseColor)(colors, command, 'green')}:\n`, 'bold'));
        for (const option of commandObj.options) {
            const usage = commandObj.usage && commandObj.usage.length > 0
                ? ` ${commandObj.usage[Math.floor(Math.random() * commandObj.usage.length)]}`
                : '';
            console.log(`${(0, utils_1.parseColor)(colors, `${option.description}:`, 'blackBright')}
arkb ${command + usage} --${option.name}${option.arg ? `=${option.usage}` : ''}\n`);
        }
        return true;
    }
}
exports.default = CliCommands;
