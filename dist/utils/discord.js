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
exports.replyErrorMessage = replyErrorMessage;
exports.updateAsErrorMessage = updateAsErrorMessage;
exports.replySuccessMessage = replySuccessMessage;
exports.updateAsSuccessMessage = updateAsSuccessMessage;
exports.logToDiscord = logToDiscord;
const discord_js_1 = require("discord.js");
const settings_handler_1 = require("../database/settings/settings-handler");
const pretty_log_1 = require("./pretty-log");
function replyErrorMessage(interaction, errorMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield interaction.reply({ content: getErrorMessage(errorMessage), flags: discord_js_1.MessageFlags.Ephemeral });
    });
}
function updateAsErrorMessage(interaction, errorMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = getErrorMessage(errorMessage);
        if (interaction.deferred)
            return yield interaction.editReply({ content: message, components: [] });
        if (interaction.isMessageComponent() || (interaction.isModalSubmit() && interaction.isFromMessage()))
            return yield interaction.update({ content: message, components: [] });
        return yield interaction.editReply({ content: message, components: [] });
    });
}
function replySuccessMessage(interaction, succesMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield interaction.reply({ content: getSuccessMessage(succesMessage), flags: discord_js_1.MessageFlags.Ephemeral });
    });
}
function updateAsSuccessMessage(interaction, succesMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = getSuccessMessage(succesMessage);
        if (interaction.deferred)
            return yield interaction.editReply({ content: message, components: [] });
        if (interaction.isMessageComponent() || (interaction.isModalSubmit() && interaction.isFromMessage()))
            return yield interaction.update({ content: message, components: [] });
        return yield interaction.editReply({ content: message, components: [] });
    });
}
function getErrorMessage(errorMessage) {
    return `❌ ${errorMessage ? errorMessage : 'Неизвестная ошибка при выполнении команды'}`;
}
function getSuccessMessage(succesMessage) {
    return `✅ ${succesMessage}`;
}
function logToDiscord(interaction, message) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        pretty_log_1.PrettyLog.info(`Подключен к Дискорду: ${message}`);
        try {
            const logChannelSetting = (0, settings_handler_1.getSettings)().get('logChannelId');
            if (!(logChannelSetting === null || logChannelSetting === void 0 ? void 0 : logChannelSetting.value) || logChannelSetting.type !== 'channelId')
                return;
            const logChannel = yield ((_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.channels.fetch(logChannelSetting.value));
            if (!(logChannel instanceof discord_js_1.TextChannel))
                return;
            yield logChannel.send(message);
        }
        catch (error) {
            pretty_log_1.PrettyLog.error(`Не удалось подключится к Дискорду: ${error}`);
        }
    });
}