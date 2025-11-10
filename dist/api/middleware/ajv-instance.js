"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ajv = void 0;
const ajv_1 = __importDefault(require("ajv"));
const constants_1 = require("../../utils/constants");
const ajv = new ajv_1.default({ allErrors: true });
exports.ajv = ajv;
ajv.addFormat('snowflake', constants_1.SNOWLAKE_REGEX);
ajv.addFormat('id', constants_1.ID_REGEX);
ajv.addFormat('emoji', constants_1.EMOJI_REGEX);