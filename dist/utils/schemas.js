"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeOptionalSchema = makeOptionalSchema;
function makeOptionalSchema(schema) {
    const optionalSchema = JSON.parse(JSON.stringify(schema));
    delete optionalSchema.required;
    optionalSchema.required = [];
    for (const key in optionalSchema.properties) {
        optionalSchema.properties[key].nullable = true;
    }
    return optionalSchema;
}