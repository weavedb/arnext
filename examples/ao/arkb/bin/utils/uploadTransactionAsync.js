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
exports.uploadTransactionAsync = void 0;
const buffer_1 = require("blockweave/dist/utils/buffer");
const promises_1 = require("stream/promises");
const stream_chunker_1 = __importDefault(require("stream-chunker"));
const exponential_backoff_1 = require("exponential-backoff");
const merkle_1 = __importStar(require("blockweave/dist/utils/merkle"));
// Copied from `arweave-js`.
const FATAL_CHUNK_UPLOAD_ERRORS = [
    'invalid_json',
    'chunk_too_big',
    'data_path_too_big',
    'offset_too_big',
    'data_size_too_big',
    'chunk_proof_ratio_not_attractive',
    'invalid_proof',
];
const MAX_CONCURRENT_CHUNK_UPLOAD_COUNT = 128;
const merkle = new merkle_1.default();
/**
 * Uploads the piped data to the specified transaction.
 *
 * @param createTx whether or not the passed transaction should be created on the network.
 * This can be false if we want to reseed an existing transaction,
 */
function uploadTransactionAsync(tx, blockweave, createTx = true) {
    return async (source) => {
        if (!tx.chunks) {
            throw Error('Transaction has no computed chunks!');
        }
        if (createTx) {
            // Ensure the transaction data field is blank.
            // We'll upload this data in chunks instead.
            tx.data = new Uint8Array(0);
            const createTxRes = await blockweave.api.post(`tx`, tx);
            if (!(createTxRes.status >= 200 && createTxRes.status < 300)) {
                throw new Error(`Failed to create transaction: ${createTxRes.data}`);
            }
        }
        const txChunkData = tx.chunks;
        const { chunks, proofs } = txChunkData;
        function prepareChunkUploadPayload(chunkIndex, chunkData) {
            const proof = proofs[chunkIndex];
            return {
                data_root: tx.data_root,
                data_size: tx.data_size,
                data_path: (0, buffer_1.bufferTob64Url)(proof.proof),
                offset: proof.offset.toString(),
                chunk: (0, buffer_1.bufferTob64Url)(chunkData),
            };
        }
        await (0, promises_1.pipeline)(source, (0, stream_chunker_1.default)(merkle_1.MAX_CHUNK_SIZE, { flush: true }), 
        // tslint:disable-next-line: only-arrow-functions
        async function (chunkedSource) {
            let chunkIndex = 0;
            let dataRebalancedIntoFinalChunk;
            const activeChunkUploads = [];
            for await (const chunkData of chunkedSource) {
                const currentChunk = chunks[chunkIndex];
                const chunkSize = currentChunk.maxByteRange - currentChunk.minByteRange;
                const expectedToBeFinalRebalancedChunk = dataRebalancedIntoFinalChunk != null;
                let chunkPayload;
                if (chunkData.byteLength === chunkSize) {
                    // If the transaction data chunks was never rebalanced this is the only code path that
                    // will execute as the incoming chunked data as the will always be equivalent to `chunkSize`.
                    chunkPayload = prepareChunkUploadPayload(chunkIndex, chunkData);
                }
                else if (chunkData.byteLength > chunkSize) {
                    // If the incoming chunk data is larger than the expected size of the current chunk
                    // it means that the transaction had chunks that were rebalanced to meet the minimum chunk size.
                    //
                    // It also means that the chunk we're currently processing should be the second to last
                    // chunk.
                    chunkPayload = prepareChunkUploadPayload(chunkIndex, chunkData.slice(0, chunkSize));
                    dataRebalancedIntoFinalChunk = chunkData.slice(chunkSize);
                }
                else if (chunkData.byteLength < chunkSize && expectedToBeFinalRebalancedChunk) {
                    // If this is the final rebalanced chunk, create the upload payload by concatenating the previous
                    // chunk's data that was moved into this and the remaining stream data.
                    chunkPayload = prepareChunkUploadPayload(chunkIndex, Buffer.concat([dataRebalancedIntoFinalChunk, chunkData], dataRebalancedIntoFinalChunk.length + chunkData.length));
                }
                else {
                    throw Error('Transaction data stream terminated incorrectly.');
                }
                const chunkValid = await merkle.validatePath(txChunkData.data_root, parseInt(chunkPayload.offset, 10), 0, parseInt(chunkPayload.data_size, 10), (0, buffer_1.b64UrlToBuffer)(chunkPayload.data_path));
                if (!chunkValid) {
                    throw new Error(`Unable to validate chunk ${chunkIndex}.`);
                }
                // Upload multiple transaction chunks in parallel to speed up the upload.
                // If we are already at the maximum concurrent chunk upload limit,
                // wait till all of them to complete first before continuing.
                if (activeChunkUploads.length >= MAX_CONCURRENT_CHUNK_UPLOAD_COUNT) {
                    await Promise.all(activeChunkUploads);
                    // Clear the active chunk uploads array.
                    activeChunkUploads.length = 0;
                }
                activeChunkUploads.push((0, exponential_backoff_1.backOff)(() => blockweave.api.post('chunk', chunkPayload), {
                    retry: (err) => !FATAL_CHUNK_UPLOAD_ERRORS.includes(err.message),
                }));
                chunkIndex++;
            }
            await Promise.all(activeChunkUploads);
            if (chunkIndex < chunks.length) {
                throw Error('Transaction upload incomplete.');
            }
        });
    };
}
exports.uploadTransactionAsync = uploadTransactionAsync;
