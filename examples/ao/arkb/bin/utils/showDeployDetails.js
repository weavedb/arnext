"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.showDeployDetails = void 0;
const clui_1 = __importDefault(require("clui"));
const cli_color_1 = __importDefault(require("cli-color"));
const bundler_1 = __importDefault(require("./bundler"));
const utils_1 = require("./utils");
async function showDeployDetails(txs, wallet, isFile = false, dir, blockweave, useBundler, bundler, license, bundlerApi, bundled, colors) {
    let totalSize = 0;
    let deployFee = 0;
    // check if all files satisfy for free bundler deploy
    // is free bundler deploy variable
    const ifd = !txs.some((tx) => tx.fileSize > 100 * 1000);
    const Line = clui_1.default.Line;
    new Line()
        .column('ID', 45, colors !== false ? [cli_color_1.default.cyan] : undefined)
        .column('Size', 15, colors !== false ? [cli_color_1.default.cyan] : undefined)
        .column('Fee', 17, colors !== false ? [cli_color_1.default.cyan] : undefined)
        .column('Type', 30, colors !== false ? [cli_color_1.default.cyan] : undefined)
        .column('Path', 20, colors !== false ? [cli_color_1.default.cyan] : undefined)
        .fill()
        .output();
    for (let i = 0, j = txs.length; i < j; i++) {
        const tx = txs[i];
        let ar = '-';
        const reward = tx.tx.reward;
        if (reward) {
            ar = blockweave.ar.winstonToAr(reward);
            deployFee += +reward;
        }
        let size = '-';
        const dataSize = tx.fileSize || tx.tx.data_size;
        if (dataSize) {
            size = (0, utils_1.bytesForHumans)(+dataSize);
            totalSize += +dataSize;
        }
        let filePath = tx.filePath;
        if (filePath.startsWith(`${dir}/`)) {
            filePath = filePath.split(`${dir}/`)[1];
        }
        if (!filePath) {
            filePath = '';
        }
        new Line()
            .column(tx.tx.id, 45)
            .column(size, 15)
            .column(ar, 17)
            .column(tx.type, 30)
            .column(filePath, 20)
            .fill()
            .output();
    }
    if (bundled.tx) {
        const size = bundled.tx.data_size;
        // total size should be size of bundle
        // not accumulated
        totalSize = +size;
        const reward = bundled.tx.reward;
        const ar = blockweave.ar.winstonToAr(reward);
        // deployFee should be only reward of bundle
        // not accumulated
        deployFee = +reward;
        new Line()
            .column(bundled.tx.id, 45)
            .column((0, utils_1.bytesForHumans)(+size), 15)
            .column(ifd ? '-' : ar, 17)
            .column('Bundle', 30)
            .column('-', 20)
            .fill()
            .output();
    }
    let fee = parseInt((deployFee * 0.1).toString(), 10);
    if (useBundler) {
        // calculate fee with 30% + 10%
        fee = parseInt((deployFee * 0.4).toString(), 10);
    }
    let arFee = blockweave.ar.winstonToAr(deployFee.toString());
    let serviceFee = blockweave.ar.winstonToAr(fee.toString());
    let totalFee = blockweave.ar.winstonToAr((deployFee + fee).toString());
    if (useBundler && ifd) {
        arFee = '0';
        serviceFee = '0';
        totalFee = '0';
    }
    console.log('');
    console.log((0, utils_1.parseColor)(colors, 'Summary', 'cyan'));
    if (license) {
        console.log(`License: ${license}`);
    }
    if (useBundler) {
        console.log(`Data items to deploy: ${isFile ? '1' : `${txs.length - 1} + 1 manifest`}`);
    }
    else if (bundled) {
        console.log(`All items will be deployed in a single bundle`);
    }
    else {
        console.log(`Files to deploy: ${isFile ? '1' : `${txs.length - 1} + 1 manifest`}`);
    }
    console.log(`Total size: ${(0, utils_1.bytesForHumans)(totalSize)}`);
    console.log(`Fees: ${arFee} + ${serviceFee} (10% arkb fee ${useBundler ? '+ 30% Bundlr fee' : ''})`);
    console.log(`Total fee: ${totalFee}`);
    const addy = await blockweave.wallets.jwkToAddress(wallet);
    let winston;
    if (useBundler) {
        const balance = await bundler_1.default.getAddressBalance(bundlerApi, addy);
        winston = balance.toString();
    }
    else {
        winston = await blockweave.wallets.getBalance(addy);
    }
    const bal = blockweave.ar.winstonToAr(winston);
    const balAfter = +bal - +totalFee;
    console.log('');
    console.log((0, utils_1.parseColor)(colors, 'Wallet', 'cyan'));
    console.log(`Address: ${addy}`);
    console.log(`Current balance: ${bal}`);
    console.log(`Balance after deploy: ${balAfter}`);
    console.log('');
    return +balAfter;
}
exports.showDeployDetails = showDeployDetails;
