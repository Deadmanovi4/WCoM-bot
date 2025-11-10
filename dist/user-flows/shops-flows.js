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
exports.DiscountCodeRemoveFlow = exports.DiscountCodeCreateFlow = exports.EditShopCurrencyFlow = exports.EditShopFlow = exports.EDIT_SHOP_OPTIONS = exports.NO_VALUE = exports.ShopReorderFlow = exports.ShopRemoveFlow = exports.ShopCreateFlow = void 0;
const discord_js_1 = require("discord.js");
const currencies_database_1 = require("../database/currencies/currencies-database");
const database_types_1 = require("../database/database-types");
const shops_database_1 = require("../database/shops/shops-database");
const extended_components_1 = require("../user-interfaces/extended-components");
const constants_1 = require("../utils/constants");
const pretty_log_1 = require("../utils/pretty-log");
const discord_1 = require("../utils/discord");
const user_flow_1 = require("./user-flow");
const utils_1 = require("../utils/utils");
class ShopCreateFlow extends user_flow_1.UserFlow {
    constructor() {
        super(...arguments);
        this.id = 'shop-create';
        this.components = new Map();
        this.selectedCurrency = null;
        this.shopName = null;
        this.shopEmoji = null;
        this.shopDescription = null;
        this.shopReservedTo = undefined;
    }
    start(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            const currencies = (0, currencies_database_1.getCurrencies)();
            if (!currencies.size)
                return yield (0, discord_1.replyErrorMessage)(interaction, `Не удалось создать магазин. ${constants_1.ErrorMessages.NoCurrencies}`);
            const shopName = (_a = interaction.options.getString('name')) === null || _a === void 0 ? void 0 : _a.replaceSpaces();
            const shopDescription = ((_b = interaction.options.getString('description')) === null || _b === void 0 ? void 0 : _b.replaceSpaces()) || '';
            const emojiOption = interaction.options.getString('emoji');
            const shopEmoji = ((_c = emojiOption === null || emojiOption === void 0 ? void 0 : emojiOption.match(constants_1.EMOJI_REGEX)) === null || _c === void 0 ? void 0 : _c[0]) || '';
            const shopReservedTo = (_d = interaction.options.getRole('reserved-to')) === null || _d === void 0 ? void 0 : _d.id;
            if (!shopName)
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
            if (shopName.removeCustomEmojis().length == 0)
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.NotOnlyEmojisInName);
            this.shopName = shopName;
            this.shopEmoji = shopEmoji;
            this.shopDescription = shopDescription;
            this.shopReservedTo = shopReservedTo;
            this.initComponents();
            this.updateComponents();
            const response = yield interaction.reply({ content: this.getMessage(), components: this.getComponentRows(), flags: discord_js_1.MessageFlags.Ephemeral, withResponse: true });
            this.createComponentsCollectors(response);
            return;
        });
    }
    getMessage() {
        var _a;
        const shopNameString = (0, discord_js_1.bold)(`${this.shopEmoji ? `${this.shopEmoji} ` : ''}${this.shopName}`);
        return `Создать магазин **${shopNameString}** со счетом **[${(0, currencies_database_1.getCurrencyName)((_a = this.selectedCurrency) === null || _a === void 0 ? void 0 : _a.id) || 'Выберите счет'}]**`;
    }
    initComponents() {
        const selectCurrencyMenu = new extended_components_1.ExtendedStringSelectMenuComponent({ customId: `${this.id}+select-currency`, placeholder: 'Select a currency', time: 120000 }, (0, currencies_database_1.getCurrencies)(), (interaction, selectedCurrency) => {
            this.selectedCurrency = selectedCurrency;
            this.updateInteraction(interaction);
        });
        const submitButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+submit`,
            label: 'Применить',
            emoji: '✅',
            style: discord_js_1.ButtonStyle.Success,
            disabled: true,
            time: 120000
        }, (interaction) => this.success(interaction));
        const changeShopNameButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+change-shop-name`,
            label: 'Изменить название магазина',
            emoji: '📝',
            style: discord_js_1.ButtonStyle.Secondary,
            time: 120000
        }, (interaction) => __awaiter(this, void 0, void 0, function* () {
            const [modalSubmit, newShopName] = yield (0, extended_components_1.showEditModal)(interaction, { edit: 'Shop Name', previousValue: this.shopName || undefined });
            this.shopName = newShopName;
            this.updateInteraction(modalSubmit);
        }));
        const changeShopEmojiButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+change-shop-emoji`,
            label: 'Изменить эмодзи магазина',
            emoji: '✏️',
            style: discord_js_1.ButtonStyle.Secondary,
            time: 120000
        }, (interaction) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const [modalSubmit, newShopEmoji] = yield (0, extended_components_1.showEditModal)(interaction, { edit: 'Shop Emoji', previousValue: this.shopEmoji || undefined });
            this.shopEmoji = ((_a = newShopEmoji === null || newShopEmoji === void 0 ? void 0 : newShopEmoji.match(constants_1.EMOJI_REGEX)) === null || _a === void 0 ? void 0 : _a[0]) || this.shopEmoji;
            this.updateInteraction(modalSubmit);
        }));
        this.components.set(selectCurrencyMenu.customId, selectCurrencyMenu);
        this.components.set(submitButton.customId, submitButton);
        this.components.set(changeShopNameButton.customId, changeShopNameButton);
        this.components.set(changeShopEmojiButton.customId, changeShopEmojiButton);
    }
    updateComponents() {
        const submitButton = this.components.get(`${this.id}+submit`);
        if (!(submitButton instanceof extended_components_1.ExtendedButtonComponent))
            return;
        submitButton.toggle(this.selectedCurrency != null);
    }
    success(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            this.disableComponents();
            try {
                if (!this.shopName)
                    return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                if (!this.selectedCurrency)
                    return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                const newShop = yield (0, shops_database_1.createShop)(this.shopName, this.shopDescription || '', this.selectedCurrency.id, this.shopEmoji || '', this.shopReservedTo);
                return yield (0, discord_1.updateAsSuccessMessage)(interaction, `Вы успешно создали магазин ${(0, discord_js_1.bold)((0, shops_database_1.getShopName)(newShop.id) || '')} со счетом ${(0, discord_js_1.bold)((0, currencies_database_1.getCurrencyName)(newShop.currency.id) || '')}. \n-# Для удаления используйте \`/shops-manage remove\` `);
            }
            catch (error) {
                return yield (0, discord_1.updateAsErrorMessage)(interaction, (error instanceof database_types_1.DatabaseError) ? error.message : undefined);
            }
        });
    }
}
exports.ShopCreateFlow = ShopCreateFlow;
class ShopRemoveFlow extends user_flow_1.UserFlow {
    constructor() {
        super(...arguments);
        this.id = 'shop-remove';
        this.components = new Map();
        this.selectedShop = null;
    }
    start(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const shops = (0, shops_database_1.getShops)();
            if (!shops.size)
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.NoShops);
            this.initComponents();
            this.updateComponents();
            const response = yield interaction.reply({ content: this.getMessage(), components: this.getComponentRows(), flags: discord_js_1.MessageFlags.Ephemeral, withResponse: true });
            this.createComponentsCollectors(response);
            return;
        });
    }
    getMessage() {
        var _a;
        return `Удалить магазин **[${(0, shops_database_1.getShopName)((_a = this.selectedShop) === null || _a === void 0 ? void 0 : _a.id) || 'Выберите магазин'}]**`;
    }
    initComponents() {
        const shopSelectMenu = new extended_components_1.ExtendedStringSelectMenuComponent({
            customId: `${this.id}+select-shop`,
            placeholder: 'Выберите магазин',
            time: 120000
        }, (0, shops_database_1.getShops)(), (interaction, selected) => {
            this.selectedShop = selected;
            this.updateInteraction(interaction);
        });
        const submitButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+submit`,
            time: 120000,
            label: 'Удалить магазин',
            emoji: { name: '⛔' },
            style: discord_js_1.ButtonStyle.Danger,
            disabled: true
        }, (interaction) => this.success(interaction));
        this.components.set(shopSelectMenu.customId, shopSelectMenu);
        this.components.set(submitButton.customId, submitButton);
    }
    updateComponents() {
        const submitButton = this.components.get(`${this.id}+submit`);
        if (!(submitButton instanceof extended_components_1.ExtendedButtonComponent))
            return;
        submitButton.toggle(this.selectedShop != null);
    }
    success(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            this.disableComponents();
            try {
                if (!this.selectedShop)
                    return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                yield (0, shops_database_1.removeShop)(this.selectedShop.id);
                return yield (0, discord_1.updateAsSuccessMessage)(interaction, `Вы успешно удалили магазин ${(0, discord_js_1.bold)((0, shops_database_1.getShopName)(this.selectedShop.id) || '')}`);
            }
            catch (error) {
                return yield (0, discord_1.updateAsErrorMessage)(interaction, (error instanceof database_types_1.DatabaseError) ? error.message : undefined);
            }
        });
    }
}
exports.ShopRemoveFlow = ShopRemoveFlow;
class ShopReorderFlow extends user_flow_1.UserFlow {
    constructor() {
        super(...arguments);
        this.id = 'shop-reorder';
        this.components = new Map();
        this.selectedShop = null;
        this.selectedPosition = null;
    }
    start(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const shops = (0, shops_database_1.getShops)();
            if (!shops.size)
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.NoShops);
            this.initComponents();
            this.selectedShop = shops.values().next().value;
            this.selectedPosition = 0 + 1;
            this.updateComponents();
            const response = yield interaction.reply({ content: this.getMessage(), components: this.getComponentRows(), flags: discord_js_1.MessageFlags.Ephemeral, withResponse: true });
            this.createComponentsCollectors(response);
            return;
        });
    }
    getMessage() {
        var _a;
        return `Изменить позицию для ${(0, discord_js_1.bold)(`[${(0, shops_database_1.getShopName)((_a = this.selectedShop) === null || _a === void 0 ? void 0 : _a.id) || 'Выберите магазин'}]`)} to ${(0, discord_js_1.bold)(`${this.selectedPosition || 'Выберите позицию'}`)}`;
    }
    initComponents() {
        const shopSelectMenu = new extended_components_1.ExtendedStringSelectMenuComponent({
            customId: `${this.id}+select-shop`,
            placeholder: 'Выберите магазин',
            time: 120000,
        }, (0, shops_database_1.getShops)(), (interaction, selected) => {
            this.selectedShop = selected;
            const shopsArray = Array.from((0, shops_database_1.getShops)().keys());
            const shopIndex = shopsArray.findIndex(id => id === selected.id);
            this.selectedPosition = shopIndex + 1;
            this.updateInteraction(interaction);
        });
        const upButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+up`,
            time: 120000,
            label: '',
            emoji: { name: '⬆️' },
            style: discord_js_1.ButtonStyle.Primary,
            disabled: this.selectedPosition != null && this.selectedPosition < (0, shops_database_1.getShops)().size,
        }, (interaction) => {
            if (!this.selectedPosition)
                return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
            this.selectedPosition = Math.max(this.selectedPosition - 1, 1);
            return this.updateInteraction(interaction);
        });
        const downButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+down`,
            time: 120000,
            label: '',
            emoji: { name: '⬇️' },
            style: discord_js_1.ButtonStyle.Primary,
            disabled: this.selectedPosition != null && this.selectedPosition > 1,
        }, (interaction) => {
            if (!this.selectedPosition)
                return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
            this.selectedPosition = Math.min(this.selectedPosition + 1, (0, shops_database_1.getShops)().size);
            return this.updateInteraction(interaction);
        });
        const submitNewPositionButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+submit-new-position`,
            time: 120000,
            label: 'Применить',
            emoji: { name: '' },
            style: discord_js_1.ButtonStyle.Success,
            disabled: true,
        }, (interaction) => this.success(interaction));
        this.components.set(shopSelectMenu.customId, shopSelectMenu);
        this.components.set(upButton.customId, upButton);
        this.components.set(downButton.customId, downButton);
        this.components.set(submitNewPositionButton.customId, submitNewPositionButton);
    }
    updateComponents() {
        const submitNewPositionButton = this.components.get(`${this.id}+submit-new-position`);
        if (submitNewPositionButton instanceof extended_components_1.ExtendedButtonComponent) {
            submitNewPositionButton.toggle(this.selectedShop != null && this.selectedPosition != null);
        }
        const upButton = this.components.get(`${this.id}+up`);
        if (upButton instanceof extended_components_1.ExtendedButtonComponent) {
            upButton.toggle(this.selectedPosition != null && this.selectedPosition > 1);
        }
        const downButton = this.components.get(`${this.id}+down`);
        if (downButton instanceof extended_components_1.ExtendedButtonComponent) {
            downButton.toggle(this.selectedPosition != null && this.selectedPosition < (0, shops_database_1.getShops)().size);
        }
    }
    success(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!this.selectedShop || !this.selectedPosition)
                    return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                (0, shops_database_1.updateShopPosition)(this.selectedShop.id, this.selectedPosition - 1);
                yield (0, discord_1.updateAsSuccessMessage)(interaction, `Вы успешно изменили позицию магазина ${(0, discord_js_1.bold)((0, shops_database_1.getShopName)((_a = this.selectedShop) === null || _a === void 0 ? void 0 : _a.id) || '')} на ${(0, discord_js_1.bold)(`${this.selectedPosition}`)}`);
                return;
            }
            catch (error) {
                yield (0, discord_1.updateAsErrorMessage)(interaction, (error instanceof database_types_1.DatabaseError) ? error.message : undefined);
                return;
            }
        });
    }
}
exports.ShopReorderFlow = ShopReorderFlow;
exports.NO_VALUE = 'no-value';
exports.EDIT_SHOP_OPTIONS = {
    Name: 'name',
    Description: 'description',
    Emoji: 'emoji',
    ReservedTo: 'reserved-to-role'
};
function isShopOption(subcommand) { return Object.values(exports.EDIT_SHOP_OPTIONS).includes(subcommand); }
function getShopOptionName(option) {
    switch (option) {
        case exports.EDIT_SHOP_OPTIONS.Name:
        case exports.EDIT_SHOP_OPTIONS.Description:
        case exports.EDIT_SHOP_OPTIONS.Emoji:
            return option;
        case exports.EDIT_SHOP_OPTIONS.ReservedTo:
            return 'reservedTo';
        default:
            (0, utils_1.assertNeverReached)(option);
    }
}
class EditShopFlow extends user_flow_1.UserFlow {
    constructor() {
        super(...arguments);
        this.id = 'edit-shop';
        this.components = new Map();
        this.selectedShop = null;
        this.updateOption = null;
        this.updateOptionValue = null;
        this.updateOptionValueDisplay = null;
    }
    start(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const shops = (0, shops_database_1.getShops)();
            if (!shops.size)
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.NoShops);
            const subcommand = interaction.options.getSubcommand();
            if (!subcommand || !isShopOption(subcommand))
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.InvalidSubcommand);
            this.updateOption = subcommand;
            try {
                this.updateOptionValue = this.getUpdateValue(interaction, subcommand);
            }
            catch (error) {
                return (0, discord_1.replyErrorMessage)(interaction, (error instanceof Error) ? error.message : undefined);
            }
            this.updateOptionValueDisplay = this.getUpdateValueDisplay(interaction, subcommand) || this.updateOptionValue;
            this.initComponents();
            this.updateComponents();
            const response = yield interaction.reply({ content: this.getMessage(), components: this.getComponentRows(), flags: discord_js_1.MessageFlags.Ephemeral, withResponse: true });
            this.createComponentsCollectors(response);
            return;
        });
    }
    getMessage() {
        var _a;
        return `Изменить магазин **[${(0, shops_database_1.getShopName)((_a = this.selectedShop) === null || _a === void 0 ? void 0 : _a.id) || 'Выберите магазин'}]**.\n**New ${this.updateOption}**: ${(0, discord_js_1.bold)(`${this.updateOptionValueDisplay}`)}`;
    }
    initComponents() {
        const shopSelectMenu = new extended_components_1.ExtendedStringSelectMenuComponent({
            customId: `${this.id}+select-shop`,
            placeholder: 'Выберите магазин',
            time: 120000,
        }, (0, shops_database_1.getShops)(), (interaction, selected) => {
            this.selectedShop = selected;
            this.updateInteraction(interaction);
        });
        const submitButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+submit`,
            time: 120000,
            label: 'Изменить',
            emoji: { name: '✅' },
            style: discord_js_1.ButtonStyle.Success,
            disabled: true,
        }, (interaction) => this.success(interaction));
        this.components.set(shopSelectMenu.customId, shopSelectMenu);
        this.components.set(submitButton.customId, submitButton);
    }
    updateComponents() {
        const submitButton = this.components.get(`${this.id}+submit`);
        if (!(submitButton instanceof extended_components_1.ExtendedButtonComponent))
            return;
        submitButton.toggle(this.selectedShop != null);
    }
    success(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.disableComponents();
            try {
                if (!this.selectedShop)
                    return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                if (!this.updateOption || !this.updateOptionValue || !this.updateOptionValueDisplay)
                    return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                const oldName = (0, shops_database_1.getShopName)((_a = this.selectedShop) === null || _a === void 0 ? void 0 : _a.id) || '';
                yield (0, shops_database_1.updateShop)(this.selectedShop.id, { [getShopOptionName(this.updateOption)]: this.updateOptionValue });
                return yield (0, discord_1.updateAsSuccessMessage)(interaction, `Вы успешно изменили магазин ${(0, discord_js_1.bold)(oldName)}.\n Новое значение ${(0, discord_js_1.bold)(this.updateOption)}: ${(0, discord_js_1.bold)(this.updateOptionValueDisplay)}`);
            }
            catch (error) {
                return yield (0, discord_1.updateAsErrorMessage)(interaction, (error instanceof database_types_1.DatabaseError) ? error.message : undefined);
            }
        });
    }
    getUpdateValue(interaction, subcommand) {
        var _a, _b, _c, _d;
        let updateValue;
        switch (subcommand) {
            case exports.EDIT_SHOP_OPTIONS.Name:
                updateValue = (_a = interaction.options.getString('new-name')) === null || _a === void 0 ? void 0 : _a.replaceSpaces();
                break;
            case exports.EDIT_SHOP_OPTIONS.Description:
                updateValue = (_b = interaction.options.getString('new-description')) === null || _b === void 0 ? void 0 : _b.replaceSpaces();
                break;
            case exports.EDIT_SHOP_OPTIONS.Emoji:
                const emojiOption = interaction.options.getString('new-emoji');
                updateValue = ((_c = emojiOption === null || emojiOption === void 0 ? void 0 : emojiOption.match(constants_1.EMOJI_REGEX)) === null || _c === void 0 ? void 0 : _c[0]) || exports.NO_VALUE;
                break;
            case exports.EDIT_SHOP_OPTIONS.ReservedTo:
                updateValue = ((_d = interaction.options.getRole('reserved-to-role')) === null || _d === void 0 ? void 0 : _d.id) || exports.NO_VALUE;
                break;
            default:
                (0, utils_1.assertNeverReached)(subcommand);
        }
        if (!updateValue)
            throw new Error(constants_1.ErrorMessages.InsufficientParameters);
        return updateValue;
    }
    getUpdateValueDisplay(interaction, subcommand) {
        switch (subcommand) {
            case exports.EDIT_SHOP_OPTIONS.ReservedTo:
                const role = interaction.options.getRole('reserved-to-role');
                if (!role)
                    return 'None';
                return (0, discord_js_1.roleMention)(role.id);
            default:
                return null;
        }
    }
}
exports.EditShopFlow = EditShopFlow;
var EditShopCurrencyStage;
(function (EditShopCurrencyStage) {
    EditShopCurrencyStage[EditShopCurrencyStage["SELECT_SHOP"] = 0] = "SELECT_SHOP";
    EditShopCurrencyStage[EditShopCurrencyStage["SELECT_CURRENCY"] = 1] = "SELECT_CURRENCY";
})(EditShopCurrencyStage || (EditShopCurrencyStage = {}));
class EditShopCurrencyFlow extends user_flow_1.UserFlow {
    constructor() {
        super(...arguments);
        this.id = 'edit-shop-currency';
        this.components = new Map();
        this.stage = EditShopCurrencyStage.SELECT_SHOP;
        this.componentsByStage = new Map();
        this.selectedShop = null;
        this.selectedCurrency = null;
        this.response = null;
    }
    start(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const shops = (0, shops_database_1.getShops)();
            if (!shops.size)
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.NoShops);
            this.initComponents();
            this.updateComponents();
            const response = yield interaction.reply({ content: this.getMessage(), components: this.getComponentRows(), flags: discord_js_1.MessageFlags.Ephemeral, withResponse: true });
            this.response = response;
            this.createComponentsCollectors(response);
            return;
        });
    }
    getMessage() {
        var _a, _b, _c;
        if (this.stage === EditShopCurrencyStage.SELECT_SHOP)
            return `Изменить счет для магазина **[${(0, shops_database_1.getShopName)((_a = this.selectedShop) === null || _a === void 0 ? void 0 : _a.id) || 'Выберите магазин'}]**.`;
        if (this.stage === EditShopCurrencyStage.SELECT_CURRENCY)
            return `Изменить счет для магазина **${(0, shops_database_1.getShopName)((_b = this.selectedShop) === null || _b === void 0 ? void 0 : _b.id)}** to **[${(0, currencies_database_1.getCurrencyName)((_c = this.selectedCurrency) === null || _c === void 0 ? void 0 : _c.id) || 'Выберите счет'}]**.`;
        pretty_log_1.PrettyLog.warning(`Unknown stage: ${this.stage}`);
        return '';
    }
    initComponents() {
        var _a, _b, _c, _d, _e;
        const shopSelectMenu = new extended_components_1.ExtendedStringSelectMenuComponent({
            customId: `${this.id}+select-shop`,
            placeholder: 'Выберите магазин',
            time: 120000,
        }, (0, shops_database_1.getShops)(), (interaction, selected) => {
            this.selectedShop = selected;
            this.updateInteraction(interaction);
        });
        const submitShopButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+submit-shop`,
            time: 120000,
            label: 'Выбрать',
            emoji: { name: '✅' },
            style: discord_js_1.ButtonStyle.Success,
            disabled: true,
        }, (interaction) => {
            this.changeStage(EditShopCurrencyStage.SELECT_CURRENCY);
            this.updateInteraction(interaction);
        });
        this.componentsByStage.set(EditShopCurrencyStage.SELECT_SHOP, new Map());
        (_a = this.componentsByStage.get(EditShopCurrencyStage.SELECT_SHOP)) === null || _a === void 0 ? void 0 : _a.set(shopSelectMenu.customId, shopSelectMenu);
        (_b = this.componentsByStage.get(EditShopCurrencyStage.SELECT_SHOP)) === null || _b === void 0 ? void 0 : _b.set(submitShopButton.customId, submitShopButton);
        this.components.set(shopSelectMenu.customId, shopSelectMenu);
        this.components.set(submitShopButton.customId, submitShopButton);
        const currencySelectMenu = new extended_components_1.ExtendedStringSelectMenuComponent({
            customId: `${this.id}+select-currency`,
            placeholder: 'Выберите счет',
            time: 120000,
        }, (0, currencies_database_1.getCurrencies)(), (interaction, selectedCurrency) => {
            this.selectedCurrency = selectedCurrency;
            this.updateInteraction(interaction);
        });
        const submitCurrencyButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+submit-currency`,
            time: 120000,
            label: 'Применить',
            emoji: { name: '✅' },
            style: discord_js_1.ButtonStyle.Success,
            disabled: true
        }, (interaction) => this.success(interaction));
        const changeShopButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+change-shop`,
            time: 120000,
            label: 'Изменить магазин',
            emoji: { name: '📝' },
            style: discord_js_1.ButtonStyle.Secondary
        }, (interaction) => {
            this.selectedShop = null;
            this.selectedCurrency = null;
            this.changeStage(EditShopCurrencyStage.SELECT_SHOP);
            this.updateInteraction(interaction);
        });
        this.componentsByStage.set(EditShopCurrencyStage.SELECT_CURRENCY, new Map());
        (_c = this.componentsByStage.get(EditShopCurrencyStage.SELECT_CURRENCY)) === null || _c === void 0 ? void 0 : _c.set(currencySelectMenu.customId, currencySelectMenu);
        (_d = this.componentsByStage.get(EditShopCurrencyStage.SELECT_CURRENCY)) === null || _d === void 0 ? void 0 : _d.set(submitCurrencyButton.customId, submitCurrencyButton);
        (_e = this.componentsByStage.get(EditShopCurrencyStage.SELECT_CURRENCY)) === null || _e === void 0 ? void 0 : _e.set(changeShopButton.customId, changeShopButton);
    }
    updateComponents() {
        if (this.stage == EditShopCurrencyStage.SELECT_SHOP) {
            const submitShopButton = this.components.get(`${this.id}+submit-shop`);
            if (!(submitShopButton instanceof extended_components_1.ExtendedButtonComponent))
                return;
            submitShopButton.toggle(this.selectedShop != null);
        }
        if (this.stage == EditShopCurrencyStage.SELECT_CURRENCY) {
            const submitUpdateButton = this.components.get(`${this.id}+submit-currency`);
            if (submitUpdateButton instanceof extended_components_1.ExtendedButtonComponent) {
                submitUpdateButton.toggle(this.selectedCurrency != null);
            }
        }
    }
    changeStage(newStage) {
        this.stage = newStage;
        this.destroyComponentsCollectors();
        this.components = this.componentsByStage.get(newStage) || new Map();
        this.updateComponents();
        if (!this.response)
            return;
        this.createComponentsCollectors(this.response);
    }
    success(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.selectedShop || !this.selectedCurrency)
                return yield (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
            try {
                (0, shops_database_1.updateShopCurrency)(this.selectedShop.id, this.selectedCurrency.id);
                return yield (0, discord_1.updateAsSuccessMessage)(interaction, `Вы успешно изменили счет магазина ${(0, discord_js_1.bold)((0, shops_database_1.getShopName)(this.selectedShop.id) || '')} на ${(0, discord_js_1.bold)((0, currencies_database_1.getCurrencyName)(this.selectedCurrency.id) || '')}`);
            }
            catch (error) {
                return yield (0, discord_1.updateAsErrorMessage)(interaction, (error instanceof database_types_1.DatabaseError) ? error.message : undefined);
            }
        });
    }
}
exports.EditShopCurrencyFlow = EditShopCurrencyFlow;
class DiscountCodeCreateFlow extends user_flow_1.UserFlow {
    constructor() {
        super(...arguments);
        this.id = 'discount-code-create';
        this.components = new Map();
        this.selectedShop = null;
        this.discountCode = null;
        this.discountAmount = null;
    }
    start(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const shops = (0, shops_database_1.getShops)();
            if (!shops.size)
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.NoShops);
            const discountCode = (_a = interaction.options.getString('code')) === null || _a === void 0 ? void 0 : _a.replaceSpaces().replace(/ /g, '').toUpperCase();
            const discountAmount = interaction.options.getInteger('amount');
            if (!discountCode || !discountAmount)
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
            this.discountCode = discountCode;
            this.discountAmount = discountAmount;
            this.initComponents();
            this.updateComponents();
            const response = yield interaction.reply({ content: this.getMessage(), components: this.getComponentRows(), flags: discord_js_1.MessageFlags.Ephemeral, withResponse: true });
            this.createComponentsCollectors(response);
            return;
        });
    }
    getMessage() {
        var _a;
        return `Создать скидочный купон для магазина **[${(0, shops_database_1.getShopName)((_a = this.selectedShop) === null || _a === void 0 ? void 0 : _a.id) || 'Выберите магазин'}]**.\n**Код**: ${(0, discord_js_1.bold)(`${this.discountCode}\nAmount: ${this.discountAmount}`)}%`;
    }
    initComponents() {
        const shopSelectMenu = new extended_components_1.ExtendedStringSelectMenuComponent({
            customId: `${this.id}+select-shop`,
            placeholder: 'Выберите магазин',
            time: 120000,
        }, (0, shops_database_1.getShops)(), (interaction, selected) => {
            this.selectedShop = selected;
            this.updateInteraction(interaction);
        });
        const submitButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+submit`,
            label: 'Создать купон',
            emoji: { name: '✅' },
            style: discord_js_1.ButtonStyle.Success,
            disabled: true,
            time: 120000
        }, (interaction) => this.success(interaction));
        this.components.set(shopSelectMenu.customId, shopSelectMenu);
        this.components.set(submitButton.customId, submitButton);
    }
    updateComponents() {
        const submitButton = this.components.get(`${this.id}+submit`);
        if (!(submitButton instanceof extended_components_1.ExtendedButtonComponent))
            return;
        submitButton.toggle(this.selectedShop != null);
    }
    success(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.disableComponents();
            try {
                if (!this.selectedShop)
                    return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                if (!this.discountCode || !this.discountAmount)
                    return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                yield (0, shops_database_1.createDiscountCode)(this.selectedShop.id, this.discountCode, this.discountAmount);
                return yield (0, discord_1.updateAsSuccessMessage)(interaction, `Вы успешно создали скидочный купон ${(0, discord_js_1.bold)(this.discountCode)} для магазина ${(0, discord_js_1.bold)((0, shops_database_1.getShopName)((_a = this.selectedShop) === null || _a === void 0 ? void 0 : _a.id) || '')}.\n${(0, discord_js_1.bold)(`Amount: ${this.discountAmount}`)}%`);
            }
            catch (error) {
                return yield (0, discord_1.updateAsErrorMessage)(interaction, (error instanceof database_types_1.DatabaseError) ? error.message : undefined);
            }
        });
    }
}
exports.DiscountCodeCreateFlow = DiscountCodeCreateFlow;
var DiscountCodeRemoveStage;
(function (DiscountCodeRemoveStage) {
    DiscountCodeRemoveStage[DiscountCodeRemoveStage["SELECT_SHOP"] = 0] = "SELECT_SHOP";
    DiscountCodeRemoveStage[DiscountCodeRemoveStage["SELECT_DISCOUNT_CODE"] = 1] = "SELECT_DISCOUNT_CODE";
})(DiscountCodeRemoveStage || (DiscountCodeRemoveStage = {}));
class DiscountCodeRemoveFlow extends user_flow_1.UserFlow {
    constructor() {
        super(...arguments);
        this.id = 'discount-code-remove';
        this.components = new Map();
        this.stage = DiscountCodeRemoveStage.SELECT_SHOP;
        this.componentsByStage = new Map();
        this.selectedShop = null;
        this.selectedDiscountCode = null;
        this.response = null;
    }
    start(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const shops = (0, shops_database_1.getShops)();
            if (!shops.size)
                return (0, discord_1.replyErrorMessage)(interaction, constants_1.ErrorMessages.NoShops);
            this.initComponents();
            this.updateComponents();
            const response = yield interaction.reply({ content: this.getMessage(), components: this.getComponentRows(), flags: discord_js_1.MessageFlags.Ephemeral, withResponse: true });
            this.response = response;
            this.createComponentsCollectors(response);
            return;
        });
    }
    getMessage() {
        var _a, _b;
        if (this.stage == DiscountCodeRemoveStage.SELECT_SHOP)
            return `Удалить скидочный купон из магазина ${(0, discord_js_1.bold)(`[${(0, shops_database_1.getShopName)((_a = this.selectedShop) === null || _a === void 0 ? void 0 : _a.id) || 'Выберите магазин'}]`)}.`;
        if (this.stage == DiscountCodeRemoveStage.SELECT_DISCOUNT_CODE)
            return `Удалить скидочный купон ${(0, discord_js_1.bold)(`[${this.selectedDiscountCode || 'Выберите купон'}]`)} from ${(0, discord_js_1.bold)(`[${(0, shops_database_1.getShopName)((_b = this.selectedShop) === null || _b === void 0 ? void 0 : _b.id)}]`)}.`;
        pretty_log_1.PrettyLog.warning(`Неизвестный этап: ${this.stage}`);
        return '';
    }
    initComponents() {
        var _a, _b, _c, _d, _e;
        const shopSelectMenu = new extended_components_1.ExtendedStringSelectMenuComponent({
            customId: `${this.id}+select-shop`,
            placeholder: 'Выберите магазин',
            time: 120000,
        }, (0, shops_database_1.getShops)(), (interaction, selected) => {
            this.selectedShop = selected;
            this.updateInteraction(interaction);
        });
        const submitButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+submit`,
            time: 120000,
            label: 'Выбрать',
            emoji: { name: '✅' },
            style: discord_js_1.ButtonStyle.Success,
            disabled: true,
        }, (interaction) => {
            var _a;
            const shopDiscountCodes = (_a = this.selectedShop) === null || _a === void 0 ? void 0 : _a.discountCodes;
            if (!shopDiscountCodes || Object.keys(shopDiscountCodes).length == 0)
                return (0, discord_1.updateAsErrorMessage)(interaction, 'The selected shop has no discount codes');
            this.changeStage(DiscountCodeRemoveStage.SELECT_DISCOUNT_CODE);
            return this.updateInteraction(interaction);
        });
        this.componentsByStage.set(DiscountCodeRemoveStage.SELECT_SHOP, new Map());
        (_a = this.componentsByStage.get(DiscountCodeRemoveStage.SELECT_SHOP)) === null || _a === void 0 ? void 0 : _a.set(shopSelectMenu.customId, shopSelectMenu);
        (_b = this.componentsByStage.get(DiscountCodeRemoveStage.SELECT_SHOP)) === null || _b === void 0 ? void 0 : _b.set(submitButton.customId, submitButton);
        this.components.set(shopSelectMenu.customId, shopSelectMenu);
        this.components.set(submitButton.customId, submitButton);
        const discountCodeSelectMenu = new extended_components_1.ExtendedStringSelectMenuComponent({
            customId: `${this.id}+select-discount-code`,
            placeholder: 'Выберите купон',
            time: 120000,
        }, new Map(), (interaction, selected) => {
            this.selectedDiscountCode = selected;
            this.updateInteraction(interaction);
        });
        const submitRemoveButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+remove-discount-code`,
            time: 120000,
            label: 'Удалить купон',
            emoji: { name: '⛔' },
            style: discord_js_1.ButtonStyle.Danger,
            disabled: true
        }, (interaction) => this.success(interaction));
        const changeShopButton = new extended_components_1.ExtendedButtonComponent({
            customId: `${this.id}+change-shop`,
            time: 120000,
            label: 'Изменить магазин',
            emoji: { name: '📝' },
            style: discord_js_1.ButtonStyle.Secondary
        }, (interaction) => {
            this.selectedShop = null;
            this.selectedDiscountCode = null;
            this.changeStage(DiscountCodeRemoveStage.SELECT_SHOP);
            this.updateInteraction(interaction);
        });
        this.componentsByStage.set(DiscountCodeRemoveStage.SELECT_DISCOUNT_CODE, new Map());
        (_c = this.componentsByStage.get(DiscountCodeRemoveStage.SELECT_DISCOUNT_CODE)) === null || _c === void 0 ? void 0 : _c.set(discountCodeSelectMenu.customId, discountCodeSelectMenu);
        (_d = this.componentsByStage.get(DiscountCodeRemoveStage.SELECT_DISCOUNT_CODE)) === null || _d === void 0 ? void 0 : _d.set(submitRemoveButton.customId, submitRemoveButton);
        (_e = this.componentsByStage.get(DiscountCodeRemoveStage.SELECT_DISCOUNT_CODE)) === null || _e === void 0 ? void 0 : _e.set(changeShopButton.customId, changeShopButton);
    }
    updateComponents() {
        var _a;
        if (this.stage == DiscountCodeRemoveStage.SELECT_SHOP) {
            const submitButton = this.components.get(`${this.id}+submit`);
            if (!(submitButton instanceof extended_components_1.ExtendedButtonComponent))
                return;
            submitButton.toggle(this.selectedShop != null);
        }
        if (this.stage == DiscountCodeRemoveStage.SELECT_DISCOUNT_CODE) {
            const submitRemoveButton = this.components.get(`${this.id}+remove-discount-code`);
            if (submitRemoveButton instanceof extended_components_1.ExtendedButtonComponent) {
                submitRemoveButton.toggle(this.selectedDiscountCode != null);
            }
            const selectDiscountCodeMenu = this.components.get(`${this.id}+select-discount-code`);
            if (selectDiscountCodeMenu instanceof extended_components_1.ExtendedStringSelectMenuComponent) {
                selectDiscountCodeMenu.updateMap(new Map(Object.keys(((_a = this.selectedShop) === null || _a === void 0 ? void 0 : _a.discountCodes) || {}).map(code => [code, code])));
            }
        }
    }
    changeStage(newStage) {
        this.stage = newStage;
        this.destroyComponentsCollectors();
        this.components = this.componentsByStage.get(newStage) || new Map();
        this.updateComponents();
        if (!this.response)
            return;
        this.createComponentsCollectors(this.response);
    }
    success(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.disableComponents();
            try {
                if (!this.selectedShop)
                    return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                if (!this.selectedDiscountCode)
                    return (0, discord_1.updateAsErrorMessage)(interaction, constants_1.ErrorMessages.InsufficientParameters);
                yield (0, shops_database_1.removeDiscountCode)(this.selectedShop.id, this.selectedDiscountCode);
                return yield (0, discord_1.updateAsSuccessMessage)(interaction, `Вы успешно удалили купон ${(0, discord_js_1.bold)(this.selectedDiscountCode)} из магазина ${(0, discord_js_1.bold)((0, shops_database_1.getShopName)((_a = this.selectedShop) === null || _a === void 0 ? void 0 : _a.id))}`);
            }
            catch (error) {
                return yield (0, discord_1.updateAsErrorMessage)(interaction, (error instanceof database_types_1.DatabaseError) ? error.message : undefined);
            }
        });
    }
}
exports.DiscountCodeRemoveFlow = DiscountCodeRemoveFlow;