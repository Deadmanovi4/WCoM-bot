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
exports.BuyProductUserInterface = exports.ShopUserInterface = void 0;
const discord_js_1 = require("discord.js");
const accounts_database_1 = require("../database/accounts/accounts-database");
const currencies_database_1 = require("../database/currencies/currencies-database");
const database_types_1 = require("../database/database-types");
const shops_database_1 = require("../database/shops/shops-database");
const shops_types_1 = require("../database/shops/shops-types");
const constants_1 = require("../utils/constants");
const discord_1 = require("../utils/discord");
const account_ui_1 = require("./account-ui");
const extended_components_1 = require("./extended-components");
const user_interfaces_1 = require("./user-interfaces");
class ShopUserInterface extends user_interfaces_1.PaginatedEmbedUserInterface {
    constructor() {
        super(...arguments);
        this.id = 'shop-ui';
        this.components = new Map();
        this.embed = null;
        this.selectedShop = null;
        this.page = 0;
        this.response = null;
        this.member = null;
    }
    predisplay(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const shops = (0, shops_database_1.getShops)();
            if (!shops.size)
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.NoShops);
            this.selectedShop = (_a = shops.entries().next().value) === null || _a === void 0 ? void 0 : _a[1];
            this.member = (_b = interaction.member) !== null && _b !== void 0 ? _b : null;
        });
    }
    getMessage() { return ''; }
    initComponents() {
        const selectShopMenu = new extended_components_1.ExtendedStringSelectMenuComponent({ customId: `${this.id}+select-shop`, placeholder: 'Select a shop', time: 120000 }, (0, shops_database_1.getShops)(), (interaction, selected) => __awaiter(this, void 0, void 0, function* () {
            this.page = 0;
            this.selectedShop = selected;
            this.updateInteraction(interaction);
        }));
        const buyButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+buy`,
            label: 'Купить',
            emoji: { name: '🪙' },
            style: discord_js_1.ButtonStyle.Primary,
            time: 120000,
            disabled: this.isBuyButtonDisabled()
        }, (interaction) => {
            if (!this.selectedShop)
                return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
            const buyProductUI = new BuyProductUserInterface(this.selectedShop);
            return buyProductUI.display(interaction);
        });
        const showAccountButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+show-account`,
            label: 'Ваш счет',
            emoji: { name: '💰' },
            style: discord_js_1.ButtonStyle.Secondary,
            time: 120000,
        }, (interaction) => {
            const user = interaction.user;
            const accountUI = new account_ui_1.AccountUserInterface(user);
            accountUI.display(interaction);
        });
        buyButton.toggle(this.selectedShop != null && this.selectedShop.products.size > 0 && !this.isBuyButtonDisabled());
        this.components.set(selectShopMenu.customId, selectShopMenu);
        this.components.set(buyButton.customId, buyButton);
        this.components.set(showAccountButton.customId, showAccountButton);
    }
    initEmbeds(_interaction) {
        if (!this.selectedShop)
            return;
        const reservedToString = this.selectedShop.reservedTo !== undefined ? ` (только для ${(0, discord_js_1.roleMention)(this.selectedShop.reservedTo)})\n` : '';
        const shopEmbed = new discord_js_1.EmbedBuilder()
            .setTitle(`${(0, shops_database_1.getShopName)(this.selectedShop.id)}`)
            .setDescription(`${reservedToString}${this.selectedShop.description}\n\nТовары:`)
            .setColor(discord_js_1.Colors.Gold);
        shopEmbed.setFields(this.getPageEmbedFields());
        this.embed = shopEmbed;
    }
    updateComponents() {
        const buyButton = this.components.get(`${this.id}+buy`);
        if (buyButton instanceof extended_components_1.ExtendedButtonComponent && this.selectedShop != null) {
            buyButton.toggle(this.selectedShop.products.size > 0 && !this.isBuyButtonDisabled());
        }
    }
    updateEmbeds() {
        const shopEmbed = this.embed;
        if (!shopEmbed || !this.selectedShop)
            return;
        const reservedToString = this.selectedShop.reservedTo !== undefined ? ` (только для ${(0, discord_js_1.roleMention)(this.selectedShop.reservedTo)})\n` : '';
        shopEmbed.setTitle(`${(0, shops_database_1.getShopName)(this.selectedShop.id)}`);
        shopEmbed.setDescription(`${reservedToString}${this.selectedShop.description}\nТовары: `);
        shopEmbed.setFields(this.getPageEmbedFields());
        this.embed = shopEmbed;
    }
    getEmbedFields() {
        if (!this.selectedShop)
            return [];
        if (this.selectedShop.products.size == 0)
            return [{ name: '\u200b', value: '🛒 *Магазин пуст*' }];
        const fields = [];
        this.selectedShop.products.forEach(product => {
            const descString = product.description ? product.description : '\u200b';
            const amountString = product.amount == undefined ? '' :
                product.amount == 0 ? ' (Распродано)' : ` (${product.amount} осталось)`;
            fields.push({
                name: (0, shops_database_1.getProductName)(this.selectedShop.id, product.id),
                value: `Цена: **${product.price} ${(0, currencies_database_1.getCurrencyName)(this.selectedShop.currency.id)}**${amountString}\n${descString}`,
                inline: true
            });
        });
        return fields;
    }
    getInputSize() {
        return this.selectedShop ? this.selectedShop.products.size : 0;
    }
    isBuyButtonDisabled() {
        if (!this.selectedShop)
            return false;
        const isReserved = this.selectedShop.reservedTo;
        if (!isReserved)
            return false;
        if (!this.member)
            return false;
        const isUserAuthorized = this.member.roles.cache.has(this.selectedShop.reservedTo);
        const isUserAdmin = this.member.permissions.has('Administrator');
        return !isUserAuthorized && !isUserAdmin;
    }
}
exports.ShopUserInterface = ShopUserInterface;
class BuyProductUserInterface extends user_interfaces_1.MessageUserInterface {
    constructor(selectedShop) {
        super();
        this.id = 'buy-product-ui';
        this.components = new Map();
        this.selectedProduct = null;
        this.discountCode = undefined;
        this.discount = 0;
        this.selectedShop = selectedShop;
    }
    predisplay(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.selectedShop.products.size)
                return yield (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.NoProducts);
        });
    }
    getMessage() {
        var _a;
        const discountCodeString = this.discountCode ? `\nСкидочный купон: ${(0, discord_js_1.bold)(this.discountCode)}` : '';
        const priceString = this.priceString() != '' ? ` для ${this.priceString()}` : '';
        return `Купить **[${(0, shops_database_1.getProductName)(this.selectedShop.id, (_a = this.selectedProduct) === null || _a === void 0 ? void 0 : _a.id) || 'Выберите товар'}]** из магазина ${(0, discord_js_1.bold)((0, shops_database_1.getShopName)(this.selectedShop.id))}${priceString}.${discountCodeString}`;
    }
    initComponents() {
        const selectProductMenu = new extended_components_1.ExtendedStringSelectMenuComponent({
            customId: `${this.id}+select-product`,
            placeholder: 'Выберите товар',
            time: 120000,
        }, this.selectedShop.products, (interaction, selected) => {
            this.selectedProduct = selected;
            this.updateInteraction(interaction);
        });
        const buyButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+buy`,
            label: 'Купить',
            emoji: { name: '✅' },
            style: discord_js_1.ButtonStyle.Success,
            time: 120000,
        }, (interaction) => this.buyProduct(interaction));
        const discountCodeButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+discount-code`,
            label: 'У меня есть купон',
            emoji: { name: '🎁' },
            style: discord_js_1.ButtonStyle.Secondary,
            time: 120000,
        }, (interaction) => this.handleSetDiscountCodeInteraction(interaction));
        this.components.set(selectProductMenu.customId, selectProductMenu);
        this.components.set(buyButton.customId, buyButton);
        this.components.set(discountCodeButton.customId, discountCodeButton);
    }
    updateComponents() {
        const buyButton = this.components.get(`${this.id}+buy`);
        if (buyButton instanceof extended_components_1.ExtendedButtonComponent) {
            buyButton.toggle(this.selectedProduct != null);
        }
    }
    handleSetDiscountCodeInteraction(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const modalId = `${this.id}+set-discount-code-modal`;
            const modal = new discord_js_1.ModalBuilder()
                .setCustomId(modalId)
                .setTitle('Использовать купон');
            const discountCodeInput = new discord_js_1.TextInputBuilder()
                .setCustomId('discount-code-input')
                .setLabel('Код купона')
                .setPlaceholder('XXXXXXX')
                .setStyle(discord_js_1.TextInputStyle.Short)
                .setRequired(true)
                .setMaxLength(8)
                .setMinLength(6);
            modal.addComponents(new discord_js_1.ActionRowBuilder().addComponents(discountCodeInput));
            yield interaction.showModal(modal);
            const filter = (interaction) => interaction.customId === modalId;
            const modalSubmit = yield interaction.awaitModalSubmit({ filter, time: 120000 });
            const input = modalSubmit.fields.getTextInputValue('discount-code-input');
            if (!input)
                return this.updateInteraction(modalSubmit);
            const shopDiscountCodes = this.selectedShop.discountCodes;
            if (!shopDiscountCodes[input])
                return this.updateInteraction(modalSubmit);
            this.discountCode = input;
            this.discount = shopDiscountCodes[input];
            this.updateInteraction(modalSubmit);
        });
    }
    buyProduct(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (!this.selectedProduct)
                return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
            try {
                if (this.selectedShop.reservedTo && interaction.member instanceof discord_js_1.GuildMember && !(((_a = interaction.member) === null || _a === void 0 ? void 0 : _a.roles.cache.has(this.selectedShop.reservedTo)) || interaction.member.permissions.has('Administrator')))
                    return (0, discord_1.replyErrorMessage)(interaction, "Вы не можете покупать здесь");
                const user = yield (0, accounts_database_1.getOrCreateAccount)(interaction.user.id);
                const userCurrencyAmount = ((_b = user.currencies.get(this.selectedShop.currency.id)) === null || _b === void 0 ? void 0 : _b.amount) || 0;
                const price = this.selectedProduct.price * (1 - this.discount / 100);
                if (userCurrencyAmount < price)
                    return (0, discord_1.replyErrorMessage)(interaction, `У вас недостаточно **${(0, currencies_database_1.getCurrencyName)(this.selectedShop.currency.id)}** для покупки этого товара`);
                (0, accounts_database_1.setAccountCurrencyAmount)(interaction.user.id, this.selectedShop.currency.id, userCurrencyAmount - price);
                if (this.selectedProduct.amount != undefined && this.selectedProduct.amount <= 0)
                    return (0, discord_1.replyErrorMessage)(interaction, `Этот товар больше не доступен`);
                if (this.selectedProduct.amount != undefined)
                    (0, shops_database_1.updateProduct)(this.selectedShop.id, this.selectedProduct.id, { amount: this.selectedProduct.amount - 1 });
                if (this.selectedProduct.action != undefined)
                    return this.buyActionProduct(interaction);
                const userProductAmount = ((_c = user.inventory.get(this.selectedProduct.id)) === null || _c === void 0 ? void 0 : _c.amount) || 0;
                (0, accounts_database_1.setAccountItemAmount)(interaction.user.id, this.selectedProduct, userProductAmount + 1);
                yield (0, discord_1.updateAsSuccessMessage)(interaction, `Вы успешно купили ${(0, discord_js_1.bold)((0, shops_database_1.getProductName)(this.selectedShop.id, this.selectedProduct.id))} в магазине ${(0, discord_js_1.bold)((0, shops_database_1.getShopName)(this.selectedShop.id))} for ${this.priceString()}`);
                (0, discord_1.logToDiscord)(interaction, `${interaction.member} купил ${(0, discord_js_1.bold)((0, shops_database_1.getProductName)(this.selectedShop.id, this.selectedProduct.id))} в магазине ${(0, discord_js_1.bold)((0, shops_database_1.getShopName)(this.selectedShop.id))} за ${this.priceString()} используя купон ${this.discountCode ? this.discountCode : '(без купона)'}`);
                return;
            }
            catch (error) {
                return yield (0, discord_1.replyErrorMessage)(interaction, (error instanceof database_types_1.DatabaseError) ? error.message : undefined);
            }
        });
    }
    priceString() {
        if (!this.selectedProduct)
            return '';
        const price = this.selectedProduct.price * (1 - this.discount / 100);
        return (this.discount == 0) ? `**${price} ${(0, currencies_database_1.getCurrencyName)(this.selectedShop.currency.id)}**` : `~~${this.selectedProduct.price}~~ **${price} ${(0, currencies_database_1.getCurrencyName)(this.selectedShop.currency.id)}**`;
    }
    buyActionProduct(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            if (!this.selectedProduct)
                return;
            let actionMessage = '';
            switch ((_a = this.selectedProduct.action) === null || _a === void 0 ? void 0 : _a.type) {
                case shops_types_1.PRODUCT_ACTION_TYPE.GiveRole:
                    const roleId = this.selectedProduct.action.options.roleId;
                    if (!roleId)
                        return;
                    const member = interaction.member;
                    if (!(member instanceof discord_js_1.GuildMember))
                        return;
                    member.roles.add(roleId);
                    actionMessage = `Вам выдана роль ${(0, discord_js_1.bold)((0, discord_js_1.roleMention)(roleId))}`;
                    break;
                case shops_types_1.PRODUCT_ACTION_TYPE.GiveCurrency:
                    const currency = this.selectedProduct.action.options.currencyId;
                    if (!currency)
                        return;
                    const amount = this.selectedProduct.action.options.amount;
                    if (!amount)
                        return;
                    const user = yield (0, accounts_database_1.getOrCreateAccount)(interaction.user.id);
                    const userCurrencyAmount = ((_b = user.currencies.get(this.selectedShop.currency.id)) === null || _b === void 0 ? void 0 : _b.amount) || 0;
                    (0, accounts_database_1.setAccountCurrencyAmount)(interaction.user.id, currency, userCurrencyAmount + amount);
                    break;
                default:
                    break;
            }
            yield (0, discord_1.updateAsSuccessMessage)(interaction, `Вы успешно купили ${(0, discord_js_1.bold)((0, shops_database_1.getProductName)(this.selectedShop.id, this.selectedProduct.id))} в магазине ${(0, discord_js_1.bold)((0, shops_database_1.getShopName)(this.selectedShop.id))} за ${this.priceString()}.\n${actionMessage}`);
            (0, discord_1.logToDiscord)(interaction, `${interaction.member} купил ${(0, discord_js_1.bold)((0, shops_database_1.getProductName)(this.selectedShop.id, this.selectedProduct.id))} в магазине ${(0, discord_js_1.bold)((0, shops_database_1.getShopName)(this.selectedShop.id))} за ${this.priceString()} используя купон ${this.discountCode ? this.discountCode : '(без купона)'}. Действие: ${((_c = this.selectedProduct.action) === null || _c === void 0 ? void 0 : _c.type) || '(нет действия)'} ${actionMessage}`);
            return;
        });
    }
}
exports.BuyProductUserInterface = BuyProductUserInterface;