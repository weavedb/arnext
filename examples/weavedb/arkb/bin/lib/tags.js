"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Tags {
    _tags = new Map();
    get tags() {
        return Array.from(this._tags.entries()).map(([name, value]) => ({ name, value }));
    }
    addTag(key, value) {
        this._tags.set(key, value);
    }
    addTags(tags) {
        tags.forEach(({ name, value }) => this.addTag(name, value));
    }
    addTagsToTransaction(tx) {
        this.tags.forEach(({ name, value }) => tx.addTag(name, value));
    }
}
exports.default = Tags;
