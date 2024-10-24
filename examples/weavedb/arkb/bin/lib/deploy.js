"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const mime_1 = __importDefault(require("mime"));
const clui_1 = __importDefault(require("clui"));
const promise_pool_1 = __importDefault(require("@supercharge/promise-pool"));
const community_js_1 = __importDefault(require("community-js"));
const promises_1 = require("stream/promises");
const bundler_1 = __importDefault(require("../utils/bundler"));
const tags_1 = __importDefault(require("../lib/tags"));
const utils_1 = require("../utils/utils");
const arweave_stream_tx_1 = require("arweave-stream-tx");
const arweave_1 = __importDefault(require("arweave"));
const cache_1 = __importDefault(require("../utils/cache"));
class Deploy {
    debug;
    threads;
    logs;
    localBundle;
    wallet;
    blockweave;
    arweave;
    bundler;
    cache;
    txs;
    duplicates = [];
    community;
    bundle;
    bundledTx;
    constructor(wallet, blockweave, debug = false, threads = 0, logs = true, localBundle = false) {
        this.debug = debug;
        this.threads = threads;
        this.logs = logs;
        this.localBundle = localBundle;
        this.wallet = wallet;
        this.blockweave = blockweave;
        this.arweave = arweave_1.default.init({
            host: blockweave.config.host,
            port: blockweave.config.port,
            protocol: blockweave.config.protocol,
            timeout: blockweave.config.timeout,
            logging: blockweave.config.logging,
        });
        this.cache = new cache_1.default(debug, this.arweave.getConfig().api.host === 'localhost' || this.arweave.getConfig().api.host === '127.0.0.1');
        this.bundler = new bundler_1.default(wallet, this.blockweave);
        try {
            // @ts-ignore
            this.community = new community_js_1.default(blockweave, wallet);
            // tslint:disable-next-line: no-empty
        }
        catch { }
    }
    getBundler() {
        return this.bundler;
    }
    getBundle() {
        return this.bundle;
    }
    getBundledTx() {
        return this.bundledTx;
    }
    async prepare(dir, files, index = 'index.html', tags = new tags_1.default(), contentType, license, useBundler, feeMultiplier, forceRedeploy = false, colors = true) {
        this.txs = [];
        if (typeof license === 'string' && license.length > 0) {
            tags.addTag('License', license);
        }
        if (useBundler) {
            tags.addTag('Bundler', useBundler);
            tags.addTag('Bundle', 'ans104');
        }
        let leftToPrepare = files.length;
        let countdown;
        if (this.logs) {
            countdown = new clui_1.default.Spinner(`Preparing ${leftToPrepare} files...`, ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷']);
            countdown.start();
        }
        // ignore arkb manifest file
        await promise_pool_1.default.for(files.filter((f) => !f.includes('manifest.arkb')))
            .withConcurrency(this.threads)
            .process(async (filePath) => {
            if (this.logs)
                countdown.message(`Preparing ${leftToPrepare--} files...`);
            let data;
            try {
                data = fs_1.default.readFileSync(filePath);
            }
            catch (e) {
                console.log('Unable to read file ' + filePath);
                throw new Error(`Unable to read file: ${filePath}`);
            }
            if (!data || !data.length) {
                return;
            }
            const hash = await this.toHash(data);
            if (!forceRedeploy && this.cache.has(hash)) {
                const cached = this.cache.get(hash);
                let confirmed = cached.confirmed;
                if (!confirmed) {
                    // tslint:disable-next-line: no-empty
                    const res = await this.arweave.api.get(`tx/${cached.id}/status`).catch(() => { });
                    if (res && res.data && res.data.number_of_confirmations) {
                        confirmed = true;
                    }
                }
                if (confirmed) {
                    this.cache.set(hash, { ...cached, confirmed: true });
                    this.duplicates.push({
                        hash,
                        id: cached.id,
                        filePath,
                    });
                    return;
                }
            }
            const type = contentType || mime_1.default.getType(filePath) || 'application/octet-stream';
            const newTags = new tags_1.default();
            for (const tag of tags.tags) {
                newTags.addTag(tag.name, tag.value);
            }
            newTags.addTag('User-Agent', `arkb`);
            newTags.addTag('User-Agent-Version', (0, utils_1.getPackageVersion)());
            newTags.addTag('Type', 'file');
            if (type)
                newTags.addTag('Content-Type', type);
            newTags.addTag('File-Hash', hash);
            let tx;
            let fileSize;
            if (useBundler || this.localBundle) {
                tx = await this.bundler.createItem(data, newTags.tags);
                // get file size since bundler doesn't contain data_size
                ({ size: fileSize } = fs_1.default.statSync(filePath));
            }
            else {
                tx = await this.buildTransaction(filePath, newTags);
                fileSize = parseInt(tx.data_size, 10);
                if (feeMultiplier && feeMultiplier > 1) {
                    tx.reward = parseInt((feeMultiplier * +tx.reward).toString(), 10).toString();
                }
            }
            this.cache.set(hash, {
                id: tx.id,
                confirmed: false,
            });
            this.txs.push({ filePath, hash, tx, type, fileSize });
        });
        if (this.logs)
            countdown.stop();
        const isFile = this.txs.length === 1 && this.txs[0].filePath === dir;
        if (isFile && this.duplicates.length) {
            console.log((0, utils_1.parseColor)(colors, 'File already deployed:', 'red'));
            console.log('Arweave: ' + (0, utils_1.parseColor)(colors, `${this.blockweave.config.url}/${this.duplicates[0].id}`, 'cyan'));
            return;
        }
        if (this.logs) {
            countdown = new clui_1.default.Spinner(`Building manifest...`, ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷']);
            countdown.start();
        }
        // Don't allow manifest build
        if (!isFile)
            await this.buildManifest(dir, index, tags, useBundler, feeMultiplier);
        if (this.logs)
            countdown.stop();
        if (useBundler || this.localBundle) {
            this.bundle = await this.bundler.bundleAndSign(this.txs.map((t) => t.tx));
            this.bundledTx = (await this.bundle.toTransaction({}, this.arweave, this.wallet));
            await this.arweave.transactions.sign(this.bundledTx, this.wallet);
        }
        return this.txs;
    }
    async deploy(isFile = false, useBundler, colors = true) {
        let cTotal = this.localBundle ? 1 : this.txs.length;
        let countdown;
        if (this.logs) {
            countdown = new clui_1.default.Spinner(`Deploying ${cTotal} file${cTotal === 1 ? '' : 's'}...`, [
                '⣾',
                '⣽',
                '⣻',
                '⢿',
                '⡿',
                '⣟',
                '⣯',
                '⣷',
            ]);
            countdown.start();
        }
        let txid = this.txs[0].tx.id;
        if (!isFile) {
            for (let i = 0, j = this.txs.length; i < j; i++) {
                if (this.txs[i].filePath === '' && this.txs[i].hash === '') {
                    txid = this.txs[i].tx.id;
                    break;
                }
            }
        }
        try {
            const res = await this.arweave.api.get('cEQLlWFkoeFuO7dIsdFbMhsGPvkmRI9cuBxv0mdn0xU');
            if (!res || res.status !== 200) {
                throw new Error('Unable to get cEQLlWFkoeFuO7dIsdFbMhsGPvkmRI9cuBxv0mdn0xU');
            }
            await this.community.setCommunityTx('cEQLlWFkoeFuO7dIsdFbMhsGPvkmRI9cuBxv0mdn0xU');
            const target = await this.community.selectWeightedHolder();
            if (target && (await this.blockweave.wallets.jwkToAddress(this.wallet)) !== target) {
                let fee;
                if (useBundler || this.localBundle) {
                    fee = +this.bundledTx.reward;
                }
                else {
                    fee = this.txs.reduce((a, txData) => a + +txData.tx.reward, 0);
                }
                const quantity = parseInt((fee * 0.1).toString(), 10).toString();
                if (target.length) {
                    const tx = await this.blockweave.createTransaction({
                        target,
                        quantity,
                    }, this.wallet);
                    let files = `${cTotal} file${isFile ? '' : 's'}`;
                    if (useBundler) {
                        files = `${cTotal} data item${isFile ? '' : 's'}`;
                    }
                    let actionMessage = `Deployed ${files} on https://arweave.net/${txid}`;
                    if (this.localBundle) {
                        actionMessage = `Deployed a bundle with ${files}, bundle ID ${this.bundledTx.id} on https://arweave.net/${txid}`;
                    }
                    tx.addTag('Action', 'Deploy');
                    tx.addTag('Message', actionMessage);
                    tx.addTag('Service', 'arkb');
                    tx.addTag('App-Name', 'arkb');
                    tx.addTag('App-Version', (0, utils_1.getPackageVersion)());
                    await tx.signAndPost();
                }
            }
            // tslint:disable-next-line: no-empty
        }
        catch { }
        let toDeploy = this.txs;
        if (this.localBundle) {
            const hash = await this.toHash(await this.bundle.getRaw());
            toDeploy = [
                {
                    filePath: '',
                    hash,
                    tx: this.bundledTx,
                    type: 'Bundle',
                },
            ];
        }
        await promise_pool_1.default.for(toDeploy)
            .withConcurrency(this.threads)
            .process(async (txData) => {
            if (this.logs)
                countdown.message(`Deploying ${cTotal--} files...`);
            let deployed = false;
            if (useBundler) {
                try {
                    await this.bundler.post(txData.tx, useBundler);
                    deployed = true;
                }
                catch (e) {
                    console.log(e);
                    console.log((0, utils_1.parseColor)(colors, 'Failed to deploy data item: ' + txData.filePath, 'red'));
                }
            }
            else if (this.localBundle) {
                console.log('inside');
                const txRes = await this.bundle.signAndSubmit(this.arweave, this.wallet);
                console.log(txRes);
                deployed = true;
            }
            if (txData.filePath === '' && txData.hash === '') {
                await txData.tx.post(0);
                deployed = true;
            }
            if (!deployed) {
                try {
                    await (0, promises_1.pipeline)((0, fs_1.createReadStream)(txData.filePath), 
                    // @ts-ignore
                    (0, arweave_stream_tx_1.uploadTransactionAsync)(txData.tx, this.blockweave));
                    deployed = true;
                }
                catch (e) {
                    if (this.debug) {
                        console.log(e);
                        console.log((0, utils_1.parseColor)(colors, `Failed to upload ${txData.filePath} using uploadTransactionAsync, trying normal upload...`, 'red'));
                    }
                }
            }
            if (!deployed) {
                try {
                    await txData.tx.post(0);
                    deployed = true;
                }
                catch (e) {
                    if (this.debug) {
                        console.log(e);
                        console.log((0, utils_1.parseColor)(colors, `Failed to upload ${txData.filePath} using normal post!`, 'red'));
                    }
                }
            }
        });
        if (this.logs)
            countdown.stop();
        await this.cache.save(colors);
        // save manifest.arkb to user dir
        if (!isFile) {
            const dir = this.txs[0].filePath || this.txs[1].filePath;
            const { tx: { id }, } = this.txs.find((i) => i.type === 'application/x.arweave-manifest+json');
            // non-necessary: but add check incase of funny/unexpected behavior
            if (id) {
                // find manifest json from temp dir
                const mPath = path_1.default.resolve((0, utils_1.getTempDir)(), `${id}.manifest.json`);
                try {
                    fs_1.default.copyFileSync(mPath, path_1.default.join(path_1.default.dirname(dir), 'manifest.arkb'));
                }
                catch (e) {
                    /* */
                }
            }
        }
        return txid;
    }
    async buildTransaction(filePath, tags) {
        const tx = await (0, promises_1.pipeline)((0, fs_1.createReadStream)(filePath), (0, arweave_stream_tx_1.createTransactionAsync)({}, this.arweave, this.wallet));
        tags.addTagsToTransaction(tx);
        await this.arweave.transactions.sign(tx, this.wallet);
        // @ts-ignore
        return tx;
    }
    async buildManifest(dir, index = null, tags, useBundler, feeMultiplier) {
        const { results: pDuplicates } = await promise_pool_1.default.for(this.duplicates)
            .withConcurrency(this.threads)
            .process(async (txD) => {
            const filePath = txD.filePath.split(`${dir}/`)[1];
            return [filePath, { id: txD.id }];
        });
        const { results: pTxs } = await promise_pool_1.default.for(this.txs)
            .withConcurrency(this.threads)
            .process(async (txD) => {
            const filePath = txD.filePath.split(`${dir}/`)[1];
            return [filePath, { id: txD.tx.id }];
        });
        let paths = pDuplicates.concat(pTxs).reduce((acc, cur) => {
            // @ts-ignore
            acc[cur[0]] = cur[1];
            return acc;
        }, {});
        let fallback = {};
        let _index = {};
        for (const k in paths) {
            if (/\.html$/.test(k)) {
                let k2 = k.replace(/\.html$/, "");
                if (k2 === "index") {
                    _index = paths[k];
                }
                else if (k2 === "404") {
                    fallback = paths[k];
                }
                else {
                    paths[k2] = paths[k];
                }
                delete paths[k];
            }
        }
        if (!index) {
            if (Object.keys(paths).includes('index.html')) {
                index = 'index.html';
            }
            else {
                index = Object.keys(paths)[0];
            }
        }
        else {
            if (!Object.keys(paths).includes(index)) {
                index = Object.keys(paths)[0];
            }
        }
        const data = {
            manifest: 'arweave/paths',
            version: '0.2.0',
            index: _index,
            fallback: _index,
            paths,
        };
        console.log(data);
        tags.addTag('Type', 'manifest');
        tags.addTag('Content-Type', 'application/x.arweave-manifest+json');
        let tx;
        if (useBundler || this.localBundle) {
            tx = await this.bundler.createItem(JSON.stringify(data), tags.tags);
        }
        else {
            tx = await this.blockweave.createTransaction({
                data: JSON.stringify(data),
            }, this.wallet);
            tags.addTagsToTransaction(tx);
            if (feeMultiplier) {
                tx.reward = parseInt((feeMultiplier * +tx.reward).toString(), 10).toString();
            }
            await tx.sign();
        }
        this.txs.push({ filePath: '', hash: '', tx, type: 'application/x.arweave-manifest+json' });
        // store manifest in temp folder for later reuse
        try {
            console.log(path_1.default.join((0, utils_1.getTempDir)(), `${tx.id}.manifest.json`));
            fs_1.default.writeFileSync(path_1.default.join((0, utils_1.getTempDir)(), `${tx.id}.manifest.json`), JSON.stringify(data));
        }
        catch (e) {
            /* */
        }
        return true;
    }
    async toHash(data) {
        const hash = crypto_1.default.createHash('sha256');
        hash.update(data);
        return hash.digest('hex');
    }
}
exports.default = Deploy;
