"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeployPath = void 0;
const path_1 = __importDefault(require("path"));
const normalize_path_1 = __importDefault(require("normalize-path"));
const utils_1 = require("./utils");
function getDeployPath(commandValues, colors) {
    // Check if we have received a command value
    if (!commandValues || !commandValues.length) {
        console.log((0, utils_1.parseColor)(colors, 'You forgot to set the directory or file that you want to deploy.', 'red'));
        process.exit(0);
    }
    const commandValue = commandValues[0];
    // Use resolve instead of join to get orignal path
    let dir = path_1.default.resolve((0, utils_1.getUserDirectory)(), commandValue.replace(/[\/\\]$/, ''));
    // Normalize for os differences
    dir = (0, normalize_path_1.default)(dir);
    // Check if deploy dir exists
    if (!(0, utils_1.dirExists)(dir)) {
        dir = (0, normalize_path_1.default)(commandValue.replace(/[\/\\]$/, ''));
        if (!(0, utils_1.dirExists)(dir)) {
            console.log((0, utils_1.parseColor)(colors, `The directory or file does not exist.`, 'red'));
            process.exit(0);
        }
    }
    return dir;
}
exports.getDeployPath = getDeployPath;
