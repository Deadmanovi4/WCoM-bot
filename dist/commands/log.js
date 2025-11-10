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
exports.data = void 0;
exports.execute = execute;
const discord_js_1 = require("discord.js");
const accounts_database_1 = require("../database/accounts/accounts-database");
const discord_1 = require("../utils/discord");
const constants_1 = require("../utils/constants");

exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('log')
    .setDescription('Показывает ваш лог начислений');

function execute(_client, interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const accounts = accounts_database_1.loadAccounts();
        const account = accounts[interaction.user.id];
        if (!account || !account.log) {
            yield interaction.reply({ content: 'Лог пуст или аккаунт не найден.', ephemeral: true });
            return;
        }
        const logLines = account.log.map(entry => `${entry.date} - ${entry.type} ${entry.amount} in ${entry.cat} by user ${entry.by}: ${entry.comment}` );
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('Ваш лог')
            .setDescription(logLines.join('\n') || 'Пусто');
        yield interaction.user.send({ embeds: [embed] });
        yield interaction.reply({ content: 'Лог отправлен в DM.', ephemeral: true });
    });
}