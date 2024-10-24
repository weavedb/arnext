"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransactionAsync = void 0;
const transaction_1 = __importDefault(require("blockweave/dist/lib/transaction"));
const buffer_1 = require("blockweave/dist/utils/buffer");
const promises_1 = require("stream/promises");
const generateTransactionChunksAsync_1 = require("./generateTransactionChunksAsync");
function createTransactionAsync(attributes, blockweave, jwk) {
    return async (source) => {
        const chunks = await (0, promises_1.pipeline)(source, (0, generateTransactionChunksAsync_1.generateTransactionChunksAsync)());
        const txAttrs = Object.assign({}, attributes);
        txAttrs.owner ??= jwk?.n;
        txAttrs.last_tx ??= await blockweave.transactions.getTransactionAnchor();
        const lastChunk = chunks.chunks[chunks.chunks.length - 1];
        const dataByteLength = lastChunk.maxByteRange;
        txAttrs.reward ??= await blockweave.transactions.getPrice(dataByteLength, txAttrs.target);
        txAttrs.data_size = dataByteLength.toString();
        const tx = new transaction_1.default(txAttrs, blockweave, jwk);
        tx.chunks = chunks;
        tx.data_root = (0, buffer_1.bufferTob64Url)(chunks.data_root);
        return tx;
    };
}
exports.createTransactionAsync = createTransactionAsync;
