"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startClient = startClient;
const promises_1 = __importDefault(require("fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const discord_js_1 = require("discord.js");
const config_json_1 = __importDefault(require("../config/config.json"));
const pretty_log_1 = require("./utils/pretty-log");
require("./utils/strings");
const client = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildPresences] });
function startClient() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!config_json_1.default.token) {
            pretty_log_1.PrettyLog.error('Missing token in config.json');
            process.exit(1);
        }
        yield registerCommands(client);
        yield registerEvents(client);
        yield client.login(config_json_1.default.token);
    });
}
startClient();
function registerCommands(client) {
    return __awaiter(this, void 0, void 0, function* () {
        client.commands = new discord_js_1.Collection();
        const commandsPath = node_path_1.default.join(__dirname, 'commands');
        const commandFiles = (yield promises_1.default.readdir(commandsPath)).filter((file) => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = node_path_1.default.join(commandsPath, file);
            const command = require(filePath);
            client.commands.set(command.data.name, command);
        }
        pretty_log_1.PrettyLog.logLoadStep('Команды зарегистрированны');
    });
}
function registerEvents(client) {
    return __awaiter(this, void 0, void 0, function* () {
        const eventsPath = node_path_1.default.join(__dirname, 'events');
        const eventFiles = (yield promises_1.default.readdir(eventsPath)).filter((file) => file.endsWith('.js'));
        for (const file of eventFiles) {
            const filePath = node_path_1.default.join(eventsPath, file);
            const event = require(filePath);
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            }
            else {
                client.on(event.name, (...args) => event.execute(...args));
            }
        }
        pretty_log_1.PrettyLog.logLoadStep('События зарегистрированны');
    });
}
process.on('unhandledRejection', (reason) => pretty_log_1.PrettyLog.error(`${reason}`, false));
process.on('uncaughtException', (reason) => pretty_log_1.PrettyLog.error(`${reason}`, false));
process.on('uncaughtExceptionMonitor', (reason) => pretty_log_1.PrettyLog.error(`${reason}`, false));