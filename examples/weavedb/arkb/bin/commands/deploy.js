"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const deploy_1 = __importDefault(require("../lib/deploy"));
const cli_questions_1 = __importDefault(require("../utils/cli-questions"));
const wallet_1 = require("../utils/wallet");
const showDeployDetails_1 = require("../utils/showDeployDetails");
const gateway_1 = __importDefault(require("../options/gateway"));
const useBundler_1 = __importDefault(require("../options/useBundler"));
const license_1 = __importDefault(require("../options/license"));
const autoConfirm_1 = __importDefault(require("../options/autoConfirm"));
const feeMultiplier_1 = __importDefault(require("../options/feeMultiplier"));
const timeout_1 = __importDefault(require("../options/timeout"));
const tagName_1 = __importDefault(require("../options/tagName"));
const tagValue_1 = __importDefault(require("../options/tagValue"));
const wallet_2 = __importDefault(require("../options/wallet"));
const debug_1 = __importDefault(require("../options/debug"));
const help_1 = __importDefault(require("../options/help"));
const force_1 = __importDefault(require("../options/force"));
const bundle_1 = __importDefault(require("../options/bundle"));
const concurrency_1 = __importDefault(require("../options/concurrency"));
const noColors_1 = __importDefault(require("../options/noColors"));
const deploy_2 = require("../utils/deploy");
const utils_1 = require("../utils/utils");
const command = {
    name: 'deploy',
    aliases: ['d', 'upload'],
    description: 'Deploy a directory or file',
    options: [
        gateway_1.default,
        useBundler_1.default,
        bundle_1.default,
        feeMultiplier_1.default,
        tagName_1.default,
        tagValue_1.default,
        license_1.default,
        wallet_2.default,
        autoConfirm_1.default,
        timeout_1.default,
        concurrency_1.default,
        force_1.default,
        debug_1.default,
        help_1.default,
        noColors_1.default,
    ],
    args: ['folder_or_file'],
    usage: [`folder${path_1.default.sep}filename.json`, `.${path_1.default.sep}folder`],
    execute: async (args) => {
        const { argv, commandValues, walletPath, config, debug, blockweave, tags, license, useBundler, feeMultiplier, autoConfirm, bundle, bundler, colors, contentType, } = args;
        // Get the wallet
        let wallet = await (0, wallet_1.getWallet)(walletPath, config, debug, colors);
        if (useBundler && !wallet) {
            wallet = await blockweave.wallets.generate();
        }
        if (!wallet) {
            console.log((0, utils_1.parseColor)(colors, 'Please save a wallet or run with the --wallet option.', 'red'));
            return;
        }
        if (useBundler && bundle) {
            console.log((0, utils_1.parseColor)(colors, 'You can not use a bundler and locally bundle at the same time', 'red'));
            return;
        }
        const concurrency = argv.concurrency || 5;
        const forceRedeploy = argv.force;
        // Check and get the specified directory or file
        const dir = (0, deploy_2.getDeployPath)(commandValues, colors);
        let files = [dir];
        let isFile = true;
        if (fs_1.default.lstatSync(dir).isDirectory()) {
            files = await (0, fast_glob_1.default)([`${dir}/**/*`], { dot: false });
            isFile = false;
        }
        const deploy = new deploy_1.default(wallet, blockweave, debug, concurrency, true, bundle);
        if (!args.index) {
            args.index = 'index.html';
        }
        const txs = await deploy.prepare(dir, files, args.index, tags, contentType, license, useBundler, feeMultiplier, forceRedeploy, colors);
        const balAfter = await (0, showDeployDetails_1.showDeployDetails)(txs, wallet, isFile, dir, blockweave, useBundler, deploy.getBundler(), license, bundler, {
            tx: deploy.getBundledTx(),
            bundle: deploy.getBundle(),
        }, colors);
        if (balAfter < 0) {
            console.log(useBundler
                ? (0, utils_1.parseColor)(colors, "You don't have enough bundler balance for this deploy.", 'red')
                : (0, utils_1.parseColor)(colors, "You don't have enough balance for this deploy.", 'red'));
            return;
        }
        // Check if auto-confirm is added
        let res = { confirm: !!autoConfirm };
        if (!autoConfirm) {
            res = await cli_questions_1.default.showConfirm();
        }
        if (!res.confirm) {
            console.log((0, utils_1.parseColor)(colors, 'Rejected!', 'red'));
            return;
        }
        const manifestTx = await deploy.deploy(isFile, useBundler, colors);
        console.log('');
        if (useBundler) {
            console.log((0, utils_1.parseColor)(colors, 'Data items deployed! Visit the following URL to see your deployed content:', 'green'));
        }
        else {
            console.log((0, utils_1.parseColor)(colors, 'Files deployed! Visit the following URL to see your deployed content:', 'green'));
        }
        console.log((0, utils_1.parseColor)(colors, `${blockweave.config.url}/${manifestTx}`, 'cyan'));
    },
};
exports.default = command;
