"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appDeleteCommands = appDeleteCommands;
exports.appDeployCommands = appDeployCommands;
exports.guildDeleteCommands = guildDeleteCommands;
exports.guildDeployCommands = guildDeployCommands;
const rest_1 = require("@discordjs/rest");
const discord_js_1 = require("discord.js");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const config_json_1 = require("../config/config.json");
const pretty_log_1 = require("./utils/pretty-log");
let rest;
const commands = [];
const commandsPath = node_path_1.default.join(__dirname, 'commands');
const commandFiles = node_fs_1.default.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = node_path_1.default.join(commandsPath, file);
    const command = require(filePath);
    commands.push(command.data.toJSON());
}
function appDeployCommands() {
    return new Promise((resolve, reject) => {
        getRest().put(discord_js_1.Routes.applicationCommands(config_json_1.clientId), { body: commands })
            .then(() => {
            pretty_log_1.PrettyLog.success('Успешно зарегистрированы команды.', false);
            resolve(true);
        })
            .catch(reject);
    });
}
function appDeleteCommands() {
    return new Promise((resolve, reject) => {
        getRest().put(discord_js_1.Routes.applicationCommands(config_json_1.clientId), { body: [] })
            .then(() => {
            pretty_log_1.PrettyLog.success('Успешно удалены команды.', false);
            resolve(true);
        })
            .catch(reject);
    });
}
function guildDeployCommands(guildId) {
    return new Promise((resolve, reject) => {
        getRest().put(discord_js_1.Routes.applicationGuildCommands(config_json_1.clientId, guildId), { body: commands })
            .then(() => {
            pretty_log_1.PrettyLog.success('Успешно зарегистрированны серверные команды.', false);
            resolve(true);
        })
            .catch(reject);
    });
}
function guildDeleteCommands(guildId) {
    return new Promise((resolve, reject) => {
        getRest().put(discord_js_1.Routes.applicationGuildCommands(config_json_1.clientId, guildId), { body: [] })
            .then(() => {
            pretty_log_1.PrettyLog.success('Успешно удалены серверные команды.', false);
            resolve(true);
        })
            .catch(reject);
    });
}
if (require.main === module) {
    const flag = process.argv[2];
    const guildId = process.argv[3];
    switch (flag) {
        case '/a':
            appDeployCommands();
            break;
        case '/ad':
            appDeleteCommands();
            break;
        case '/g':
            if (!guildId) {
                pretty_log_1.PrettyLog.error('Please specify a guild id');
                break;
            }
            guildDeployCommands(guildId);
            break;
        case '/gd':
            if (!guildId) {
                pretty_log_1.PrettyLog.error('Please specify a guild id');
                break;
            }
            guildDeleteCommands(guildId);
            break;
        default:
            pretty_log_1.PrettyLog.error('Please specify one of these flags: \n\n    /a  : Deploy App Commands\n    /ad : Delete App Commands\n    /g  : Deploy Guild Commands\n    /gd : Delete Guild Commands\n');
    }
}
function getRest() {
    if (!config_json_1.clientId || !config_json_1.token) {
        pretty_log_1.PrettyLog.error('Missing clientId or token in config.json');
        process.exit(1);
    }
    if (!rest) {
        rest = new rest_1.REST({ version: '10' }).setToken(config_json_1.token);
    }
    return rest;
}