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
const product_flows_1 = require("../user-flows/product-flows");
const constants_1 = require("../utils/constants");
const discord_1 = require("../utils/discord");
const shops_types_1 = require("../database/shops/shops-types");
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('products-manage')
    .setDescription('Изменить товары')
    .addSubcommand(subcommand => subcommand
    .setName('add')
    .setDescription('Добавить товар')
    .addStringOption(option => option
    .setName('name')
    .setDescription('Название')
    .setRequired(true)
    .setMaxLength(70)
    .setMinLength(1))
    .addNumberOption(option => option
    .setName('price')
    .setDescription('Цена')
    .setRequired(true)
    .setMaxValue(99999999)
    .setMinValue(0))
    .addStringOption(option => option
    .setName('description')
    .setDescription('Описание товара')
    .setMaxLength(300)
    .setMinLength(1))
    .addStringOption(option => option
    .setName('emoji')
    .setDescription('Эмодзи (иконка)')
    .setRequired(false))
    .addIntegerOption(option => option
    .setName('amount')
    .setDescription('Количество товара')
    .setRequired(false)
    .setMaxValue(99999999)
    .setMinValue(1))
    .addStringOption(option => option
    .setName('action')
    .setDescription('Действие товара')
    .setRequired(false)
    .addChoices({ name: 'Выдать роль', value: shops_types_1.PRODUCT_ACTION_TYPE.GiveRole }, { name: 'Выдать очки', value: shops_types_1.PRODUCT_ACTION_TYPE.GiveCurrency })))
    .addSubcommand(subcommand => subcommand
    .setName('remove')
    .setDescription('Удалить товар'))
    .addSubcommandGroup(subcommandgroup => subcommandgroup
    .setName('edit')
    .setDescription('Изменить товар')
    .addSubcommand(subcommand => subcommand
    .setName(product_flows_1.EditProductOption.NAME)
    .setDescription('Изменить название')
    .addStringOption(option => option
    .setName('new-name')
    .setDescription('Новое название')
    .setRequired(true)
    .setMaxLength(70)
    .setMinLength(1)))
    .addSubcommand(subcommand => subcommand
    .setName(product_flows_1.EditProductOption.DESCRIPTION)
    .setDescription('Изменить описание товара')
    .addStringOption(option => option
    .setName('new-description')
    .setRequired(true)
    .setDescription('Новое описание товара')
    .setMaxLength(300)
    .setMinLength(1)))
    .addSubcommand(subcommand => subcommand
    .setName(product_flows_1.EditProductOption.PRICE)
    .setDescription('Изменить цену')
    .addNumberOption(option => option
    .setName('new-price')
    .setDescription('Новая цена')
    .setRequired(true)
    .setMaxValue(99999999)
    .setMinValue(0)))
    .addSubcommand(subcommand => subcommand
    .setName(product_flows_1.EditProductOption.EMOJI)
    .setDescription('Изменить эмодзи')
    .addStringOption(option => option
    .setName('new-emoji')
    .setDescription('Новое эмодзи (для удаления введите что угодно)')
    .setRequired(true)))
    .addSubcommand(subcommand => subcommand
    .setName(product_flows_1.EditProductOption.AMOUNT)
    .setDescription('Изменить количество')
    .addIntegerOption(option => option
    .setName('new-amount')
    .setDescription('Новое количество (указав -1 товар никогда не закончится)')
    .setRequired(true)
    .setMaxValue(99999999)
    .setMinValue(-1))))
    .setDefaultMemberPermissions(discord_js_1.PermissionFlagsBits.Administrator);
function execute(_client, interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const subCommand = interaction.options.getSubcommand();
        const subCommandGroup = interaction.options.getSubcommandGroup();
        switch (subCommand) {
            case 'add':
                if (interaction.options.getString('action') != null) {
                    const addActionProductFlow = new product_flows_1.AddActionProductFlow();
                    addActionProductFlow.start(interaction);
                    break;
                }
                const addProductFlow = new product_flows_1.AddProductFlow();
                addProductFlow.start(interaction);
                break;
            case 'remove':
                const removeProductFlow = new product_flows_1.RemoveProductFlow();
                removeProductFlow.start(interaction);
                break;
            default:
                if (subCommandGroup == 'edit') {
                    const editProductFlow = new product_flows_1.EditProductFlow();
                    editProductFlow.start(interaction);
                    break;
                }
                yield (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.InvalidSubcommand);
        }
    });
}