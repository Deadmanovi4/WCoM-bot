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
const accounts_flows_1 = require("../user-flows/accounts-flows");
const account_ui_1 = require("../user-interfaces/account-ui");
const discord_1 = require("../utils/discord");
const constants_1 = require("../utils/constants");
const fs = require("fs"); // for load tiers
const path = require("path");
const accounts_database_1 = require("../database/accounts/accounts-database"); // for load/save accounts in upgrade

exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('accounts-manage')
    .setDescription('Управление аккаунтами')
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand => subcommand
    .setName('view-account')
    .setDescription('Посмотреть статистику другого пользователя')
    .addUserOption(option => option
    .setName('target')
    .setDescription('Никнейм пользователя')
    .setRequired(true)))
    .addSubcommand(subcommand => subcommand
    .setName('give')
    .setDescription('Выдать очки пользователю')
    .addUserOption(option => option
    .setName('target')
    .setDescription('Никнейм пользователя')
    .setRequired(true))
    .addNumberOption(option => option
    .setName('amount')
    .setDescription('Количество очков')
    .setRequired(true)
    .setMaxValue(99999999)
    .setMinValue(1))
	.addStringOption(option => option
    .setName('comment')
    .setDescription('Комментарий за что выдано')
    .setRequired(false)))
    .addSubcommand(subcommand => subcommand
    .setName('bulk-give')
    .setDescription('Выдать очки пользователям с соответствующей ролью')
    .addRoleOption(option => option
    .setName('role')
    .setDescription('Роль на сервере')
    .setRequired(true))
    .addNumberOption(option => option
    .setName('amount')
    .setDescription('Количество очков')
    .setRequired(true)
    .setMaxValue(99999999)
    .setMinValue(1)))
    .addSubcommand(subcommand => subcommand
    .setName('take')
    .setDescription('Забрать очки у пользователя')
    .addUserOption(option => option
    .setName('target')
    .setDescription('Никнейм пользователя')
    .setRequired(true))
    .addNumberOption(option => option
    .setName('amount')
    .setDescription('Количество очков')
    .setRequired(true)
    .setMinValue(1))
    .addStringOption(option => option
    .setName('comment')
    .setDescription('Комментарий за что забрано')
    .setRequired(false)))
    .addSubcommand(subcommand => subcommand
    .setName('upgrade')
    .setDescription('Повысить ранг пользователя')
    .addUserOption(option => option
    .setName('target')
    .setDescription('Никнейм пользователя')
    .setRequired(true)));
    
function execute(_, interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const subCommand = interaction.options.getSubcommand();
        switch (subCommand) {
            case 'view-account':
                const user = interaction.options.getUser('target');
                if (!user) {
                    (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                    break;
                }
                const accountUI = new account_ui_1.AccountUserInterface(user);
                accountUI.display(interaction);
                break;
            case 'give':
                const accountGiveFlow = new accounts_flows_1.AccountGiveFlow();
                accountGiveFlow.start(interaction);
                break;
            case 'bulk-give':
                const accountBulkGiveFlow = new accounts_flows_1.BulkAccountGiveFlow();
                accountBulkGiveFlow.start(interaction);
                break;
            case 'take':
                const accountTakeFlow = new accounts_flows_1.AccountTakeFlow();
                accountTakeFlow.start(interaction);
                break;
            case 'upgrade':
                const target = interaction.options.getUser('target');
                if (!target) {
                    (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                    break;
                }
                const accounts = accounts_database_1.loadAccounts();
                const account = accounts[target.id];
                if (!account) {
                    (0, discord_1.replyErrorMessage)(interaction, 'Аккаунт не найден');
                    break;
                }
                account.rank = (account.rank || 1) + 1;
                // account.totalPoints = 0; // если нужно сбросить, un comment
                accounts_database_1.saveAccounts(accounts);
                yield interaction.reply({ content: `Ранг ${target.username} повышен до ${account.rank}!`, ephemeral: true });
                break;
            default:
                (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.InvalidSubcommand);
                break;
        }
    });
}