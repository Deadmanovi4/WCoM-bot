"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const config_json_1 = __importDefault(require("../config/config.json"));
const fs_1 = __importDefault(require("fs"));
const pretty_log_1 = require("./utils/pretty-log");
const configFile = 'config/config.json';
if (!config_json_1.default.jwtSecret) {
    pretty_log_1.PrettyLog.info('No secret key found in config file. Generating a new one...');
    const newSecretKey = crypto_1.default.randomBytes(16).toString('hex');
    config_json_1.default.jwtSecret = newSecretKey;
    fs_1.default.writeFileSync(configFile, JSON.stringify(config_json_1.default, null, 4));
    pretty_log_1.PrettyLog.success(`New API token generated and saved to ${configFile}`);
}
else {
    pretty_log_1.PrettyLog.info('API token already exists in config file at path: ' + configFile);
}
const userId = process.argv[2];
if (!userId || userId === '') {
    pretty_log_1.PrettyLog.error('No user ID provided. Please provide a user ID as the first argument.');
    process.exit(1);
}
const adminData = {
    userId
};
const token = jsonwebtoken_1.default.sign(adminData, config_json_1.default.jwtSecret, { algorithm: 'HS256' });
pretty_log_1.PrettyLog.success(`Generated API token for user ${userId}: ${token}\n\nYou can now use this token to make requests to the API. \nMake sure to include it in the Authorization header of your requests. Example: Authorization: Bearer ${token}`);