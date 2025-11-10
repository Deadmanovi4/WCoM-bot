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
const shops_flows_1 = require("../user-flows/shops-flows");
const constants_1 = require("../utils/constants");
const discord_1 = require("../utils/discord");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('shops-manage')
    .setDescription('Управление магазином')
    .addSubcommand(subcommand => subcommand
    .setName('create')
    .setDescription('Создать новый магазин')
    .addStringOption(option => option
    .setName('name')
    .setDescription('Название магазина')
    .setRequired(true)
    .setMaxLength(120)
    .setMinLength(1))
    .addStringOption(option => option
    .setName('description')
    .setDescription('Описание магазина')
    .setMaxLength(480)
    .setMinLength(1))
    .addStringOption(option => option
    .setName('emoji')
    .setDescription('Эмодзи (иконка) магазина')
    .setRequired(false))
    .addRoleOption(option => option
    .setName('reserved-to')
    .setDescription('Доступно ролям')))
    .addSubcommand(subcommand => subcommand
    .setName('remove')
    .setDescription('Удалить выбранный магазин'))
    .addSubcommand(subcommand => subcommand
    .setName('reorder')
    .setDescription('Сортировать магазины'))
    .addSubcommandGroup(subcommandgroup => subcommandgroup
    .setName('edit')
    .setDescription('Изменить магазин')
    .addSubcommand(subcommand => subcommand
    .setName(shops_flows_1.EDIT_SHOP_OPTIONS.Name)
    .setDescription('Изменить название')
    .addStringOption(option => option
    .setName('new-name')
    .setDescription('Новое название')
    .setRequired(true)
    .setMaxLength(120)
    .setMinLength(1)))
    .addSubcommand(subcommand => subcommand
    .setName(shops_flows_1.EDIT_SHOP_OPTIONS.Description)
    .setDescription('Изменить описание')
    .addStringOption(option => option
    .setName('new-description')
    .setRequired(true)
    .setDescription('Новое описание')
    .setMaxLength(480)
    .setMinLength(1)))
    .addSubcommand(subcommand => subcommand
    .setName(shops_flows_1.EDIT_SHOP_OPTIONS.Emoji)
    .setDescription('Изменить эмодзи')
    .addStringOption(option => option
    .setName('new-emoji')
    .setDescription('Новое эмодзи (для удаления введите что угодно)')
    .setRequired(true)))
    .addSubcommand(subcommand => subcommand
    .setName(shops_flows_1.EDIT_SHOP_OPTIONS.ReservedTo)
    .setDescription('Изменить доступ ролей к магазину')
    .addRoleOption(option => option
    .setName('reserved-to-role')
    .setDescription('Новая роль для доступа к магазину. Для удаления оставьте поле пустым.')))
    .addSubcommand(subcommand => subcommand
    .setName('currency')
    .setDescription('Изменить валюту/счет.')))
    .addSubcommand(subcommand => subcommand
    .setName('create-discount-code')
    .setDescription('Создать купон скидки')
    .addStringOption(option => option
    .setName('code')
    .setDescription('Код скидки')
    .setRequired(true)
    .setMaxLength(8)
    .setMinLength(6))
    .addIntegerOption(option => option
    .setName('amount')
    .setDescription('Размер скидки (в %)')
    .setRequired(true)
    .setMaxValue(100)
    .setMinValue(1)))
    .addSubcommand(subcommand => subcommand
    .setName('remove-discount-code')
    .setDescription('Удалить купон'))
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator);
function execute(_client, interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const subCommand = interaction.options.getSubcommand();
        const subCommandGroup = interaction.options.getSubcommandGroup();
        switch (subCommand) {
            case 'create':
                const createShopFlow = new shops_flows_1.ShopCreateFlow();
                createShopFlow.start(interaction);
                break;
            case 'remove':
                const removeShopFlow = new shops_flows_1.ShopRemoveFlow();
                removeShopFlow.start(interaction);
                break;
            case 'reorder':
                const reorderShopsFlow = new shops_flows_1.ShopReorderFlow();
                reorderShopsFlow.start(interaction);
                break;
            case 'create-discount-code':
                const createDiscountCodeFlow = new shops_flows_1.DiscountCodeCreateFlow();
                createDiscountCodeFlow.start(interaction);
                break;
            case 'remove-discount-code':
                const removeDiscountCodeFlow = new shops_flows_1.DiscountCodeRemoveFlow();
                removeDiscountCodeFlow.start(interaction);
                break;
            default:
                if (subCommandGroup == 'edit') {
                    if (subCommand == 'currency') {
                        const editShopCurrencyFlow = new shops_flows_1.EditShopCurrencyFlow();
                        editShopCurrencyFlow.start(interaction);
                        break;
                    }
                    const editShopFlow = new shops_flows_1.EditShopFlow();
                    editShopFlow.start(interaction);
                    break;
                }
                yield (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.InvalidSubcommand);
        }
    });
}