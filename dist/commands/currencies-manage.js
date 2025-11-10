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
exports.createCurrencyCommand = createCurrencyCommand;
const discord_js_1 = require("discord.js");
const database_types_1 = require("../database/database-types");
const currencies_flows_1 = require("../user-flows/currencies-flows");
const constants_1 = require("../utils/constants");
const discord_1 = require("../utils/discord");
const currencies_database_1 = require("../database/currencies/currencies-database");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('currencies-manage')
    .setDescription('Управление счетами')
    .addSubcommand(subcommand => subcommand
    .setName('create')
    .setDescription('Создать новый счет')
    .addStringOption(option => option
    .setName('name')
    .setDescription('Название счета')
    .setRequired(true)
    .setMaxLength(40)
    .setMinLength(1))
    .addStringOption(option => option
    .setName('emoji')
    .setDescription('Эмодзи (иконка) счета')
    .setRequired(false)))
    .addSubcommand(subcommand => subcommand
    .setName('remove')
    .setDescription('Удалить счет'))
    .addSubcommandGroup(group => group
    .setName('edit')
    .setDescription('Изменить счет')
    .addSubcommand(subcommand => subcommand
    .setName(currencies_flows_1.EditCurrencyOption.NAME)
    .setDescription('Изменить название')
    .addStringOption(option => option
    .setName('new-name')
    .setDescription('Название счета')
    .setRequired(true)
    .setMaxLength(40)
    .setMinLength(1)))
    .addSubcommand(subcommand => subcommand
    .setName(currencies_flows_1.EditCurrencyOption.EMOJI)
    .setDescription('Изменить эмодзи (иконку)')
    .addStringOption(option => option
    .setName('new-emoji')
    .setDescription('Эмодзи счета (для удаления эмодзи введите что угодно)')
    .setRequired(true))))
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator);
function execute(client, interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const subCommand = interaction.options.getSubcommand();
        const subCommandGroup = interaction.options.getSubcommandGroup();
        switch (subCommand) {
            case 'create':
                yield createCurrencyCommand(client, interaction);
                break;
            case 'remove':
                const currencyRemoveFlow = new currencies_flows_1.CurrencyRemoveFlow();
                currencyRemoveFlow.start(interaction);
                break;
            default:
                if (subCommandGroup == 'edit') {
                    const editCurrencyFlow = new currencies_flows_1.EditCurrencyFlow();
                    editCurrencyFlow.start(interaction);
                    break;
                }
                yield (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.InvalidSubcommand);
        }
    });
}
function createCurrencyCommand(_client, interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const currencyName = (_a = interaction.options.getString('name')) === null || _a === void 0 ? void 0 : _a.replaceSpaces();
        if (!currencyName)
            return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
        const emojiOption = interaction.options.getString('emoji');
        const emojiString = ((_b = emojiOption === null || emojiOption === void 0 ? void 0 : emojiOption.match(constants_1.EMOJI_REGEX)) === null || _b === void 0 ? void 0 : _b[0]) || '';
        try {
            if (currencyName.removeCustomEmojis().length == 0)
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.NotOnlyEmojisInName);
            yield (0, currencies_database_1.createCurrency)(currencyName, emojiString);
            const currencyNameString = (0, discord_js_1.bold)(`${emojiString ? `${emojiString} ` : ''}${currencyName}`);
            yield (0, discord_1.replySuccessMessage)(interaction, `Вы успешно добавили счет ${currencyNameString}. \n-# Используйте \`/currencies-manage remove\` для удаления`);
            return;
        }
        catch (error) {
            yield (0, discord_1.replyErrorMessage)(interaction, (error instanceof database_types_1.DatabaseError) ? error.message : undefined);
            return;
        }
    });
}