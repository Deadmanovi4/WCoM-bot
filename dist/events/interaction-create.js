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
Object.defineProperty(exports, "__esModule", { value: true });
exports.name = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const pretty_log_1 = require("../utils/pretty-log");
const discord_1 = require("../utils/discord");
exports.name = 'interactionCreate';
function execute(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        if (interaction.type != discord_js_1.InteractionType.ApplicationCommand)
            return;
        if (interaction.user.bot)
            return;
        if (interaction.isChatInputCommand()) {
            handleSlashCommand(interaction);
            return;
        }
    });
}
function handleSlashCommand(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command)
            return;
        if (((_a = interaction === null || interaction === void 0 ? void 0 : interaction.channel) === null || _a === void 0 ? void 0 : _a.type) === discord_js_1.ChannelType.DM)
            return;
        try {
            pretty_log_1.PrettyLog.info(`${interaction.user.username} (${interaction.user.id}) in #${(_b = interaction === null || interaction === void 0 ? void 0 : interaction.channel) === null || _b === void 0 ? void 0 : _b.name} (${(_c = interaction === null || interaction === void 0 ? void 0 : interaction.channel) === null || _c === void 0 ? void 0 : _c.id}) triggered the command '/${interaction.commandName}'`);
            yield command.execute(interaction.client, interaction);
        }
        catch (error) {
            console.error(error);
            pretty_log_1.PrettyLog.error(`Failed to execute the command '/${interaction.commandName}' (user: ${interaction.user.username} (${interaction.user.id}) in #${(_d = interaction === null || interaction === void 0 ? void 0 : interaction.channel) === null || _d === void 0 ? void 0 : _d.name} (${(_e = interaction === null || interaction === void 0 ? void 0 : interaction.channel) === null || _e === void 0 ? void 0 : _e.id}))`);
            yield (0, discord_1.replyErrorMessage)(interaction);
        }
    });
}