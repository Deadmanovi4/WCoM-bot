"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAccount = void 0;
const ajv_instance_1 = require("../../api/middleware/ajv-instance");
const accountSchema = {
    type: "object",
    propertyNames: {
        format: "snowflake"
    },
    patternProperties: {
        "": {
            type: "object",
            additionalProperties: false,
            properties: {
                currencies: {
                    type: "object",
                    propertyNames: {
                        format: "id"
                    },
                    patternProperties: {
                        "": {
                            type: "object",
                            required: ["item", "amount"],
                            properties: {
                                item: { type: "string", format: "id" },
                                amount: { type: "number" }
                            }
                        }
                    },
                    required: []
                },
                inventory: {
                    type: "object",
                    propertyNames: {
                        format: "id"
                    },
                    patternProperties: {
                        "": {
                            type: "object",
                            required: ["item", "amount"],
                            properties: {
                                item: {
                                    type: "object",
                                    required: ["id", "shopId"],
                                    properties: {
                                        id: { type: "string", format: "id" },
                                        shopId: { type: "string", format: "id" }
                                    }
                                },
                                amount: { type: "number" }
                            }
                        }
                    },
                    required: []
                }
            },
            required: ["currencies", "inventory"]
        }
    },
    additionalProperties: false,
    required: []
};
exports.validateAccount = ajv_instance_1.ajv.compile(accountSchema);