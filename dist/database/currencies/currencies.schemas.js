"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCurrencyOptional = exports.validateCurrency = void 0;
const ajv_instance_1 = require("../../api/middleware/ajv-instance");
const schemas_1 = require("../../utils/schemas");
const currencyOptionsSchema = {
    type: 'object',
    required: ['name', 'emoji'],
    properties: {
        name: { type: 'string', minLength: 1, maxLength: 40, pattern: '^[a-zA-Z0-9 ]+$' },
        emoji: { type: 'string', format: 'emoji' }
    },
    additionalProperties: false
};
exports.validateCurrency = ajv_instance_1.ajv.compile(currencyOptionsSchema);
const currencyOptionsOptionalSchema = (0, schemas_1.makeOptionalSchema)(currencyOptionsSchema);
exports.validateCurrencyOptional = ajv_instance_1.ajv.compile(currencyOptionsOptionalSchema);