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
exports.generateTransactionChunksAsync = void 0;
const stream_chunker_1 = __importDefault(require("stream-chunker"));
const promises_1 = require("stream/promises");
const blockweave_1 = __importDefault(require("blockweave"));
const merkle_1 = __importStar(require("blockweave/dist/utils/merkle"));
const merkle = new merkle_1.default();
/**
 * Generates the Arweave transaction chunk information from the piped data stream.
 */
function generateTransactionChunksAsync() {
    return async (source) => {
        const chunks = [];
        /**
         * @param chunkByteIndex the index the start of the specified chunk is located at within its original data stream.
         */
        async function addChunk(chunkByteIndex, chunk) {
            const dataHash = await blockweave_1.default.crypto.hash(chunk);
            const chunkRep = {
                dataHash,
                minByteRange: chunkByteIndex,
                maxByteRange: chunkByteIndex + chunk.byteLength,
            };
            chunks.push(chunkRep);
            return chunkRep;
        }
        let chunkStreamByteIndex = 0;
        let previousDataChunk;
        let expectChunkGenerationCompleted = false;
        await (0, promises_1.pipeline)(source, (0, stream_chunker_1.default)(merkle_1.MAX_CHUNK_SIZE, { flush: true }), async (chunkedSource) => {
            for await (const chunk of chunkedSource) {
                if (expectChunkGenerationCompleted) {
                    throw Error('Expected chunk generation to have completed.');
                }
                if (chunk.byteLength >= merkle_1.MIN_CHUNK_SIZE && chunk.byteLength <= merkle_1.MAX_CHUNK_SIZE) {
                    await addChunk(chunkStreamByteIndex, chunk);
                }
                else if (chunk.byteLength < merkle_1.MIN_CHUNK_SIZE) {
                    if (previousDataChunk) {
                        // If this final chunk is smaller than the minimum chunk size, rebalance this final chunk and
                        // the previous chunk to keep the final chunk size above the minimum threshold.
                        const remainingBytes = Buffer.concat([previousDataChunk, chunk], previousDataChunk.byteLength + chunk.byteLength);
                        const rebalancedSizeForPreviousChunk = Math.ceil(remainingBytes.byteLength / 2);
                        const previousChunk = chunks.pop();
                        const rebalancedPreviousChunk = await addChunk(previousChunk.minByteRange, remainingBytes.slice(0, rebalancedSizeForPreviousChunk));
                        await addChunk(rebalancedPreviousChunk.maxByteRange, remainingBytes.slice(rebalancedSizeForPreviousChunk));
                    }
                    else {
                        // This entire stream should be smaller than the minimum chunk size, just add the chunk in.
                        await addChunk(chunkStreamByteIndex, chunk);
                    }
                    expectChunkGenerationCompleted = true;
                }
                else if (chunk.byteLength > merkle_1.MAX_CHUNK_SIZE) {
                    throw Error('Encountered chunk larger than max chunk size.');
                }
                chunkStreamByteIndex += chunk.byteLength;
                previousDataChunk = chunk;
            }
        });
        const leaves = await merkle.generateLeaves(chunks);
        const root = await merkle.buildLayers(leaves);
        const proofs = merkle.generateProofs(root);
        return {
            data_root: root.id,
            chunks,
            proofs,
        };
    };
}
exports.generateTransactionChunksAsync = generateTransactionChunksAsync;
