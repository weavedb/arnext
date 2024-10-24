"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
class Crypter {
    passphrase = '';
    constructor(password) {
        this.passphrase = password;
    }
    encrypt(data) {
        const key = crypto_1.default.pbkdf2Sync(this.passphrase, 'salt', 100000, 32, 'sha256');
        const algorithm = 'aes-256-cbc';
        const iv = crypto_1.default.randomBytes(16);
        const cipher = crypto_1.default.createCipheriv(algorithm, key, iv);
        const encrypted = Buffer.concat([iv, cipher.update(data), cipher.final()]);
        return encrypted;
    }
    decrypt(encrypted) {
        try {
            const algorithm = 'aes-256-cbc';
            const key = crypto_1.default.pbkdf2Sync(this.passphrase, 'salt', 100000, 32, 'sha256');
            const iv = encrypted.slice(0, 16);
            const data = encrypted.slice(16);
            const decipher = crypto_1.default.createDecipheriv(algorithm, key, iv);
            const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
            return decrypted;
        }
        catch (error) {
            throw new Error('Failed to decrypt');
        }
    }
}
exports.default = Crypter;
