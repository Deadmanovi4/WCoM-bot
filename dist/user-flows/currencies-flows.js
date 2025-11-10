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
exports.EditCurrencyFlow = exports.EditCurrencyOption = exports.CurrencyRemoveFlow = void 0;
const discord_js_1 = require("discord.js");
const accounts_database_1 = require("../database/accounts/accounts-database");
const currencies_database_1 = require("../database/currencies/currencies-database");
const database_types_1 = require("../database/database-types");
const shops_database_1 = require("../database/shops/shops-database");
const extended_components_1 = require("../user-interfaces/extended-components");
const constants_1 = require("../utils/constants");
const pretty_log_1 = require("../utils/pretty-log");
const discord_1 = require("../utils/discord");
const user_flow_1 = require("./user-flow");
class CurrencyRemoveFlow extends user_flow_1.UserFlow {
    constructor() {
        super(...arguments);
        this.id = 'currency-remove';
        this.components = new Map();
        this.selectedCurrency = null;
    }
    start(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const currencies = (0, currencies_database_1.getCurrencies)();
            if (currencies.size == 0)
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.NoCurrencies);
            this.selectedCurrency = null;
            this.initComponents();
            this.updateComponents();
            const response = yield interaction.reply({ content: this.getMessage(), components: this.getComponentRows(), flags: discord_js_1.MessageFlags.Ephemeral, withResponse: true });
            this.createComponentsCollectors(response);
            return;
        });
    }
    initComponents() {
        const currencySelect = new extended_components_1.ExtendedStringSelectMenuComponent({
            customId: `${this.id}+select-currency`,
            placeholder: 'Выберите счет',
            time: 120000
        }, (0, currencies_database_1.getCurrencies)(), (interaction, selectedCurrency) => {
            this.selectedCurrency = selectedCurrency;
            this.updateInteraction(interaction);
        });
        const submitButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+submit`,
            label: 'Удалить счет',
            emoji: { name: '⛔' },
            style: discord_js_1.ButtonStyle.Danger,
            disabled: this.selectedCurrency == null,
            time: 120000,
        }, (interaction) => __awaiter(this, void 0, void 0, function* () {
            const [modalSubmitInteraction, confirmed] = yield (0, extended_components_1.showConfirmationModal)(interaction);
            if (confirmed)
                return this.success(modalSubmitInteraction);
            return this.updateInteraction(modalSubmitInteraction);
        }));
        this.components.set(currencySelect.customId, currencySelect);
        this.components.set(submitButton.customId, submitButton);
    }
    getMessage() {
        var _a;
        if (this.selectedCurrency) {
            const shopsWithCurrency = (0, shops_database_1.getShopsWithCurrency)(this.selectedCurrency.id);
            if (shopsWithCurrency.size > 0) {
                const shopsWithCurrencyNames = Array.from(shopsWithCurrency.values()).map(shop => (0, discord_js_1.bold)((0, discord_js_1.italic)((0, shops_database_1.getShopName)(shop.id) || ''))).join(', ');
                return `⚠️ Не удалось удалить **${(0, currencies_database_1.getCurrencyName)(this.selectedCurrency.id)}** ! Имеются магазины, которые его в данный момент используют: ${shopsWithCurrencyNames}. \n-# Пожалуйста удалите или измените товар или магазин перед удалением счета (\`/shops-manage remove\`) (\`/shops-manage change-currency\`) .`;
            }
        }
        return `Удаление **[${(0, currencies_database_1.getCurrencyName)((_a = this.selectedCurrency) === null || _a === void 0 ? void 0 : _a.id) || 'Выберите счет'}]**, ⚠️ __**это действие также удалит данный счет с аккаунтов пользователей**__`;
    }
    updateComponents() {
        var _a;
        const submitButton = this.components.get(`${this.id}+submit`);
        if (!(submitButton instanceof extended_components_1.ExtendedButtonComponent))
            return;
        const shopsWithCurrency = (0, shops_database_1.getShopsWithCurrency)(((_a = this.selectedCurrency) === null || _a === void 0 ? void 0 : _a.id) || '');
        submitButton.toggle((this.selectedCurrency != null) && (shopsWithCurrency.size == 0));
    }
    success(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            this.disableComponents();
            try {
                if (this.selectedCurrency == null)
                    return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                yield (0, accounts_database_1.takeCurrencyFromAccounts)(this.selectedCurrency.id);
                const currencyName = (0, currencies_database_1.getCurrencyName)(this.selectedCurrency.id) || '';
                yield (0, currencies_database_1.removeCurrency)(this.selectedCurrency.id);
                return yield (0, discord_1.updateAsSuccessMessage)(interaction, `Вы успешно удалили счет ${(0, discord_js_1.bold)(currencyName)}`);
            }
            catch (error) {
                return yield (0, discord_1.updateAsErrorMessage)(interaction, (error instanceof database_types_1.DatabaseError) ? error.message : undefined);
            }
        });
    }
}
exports.CurrencyRemoveFlow = CurrencyRemoveFlow;
var EditCurrencyOption;
(function (EditCurrencyOption) {
    EditCurrencyOption["NAME"] = "name";
    EditCurrencyOption["EMOJI"] = "emoji";
})(EditCurrencyOption || (exports.EditCurrencyOption = EditCurrencyOption = {}));
class EditCurrencyFlow extends user_flow_1.UserFlow {
    constructor() {
        super(...arguments);
        this.id = 'currency-edit';
        this.components = new Map();
        this.selectedCurrency = null;
        this.updateOption = null;
        this.updateOptionValue = null;
    }
    start(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const currencies = (0, currencies_database_1.getCurrencies)();
            if (currencies.size == 0)
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.NoCurrencies);
            const subcommand = interaction.options.getSubcommand();
            if (!subcommand || !Object.values(EditCurrencyOption).includes(subcommand))
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.InvalidSubcommand);
            this.updateOption = subcommand;
            this.updateOptionValue = this.getUpdateValue(interaction, subcommand);
            this.initComponents();
            this.updateComponents();
            const response = yield interaction.reply({ content: this.getMessage(), components: this.getComponentRows(), flags: discord_js_1.MessageFlags.Ephemeral, withResponse: true });
            this.createComponentsCollectors(response);
            return;
        });
    }
    getMessage() {
        var _a;
        return `Изменить **[${(0, currencies_database_1.getCurrencyName)((_a = this.selectedCurrency) === null || _a === void 0 ? void 0 : _a.id) || 'Выберите счет'}]**.\n**Новое значение ${this.updateOption}**: ${(0, discord_js_1.bold)(`${this.updateOptionValue}`)}`;
    }
    initComponents() {
        const currencySelectMenu = new extended_components_1.ExtendedStringSelectMenuComponent({ customId: `${this.id}+select-currency`, placeholder: 'Выберите счет', time: 120000 }, (0, currencies_database_1.getCurrencies)(), (interaction, selectedCurrency) => {
            this.selectedCurrency = selectedCurrency;
            this.updateInteraction(interaction);
        });
        const submitButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+submit`,
            label: 'Применить',
            emoji: { name: '✅' },
            style: discord_js_1.ButtonStyle.Success,
            disabled: this.selectedCurrency == null,
            time: 120000,
        }, (interaction) => this.success(interaction));
        this.components.set(currencySelectMenu.customId, currencySelectMenu);
        this.components.set(submitButton.customId, submitButton);
    }
    updateComponents() {
        const submitButton = this.components.get(`${this.id}+submit`);
        if (!(submitButton instanceof extended_components_1.ExtendedButtonComponent))
            return;
        submitButton.toggle(this.selectedCurrency != null);
    }
    success(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.selectedCurrency)
                    return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                if (!this.updateOption || this.updateOptionValue == undefined)
                    return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                const oldName = (0, currencies_database_1.getCurrencyName)(this.selectedCurrency.id) || '';
                yield (0, currencies_database_1.updateCurrency)(this.selectedCurrency.id, { [this.updateOption.toString()]: this.updateOptionValue });
                return yield (0, discord_1.updateAsSuccessMessage)(interaction, `Вы успешно изменили счет ${(0, discord_js_1.bold)(oldName)}. \nНовое значение ${(0, discord_js_1.bold)(this.updateOption)}: ${(0, discord_js_1.bold)(this.updateOptionValue)}`);
            }
            catch (error) {
                return yield (0, discord_1.updateAsErrorMessage)(interaction, (error instanceof database_types_1.DatabaseError) ? error.message : undefined);
            }
        });
    }
    getUpdateValue(interaction, subcommand) {
        var _a, _b;
        switch (subcommand) {
            case EditCurrencyOption.NAME:
                return ((_a = interaction.options.getString(`new-${subcommand}`)) === null || _a === void 0 ? void 0 : _a.replaceSpaces()) || '';
            case EditCurrencyOption.EMOJI:
                const emojiOption = interaction.options.getString(`new-${subcommand}`);
                return ((_b = emojiOption === null || emojiOption === void 0 ? void 0 : emojiOption.match(constants_1.EMOJI_REGEX)) === null || _b === void 0 ? void 0 : _b[0]) || '';
            default:
                pretty_log_1.PrettyLog.warning(`Неизвестная опция: ${subcommand}`);
                return '';
        }
    }
}
exports.EditCurrencyFlow = EditCurrencyFlow;