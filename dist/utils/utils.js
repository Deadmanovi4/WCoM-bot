"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertNeverReached = assertNeverReached;
exports.toStringOrUndefined = toStringOrUndefined;
function assertNeverReached(x) {
    throw new Error('Did not expect to get here');
}
function toStringOrUndefined(value) {
    if (value === undefined)
        return undefined;
    return `${value}`;
}