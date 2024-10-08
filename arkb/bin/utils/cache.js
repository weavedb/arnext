"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
class Cache {
    debug;
    isArLocal;
    cache;
    cacheFile = path_1.default.join(__dirname, '..', '..', 'cached.json');
    constructor(debug = false, isArLocal) {
        this.debug = debug;
        this.isArLocal = isArLocal;
        if (this.isArLocal) {
            this.cacheFile = path_1.default.join(__dirname, '..', '..', 'cached-arlocal.json');
        }
        this.cache = new Map();
        if (fs_1.default.existsSync(this.cacheFile)) {
            try {
                const entries = JSON.parse(fs_1.default.readFileSync(this.cacheFile, 'utf8'));
                for (const [key, value] of entries) {
                    this.cache.set(key, value);
                }
                // tslint:disable-next-line: no-empty
            }
            catch (e) { }
        }
    }
    get(key) {
        return this.cache.get(key);
    }
    set(key, value) {
        this.cache.set(key, value);
    }
    has(key) {
        return this.cache.has(key);
    }
    delete(key) {
        this.cache.delete(key);
    }
    clear() {
        this.cache.clear();
    }
    size() {
        return this.cache.size;
    }
    save(colors) {
        return new Promise((resolve, reject) => {
            fs_1.default.writeFile(this.cacheFile, JSON.stringify(this.entries()), 'utf8', (err) => {
                if (err) {
                    if (this.debug) {
                        console.log((0, utils_1.parseColor)(colors, 'Error saving cache: ' + err.message, 'red'));
                        reject(err);
                    }
                }
                resolve();
            });
        });
    }
    keys() {
        return Array.from(this.cache.keys());
    }
    values() {
        return Array.from(this.cache.values());
    }
    entries() {
        return Array.from(this.cache.entries());
    }
}
exports.default = Cache;
