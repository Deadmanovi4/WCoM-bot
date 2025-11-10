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
exports.AccountUserInterface = void 0;
const discord_js_1 = require("discord.js");
const accounts_database_1 = require("../database/accounts/accounts-database");
const currencies_database_1 = require("../database/currencies/currencies-database");
const extended_components_1 = require("./extended-components");
const user_interfaces_1 = require("./user-interfaces");
class AccountUserInterface extends user_interfaces_1.PaginatedMultipleEmbedUserInterface {
    constructor(user) {
        super();
        this.id = 'account-ui';
        this.components = new Map();
        this.modes = {
            CURRENCIES: 'currencies',
            INVENTORY: 'inventory'
        };
        this.mode = this.modes.CURRENCIES;
        this.embed = null;
        this.embedByMode = new Map();
        this.page = 0;
        this.response = null;
        this.account = null;
        this.user = user;
    }
    predisplay(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            this.account = yield (0, accounts_database_1.getOrCreateAccount)(this.user.id);
        });
    }
    getMessage() {
        return '';
    }
    initEmbeds(interaction) {
        this.mode = this.modes.CURRENCIES;
        const currenciesEmbed = new discord_js_1.EmbedBuilder()
            .setTitle(`Статистика _${this.user.displayName}_`)
            .setColor(discord_js_1.Colors.Gold)
            .setFooter({ text: 'ShopBot', iconURL: interaction.client.user.displayAvatarURL() })
            .setFields(this.getPageEmbedFields());
        this.mode = this.modes.INVENTORY;
        const inventoryEmbed = new discord_js_1.EmbedBuilder()
            .setTitle(`Инвентарь _${this.user.displayName}_`)
            .setColor(discord_js_1.Colors.DarkGreen)
            .setFooter({ text: 'ShopBot', iconURL: interaction.client.user.displayAvatarURL() })
            .setFields(this.getPageEmbedFields());
        this.embedByMode.set(this.modes.CURRENCIES, currenciesEmbed);
        this.embedByMode.set(this.modes.INVENTORY, inventoryEmbed);
        this.embed = currenciesEmbed;
        this.mode = this.modes.CURRENCIES;
    }
    updateEmbeds() {
        const currentModeEmbed = this.embedByMode.get(this.mode);
        if (!currentModeEmbed)
            return;
        currentModeEmbed.setFields(this.getPageEmbedFields());
        this.embed = currentModeEmbed;
    }
    initComponents() {
        const showAccountButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+show-account`,
            label: 'Показать статистику',
            emoji: { name: '💰' },
            style: discord_js_1.ButtonStyle.Secondary,
            disabled: this.mode == this.modes.CURRENCIES,
            time: 120000
        }, (interaction) => this.changeDisplayMode(interaction, this.modes.CURRENCIES));
        const showInventoryButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+show-inventory`,
            label: 'Показать инвентарь',
            emoji: { name: '💼' },
            style: discord_js_1.ButtonStyle.Secondary,
            disabled: this.mode == this.modes.INVENTORY,
            time: 120000
        }, (interaction) => this.changeDisplayMode(interaction, this.modes.INVENTORY));
        this.components.set(showAccountButton.customId, showAccountButton);
        this.components.set(showInventoryButton.customId, showInventoryButton);
    }
    updateComponents() {
        const showAccountButton = this.components.get(`${this.id}+show-account`);
        if (showAccountButton instanceof extended_components_1.ExtendedButtonComponent) {
            showAccountButton.toggle(this.mode != this.modes.CURRENCIES);
        }
        const showInventoryButton = this.components.get(`${this.id}+show-inventory`);
        if (showInventoryButton instanceof extended_components_1.ExtendedButtonComponent) {
            showInventoryButton.toggle(this.mode != this.modes.INVENTORY);
        }
    }
    getInputSize() {
        var _a, _b;
        switch (this.mode) {
            case this.modes.CURRENCIES:
                return (0, currencies_database_1.getCurrencies)().size;
            case this.modes.INVENTORY:
                return (_b = (_a = this.account) === null || _a === void 0 ? void 0 : _a.inventory.size) !== null && _b !== void 0 ? _b : 0;
        }
    }
    getAccountFields() {
        if (!this.account || !this.account.currencies.size)
            return [{ name: '❌ Ничего нет', value: '\u200b' }];
        const fields = [];
        this.account.currencies.forEach(currencyBalance => {
            const emojiString = currencyBalance.item.emoji != null ? `${currencyBalance.item.emoji} ` : '';
            fields.push({ name: `${emojiString}${currencyBalance.item.name}`, value: `${currencyBalance.amount}`, inline: true });
        });
        return fields;
    }
    getInventoryFields() {
        if (!this.account || !this.account.inventory.size)
            return [{ name: '❌ Инвентарь пуст', value: '\u200b' }];
        const fields = [];
        this.account.inventory.forEach(productBalance => {
            const emojiString = productBalance.item.emoji != null ? `${productBalance.item.emoji} ` : '';
            fields.push({ name: `${emojiString}${productBalance.item.name}`, value: `${productBalance.amount}`, inline: true });
        });
        return fields;
    }
    getEmbedFields() {
        switch (this.mode) {
            case this.modes.CURRENCIES:
                return this.getAccountFields();
            case this.modes.INVENTORY:
                return this.getInventoryFields();
        }
    }
}
exports.AccountUserInterface = AccountUserInterface;