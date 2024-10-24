"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cli_color_1 = __importDefault(require("cli-color"));
const inquirer_1 = __importDefault(require("inquirer"));
const cliQuestions = {
    askWalletPassword: (message = 'Type your password') => {
        return inquirer_1.default.prompt([
            {
                name: 'password',
                type: 'password',
                message,
                validate: (val) => {
                    if (val.length) {
                        return true;
                    }
                    return 'Please enter a password';
                },
            },
        ]);
    },
    showConfirm: () => {
        return inquirer_1.default.prompt([
            {
                name: 'confirm',
                type: 'confirm',
                message: cli_color_1.default.greenBright('Carefully check the above details are correct, then confirm to complete this upload'),
            },
        ]);
    },
};
exports.default = cliQuestions;
