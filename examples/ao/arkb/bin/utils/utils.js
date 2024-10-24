"use strict";
/**
 * utils.ts - Various utility functions
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTempDir = exports.parseColor = exports.snakeCaseToTitleCase = exports.pause = exports.getPackageVersion = exports.getUserDirectory = exports.dirExists = exports.numbersForHumans = exports.bytesForHumans = exports.isValidWalletAddress = exports.setArweaveInstance = void 0;
const blockweave_1 = __importDefault(require("blockweave"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cli_color_1 = __importDefault(require("cli-color"));
const temp_dir_1 = __importDefault(require("temp-dir"));
function setArweaveInstance(argv, debug) {
    const timeout = argv.timeout || 20000;
    const gateway = argv.gateway || argv.g || 'https://arweave.net';
    return new blockweave_1.default({
        url: gateway,
        timeout,
        logging: debug,
    }, [gateway]);
}
exports.setArweaveInstance = setArweaveInstance;
function isValidWalletAddress(address) {
    return /[a-z0-9_-]{43}/i.test(address);
}
exports.isValidWalletAddress = isValidWalletAddress;
function bytesForHumans(bytes) {
    const sizes = ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB'];
    let output;
    sizes.forEach((unit, id) => {
        const s = Math.pow(1024, id);
        let fixed = '';
        if (bytes >= s) {
            fixed = String((bytes / s).toFixed(2));
            if (fixed.indexOf('.0') === fixed.length - 2) {
                fixed = fixed.slice(0, -2);
            }
            output = `${fixed} ${unit}`;
        }
    });
    if (!output) {
        return `0 Bytes`;
    }
    return output;
}
exports.bytesForHumans = bytesForHumans;
function numbersForHumans(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
exports.numbersForHumans = numbersForHumans;
function dirExists(dir) {
    return fs_1.default.existsSync(dir);
}
exports.dirExists = dirExists;
function getUserDirectory() {
    return process.cwd();
}
exports.getUserDirectory = getUserDirectory;
function getPackageVersion() {
    return require(path_1.default.join(__dirname, '..', '..', 'package.json')).version;
}
exports.getPackageVersion = getPackageVersion;
async function pause(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.pause = pause;
// tslint:disable-next-line: variable-name
function snakeCaseToTitleCase(snake_case) {
    const sentence = snake_case.toLowerCase().split('_');
    for (let i = 0; i < sentence.length; i++) {
        sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
    }
    return sentence.join(' ');
}
exports.snakeCaseToTitleCase = snakeCaseToTitleCase;
/**
 *
 * @param colors colors option (--colors) set in cli
 * @param text text to parsed
 * @param color color to be parsed to
 * @returns parsed
 */
const parseColor = (colors, text, color) => {
    if (colors === false) {
        return text;
    }
    else {
        return cli_color_1.default[color](text);
    }
};
exports.parseColor = parseColor;
function getTempDir() {
    // arkb temp dir
    const dir = path_1.default.join(temp_dir_1.default, '.arkb');
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir);
    }
    return dir;
}
exports.getTempDir = getTempDir;
